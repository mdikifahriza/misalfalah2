import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)));
        const type = searchParams.get('type');

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabaseAdmin()
            .from('publications')
            .select('*', { count: 'exact' })
            .order('is_pinned', { ascending: false })
            .order('published_at', { ascending: false })
            .range(from, to);

        if (type) {
            query = query.eq('type', type);
        }

        const { data, count, error } = await query;

        if (error) throw error;

        const ids = (data || []).map((row: any) => row.id);
        let mediaByEntity: Record<string, any[]> = {};

        if (ids.length) {
            const { data: mediaData, error: mediaError } = await supabaseAdmin()
                .from('media_items')
                .select('*')
                .eq('entity_type', 'publication')
                .in('entity_id', ids)
                .order('display_order', { ascending: true });

            if (mediaError) throw mediaError;

            mediaByEntity = (mediaData || []).reduce((acc: any, m: any) => {
                (acc[m.entity_id] = acc[m.entity_id] || []).push(m);
                return acc;
            }, {});
        }

        const items = (data || []).map((row: any) => {
            const mediaItems = mediaByEntity[row.id] || [];
            const mappedMedia = mediaItems.map((m: any) => ({
                id: m.id,
                mediaUrl: m.media_url,
                mediaType: m.media_type,
                thumbnailUrl: m.thumbnail_url,
                caption: m.caption,
                isMain: m.is_main,
                displayOrder: m.display_order,
                createdAt: m.created_at,
                entityType: m.entity_type,
                entityId: m.entity_id
            }));

            return {
                id: row.id,
                title: row.title,
                slug: row.slug,
                type: row.type,
                excerpt: row.excerpt, // Description usually maps to excerpt
                description: row.excerpt, // Alias for frontend
                content: row.content,
                authorName: row.author_name,
                publishedAt: row.published_at,
                isPublished: row.is_published,
                isPinned: row.is_pinned,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                media: mappedMedia
            };
        });

        return NextResponse.json({
            items,
            total: count || 0,
            page,
            pageSize
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const dbPayload = {
            title: body.title,
            slug: body.slug,
            type: body.type,
            excerpt: body.description || body.excerpt,
            content: body.content,
            author_name: body.authorName,
            published_at: body.publishedAt,
            is_published: body.isPublished,
            is_pinned: body.isPinned
        };

        const { data, error } = await supabaseAdmin()
            .from('publications')
            .insert(dbPayload)
            .select()
            .single();

        if (error) throw error;

        if (body.media && Array.isArray(body.media) && body.media.length > 0) {
            const mediaIds = body.media.map((m: any) => m.id).filter(Boolean);
            if (mediaIds.length > 0) {
                await supabaseAdmin()
                    .from('media_items')
                    .update({ entity_id: data.id, entity_type: 'publication' })
                    .in('id', mediaIds);
            }
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
