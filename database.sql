-- ============================================
-- REFACTOR DATABASE SCRIPT (UPDATED)
-- Create 5 Independent Modules + Unified Media
-- AND REMOVE OLD UNUSED TABLES
-- ============================================

-- 1. Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create timestamp updater function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- 1. MODULE: BERITA (NEWS)
-- ============================================
DROP TABLE IF EXISTS news_posts CASCADE;
CREATE TABLE news_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    author_name TEXT DEFAULT 'Admin',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE, -- Untuk Hero Section
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER update_news_posts_modtime
    BEFORE UPDATE ON news_posts
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- 2. MODULE: PUBLIKASI (PUBLICATIONS)
-- Cakupan: Pengumuman, Artikel Ilmiah, Buletin
-- ============================================
DROP TABLE IF EXISTS publications CASCADE;
CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('announcement', 'article', 'bulletin')),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    content TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE, -- Untuk Hero Section
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER update_publications_modtime
    BEFORE UPDATE ON publications
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- 3. MODULE: PRESTASI (ACHIEVEMENTS)
-- ============================================
DROP TABLE IF EXISTS achievements CASCADE;
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    event_name TEXT,
    event_level TEXT CHECK (event_level IN ('sekolah', 'kecamatan', 'kabupaten', 'provinsi', 'nasional', 'internasional')),
    rank TEXT, -- Juara 1, 2, 3, Harapan 1, dsb
    achieved_at DATE DEFAULT CURRENT_DATE,
    is_published BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE, -- Untuk Hero Section
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER update_achievements_modtime
    BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- 4. MODULE: GALERI (GALLERIES)
-- ============================================
DROP TABLE IF EXISTS galleries CASCADE;
CREATE TABLE galleries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    event_date DATE DEFAULT CURRENT_DATE,
    is_published BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE, -- Untuk Hero Section
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER update_galleries_modtime
    BEFORE UPDATE ON galleries
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- 5. MODULE: DOWNLOAD (DOWNLOADS)
-- ============================================
DROP TABLE IF EXISTS downloads CASCADE;
CREATE TABLE downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    file_url TEXT, -- Legacy single file (Supabase Storage), optional
    file_type TEXT, -- Legacy mime/ext
    file_size_kb INTEGER, 
    download_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE, -- Untuk Hero Section
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger
CREATE TRIGGER update_downloads_modtime
    BEFORE UPDATE ON downloads
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Lampiran multi-file untuk downloads (Supabase Storage)
DROP TABLE IF EXISTS download_files CASCADE;
CREATE TABLE download_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    download_id UUID NOT NULL REFERENCES downloads(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size_kb INTEGER,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_download_files_download_id ON download_files(download_id, display_order);

-- ============================================
-- 6. UNIFIED MEDIA TABLE
-- ============================================
DROP TABLE IF EXISTS media_items CASCADE;
CREATE TABLE media_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('news', 'publication', 'achievement', 'gallery', 'download', 'academic', 'ppdb')),
    entity_id UUID NOT NULL, -- Referensi ID ke tabel terkait
    media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'youtube_embed')),
    media_url TEXT NOT NULL, -- URL Gambar/Video (Google/Cloudinary)
    thumbnail_url TEXT,
    caption TEXT,
    is_main BOOLEAN DEFAULT FALSE, -- Jika true, jadi cover image
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_entity ON media_items(entity_type, entity_id);

-- ============================================
-- 6.1 ROW LEVEL SECURITY (PUBLIC READ)
-- ============================================
ALTER TABLE academic_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_read_academic_pages ON academic_pages;
CREATE POLICY anon_read_academic_pages
ON academic_pages
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS anon_read_academic_sections ON academic_sections;
CREATE POLICY anon_read_academic_sections
ON academic_sections
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS anon_read_media_items ON media_items;
CREATE POLICY anon_read_media_items
ON media_items
FOR SELECT
TO anon
USING (true);

-- ============================================
-- 6.5 NAVIGATION MENU (HEADER)
-- ============================================
DROP TABLE IF EXISTS navigation_menu CASCADE;
CREATE TABLE navigation_menu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    href TEXT,
    parent_id UUID REFERENCES navigation_menu(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_navigation_parent ON navigation_menu(parent_id, display_order);

CREATE TRIGGER update_navigation_menu_modtime
    BEFORE UPDATE ON navigation_menu
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- 7. HERO SECTION VIEW
-- Mengambil item yang di-pin dari semua modul
-- ============================================
CREATE OR REPLACE VIEW view_hero_section AS
SELECT 
    id, 'news' AS type, title, slug, published_at AS date, is_pinned 
FROM news_posts WHERE is_pinned = TRUE AND is_published = TRUE
UNION ALL
SELECT 
    id, 'publication' AS type, title, slug, published_at AS date, is_pinned 
FROM publications WHERE is_pinned = TRUE AND is_published = TRUE
UNION ALL
SELECT 
    id, 'achievement' AS type, title, slug, achieved_at::timestamp AS date, is_pinned 
FROM achievements WHERE is_pinned = TRUE AND is_published = TRUE
UNION ALL
SELECT 
    id, 'gallery' AS type, title, slug, event_date::timestamp AS date, is_pinned 
FROM galleries WHERE is_pinned = TRUE AND is_published = TRUE
UNION ALL
SELECT 
    id, 'download' AS type, title, slug, created_at AS date, is_pinned 
FROM downloads WHERE is_pinned = TRUE AND is_published = TRUE
ORDER BY date DESC;


-- ============================================
-- 8. DUMMY DATA SEEDING
-- ============================================

-- A. SEED BERITA
WITH new_news AS (
    INSERT INTO news_posts (title, slug, excerpt, content, is_pinned) 
    VALUES 
    ('Kunjungan Dinas Pendidikan ke MI Al-Falah', 'kunjungan-dinas-2026', 'Kepala Dinas mengapresiasi kemajuan sekolah.', 'Lorem ipsum content berita lengkap...', TRUE),
    ('Kegiatan Pesantren Kilat Ramadhan', 'pesantren-kilat-2026', 'Siswa antusias mengikuti kegiatan keagamaan.', 'Isi berita pesantren kilat...', FALSE)
    RETURNING id
)
INSERT INTO media_items (entity_type, entity_id, media_url, is_main)
SELECT 'news', id, 'https://lh3.googleusercontent.com/d/YOUR_GOOGLE_IMAGE_ID_1', TRUE FROM new_news LIMIT 1;

-- B. SEED PUBLIKASI
INSERT INTO publications (type, title, slug, content, is_pinned)
VALUES 
('announcement', 'Penerimaan Peserta Didik Baru 2026/2027', 'ppdb-2026', 'Pendaftaran dibuka mulai tanggal...', TRUE),
('article', 'Pentingnya Pendidikan Karakter', 'pendidikan-karakter', 'Artikel tentang pendidikan karakter...', FALSE);

-- C. SEED PRESTASI
WITH new_achievement AS (
    INSERT INTO achievements (title, slug, event_level, rank, is_pinned)
    VALUES 
    ('Juara 1 Lomba Pidato Bahasa Arab', 'juara-pidato-arab-2026', 'kabupaten', 'Juara 1', TRUE),
    ('Medali Perak Olimpiade Sains', 'medali-perak-sains', 'provinsi', 'Medali Perak', TRUE)
    RETURNING id
)
INSERT INTO media_items (entity_type, entity_id, media_url, is_main)
SELECT 'achievement', id, 'https://lh3.googleusercontent.com/d/YOUR_GOOGLE_IMAGE_ID_2', TRUE FROM new_achievement;

-- D. SEED GALERI
WITH new_gallery AS (
    INSERT INTO galleries (title, slug, description, is_pinned)
    VALUES 
    ('Dokumentasi Wisuda 2025', 'wisuda-2025', 'Foto-foto kegiatan wisuda...', FALSE),
    ('Karnaval Budaya', 'karnaval-budaya-2026', 'Kegiatan pawai budaya keliling desa.', TRUE)
    RETURNING id
)
INSERT INTO media_items (entity_type, entity_id, media_url, display_order)
SELECT 'gallery', id, 'https://lh3.googleusercontent.com/d/YOUR_GOOGLE_IMAGE_ID_3', 1 FROM new_gallery;

-- E. SEED DOWNLOAD
INSERT INTO downloads (title, slug, file_url, file_type, is_pinned)
VALUES 
('Brosur PPDB 2026', 'brosur-ppdb-2026', 'https://drive.google.com/uc?id=YOUR_FILE_ID_1', 'PDF', TRUE),
('Kalender Akademik 2026', 'kalender-2026', 'https://drive.google.com/uc?id=YOUR_FILE_ID_2', 'PDF', FALSE);

-- F. SEED NAVIGATION MENU (HEADER)
INSERT INTO navigation_menu
(id, label, href, parent_id, display_order, is_active, icon, created_at, updated_at)
VALUES
('00000000-0000-0000-0000-000000000001','Beranda','/',NULL,1,TRUE,NULL,now(),now()),
('00000000-0000-0000-0000-000000000002','Profil',NULL,NULL,2,TRUE,NULL,now(),now()),
('00000000-0000-0000-0000-000000000003','Akademik',NULL,NULL,3,TRUE,NULL,now(),now()),
('00000000-0000-0000-0000-000000000004','Informasi',NULL,NULL,4,TRUE,NULL,now(),now()),
('00000000-0000-0000-0000-000000000005','PPDB','/ppdb',NULL,5,TRUE,NULL,now(),now());

INSERT INTO navigation_menu
(id, label, href, parent_id, display_order, is_active, icon, created_at, updated_at)
VALUES
('11111111-1111-1111-1111-111111111111','Sambutan','/sambutan','00000000-0000-0000-0000-000000000002',1,TRUE,NULL,now(),now()),
('22222222-2222-2222-2222-222222222222','Profil Madrasah','/profil','00000000-0000-0000-0000-000000000002',2,TRUE,NULL,now(),now()),
('33333333-3333-3333-3333-333333333333','Sejarah Madrasah','/sejarah','00000000-0000-0000-0000-000000000002',3,TRUE,NULL,now(),now()),
('44444444-4444-4444-4444-444444444444','Visi & Misi','/visimisi','00000000-0000-0000-0000-000000000002',4,TRUE,NULL,now(),now()),
('55555555-5555-5555-5555-555555555555','Kontak','/kontak','00000000-0000-0000-0000-000000000002',5,TRUE,NULL,now(),now());

INSERT INTO navigation_menu
(id, label, href, parent_id, display_order, is_active, icon, created_at, updated_at)
VALUES
('66666666-6666-6666-6666-666666666666','Akademik','/akademik','00000000-0000-0000-0000-000000000003',1,TRUE,NULL,now(),now()),
('77777777-7777-7777-7777-777777777777','Kesiswaan','/kesiswaan','00000000-0000-0000-0000-000000000003',2,TRUE,NULL,now(),now()),
('88888888-8888-8888-8888-888888888888','Guru','/guru','00000000-0000-0000-0000-000000000003',3,TRUE,NULL,now(),now());

INSERT INTO navigation_menu
(id, label, href, parent_id, display_order, is_active, icon, created_at, updated_at)
VALUES
('99999999-9999-9999-9999-999999999991','Berita','/berita','00000000-0000-0000-0000-000000000004',1,TRUE,NULL,now(),now()),
('99999999-9999-9999-9999-999999999992','Publikasi','/publikasi','00000000-0000-0000-0000-000000000004',2,TRUE,NULL,now(),now()),
('99999999-9999-9999-9999-999999999993','Galeri','/galeri','00000000-0000-0000-0000-000000000004',3,TRUE,NULL,now(),now()),
('99999999-9999-9999-9999-999999999994','Prestasi','/prestasi','00000000-0000-0000-0000-000000000004',4,TRUE,NULL,now(),now()),
('99999999-9999-9999-9999-999999999995','Kelulusan','/kelulusan','00000000-0000-0000-0000-000000000004',5,TRUE,NULL,now(),now()),
('99999999-9999-9999-9999-999999999996','Unduhan','/download','00000000-0000-0000-0000-000000000004',6,TRUE,NULL,now(),now()),
('99999999-9999-9999-9999-999999999997','RDM','https://rdm.mialfalahkanigoroblitar.sch.id/','00000000-0000-0000-0000-000000000004',7,TRUE,NULL,now(),now()),
('99999999-9999-9999-9999-999999999998','E-Learning','https://elearning.mialfalahkanigoroblitar.sch.id/','00000000-0000-0000-0000-000000000004',8,TRUE,NULL,now(),now()),
('99999999-9999-9999-9999-999999999999','CBTM','https://misalfalah.cbtm.my.id/login','00000000-0000-0000-0000-000000000004',9,TRUE,NULL,now(),now());

-- ============================================
-- 9. CLEANUP / DROP OLD TABLES
-- Hapus tabel lama yang sudah digantikan
-- ============================================

-- Hapus tabel 'content_posts' (yang dulu dicampur)
-- Hapus tabel 'news' (versi lama)
-- Hapus tabel 'download_files' (versi lama)
-- Hapus tabel media lama

DROP TABLE IF EXISTS content_media CASCADE;
DROP TABLE IF EXISTS content_posts CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS achievement_media CASCADE;
DROP TABLE IF EXISTS academic_subjects CASCADE;
DROP TABLE IF EXISTS academic_programs CASCADE;
DROP TABLE IF EXISTS academic_page CASCADE;
-- DROP TABLE IF EXISTS highlights CASCADE; -- Opsional, jika sudah tidak dipakai

-- ============================================
-- 10. MODULE: AKADEMIK (SIMPLIFIED)
-- ============================================
DROP TABLE IF EXISTS academic_sections CASCADE;
DROP TABLE IF EXISTS academic_pages CASCADE;

CREATE TABLE academic_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    content TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_academic_pages_modtime
    BEFORE UPDATE ON academic_pages
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE academic_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES academic_pages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_academic_sections_page ON academic_sections(page_id, display_order);

CREATE TRIGGER update_academic_sections_modtime
    BEFORE UPDATE ON academic_sections
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Seed Akademik
WITH new_academic AS (
    INSERT INTO academic_pages (title, subtitle, content, is_active)
    VALUES (
        'Akademik',
        'Integrasi kurikulum nasional dan nilai keislaman.',
        'Halaman akademik berisi gambaran kurikulum, metode pembelajaran, dan program unggulan.',
        TRUE
    )
    RETURNING id
)
INSERT INTO academic_sections (page_id, title, body, display_order)
SELECT id, 'Kurikulum Terintegrasi', 'Kurikulum nasional dipadukan dengan kurikulum madrasah dan penguatan karakter.', 1 FROM new_academic
UNION ALL
SELECT id, 'Program Unggulan', 'Tahfidz, literasi, sains, dan penguatan bahasa.', 2 FROM new_academic
UNION ALL
SELECT id, 'Metode Pembelajaran', 'Project based learning, kolaboratif, dan pembiasaan adab.', 3 FROM new_academic
UNION ALL
SELECT id, 'Fasilitas Akademik', 'Perpustakaan, laboratorium, dan ruang multimedia.', 4 FROM new_academic;

-- Dummy media untuk akademik (sementara pakai URL Google, produksi pakai Cloudinary)
WITH academic_target AS (
    SELECT id FROM academic_pages ORDER BY created_at DESC LIMIT 1
)
INSERT INTO media_items (entity_type, entity_id, media_type, media_url, caption, is_main, display_order)
SELECT 'academic', id, 'image', 'https://lh3.googleusercontent.com/d/YOUR_GOOGLE_IMAGE_ID_ACADEMIC_1', 'Kegiatan Belajar', true, 0 FROM academic_target
UNION ALL
SELECT 'academic', id, 'image', 'https://lh3.googleusercontent.com/d/YOUR_GOOGLE_IMAGE_ID_ACADEMIC_2', 'Ruang Kelas', false, 1 FROM academic_target
UNION ALL
SELECT 'academic', id, 'image', 'https://lh3.googleusercontent.com/d/YOUR_GOOGLE_IMAGE_ID_ACADEMIC_3', 'Laboratorium', false, 2 FROM academic_target;

-- ============================================
-- 11. MODULE: PPDB (REGISTRATIONS + FILES)
-- ============================================
DROP TABLE IF EXISTS ppdb_files CASCADE;
DROP TABLE IF EXISTS ppdb_registrations CASCADE;
DROP TABLE IF EXISTS ppdb_notifications CASCADE;
DROP TABLE IF EXISTS ppdb_waves CASCADE;

-- Enum status PPDB
DO $$ BEGIN
    CREATE TYPE ppdb_status AS ENUM ('VERIFIKASI', 'BERKAS_VALID', 'DITERIMA', 'DITOLAK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Gelombang PPDB
CREATE TABLE ppdb_waves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    quota INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ppdb_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "namaLengkap" TEXT NOT NULL,
    nik TEXT NOT NULL,
    nisn TEXT NOT NULL,
    wave_id UUID REFERENCES ppdb_waves(id) ON DELETE SET NULL,
    "tempatLahir" TEXT NOT NULL,
    "tanggalLahir" DATE NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    alamat TEXT NOT NULL,
    "namaAyah" TEXT NOT NULL,
    "pekerjaanAyah" TEXT,
    "namaIbu" TEXT NOT NULL,
    "pekerjaanIbu" TEXT,
    "noHp" TEXT NOT NULL,
    status ppdb_status NOT NULL DEFAULT 'VERIFIKASI',
    pesan TEXT,
    "tanggalDaftar" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unik untuk NISN (abaikan NULL)
CREATE UNIQUE INDEX IF NOT EXISTS ppdb_registrations_nisn_unique
ON ppdb_registrations (nisn)
WHERE nisn IS NOT NULL;

-- Pastikan hanya 1 gelombang aktif
CREATE UNIQUE INDEX IF NOT EXISTS ppdb_waves_single_active
ON ppdb_waves (is_active)
WHERE is_active = true;

CREATE INDEX idx_ppdb_registrations_wave_id ON ppdb_registrations(wave_id);

-- Berkas PPDB (semua berbasis gambar via Cloudinary)
CREATE TABLE ppdb_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES ppdb_registrations(id) ON DELETE CASCADE,
    file_type TEXT NOT NULL CHECK (
        file_type IN (
            'kk',
            'akta_kelahiran',
            'ktp_wali',
            'pas_foto',
            'nisn',
            'ijazah_rapor'
        )
    ),
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ppdb_files_registration ON ppdb_files (registration_id);
CREATE INDEX idx_ppdb_files_type ON ppdb_files (file_type);

-- Notifikasi PPDB
CREATE TABLE ppdb_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES ppdb_registrations(id) ON DELETE SET NULL,
    wave_id UUID REFERENCES ppdb_waves(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ppdb_notifications_reg ON ppdb_notifications(registration_id);
CREATE INDEX idx_ppdb_notifications_wave ON ppdb_notifications(wave_id);

-- RLS: anon bisa insert berkas
ALTER TABLE ppdb_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS anon_insert_ppdb_files ON ppdb_files;
CREATE POLICY anon_insert_ppdb_files
ON ppdb_files
FOR INSERT
TO anon
WITH CHECK (true);

-- ============================================
-- 12. MODULE: WEB PUSH SUBSCRIPTIONS
-- ============================================
DROP TABLE IF EXISTS push_subscriptions CASCADE;
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES ppdb_registrations(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_push_subscriptions_reg ON push_subscriptions (registration_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS anon_insert_push_subscriptions ON push_subscriptions;
CREATE POLICY anon_insert_push_subscriptions
ON push_subscriptions
FOR INSERT
TO anon
WITH CHECK (true);
