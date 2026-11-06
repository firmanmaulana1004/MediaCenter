/**
 * SKRIP SQL RESMI UNTUK SUPABASE
 * Cendekia Media Calendar - Sekolah Cendekia BAZNAS
 * 
 * Petunjuk untuk Guru/Humas:
 * 1. Buka dashboard Supabase (https://supabase.com/dashboard)
 * 2. Pilih Project Anda -> Klik menu "SQL Editor" di bilah kiri
 * 3. Klik "+ New Query"
 * 4. Salin seluruh teks SQL di bawah ini dan tempel (paste) ke editor
 * 5. Klik tombol hijau "RUN" di pojok kanan bawah
 * 6. Selesai! Semua tabel dan hak akses (RLS) langsung aktif secara aman.
 */

export const SUPABASE_SQL_SCRIPT = `-- ============================================================
-- 1. EKSTENSI & TIPE DATA (ENUM)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Role Pengguna: Siswa, Ketua Tim, Humas/Admin
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('siswa', 'ketua_tim', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Jenis Organisasi / User di Sekolah Cendekia BAZNAS
DO $$ BEGIN
    CREATE TYPE media_team AS ENUM (
        'OCEANS',
        'ADIWIYATA',
        'ROHIS',
        'MUDABIR',
        'MEDIA CENTER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tahap Alur Produksi Karya Media
DO $$ BEGIN
    CREATE TYPE work_stage AS ENUM (
        'Ide',
        'Naskah',
        'Produksi',
        'Editing',
        'Review',
        'Siap Tayang',
        'Tayang'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Jenis Karya
DO $$ BEGIN
    CREATE TYPE work_type AS ENUM (
        'Video',
        'Dokumentasi',
        'Podcast',
        'Desain',
        'Lainnya'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ============================================================
-- 2. TABEL PROFIL PENGGUNA (PROFILES)
-- Terhubung langsung dengan Google Login Supabase Auth
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'siswa',
    team media_team NOT NULL DEFAULT 'MEDIA CENTER',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================
-- 3. TABEL KARYA MEDIA (WORKS)
-- Menyimpan alur ide s.d. tayang, PJ, tanggal, alat, link
-- ============================================================
CREATE TABLE IF NOT EXISTS public.works (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type work_type NOT NULL,
    team media_team NOT NULL,
    person_in_charge TEXT NOT NULL,
    stage work_stage NOT NULL DEFAULT 'Ide',
    production_date DATE,
    editing_date DATE,
    target_publish_date DATE NOT NULL,
    actual_publish_date DATE,
    required_equipment TEXT[] DEFAULT '{}',
    result_link TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index agar pencarian dan kalender sangat cepat
CREATE INDEX IF NOT EXISTS idx_works_target_publish_date ON public.works(target_publish_date);
CREATE INDEX IF NOT EXISTS idx_works_team ON public.works(team);
CREATE INDEX IF NOT EXISTS idx_works_stage ON public.works(stage);


-- ============================================================
-- 4. TABEL PEMESANAN RUANG MEDIA & LAPTOP (BOOKINGS)
-- Mencegah bentrok jadwal antar tim secara otomatis
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_date DATE NOT NULL,
    session TEXT NOT NULL, -- Contoh: 'Sesi 1 (08.00 - 10.00)'
    resource_type TEXT NOT NULL, -- Contoh: 'Ruang Studio Media' atau 'Laptop Editing A (ROG)'
    team media_team NOT NULL,
    applicant_name TEXT NOT NULL,
    purpose TEXT NOT NULL,
    equipment_needed TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Disetujui',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Constraint Unik untuk mencegah bentrok pada tanggal, sesi, dan fasilitas yang sama!
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS unique_date_session_resource;

ALTER TABLE public.bookings
ADD CONSTRAINT unique_date_session_resource 
UNIQUE (booking_date, session, resource_type);


-- ============================================================
-- 5. TABEL AGENDA & TEMA BULANAN SEKOLAH (AGENDAS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_key TEXT NOT NULL, -- Format 'YYYY-MM', misal '2026-11'
    monthly_theme TEXT NOT NULL,
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    target_coverage TEXT,
    team_in_charge media_team NOT NULL DEFAULT 'MEDIA CENTER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);


-- ============================================================
-- 6. TABEL REKAP & EVALUASI BULANAN (MONTHLY_RECAPS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.monthly_recaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_key TEXT NOT NULL UNIQUE,
    best_work TEXT,
    obstacles TEXT,
    improvement_plan TEXT,
    submitted_by TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);


-- ============================================================
-- 7. OTOMATIS MEMBUAT PROFIL SAAT USER BARU LOGIN GOOGLE
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, team, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Anggota Media Cendekia'),
    NEW.email,
    -- Jika email admin sekolah didaftarkan otomatis role admin, selainnya siswa
    CASE 
      WHEN NEW.email LIKE '%humas%' OR NEW.email = 'firman.maulana1004@gmail.com' THEN 'admin'::user_role
      ELSE 'siswa'::user_role
    END,
    'MEDIA CENTER'::media_team,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS) - KEAMANAN DATA SESUAI PERAN
-- Siswa: Ajukan karya & booking
-- Ketua Tim: Ubah tahap karya timnya
-- Humas/Admin: Kuasa penuh (approval, agenda, rekap)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_recaps ENABLE ROW LEVEL SECURITY;

-- Helper Function untuk cek role pengguna saat ini
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper Function untuk cek tim pengguna saat ini
CREATE OR REPLACE FUNCTION public.current_user_team()
RETURNS media_team AS $$
  SELECT team FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 8.1 ATURAN PROFIL
CREATE POLICY "Semua orang terautentikasi dapat melihat profil"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Pengguna dapat mengedit profil sendiri"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 8.2 ATURAN KARYA (WORKS)
-- Semua anggota boleh melihat semua karya (transparansi sekolah)
CREATE POLICY "Semua pengguna dapat melihat karya"
  ON public.works FOR SELECT
  USING (true);

-- Siswa dan Ketua Tim dapat mengajukan karya baru
CREATE POLICY "Pengguna terautentikasi dapat membuat karya"
  ON public.works FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Ketua Tim dapat mengubah karya timnya sendiri, Admin dapat mengubah semua
CREATE POLICY "Ketua tim dan Admin dapat mengupdate karya"
  ON public.works FOR UPDATE
  USING (
    public.current_user_role() = 'admin'
    OR (public.current_user_role() = 'ketua_tim' AND team = public.current_user_team())
    OR (created_by = auth.uid() AND stage = 'Ide')
  );

-- Hanya Admin yang boleh menghapus karya
CREATE POLICY "Hanya admin yang dapat menghapus karya"
  ON public.works FOR DELETE
  USING (public.current_user_role() = 'admin');

-- 8.3 ATURAN BOOKING RUANG & LAPTOP
CREATE POLICY "Semua orang dapat melihat jadwal booking"
  ON public.bookings FOR SELECT
  USING (true);

CREATE POLICY "Pengguna terautentikasi dapat membuat booking"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Pembuat booking dan Admin dapat membatalkan atau mengubah booking"
  ON public.bookings FOR UPDATE
  USING (created_by = auth.uid() OR public.current_user_role() = 'admin');

CREATE POLICY "Admin dapat menghapus data booking"
  ON public.bookings FOR DELETE
  USING (public.current_user_role() = 'admin');

-- 8.4 ATURAN AGENDA SEKOLAH
CREATE POLICY "Semua orang dapat membaca agenda"
  ON public.agendas FOR SELECT
  USING (true);

CREATE POLICY "Hanya admin yang dapat mengelola agenda sekolah"
  ON public.agendas FOR ALL
  USING (public.current_user_role() = 'admin');

-- 8.5 ATURAN REKAP BULANAN
CREATE POLICY "Semua orang dapat membaca rekap bulanan"
  ON public.monthly_recaps FOR SELECT
  USING (true);

CREATE POLICY "Hanya admin yang dapat mengisi dan mengubah rekap bulanan"
  ON public.monthly_recaps FOR ALL
  USING (public.current_user_role() = 'admin');
`;
