-- ==============================================================================
-- SKRIP SQL SUPABASE: STRUKTUR DATABASE & ROW LEVEL SECURITY (RLS)
-- E-JURNAL KINERJA GURU DENGAN ROLE-BASED ACCESS CONTROL (ADMIN & GURU)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL PEGAWAI / GURU
CREATE TABLE IF NOT EXISTS public.pegawai (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nip VARCHAR(30) UNIQUE NOT NULL,
  nama_lengkap VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  role VARCHAR(20) NOT NULL DEFAULT 'guru' CHECK (role IN ('admin', 'guru')),
  pangkat_golongan VARCHAR(100) DEFAULT 'Penata Muda / III/a',
  jabatan VARCHAR(100) DEFAULT 'Guru',
  unit_kerja VARCHAR(150) DEFAULT 'SD Negeri Sukabudi 02',
  kota_penetapan VARCHAR(100) DEFAULT 'Bekasi',
  avatar_url TEXT,

  -- Atasan Langsung
  sertakan_atasan BOOLEAN DEFAULT false,
  nama_atasan VARCHAR(150) DEFAULT 'Dra. Hj. Siti Rohmah, M.M.Pd.',
  nip_atasan VARCHAR(50) DEFAULT '19680715 199303 2 004',
  jabatan_atasan VARCHAR(100) DEFAULT 'Kepala Sekolah',

  -- Kop Dinas Resmi
  kop_baris1 VARCHAR(150) DEFAULT 'DINAS PENDIDIKAN KABUPATEN BEKASI',
  kop_baris2 VARCHAR(150) DEFAULT 'JURNAL HARIAN KINERJA',
  kop_baris3 VARCHAR(150) DEFAULT 'SD NEGERI SUKABUDI 02',
  kop_alamat TEXT,
  kop_kontak TEXT,
  logo_type VARCHAR(50) DEFAULT 'disdik',
  custom_logo_url TEXT,
  login_logo_type VARCHAR(50) DEFAULT 'default',
  login_logo_url TEXT,

  -- Watermark Evidence
  label_evidence VARCHAR(100) DEFAULT 'Evidence Sikawan',
  alamat_evidence TEXT DEFAULT 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi, Kabupaten Bekasi, Jawa Barat 17620',
  koordinat_evidence VARCHAR(100) DEFAULT '6.139568°S, 107.110048°E',
  skala_watermark NUMERIC(4, 2) DEFAULT 0.55,
  posisi_watermark VARCHAR(50) DEFAULT 'kiri-bawah',
  sertakan_catatan_di_foto BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing untuk query cepat
CREATE INDEX IF NOT EXISTS idx_pegawai_role ON public.pegawai(role);
CREATE INDEX IF NOT EXISTS idx_pegawai_nip ON public.pegawai(nip);
CREATE INDEX IF NOT EXISTS idx_pegawai_auth_user_id ON public.pegawai(auth_user_id);

-- 3. TABEL JURNAL HARIAN (RELASI KE PEGAWAI)
CREATE TABLE IF NOT EXISTS public.jurnal_harian (
  id VARCHAR(100) PRIMARY KEY,
  pegawai_id UUID NOT NULL REFERENCES public.pegawai(id) ON DELETE CASCADE,
  pegawai_nama VARCHAR(150),
  tanggal DATE NOT NULL,
  nomor_surat VARCHAR(100),
  kegiatan_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  catatan TEXT,
  paper_size VARCHAR(10) DEFAULT 'A4',
  font_family VARCHAR(50) DEFAULT 'arial',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_pegawai_tanggal UNIQUE(pegawai_id, tanggal)
);

CREATE INDEX IF NOT EXISTS idx_jurnal_pegawai_id ON public.jurnal_harian(pegawai_id);
CREATE INDEX IF NOT EXISTS idx_jurnal_tanggal ON public.jurnal_harian(tanggal);

-- 4. HELPER FUNCTION: CEK APAKAH USER LOGIN ADALAH ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pegawai
    WHERE auth_user_id = auth.uid()
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_harian ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES UNTUK TABEL PEGAWAI
-- Semua user terautentikasi dapat melihat daftar guru/pegawai (untuk dropdown, kop dinas, dan identitas)
CREATE POLICY "Semua user authenticated dapat melihat data pegawai"
  ON public.pegawai
  FOR SELECT
  TO authenticated
  USING (true);

-- Admin memiliki hak penuh mengelola data seluruh pegawai (tambah, edit, hapus)
CREATE POLICY "Admin dapat mengelola data pegawai"
  ON public.pegawai
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Guru dapat mengubah profil miliknya sendiri (misal avatar, kontak, dsb)
CREATE POLICY "Guru dapat mengubah profil sendiri"
  ON public.pegawai
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid() AND role = 'guru');

-- 7. POLICIES UNTUK TABEL JURNAL HARIAN
-- SELECT:
-- 1) Role Guru hanya bisa melihat jurnal miliknya sendiri (pegawai_id = auth.uid())
-- 2) Role Admin bisa melihat jurnal milik SEMUA guru
CREATE POLICY "Akses Baca Jurnal: Guru hanya miliknya, Admin semua"
  ON public.jurnal_harian
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR
    pegawai_id IN (
      SELECT id FROM public.pegawai WHERE auth_user_id = auth.uid()
    )
  );

-- INSERT:
-- 1) Guru hanya bisa membuat jurnal atas nama dirinya sendiri
-- 2) Admin bisa membuat jurnal atas nama guru manapun (pegawai_id guru yang dipilih)
CREATE POLICY "Akses Tambah Jurnal: Guru untuk diri sendiri, Admin untuk semua"
  ON public.jurnal_harian
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR
    pegawai_id IN (
      SELECT id FROM public.pegawai WHERE auth_user_id = auth.uid()
    )
  );

-- UPDATE:
-- 1) Guru hanya bisa mengubah jurnal miliknya sendiri
-- 2) Admin bisa mengubah jurnal milik guru manapun
CREATE POLICY "Akses Ubah Jurnal: Guru miliknya, Admin semua"
  ON public.jurnal_harian
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR
    pegawai_id IN (
      SELECT id FROM public.pegawai WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR
    pegawai_id IN (
      SELECT id FROM public.pegawai WHERE auth_user_id = auth.uid()
    )
  );

-- DELETE:
-- 1) Guru bisa menghapus jurnal miliknya sendiri
-- 2) Admin bisa menghapus jurnal guru manapun
CREATE POLICY "Akses Hapus Jurnal: Guru miliknya, Admin semua"
  ON public.jurnal_harian
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin()
    OR
    pegawai_id IN (
      SELECT id FROM public.pegawai WHERE auth_user_id = auth.uid()
    )
  );

-- 8. DATA SEEDING AWAL (SD NEGERI SUKABUDI 02)
INSERT INTO public.pegawai (
  nip, nama_lengkap, email, role, pangkat_golongan, jabatan, unit_kerja,
  nama_atasan, nip_atasan, jabatan_atasan
) VALUES
  ('196807151993032004', 'Dra. Hj. Siti Rohmah, M.M.Pd.', 'siti.rohmah@guru.sd.belajar.id', 'admin', 'Pembina Tk. I / IV/b', 'Kepala Sekolah & Admin Utama', 'SD Negeri Sukabudi 02', '-', '-', '-'),
  ('1989061420201210004', 'Tatang Supriatna, S.Pd.', 'tatang.supriatna@guru.sd.belajar.id', 'guru', 'Penata Muda / III/a', 'Guru Kelas VI', 'SD Negeri Sukabudi 02', 'Dra. Hj. Siti Rohmah, M.M.Pd.', '19680715 199303 2 004', 'Kepala Sekolah'),
  ('199304122022212015', 'Nabra Herbana, S.Pd., Gr.', 'nabra.herbana@guru.sd.belajar.id', 'guru', 'Penata Muda / IX', 'Guru PJOK', 'SD Negeri Sukabudi 02', 'Dra. Hj. Siti Rohmah, M.M.Pd.', '19680715 199303 2 004', 'Kepala Sekolah'),
  ('199508182023212008', 'Dewi Lestari, S.Pd.', 'dewi.lestari@guru.sd.belajar.id', 'guru', 'Penata Muda / IX', 'Guru Kelas III', 'SD Negeri Sukabudi 02', 'Dra. Hj. Siti Rohmah, M.M.Pd.', '19680715 199303 2 004', 'Kepala Sekolah'),
  ('199102102021211005', 'Ahmad Fauzi, S.Pd.I.', 'ahmad.fauzi@guru.sd.belajar.id', 'guru', 'Penata Muda Tk. I / III/b', 'Guru PAI', 'SD Negeri Sukabudi 02', 'Dra. Hj. Siti Rohmah, M.M.Pd.', '19680715 199303 2 004', 'Kepala Sekolah')
ON CONFLICT (nip) DO UPDATE SET role = EXCLUDED.role;


-- ==============================================================================
-- 9. SUPABASE STORAGE (OBJECT STORAGE UNTUK BUKTI FOTO & ASSET)
-- Mencegah penyimpanan Base64/BLOB langsung di database agar database ringan & hemat kuota
-- ==============================================================================

-- Buat bucket penyimpanan publik 'evidence-photos' jika belum tersedia
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence-photos',
  'evidence-photos',
  true,
  5242880, -- Batas 5MB per berkas foto
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Kebijakan RLS Storage: Siapapun (publik/tamu/guru) dapat melihat foto bukti (untuk cetak dokumen & PDF)
CREATE POLICY "Public Read: Melihat Foto Bukti"
ON storage.objects FOR SELECT
USING (bucket_id = 'evidence-photos');

-- Kebijakan RLS Storage: Guru & Admin dapat mengunggah foto bukti ke bucket
CREATE POLICY "Public/Auth Upload: Unggah Foto Bukti"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'evidence-photos');

-- Kebijakan RLS Storage: Pengguna dapat memperbarui foto bukti
CREATE POLICY "Public/Auth Update: Ubah Foto Bukti"
ON storage.objects FOR UPDATE
USING (bucket_id = 'evidence-photos');

-- Kebijakan RLS Storage: Pengguna dapat menghapus foto bukti
CREATE POLICY "Public/Auth Delete: Hapus Foto Bukti"
ON storage.objects FOR DELETE
USING (bucket_id = 'evidence-photos');
