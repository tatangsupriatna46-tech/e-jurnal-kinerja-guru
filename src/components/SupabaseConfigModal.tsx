import React, { useState } from 'react';
import { Database, Copy, Check, X, Shield, ExternalLink, RefreshCw } from 'lucide-react';
import { loadSupabaseConfig, saveSupabaseConfig, getSupabaseClient } from '../utils/supabaseClient';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const [config, setConfig] = useState(loadSupabaseConfig);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'config' | 'panduan'>('sql');
  const [testingStatus, setTestingStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const sqlScript = `-- ==============================================================================
-- SKRIP SQL SUPABASE: E-JURNAL KINERJA GURU (RBAC: ADMIN & GURU)
-- Jalankan skrip ini di SQL Editor pada Dashboard Supabase Anda
-- ==============================================================================

-- 1. TABEL PEGAWAI (DENGAN ROLE 'admin' & 'guru')
CREATE TABLE IF NOT EXISTS public.pegawai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nip VARCHAR(30) UNIQUE NOT NULL,
  nama_lengkap VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  role VARCHAR(20) NOT NULL DEFAULT 'guru' CHECK (role IN ('admin', 'guru')),
  pangkat_golongan VARCHAR(100) DEFAULT 'Penata Muda / III/a',
  jabatan VARCHAR(100) DEFAULT 'Guru',
  unit_kerja VARCHAR(150) DEFAULT 'SD Negeri Sukabudi 02',
  kota_penetapan VARCHAR(100) DEFAULT 'Bekasi',
  sertakan_atasan BOOLEAN DEFAULT false,
  nama_atasan VARCHAR(150) DEFAULT 'Dra. Hj. Siti Rohmah, M.M.Pd.',
  nip_atasan VARCHAR(50) DEFAULT '19680715 199303 2 004',
  jabatan_atasan VARCHAR(100) DEFAULT 'Kepala Sekolah',
  kop_baris1 VARCHAR(150) DEFAULT 'DINAS PENDIDIKAN KABUPATEN BEKASI',
  kop_baris2 VARCHAR(150) DEFAULT 'JURNAL HARIAN KINERJA',
  kop_baris3 VARCHAR(150) DEFAULT 'SD NEGERI SUKABUDI 02',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABEL JURNAL HARIAN (DENGAN RELASI PEGAWAI_ID)
CREATE TABLE IF NOT EXISTS public.jurnal_harian (
  id VARCHAR(100) PRIMARY KEY,
  pegawai_id UUID NOT NULL REFERENCES public.pegawai(id) ON DELETE CASCADE,
  pegawai_nama VARCHAR(150),
  tanggal DATE NOT NULL,
  kegiatan_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  catatan TEXT,
  paper_size VARCHAR(10) DEFAULT 'A4',
  font_family VARCHAR(50) DEFAULT 'arial',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_pegawai_tanggal UNIQUE(pegawai_id, tanggal)
);

-- 3. FUNCTION DETEKSI ROLE ADMIN DARI AUTH.UID()
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

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.pegawai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_harian ENABLE ROW LEVEL SECURITY;

-- Guru hanya bisa baca, buat, dan edit jurnal miliknya sendiri (pegawai_id = auth.uid())
-- Admin memiliki akses penuh (Read, Create, Update, Delete) ke seluruh jurnal guru
CREATE POLICY "RLS_Jurnal_Select" ON public.jurnal_harian
  FOR SELECT TO authenticated
  USING (public.is_admin() OR pegawai_id IN (SELECT id FROM public.pegawai WHERE auth_user_id = auth.uid()));

CREATE POLICY "RLS_Jurnal_Insert" ON public.jurnal_harian
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR pegawai_id IN (SELECT id FROM public.pegawai WHERE auth_user_id = auth.uid()));

CREATE POLICY "RLS_Jurnal_Update" ON public.jurnal_harian
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR pegawai_id IN (SELECT id FROM public.pegawai WHERE auth_user_id = auth.uid()));

CREATE POLICY "RLS_Jurnal_Delete" ON public.jurnal_harian
  FOR DELETE TO authenticated
  USING (public.is_admin() OR pegawai_id IN (SELECT id FROM public.pegawai WHERE auth_user_id = auth.uid()));

CREATE POLICY "RLS_Pegawai_Select" ON public.pegawai FOR SELECT TO authenticated USING (true);
CREATE POLICY "RLS_Pegawai_Admin_All" ON public.pegawai FOR ALL TO authenticated USING (public.is_admin());

-- 5. SUPABASE STORAGE (BUCKET & RLS FOTO BUKTI)
-- Simpan URL saja ke database agar database tidak membengkak
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('evidence-photos', 'evidence-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public_Read_Evidence_Photos" ON storage.objects FOR SELECT USING (bucket_id = 'evidence-photos');
CREATE POLICY "Public_Upload_Evidence_Photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'evidence-photos');
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setIsCopied(true);
    showToast('Skrip SQL RLS Supabase berhasil disalin ke clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSaveConfig = () => {
    saveSupabaseConfig(config);
    showToast('Pengaturan kredensial Supabase berhasil disimpan');
  };

  const handleTestConnection = async () => {
    setTestingStatus('Sedang menguji koneksi...');
    try {
      const client = getSupabaseClient();
      if (!client) {
        setTestingStatus('Belum ada URL / Anon Key yang dimasukkan.');
        return;
      }
      const { data, error } = await client.from('pegawai').select('count', { count: 'exact', head: true });
      if (error) {
        setTestingStatus(`Koneksi terhubung ke Supabase, namun tabel belum dibuat: ${error.message}`);
      } else {
        setTestingStatus(`Koneksi Supabase Sukses! (Terdeteksi ${data ?? 0} data)`);
        saveSupabaseConfig({ ...config, isConnected: true });
      }
    } catch (e: any) {
      setTestingStatus(`Gagal konek: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Integrasi Database Supabase & Skrip SQL RLS
              </h3>
              <p className="text-xs text-slate-500">
                Sistem Role-Based Access Control (Admin & Guru)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-3 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'sql'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Skrip SQL RLS (Siap Jalankan)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('panduan')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'panduan'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Alur Kerja RBAC
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'config'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Kredensial URL & Key
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  Salin dan tempel ke <strong>Supabase SQL Editor</strong>:
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Tersalin!' : 'Salin SQL Lengkap'}</span>
                </button>
              </div>

              <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
                {sqlScript}
              </pre>
            </div>
          )}

          {activeTab === 'panduan' && (
            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <h4 className="font-bold text-blue-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Kebijakan Akses Data (RLS):
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-blue-800">
                  <li>
                    <strong>Role Guru:</strong> Hanya bisa melihat, mengisi, dan mengedit jurnal miliknya sendiri (terfilter berdasarkan <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">pegawai_id = auth.uid()</code>). Dropdown nama guru terkunci.
                  </li>
                  <li>
                    <strong>Role Admin:</strong> Memiliki akses penuh (Read, Create, Update, Delete) ke data seluruh guru. Di bagian atas form Jurnal Harian muncul dropdown untuk memilih guru dan menyimpan kegiatan atas nama guru yang dipilih.
                  </li>
                </ul>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                <h5 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Penyimpanan Foto Ringan &amp; Cepat (Supabase Object Storage):
                </h5>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Sistem otomatis mengompresi dan mengunggah foto bukti (Evidence Sikawan), logo instansi, dan foto profil guru ke <strong>Supabase Object Storage (bucket: <code>evidence-photos</code>)</strong>. Yang disimpan ke tabel basis data hanya berupa tautan / URL publik gambar, sehingga <strong>kuota database 500 MB tidak cepat penuh</strong> dan performa aplikasi tetap cepat selamanya.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <h5 className="font-bold text-slate-900">Alur Pengisian Kolektif Admin:</h5>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                  <li>Admin login sekali dengan akun Admin.</li>
                  <li>Buka tab "Jurnal Harian", pilih nama guru yang ingin diisikan (misal Pak Tatang).</li>
                  <li>KOP dinas dan identitas otomatis menyesuaikan dengan guru yang dipilih.</li>
                  <li>Admin mengisi uraian kegiatan dan mengunggah foto Evidence Sikawan ber-timestamp.</li>
                  <li>Saat disimpan, sistem otomatis mengaitkan <code className="bg-slate-200 px-1 rounded font-mono">pegawai_id</code> milik guru tersebut.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Masukkan URL dan Kunci Anonim proyek Supabase Anda. Jika belum terisi, aplikasi secara cerdas tetap berfungsi penuh menggunakan penyimpanan lokal terintegrasi.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  VITE_SUPABASE_URL
                </label>
                <input
                  type="text"
                  value={config.url}
                  onChange={(e) => setConfig({ ...config, url: e.target.value })}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  VITE_SUPABASE_ANON_KEY
                </label>
                <input
                  type="password"
                  value={config.anonKey}
                  onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Simpan Pengaturan
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Uji Koneksi</span>
                </button>
              </div>

              {testingStatus && (
                <div className="p-3 bg-slate-100 rounded-xl text-xs font-mono text-slate-700">
                  {testingStatus}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
