import React, { useState } from 'react';
import { Profile, UserRole } from '../types';
import {
  X,
  Save,
  Building2,
  User,
  ShieldCheck,
  Upload,
  CheckCircle2,
  Trash2,
  Sparkles,
  Camera,
  MapPin,
  Navigation,
} from 'lucide-react';
import {
  DinasPendidikanLogo,
  TutWuriHandayaniLogo,
  GarudaLogo,
  KemenagLogo,
} from './OfficialLogos';
import { uploadImageToStorage } from '../utils/supabaseClient';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  currentRole?: UserRole;
  onSave: (updatedProfile: Profile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  currentRole = 'guru',
  onSave,
}) => {
  const [formData, setFormData] = useState<Profile>(() => {
    const rawCoords = profile.koordinatEvidence;
    const finalCoord =
      !rawCoords ||
      rawCoords === '6.200000°S, 106.816666°E' ||
      rawCoords === '6.139434°S, 107.109875°E'
        ? '6.139568°S, 107.110048°E'
        : rawCoords;
    const rawAddr = profile.alamatEvidence;
    const finalAddr =
      !rawAddr || rawAddr.includes('Jl. Pendidikan No. 01')
        ? 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620'
        : rawAddr;

    return {
      ...profile,
      koordinatEvidence: finalCoord,
      alamatEvidence: finalAddr,
    };
  });
  const [activeTab, setActiveTab] = useState<'instansi' | 'pegawai' | 'atasan' | 'evidence'>('instansi');
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (field: keyof Profile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCustomLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setNotification('Mengompresi & mengunggah logo ke Storage...');
        const url = await uploadImageToStorage(file, 'logos', 'logo_instansi');
        handleChange('customLogoUrl', url);
        handleChange('logoType', 'custom');
        setNotification('✓ Logo instansi tersimpan di Object Storage');
        setTimeout(() => setNotification(null), 2500);
      } catch (err) {
        console.warn('Gagal upload logo:', err);
      }
    }
  };

  const handleLoginLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setNotification('Mengompresi & mengunggah logo login ke Storage...');
        const url = await uploadImageToStorage(file, 'logos', 'logo_login');
        handleChange('loginLogoUrl', url);
        handleChange('loginLogoType', 'custom');
        setNotification('✓ Logo layar login tersimpan di Object Storage');
        setTimeout(() => setNotification(null), 2500);
      } catch (err) {
        console.warn('Gagal upload logo login:', err);
      }
    }
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

  const handleSave = () => {
    onSave(formData);
    setNotification('Pengaturan profil dan kop instansi berhasil disimpan!');
    setTimeout(() => {
      setNotification(null);
      onClose();
    }, 900);
  };

  const fillSampleBekasi = () => {
    setFormData((prev) => ({
      ...prev,
      kopBaris1: 'DINAS PENDIDIKAN KABUPATEN BEKASI',
      kopBaris2: 'JURNAL HARIAN KINERJA',
      kopBaris3: 'SD NEGERI SUKABUDI 02',
      kopAlamat: '',
      kopKontak: '',
      logoType: 'disdik',
      namaLengkap: 'Tatang Supriatna, S.Pd.',
      nip: '1989061420201210004',
      pangkatGolongan: 'Penata Muda / III/a',
      jabatan: 'Guru',
      unitKerja: 'SD Negeri Sukabudi 02',
      kotaPenetapan: 'Bekasi',
      sertakanAtasan: false,
      labelEvidence: 'Evidence Sikawan',
      alamatEvidence: 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi, Kabupaten Bekasi, Jawa Barat 17620',
      koordinatEvidence: '6.139568°S, 107.110048°E',
    }));
  };

  const fillSampleSD = () => {
    setFormData((prev) => ({
      ...prev,
      kopBaris1: 'PEMERINTAH KABUPATEN BOGOR',
      kopBaris2: 'DINAS PENDIDIKAN',
      kopBaris3: 'SD NEGERI 01 SUKAMAJU',
      kopAlamat: 'Jl. Raya Pendidikan No. 45, Kec. Sukamaju, Kab. Bogor - Jawa Barat 16910',
      kopKontak: 'Telp: (021) 8765432 | Pos-el: sdn01sukamaju@disdik.bogorkab.go.id',
      logoType: 'tutwuri',
      namaLengkap: 'Nabra Herbana, S.Pd., Gr.',
      nip: '19891024 201502 1 003',
      pangkatGolongan: 'Penata Muda Tk. I / III/b',
      jabatan: 'Guru Kelas V (Ahli Pertama)',
      unitKerja: 'SD Negeri 01 Sukamaju',
      kotaPenetapan: 'Bogor',
      sertakanAtasan: true,
      namaAtasan: 'Dra. Hj. Siti Rohmah, M.M.Pd.',
      nipAtasan: '19680715 199303 2 004',
      jabatanAtasan: 'Kepala Sekolah',
    }));
  };

  const fillSampleSMP = () => {
    setFormData((prev) => ({
      ...prev,
      kopBaris1: 'PEMERINTAH PROVINSI JAWA BARAT',
      kopBaris2: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
      kopBaris3: 'SMA NEGERI 1 BINA BANGSA',
      kopAlamat: 'Jl. Diponegoro No. 88, Kota Bandung, Jawa Barat 40115',
      kopKontak: 'Website: sman1binabangsa.sch.id | Email: info@sman1binabangsa.sch.id',
      logoType: 'tutwuri',
      namaLengkap: 'Drs. Ahmad Fauzi, M.Pd.',
      nip: '19750512 200003 1 005',
      pangkatGolongan: 'Pembina / IV/a',
      jabatan: 'Guru Mata Pelajaran Matematika (Ahli Madya)',
      unitKerja: 'SMA Negeri 1 Bina Bangsa',
      kotaPenetapan: 'Bandung',
      sertakanAtasan: true,
      namaAtasan: 'Dr. H. Bambang Gunawan, M.Pd.',
      nipAtasan: '19650314 198902 1 002',
      jabatanAtasan: 'Kepala Sekolah',
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Building2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Pengaturan Profil & Kop Dinas</h3>
              <p className="text-xs text-emerald-100">
                Disimpan permanen di perangkat Anda (LocalStorage)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('instansi')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'instansi'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Kop Instansi & Logo
          </button>
          <button
            onClick={() => setActiveTab('pegawai')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'pegawai'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            Identitas Pegawai
          </button>
          <button
            onClick={() => setActiveTab('atasan')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'atasan'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Atasan & Tanda Tangan
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs md:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'evidence'
                ? 'border-amber-500 text-amber-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-600" />
            Evidence Sikawan (Foto)
          </button>
        </div>

        {/* Preset Helpers */}
        <div className="px-6 py-2 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-800">
          {currentRole === 'admin' ? (
            <>
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Isi Cepat Format Dinas:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={fillSampleBekasi}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium transition-colors shadow-2xs"
                >
                  SDN Sukabudi 02 (Kab. Bekasi)
                </button>
                <button
                  type="button"
                  onClick={fillSampleSD}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded text-emerald-800 font-medium transition-colors"
                >
                  Contoh Kab. Bogor
                </button>
                <button
                  type="button"
                  onClick={fillSampleSMP}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded text-emerald-800 font-medium transition-colors"
                >
                  Contoh Prov. Jabar
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-emerald-900 font-medium py-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Data Sekolah &amp; Kop Surat otomatis seragam mengikuti pengaturan Admin</span>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[62vh] overflow-y-auto space-y-4 text-xs md:text-sm">
          {notification && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* TAB 1: KOP INSTANSI */}
          {activeTab === 'instansi' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white border border-dashed border-slate-300 rounded-xl flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-2xs">
                    {formData.customLogoUrl ? (
                      <img
                        src={formData.customLogoUrl}
                        alt="Logo Instansi"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-slate-400 text-[10px]">
                        <Upload className="w-4 h-4 mx-auto mb-0.5" />
                        <span>Belum ada</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Logo Resmi Instansi</h5>
                    <p className="text-[11px] text-slate-500">Unggah berkas PNG/JPG logo sekolah</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="modal-custom-logo-input"
                    onChange={handleCustomLogoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="modal-custom-logo-input"
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" /> {formData.customLogoUrl ? 'Ganti' : 'Unggah'}
                  </label>
                  {formData.customLogoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('customLogoUrl', undefined);
                        handleChange('logoType', 'none');
                      }}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium shadow-2xs"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>

              {/* DEDICATED LOGO HALAMAN LOGIN CUSTOMIZATION */}
              <div className="p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-2xl border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Logo Halaman Login Aplikasi
                    </h4>
                    <p className="text-xs text-slate-600">
                      Pilih atau unggah logo khusus yang tampil di bagian tengah atas halaman Login
                    </p>
                  </div>
                  {/* Live Mini Preview of Login Squircle */}
                  <div className="w-14 h-14 rounded-2xl bg-[#edf3fa] shadow-[4px_4px_8px_#cad7e6,-4px_-4px_8px_#ffffff] border border-white flex items-center justify-center p-1.5 shrink-0">
                    {formData.loginLogoType === 'custom' && (formData.loginLogoUrl || formData.customLogoUrl) ? (
                      <img
                        src={formData.loginLogoUrl || formData.customLogoUrl}
                        alt="Preview Login"
                        className="w-10 h-10 object-contain drop-shadow-sm"
                      />
                    ) : formData.loginLogoType === 'tutwuri' ? (
                      <TutWuriHandayaniLogo className="w-9 h-9" />
                    ) : formData.loginLogoType === 'disdik' ? (
                      <DinasPendidikanLogo className="w-9 h-9" />
                    ) : formData.loginLogoType === 'kemenag' ? (
                      <KemenagLogo className="w-9 h-9" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                        3D
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleChange('loginLogoType', 'default')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      (!formData.loginLogoType || formData.loginLogoType === 'default')
                        ? 'border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white/70'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-extrabold text-[10px]">
                      3D
                    </div>
                    <span className="text-[11px] font-semibold text-slate-800">Emblem 3D</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('loginLogoType', 'tutwuri')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      formData.loginLogoType === 'tutwuri'
                        ? 'border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white/70'
                    }`}
                  >
                    <TutWuriHandayaniLogo className="w-7 h-7" />
                    <span className="text-[11px] font-semibold text-slate-800">Tut Wuri</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('loginLogoType', 'disdik')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      formData.loginLogoType === 'disdik'
                        ? 'border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white/70'
                    }`}
                  >
                    <DinasPendidikanLogo className="w-7 h-7" />
                    <span className="text-[11px] font-semibold text-slate-800">Disdik</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('loginLogoType', 'kemenag')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      formData.loginLogoType === 'kemenag'
                        ? 'border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white/70'
                    }`}
                  >
                    <KemenagLogo className="w-7 h-7" />
                    <span className="text-[11px] font-semibold text-slate-800">Kemenag</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('loginLogoType', 'custom')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      formData.loginLogoType === 'custom'
                        ? 'border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white/70'
                    }`}
                  >
                    {formData.loginLogoUrl || formData.customLogoUrl ? (
                      <img
                        src={formData.loginLogoUrl || formData.customLogoUrl}
                        alt="Logo"
                        className="w-7 h-7 object-contain"
                      />
                    ) : (
                      <Upload className="w-5 h-5 text-slate-500" />
                    )}
                    <span className="text-[11px] font-semibold text-slate-800">Kustom</span>
                  </button>
                </div>

                {formData.loginLogoType === 'custom' && (
                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      id="login-logo-upload-input"
                      onChange={handleLoginLogoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="login-logo-upload-input"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> Unggah File Logo Login
                    </label>
                    {formData.customLogoUrl && !formData.loginLogoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          handleChange('loginLogoUrl', formData.customLogoUrl);
                          handleChange('loginLogoType', 'custom');
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors"
                      >
                        Gunakan Logo Kop yang Sudah Diunggah
                      </button>
                    )}
                    <span className="text-[11px] text-slate-500">
                      Disimpan ke LocalStorage & langsung update pada layar Login
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kop Instansi Baris 1 (Pemerintah Daerah / Kementerian)
                </label>
                <input
                  type="text"
                  value={formData.kopBaris1}
                  onChange={(e) => handleChange('kopBaris1', e.target.value)}
                  placeholder="PEMERINTAH KABUPATEN BOGOR"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kop Instansi Baris 2 (Dinas / Badan)
                </label>
                <input
                  type="text"
                  value={formData.kopBaris2}
                  onChange={(e) => handleChange('kopBaris2', e.target.value)}
                  placeholder="DINAS PENDIDIKAN"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kop Instansi Baris 3 (Nama Satuan Pendidikan / Sekolah)
                </label>
                <input
                  type="text"
                  value={formData.kopBaris3}
                  onChange={(e) => handleChange('kopBaris3', e.target.value)}
                  placeholder="SD NEGERI 01 SUKAMAJU"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Instansi / Sekolah
                </label>
                <input
                  type="text"
                  value={formData.kopAlamat}
                  onChange={(e) => handleChange('kopAlamat', e.target.value)}
                  placeholder="Jl. Raya Pendidikan No. 45, Kec. Sukamaju, Kab. Bogor 16910"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kontak / Email / Website (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.kopKontak}
                  onChange={(e) => handleChange('kopKontak', e.target.value)}
                  placeholder="Telp: (021) 8765432 | Pos-el: sekolah@disdik.go.id"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600"
                />
              </div>
            </div>
          )}

          {/* TAB 2: IDENTITAS PEGAWAI */}
          {activeTab === 'pegawai' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar Akademik
                </label>
                <input
                  type="text"
                  value={formData.namaLengkap}
                  onChange={(e) => handleChange('namaLengkap', e.target.value)}
                  placeholder="Nabra Herbana, S.Pd., Gr."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIP / NUPTK / NIK
                  </label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => handleChange('nip', e.target.value)}
                    placeholder="19891024 201502 1 003"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pangkat / Golongan Ruang
                  </label>
                  <input
                    type="text"
                    value={formData.pangkatGolongan}
                    onChange={(e) => handleChange('pangkatGolongan', e.target.value)}
                    placeholder="Penata Muda Tk. I / III/b"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => handleChange('jabatan', e.target.value)}
                    placeholder="Guru Kelas V / Guru Ahli Pertama"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Unit Kerja / Satuan Pendidikan
                  </label>
                  <input
                    type="text"
                    value={formData.unitKerja}
                    onChange={(e) => handleChange('unitKerja', e.target.value)}
                    placeholder="SD Negeri 01 Sukamaju"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kota / Kabupaten Lokasi Pengesahan
                </label>
                <input
                  type="text"
                  value={formData.kotaPenetapan}
                  onChange={(e) => handleChange('kotaPenetapan', e.target.value)}
                  placeholder="Bogor"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Contoh: &quot;Bogor, 23 Oktober 2026&quot; pada tanda tangan kanan bawah
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: ATASAN & TANDA TANGAN */}
          {activeTab === 'atasan' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sertakanAtasan}
                    onChange={(e) => handleChange('sertakanAtasan', e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-800">
                    Sertakan Tanda Tangan Atasan Langsung (Mengetahui Kepala Sekolah)
                  </span>
                </label>
                <p className="text-xs text-slate-500 pl-6">
                  Jika dicentang, dokumen laporan akan menampilkan 2 kolom tanda tangan resmi
                  (Kepala Sekolah di kiri dan Guru/Pegawai di kanan).
                </p>

                {formData.sertakanAtasan && (
                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nama Lengkap & Gelar Atasan Langsung
                      </label>
                      <input
                        type="text"
                        value={formData.namaAtasan}
                        onChange={(e) => handleChange('namaAtasan', e.target.value)}
                        placeholder="Dra. Hj. Siti Rohmah, M.M.Pd."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          NIP Atasan Langsung
                        </label>
                        <input
                          type="text"
                          value={formData.nipAtasan}
                          onChange={(e) => handleChange('nipAtasan', e.target.value)}
                          placeholder="19680715 199303 2 004"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Jabatan Atasan
                        </label>
                        <input
                          type="text"
                          value={formData.jabatanAtasan}
                          onChange={(e) => handleChange('jabatanAtasan', e.target.value)}
                          placeholder="Kepala Sekolah"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-emerald-600"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Digital Signature / Paraf (Opsional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-2">
                  <span className="font-semibold text-slate-800 block text-xs">
                    Tanda Tangan / Paraf Pegawai (PNG)
                  </span>
                  {formData.tandaTanganPegawaiUrl ? (
                    <div className="relative border border-slate-300 rounded-lg p-2 flex items-center justify-center bg-slate-50 h-20">
                      <img
                        src={formData.tandaTanganPegawaiUrl}
                        alt="Tanda Tangan Pegawai"
                        className="max-h-16 max-w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => handleChange('tandaTanganPegawaiUrl', undefined)}
                        className="absolute top-1 right-1 p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        title="Hapus tanda tangan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="border border-dashed border-slate-300 hover:border-emerald-500 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all text-center">
                      <Upload className="w-4 h-4 text-slate-400 mb-1" />
                      <span className="text-[11px] font-medium text-slate-600">Unggah Gambar Paraf</span>
                      <span className="text-[10px] text-slate-400">PNG transparan direkomendasikan</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSignatureUpload('tandaTanganPegawaiUrl', e)}
                        className="hidden"
                      />
                    </label>
                  )}
                  <span className="text-[10px] text-slate-500">
                    *Kosongkan bila ingin tanda tangan basah manual setelah dicetak.
                  </span>
                </div>

                {formData.sertakanAtasan && (
                  <div className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-2">
                    <span className="font-semibold text-slate-800 block text-xs">
                      Tanda Tangan / Stempel Kepala Sekolah (PNG)
                    </span>
                    {formData.tandaTanganAtasanUrl ? (
                      <div className="relative border border-slate-300 rounded-lg p-2 flex items-center justify-center bg-slate-50 h-20">
                        <img
                          src={formData.tandaTanganAtasanUrl}
                          alt="Tanda Tangan Atasan"
                          className="max-h-16 max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => handleChange('tandaTanganAtasanUrl', undefined)}
                          className="absolute top-1 right-1 p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                          title="Hapus tanda tangan atasan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="border border-dashed border-slate-300 hover:border-emerald-500 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all text-center">
                        <Upload className="w-4 h-4 text-slate-400 mb-1" />
                        <span className="text-[11px] font-medium text-slate-600">Unggah Paraf / Cap</span>
                        <span className="text-[10px] text-slate-400">PNG transparan direkomendasikan</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSignatureUpload('tandaTanganAtasanUrl', e)}
                          className="hidden"
                        />
                      </label>
                    )}
                    <span className="text-[10px] text-slate-500">
                      *Bisa dikosongkan untuk tanda tangan basah langsung.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EVIDENCE SIKAWAN (STEMPEL FOTO) */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <Camera className="w-4 h-4 text-amber-600" />
                  <span>Stempel Bukti Evidence Sikawan Otomatis</span>
                </div>
                <p className="text-xs text-amber-800/90 leading-relaxed">
                  Setiap foto bukti kegiatan yang Anda unggah akan otomatis dicap dengan format stempel resmi Evidence Sikawan: kartu pill kuning-putih dengan jam digital besar, avatar ASN KORPRI, tanggal, alamat sekolah, dan koordinat GPS.
                </p>
              </div>

              {/* Visual Preview of the Sikawan Watermark */}
              <div className="p-4 bg-slate-900 rounded-xl text-white space-y-3 relative overflow-hidden shadow-inner">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Pratinjau Tampilan Stempel pada Foto:
                </div>

                {/* Top Badge Preview */}
                <div className="mb-1">
                  <img
                    src="/assets/aistudio/sikawan_header.png"
                    alt="Evidence Sikawan Header"
                    className="w-full max-w-[290px] h-auto rounded-md shadow-xs object-contain"
                  />
                </div>

                {/* Left Line & Info Preview */}
                <div className="flex items-start gap-2 pt-0.5">
                  <div className="w-[3px] self-stretch bg-[#ffb703] rounded-full shrink-0 shadow-xs"></div>
                  <div className="space-y-0.5 text-xs text-white">
                    <p className="font-extrabold text-xs tracking-tight">Rabu, 20/08/2025</p>
                    <p className="font-semibold text-[11px] leading-tight text-slate-100">
                      Kp Jl. Bulak Temu, Sukabudi, Kec.
                    </p>
                    <p className="font-semibold text-[11px] leading-tight text-slate-100">
                      Sukawangi, Kabupaten Bekasi, Jawa Barat
                    </p>
                    <p className="font-semibold text-[11px] leading-tight text-slate-100">
                      17620
                    </p>
                    <p className="font-normal text-[10px] text-slate-300 font-mono pt-0.5">
                      {formData.koordinatEvidence || '6.139568°S, 107.110048°E'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Label Teks Stempel (Badge Kuning)
                </label>
                <input
                  type="text"
                  value={formData.labelEvidence || 'Absensi'}
                  onChange={(e) => handleChange('labelEvidence', e.target.value)}
                  placeholder="Absensi"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-500" />
                    Alamat Lengkap untuk Stempel Foto Timemark
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleChange('alamatEvidence', 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620')}
                      className="text-[11px] text-amber-800 hover:text-amber-950 font-bold"
                    >
                      Reset Alamat Default
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        const addr = formData.kopAlamat || formData.unitKerja;
                        if (addr) handleChange('alamatEvidence', addr);
                      }}
                      className="text-[11px] text-emerald-700 hover:underline font-semibold"
                    >
                      Gunakan Alamat Kop
                    </button>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={formData.alamatEvidence || ''}
                  onChange={(e) => handleChange('alamatEvidence', e.target.value)}
                  placeholder="Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi, Kabupaten Bekasi, Jawa Barat 17620"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-amber-500 font-medium leading-relaxed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-blue-500" />
                    Koordinat GPS (Lintang & Bujur)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleChange('koordinatEvidence', '6.139568°S, 107.110048°E')}
                      className="text-[11px] text-amber-800 hover:text-amber-950 font-bold"
                    >
                      Reset Koordinat Default
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!navigator.geolocation) {
                          alert('Browser tidak mendukung geolokasi. Menggunakan koordinat default: 6.139568°S, 107.110048°E');
                          handleChange('koordinatEvidence', '6.139568°S, 107.110048°E');
                          return;
                        }
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            const lat = pos.coords.latitude;
                            const lng = pos.coords.longitude;
                            const latDir = lat >= 0 ? 'N' : 'S';
                            const lngDir = lng >= 0 ? 'E' : 'W';
                            const formatted = `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`;
                            handleChange('koordinatEvidence', formatted);
                          },
                          () => {
                            handleChange('koordinatEvidence', '6.139568°S, 107.110048°E');
                            alert('Gagal membaca GPS perangkat. Menggunakan koordinat default: 6.139568°S, 107.110048°E');
                          }
                        );
                      }}
                      className="text-[11px] text-blue-700 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> Deteksi GPS Otomatis
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.koordinatEvidence || ''}
                  onChange={(e) => handleChange('koordinatEvidence', e.target.value)}
                  placeholder="6.139568°S, 107.110048°E"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:outline-amber-500 font-bold bg-slate-50/50"
                />
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => handleChange('koordinatEvidence', '6.139568°S, 107.110048°E')}
                    className="text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 transition-colors"
                  >
                    📍 Koordinat Default: 6.139568°S, 107.110048°E
                  </button>
                </div>
              </div>

              {/* Ukuran Proporsional Default */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs">
                    Ukuran Stempel Default (Proporsional)
                  </label>
                  <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    {Math.round((formData.skalaWatermark ?? 0.55) * 48.6)}% Lebar Foto
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange('skalaWatermark', 0.45)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                      (formData.skalaWatermark ?? 0.55) <= 0.48
                        ? 'border-amber-600 bg-amber-500 text-slate-950 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    Sangat Kecil (22%)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('skalaWatermark', 0.58)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                      (formData.skalaWatermark ?? 0.55) > 0.48 && (formData.skalaWatermark ?? 0.55) <= 0.65
                        ? 'border-amber-600 bg-amber-500 text-slate-950 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    Pas / Proporsional (28%) ★
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('skalaWatermark', 0.72)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                      (formData.skalaWatermark ?? 0.55) > 0.65
                        ? 'border-amber-600 bg-amber-500 text-slate-950 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    Sedang (35%)
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  *Rekomendasi 28% mengikuti standar Evidence Sikawan asli agar tidak menutupi wajah atau papan tulis.
                </p>
              </div>

              {/* Posisi Default */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="font-bold text-slate-800 block text-xs">
                  Posisi Stempel Default
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange('posisiWatermark', 'kiri-bawah')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                      (formData.posisiWatermark || 'kiri-bawah') === 'kiri-bawah'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Kiri Bawah (Pojok)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('posisiWatermark', 'kiri-tengah')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                      formData.posisiWatermark === 'kiri-tengah'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Kiri Tengah
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('posisiWatermark', 'kiri-atas')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                      formData.posisiWatermark === 'kiri-atas'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Kiri Atas
                  </button>
                </div>
              </div>

              {/* Sertakan Catatan di Foto Toggle */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">
                    Cantumkan Teks Deskripsi di Foto
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Nonaktifkan agar stempel tetap ringkas & tidak menutupi foto kegiatan
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.sertakanCatatanDiFoto ?? false}
                  onChange={(e) => handleChange('sertakanCatatanDiFoto', e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3.5 flex items-center justify-between border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg font-medium text-xs md:text-sm transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs md:text-sm flex items-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};
