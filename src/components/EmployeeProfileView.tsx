import React, { useState } from 'react';
import { Profile, UserRole } from '../types';
import { NavTab } from './SidebarNav';
import { getInitials } from '../utils/storage';
import {
  UserCheck,
  Building2,
  ShieldCheck,
  Save,
  CheckCircle2,
  Upload,
  PenTool,
  Lock,
} from 'lucide-react';

interface EmployeeProfileViewProps {
  profile: Profile;
  currentRole?: UserRole;
  onSaveProfile: (updatedProfile: Profile) => void;
  onNavigate?: (tab: NavTab) => void;
}

export const EmployeeProfileView: React.FC<EmployeeProfileViewProps> = ({
  profile,
  currentRole = 'guru',
  onSaveProfile,
  onNavigate,
}) => {
  const [formData, setFormData] = useState<Profile>({ ...profile });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'pokok' | 'unit' | 'atasan' | 'ttd'>('pokok');

  // Common civil service ranks for quick selection
  const PANGKAT_OPTIONS = [
    'Pengatur Muda / II/a',
    'Pengatur Muda Tk. I / II/b',
    'Pengatur / II/c',
    'Pengatur Tk. I / II/d',
    'Penata Muda / III/a',
    'Penata Muda Tk. I / III/b',
    'Penata / III/c',
    'Penata Tk. I / III/d',
    'Pembina / IV/a',
    'Pembina Tk. I / IV/b',
    'Pembina Utama Muda / IV/c',
    'Pembina Utama Madya / IV/d',
    'Pembina Utama / IV/e',
    'PPPK Golongan IX',
    'PPPK Golongan X',
  ];

  const handleChange = (field: keyof Profile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSaveProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleSignatureUpload = (
    field: 'tandaTanganPegawaiUrl' | 'tandaTanganAtasanUrl',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (typeof uploadEvent.target?.result === 'string') {
          handleChange(field, uploadEvent.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">


      {/* Save Success Alert Banner */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Perubahan Berhasil Disimpan!</span> Data identitas pegawai Anda telah diperbarui dan langsung disinkronkan ke seluruh dokumen Jurnal Harian Kinerja dan lembar pengesahan tanda tangan.
          </div>
        </div>
      )}

      {/* Form Controls & Sections */}
      <div className="space-y-6">
          {/* Sub Navigation Tabs */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-2xs flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveSubTab('pokok')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                activeSubTab === 'pokok'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              1. Data Pokok ASN
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('unit')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                activeSubTab === 'unit'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              2. Unit Kerja & Lokasi
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('atasan')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                activeSubTab === 'atasan'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              3. Atasan Langsung
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('ttd')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                activeSubTab === 'ttd'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              4. Tanda Tangan Digital
            </button>
          </div>

          {/* TAB 1: DATA POKOK ASN */}
          {activeSubTab === 'pokok' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Data Pokok Pegawai / Guru
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Lengkap */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap (dengan Gelar Akademik) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.namaLengkap}
                    onChange={(e) => handleChange('namaLengkap', e.target.value)}
                    placeholder="Contoh: Tatang Supriatna, S.Pd."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* NIP */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Induk Pegawai (NIP) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => handleChange('nip', e.target.value)}
                    placeholder="Contoh: 1989061420201210004"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Jabatan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan Kedinasan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => handleChange('jabatan', e.target.value)}
                    placeholder="Contoh: Guru Kelas / Guru Pertama"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Pangkat & Golongan */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pangkat / Golongan Ruang <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.pangkatGolongan}
                      onChange={(e) => handleChange('pangkatGolongan', e.target.value)}
                      placeholder="Contoh: Penata Muda / III/a"
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleChange('pangkatGolongan', e.target.value);
                      }}
                      defaultValue=""
                      className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-blue-600 cursor-pointer"
                    >
                      <option value="" disabled>
                        Pilih Cepat Golongan
                      </option>
                      {PANGKAT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: UNIT KERJA & LOKASI */}
          {activeSubTab === 'unit' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Unit Kerja &amp; Penempatan
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Satuan Pendidikan / Unit Kerja */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit Kerja / Satuan Pendidikan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.unitKerja}
                    readOnly={currentRole === 'guru'}
                    onChange={(e) => handleChange('unitKerja', e.target.value)}
                    placeholder="Contoh: SD NEGERI SUKABUDI 02"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      currentRole === 'guru'
                        ? 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:outline-blue-600'
                    }`}
                  />
                </div>

                {/* Instansi Induk (Kop Baris 1) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Instansi Induk / Pemerintah Daerah
                  </label>
                  <input
                    type="text"
                    value={formData.kopBaris1}
                    readOnly={currentRole === 'guru'}
                    onChange={(e) => handleChange('kopBaris1', e.target.value)}
                    placeholder="Contoh: DINAS PENDIDIKAN KABUPATEN BEKASI"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      currentRole === 'guru'
                        ? 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:outline-blue-600'
                    }`}
                  />
                </div>

                {/* Kota / Tempat Penetapan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tempat / Kota Penetapan Laporan
                  </label>
                  <input
                    type="text"
                    value={formData.kotaPenetapan}
                    readOnly={currentRole === 'guru'}
                    onChange={(e) => handleChange('kotaPenetapan', e.target.value)}
                    placeholder="Contoh: Bekasi atau Sukawangi"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      currentRole === 'guru'
                        ? 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:outline-blue-600'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {currentRole === 'guru' ? (
                  <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tersinkronisasi dengan data Admin Sekolah</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Unit Kerja</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DATA ATASAN LANGSUNG */}
          {activeSubTab === 'atasan' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Pejabat Penilai / Atasan Langsung (Kepala Sekolah)
                </h3>
              </div>

              {/* Toggle sertakan atasan */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Sertakan Kolom Mengetahui Kepala Sekolah / Atasan
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={currentRole === 'guru'}
                    checked={formData.sertakanAtasan}
                    onChange={(e) => handleChange('sertakanAtasan', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Atasan */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Kepala Sekolah / Atasan (dengan Gelar)
                  </label>
                  <input
                    type="text"
                    value={formData.namaAtasan}
                    readOnly={currentRole === 'guru'}
                    onChange={(e) => handleChange('namaAtasan', e.target.value)}
                    placeholder="Contoh: Dra. Hj. Siti Rohmah, M.M.Pd."
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      currentRole === 'guru'
                        ? 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:outline-blue-600'
                    }`}
                  />
                </div>

                {/* NIP Atasan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP Atasan Langsung
                  </label>
                  <input
                    type="text"
                    value={formData.nipAtasan}
                    readOnly={currentRole === 'guru'}
                    onChange={(e) => handleChange('nipAtasan', e.target.value)}
                    placeholder="Contoh: 19680715 199303 2 004"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold border transition-colors ${
                      currentRole === 'guru'
                        ? 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:outline-blue-600'
                    }`}
                  />
                </div>

                {/* Jabatan Atasan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan Atasan
                  </label>
                  <input
                    type="text"
                    value={formData.jabatanAtasan}
                    readOnly={currentRole === 'guru'}
                    onChange={(e) => handleChange('jabatanAtasan', e.target.value)}
                    placeholder="Contoh: Kepala Sekolah SD Negeri Sukabudi 02"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      currentRole === 'guru'
                        ? 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:outline-blue-600'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {currentRole === 'guru' ? (
                  <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Data atasan otomatis terisi dari Admin Sekolah</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Data Atasan</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TANDA TANGAN DIGITAL */}
          {activeSubTab === 'ttd' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-blue-600" />
                  Tanda Tangan Elektronik / Digital
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tanda Tangan Pegawai */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-3">
                      Tanda Tangan Pegawai ({formData.namaLengkap ? formData.namaLengkap.split(',')[0] : 'Pegawai'})
                    </h4>

                    <div className="h-28 bg-white border border-dashed border-slate-300 rounded-xl flex items-center justify-center p-2 relative overflow-hidden">
                      {formData.tandaTanganPegawaiUrl ? (
                        <img
                          src={formData.tandaTanganPegawaiUrl}
                          alt="Tanda Tangan Pegawai"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-slate-400 text-xs">
                          <PenTool className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          <span>Belum ada tanda tangan (tanda tangan manual basah)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>{formData.tandaTanganPegawaiUrl ? 'Ganti TTD' : 'Unggah TTD'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSignatureUpload('tandaTanganPegawaiUrl', e)}
                      />
                    </label>

                    {formData.tandaTanganPegawaiUrl && (
                      <button
                        type="button"
                        onClick={() => handleChange('tandaTanganPegawaiUrl', undefined)}
                        className="text-xs text-red-600 hover:underline font-semibold"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>

                {/* Tanda Tangan Atasan */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-3">
                      Tanda Tangan Kepala Sekolah / Atasan
                    </h4>

                    <div className="h-28 bg-white border border-dashed border-slate-300 rounded-xl flex items-center justify-center p-2 relative overflow-hidden">
                      {formData.tandaTanganAtasanUrl ? (
                        <img
                          src={formData.tandaTanganAtasanUrl}
                          alt="Tanda Tangan Atasan"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-slate-400 text-xs">
                          <PenTool className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          <span>Belum ada tanda tangan (tanda tangan manual basah)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>{formData.tandaTanganAtasanUrl ? 'Ganti TTD' : 'Unggah TTD'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSignatureUpload('tandaTanganAtasanUrl', e)}
                      />
                    </label>

                    {formData.tandaTanganAtasanUrl && (
                      <button
                        type="button"
                        onClick={() => handleChange('tandaTanganAtasanUrl', undefined)}
                        className="text-xs text-red-600 hover:underline font-semibold"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Tanda Tangan</span>
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
