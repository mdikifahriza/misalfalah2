import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to determine the table name based on type
const getTableName = (type: string) => {
    switch (type) {
        case 'news':
            return 'news_posts';
        case 'publication':
        case 'announcement':
        case 'article':
        case 'bulletin':
            return 'publications';
        case 'achievement':
            return 'achievements';
        case 'gallery':
            return 'galleries';
        case 'download':
            return 'downloads';
        default:
            return 'publications'; // Default
    }
};

const parseMeta = (value: unknown) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    if (typeof value === 'object') {
        return value;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;
        try {
            return JSON.parse(trimmed);
        } catch (e) {
            return null;
        }
    }
    return null;
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || undefined;

        if (type && type !== 'all') {
            const tableName = getTableName(type);
            let query = supabaseAdmin()
                .from(tableName)
                .select('*');

            // Handle type filtering for publications if generic type requested
            if (tableName === 'publications' && type !== 'publication') {
                query = query.eq('type', type);
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;

            const entityType = tableName === 'news_posts' ? 'news' :
                tableName === 'publications' ? 'publication' :
                    tableName === 'achievements' ? 'achievement' :
                        tableName === 'galleries' ? 'gallery' : 'download';

            const ids = (data || []).map((row: any) => row.id);
            let mediaByEntity: Record<string, any[]> = {};
            if (ids.length) {
                const { data: mediaData, error: mediaError } = await supabaseAdmin()
                    .from('media_items')
                    .select('*')
                    .eq('entity_type', entityType)
                    .in('entity_id', ids)
                    .order('display_order', { ascending: true });
                if (mediaError) throw mediaError;
                mediaByEntity = (mediaData || []).reduce((acc: any, m: any) => {
                    (acc[m.entity_id] = acc[m.entity_id] || []).push(m);
                    return acc;
                }, {});
            }

            const mapped = (data || []).map((row: any) => ({
                ...row,
                media_items: mediaByEntity[row.id] || [],
            }));

            return NextResponse.json(mapped);
        }

        // Fetch all if type=all or not provided
        const [newsRes, pubRes, achRes, galRes] = await Promise.all([
            supabaseAdmin().from('news_posts').select('*'),
            supabaseAdmin().from('publications').select('*'),
            supabaseAdmin().from('achievements').select('*'),
            supabaseAdmin().from('galleries').select('*')
        ]);

        const allIds = [
            ...(newsRes.data || []).map((row: any) => ({ id: row.id, type: 'news' })),
            ...(pubRes.data || []).map((row: any) => ({ id: row.id, type: 'publication' })),
            ...(achRes.data || []).map((row: any) => ({ id: row.id, type: 'achievement' })),
            ...(galRes.data || []).map((row: any) => ({ id: row.id, type: 'gallery' })),
        ];

        const mediaByEntityType: Record<string, Record<string, any[]>> = {
            news: {},
            publication: {},
            achievement: {},
            gallery: {},
        };

        const groupedIds: Record<string, string[]> = allIds.reduce((acc: Record<string, string[]>, item) => {
            (acc[item.type] = acc[item.type] || []).push(item.id);
            return acc;
        }, {});

        for (const [entityType, ids] of Object.entries(groupedIds)) {
            if (!ids.length) continue;
            const { data: mediaData, error: mediaError } = await supabaseAdmin()
                .from('media_items')
                .select('*')
                .eq('entity_type', entityType)
                .in('entity_id', ids)
                .order('display_order', { ascending: true });
            if (mediaError) throw mediaError;
            mediaByEntityType[entityType] = (mediaData || []).reduce((acc: any, m: any) => {
                (acc[m.entity_id] = acc[m.entity_id] || []).push(m);
                return acc;
            }, {});
        }

        const all = [
            ...(newsRes.data || []).map(x => ({ ...x, type: 'news', media_items: mediaByEntityType.news[x.id] || [] })),
            ...(pubRes.data || []).map(x => ({ ...x, media_items: mediaByEntityType.publication[x.id] || [] })),
            ...(achRes.data || []).map(x => ({ ...x, type: 'achievement', media_items: mediaByEntityType.achievement[x.id] || [] })),
            ...(galRes.data || []).map(x => ({ ...x, type: 'gallery', media_items: mediaByEntityType.gallery[x.id] || [] }))
        ];

        return NextResponse.json(all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

    } catch (error) {
        console.error('Admin fetch content posts error:', error);
        return NextResponse.json({ error: 'Failed to fetch content posts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const postInput = payload?.post ?? payload;
        const mediaInput = payload?.media;

        if (!postInput?.title || !postInput?.slug || !postInput?.type) {
            return NextResponse.json({ error: 'Judul, slug, dan tipe wajib diisi.' }, { status: 400 });
        }

        const tableName = getTableName(postInput.type);

        const insertPayload: any = {
            title: postInput.title?.trim(),
            slug: postInput.slug?.trim(),
            is_published: postInput.isPublished ?? true,
            is_pinned: postInput.isPinned ?? false,
        };

        if (tableName === 'news_posts') {
            insertPayload.excerpt = postInput.excerpt || null;
            insertPayload.content = postInput.contentHtml || postInput.content || null;
            insertPayload.author_name = postInput.authorName || 'Admin';
            insertPayload.published_at = postInput.publishedAt || new Date().toISOString();
        } else if (tableName === 'publications') {
            insertPayload.type = postInput.type === 'publication' ? 'announcement' : postInput.type;
            insertPayload.description = postInput.description || postInput.excerpt || null;
            insertPayload.content = postInput.contentHtml || postInput.content || null;
            insertPayload.author_name = postInput.authorName || 'Admin';
            insertPayload.published_at = postInput.publishedAt || new Date().toISOString();
        } else if (tableName === 'achievements') {
            insertPayload.description = postInput.description || postInput.excerpt || null;
            insertPayload.event_name = postInput.eventName || null;
            insertPayload.event_level = postInput.eventLevel || null;
            insertPayload.rank = postInput.rank || null;
            insertPayload.achieved_at = postInput.achievedAt || new Date().toISOString().split('T')[0];
        } else if (tableName === 'galleries') {
            insertPayload.description = postInput.description || postInput.excerpt || null;
            insertPayload.event_date = postInput.eventDate || postInput.publishedAt || new Date().toISOString().split('T')[0];
        }

        const { data: created, error } = await supabaseAdmin()
            .from(tableName)
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) throw error;

        // Handle Media
        if (Array.isArray(mediaInput) && mediaInput.length > 0) {
            const entityType = tableName === 'news_posts' ? 'news' :
                tableName === 'publications' ? 'publication' :
                    tableName === 'achievements' ? 'achievement' :
                        tableName === 'galleries' ? 'gallery' : 'download';

            const normalizedMedia = mediaInput
                .filter((item) => item && (item.url || item.mediaUrl || item.embedHtml))
                .map((item, index) => ({
                    entity_id: created.id,
                    entity_type: entityType,
                    media_type: item.mediaType || 'image',
                    media_url: item.url || item.mediaUrl || null,
                    thumbnail_url: item.thumbnailUrl || null,
                    caption: item.caption || null,
                    display_order: Number(item.displayOrder) || index + 1,
                    is_main: index === 0,
                }));

            if (normalizedMedia.length) {
                await supabaseAdmin().from('media_items').insert(normalizedMedia);
            }
        }

        return NextResponse.json({ post: created });
    } catch (error) {
        console.error('Admin create content post error:', error);
        return NextResponse.json({ error: 'Failed to create content post' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const payload = await request.json();
        const postInput = payload?.post ?? payload;
        const mediaInput = payload?.media;

        if (!postInput?.id) {
            return NextResponse.json({ error: 'ID wajib diisi.' }, { status: 400 });
        }
        if (!postInput?.title || !postInput?.slug || !postInput?.type) {
            return NextResponse.json({ error: 'Judul, slug, dan tipe wajib diisi.' }, { status: 400 });
        }

        const tableName = getTableName(postInput.type);

        const updatePayload: any = {
            title: postInput.title?.trim(),
            slug: postInput.slug?.trim(),
            is_published: postInput.isPublished ?? true,
            is_pinned: postInput.isPinned ?? false,
        };

        if (tableName === 'news_posts') {
            updatePayload.excerpt = postInput.excerpt || null;
            updatePayload.content = postInput.contentHtml || postInput.content || null;
            updatePayload.author_name = postInput.authorName || 'Admin';
            updatePayload.published_at = postInput.publishedAt || postInput.published_at || new Date().toISOString();
        } else if (tableName === 'publications') {
            updatePayload.type = postInput.type === 'publication' ? 'announcement' : postInput.type;
            updatePayload.description = postInput.description || postInput.excerpt || null;
            updatePayload.content = postInput.contentHtml || postInput.content || null;
            updatePayload.author_name = postInput.authorName || 'Admin';
            updatePayload.published_at = postInput.publishedAt || postInput.published_at || new Date().toISOString();
        } else if (tableName === 'achievements') {
            updatePayload.description = postInput.description || postInput.excerpt || null;
            updatePayload.event_name = postInput.eventName || null;
            updatePayload.event_level = postInput.eventLevel || null;
            updatePayload.rank = postInput.rank || null;
            updatePayload.achieved_at = postInput.achievedAt || new Date().toISOString().split('T')[0];
        } else if (tableName === 'galleries') {
            updatePayload.description = postInput.description || postInput.excerpt || null;
            updatePayload.event_date = postInput.eventDate || postInput.publishedAt || new Date().toISOString().split('T')[0];
        }

        const { data: updated, error } = await supabaseAdmin()
            .from(tableName)
            .update(updatePayload)
            .eq('id', postInput.id)
            .select('*')
            .single();

        if (error) throw error;

        // Handle Media Refresh
        if (Array.isArray(mediaInput)) {
            const entityType = tableName === 'news_posts' ? 'news' :
                tableName === 'publications' ? 'publication' :
                    tableName === 'achievements' ? 'achievement' :
                        tableName === 'galleries' ? 'gallery' : 'download';

            // Delete existing
            await supabaseAdmin().from('media_items').delete().eq('entity_id', updated.id).eq('entity_type', entityType);

            // Insert new
            const normalizedMedia = mediaInput
                .filter((item) => item && (item.url || item.mediaUrl || item.embedHtml))
                .map((item, index) => ({
                    entity_id: updated.id,
                    entity_type: entityType,
                    media_type: item.mediaType || 'image',
                    media_url: item.url || item.mediaUrl || null,
                    thumbnail_url: item.thumbnailUrl || null,
                    caption: item.caption || null,
                    display_order: Number(item.displayOrder) || index + 1,
                    is_main: index === 0,
                }));

            if (normalizedMedia.length) {
                await supabaseAdmin().from('media_items').insert(normalizedMedia);
            }
        }

        return NextResponse.json({ post: updated });
    } catch (error) {
        console.error('Admin update content post error:', error);
        return NextResponse.json({ error: 'Failed to update content post' }, { status: 500 });
    }
}
