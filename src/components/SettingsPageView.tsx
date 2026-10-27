import React, { useState } from 'react';
import { Profile, AuthAccounts, UserRole } from '../types';
import { NavTab } from './SidebarNav';
import {
  Camera,
  Sparkles,
  MapPin,
  Navigation,
  Upload,
  CheckCircle2,
  Save,
  ShieldCheck,
  PenTool,
  KeyRound,
  Eye,
  EyeOff,
  RotateCcw,
  Shield,
  GraduationCap,
  User,
  Trash2,
  Lock,
  Hash,
  RefreshCw,
} from 'lucide-react';
import { loadAuthAccounts, saveAuthAccounts, DEFAULT_ACCOUNTS, getInitials } from '../utils/storage';
import { generateTimemarkPhotoCode } from '../utils/watermark';
import { uploadImageToStorage } from '../utils/supabaseClient';

interface SettingsPageViewProps {
  profile: Profile;
  currentRole?: UserRole;
  onSaveProfile: (updatedProfile: Profile) => void;
  onNavigate?: (tab: NavTab) => void;
  showToast?: (message: string) => void;
}

export const SettingsPageView: React.FC<SettingsPageViewProps> = ({
  profile,
  currentRole = 'guru',
  onSaveProfile,
  onNavigate,
  showToast,
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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<
    'instansi' | 'avatar' | 'evidence' | 'login-logo' | 'pengesahan' | 'akun'
  >('instansi');

  const [accounts, setAccounts] = useState<AuthAccounts>(loadAuthAccounts);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showGuruPassword, setShowGuruPassword] = useState(false);
  const [accountSaveSuccess, setAccountSaveSuccess] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (showToast) showToast('Mengompresi & mengunggah foto profil...');
        const url = await uploadImageToStorage(file, 'avatars', `avatar_${formData.nip || 'user'}`);
        handleChange('avatarUrl', url);
        if (showToast) showToast('✓ Foto profil tersimpan di Object Storage');
      } catch (err) {
        console.warn('Gagal unggah foto profil:', err);
      }
    }
  };

  const handleRemoveAvatar = () => {
    handleChange('avatarUrl', '');
  };

  const handleSaveAccounts = () => {
    if (!accounts.admin.username.trim() || !accounts.admin.password.trim()) {
      if (showToast) showToast('Username & password Admin tidak boleh kosong!');
      return;
    }
    if (!accounts.guru.username.trim() || !accounts.guru.password.trim()) {
      if (showToast) showToast('Username & password Guru tidak boleh kosong!');
      return;
    }
    saveAuthAccounts(accounts);
    setAccountSaveSuccess(true);
    if (showToast) {
      showToast('✓ Username & password Admin serta Guru berhasil diperbarui!');
    }
    setTimeout(() => {
      setAccountSaveSuccess(false);
    }, 3500);
  };

  const handleResetDefaultAccounts = () => {
    setAccounts(DEFAULT_ACCOUNTS);
    saveAuthAccounts(DEFAULT_ACCOUNTS);
    setAccountSaveSuccess(true);
    if (showToast) {
      showToast('✓ Akun dikembalikan ke default: Admin (Admin/Admin123) & Guru (Guru/Guru123)');
    }
    setTimeout(() => {
      setAccountSaveSuccess(false);
    }, 3500);
  };

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
        if (showToast) showToast('Mengompresi & mengunggah logo instansi...');
        const url = await uploadImageToStorage(file, 'logos', 'logo_instansi');
        handleChange('customLogoUrl', url);
        handleChange('logoType', 'custom');
        if (showToast) showToast('✓ Logo instansi tersimpan di Object Storage');
      } catch (err) {
        console.warn('Gagal unggah logo instansi:', err);
      }
    }
  };

  const handleLoginLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (showToast) showToast('Mengompresi & mengunggah logo layar login...');
        const url = await uploadImageToStorage(file, 'logos', 'logo_login');
        handleChange('loginLogoUrl', url);
        handleChange('loginLogoType', 'custom');
        if (showToast) showToast('✓ Logo layar login tersimpan di Object Storage');
      } catch (err) {
        console.warn('Gagal unggah logo login:', err);
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
    onSaveProfile(formData);
    setSaveSuccess(true);
    if (showToast) {
      showToast('✓ Pengaturan aplikasi & kop surat berhasil disimpan!');
    }
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Save Success Alert Banner */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Pengaturan Berhasil Disimpan!</span> Format kop surat kedinasan, logo instansi, konfigurasi bukti foto Evidence Sikawan, dan layar login telah diperbarui dan langsung disinkronkan ke seluruh dokumen.
          </div>
        </div>
      )}

      {/* Sub Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-2xs flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('instansi')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            activeSubTab === 'instansi'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          1. Kop Instansi & Logo
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('avatar')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            activeSubTab === 'avatar'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          2. Foto Profil Pegawai
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('evidence')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            activeSubTab === 'evidence'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          3. Evidence Sikawan (Foto)
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('login-logo')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            activeSubTab === 'login-logo'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          4. Logo Layar Login
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('pengesahan')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            activeSubTab === 'pengesahan'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          5. Pengesahan & Lokasi
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('akun')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            activeSubTab === 'akun'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          6. Akun & Password Login
        </button>
      </div>

      {/* TAB 1: KOP INSTANSI & LOGO */}
      {activeSubTab === 'instansi' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-6">
          {/* Unggah Logo Instansi / Satuan Pendidikan */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white border border-dashed border-slate-300 rounded-xl flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-2xs">
                {formData.customLogoUrl ? (
                  <img
                    src={formData.customLogoUrl}
                    alt="Logo Instansi"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-slate-400 text-[10px]">
                    <Upload className="w-5 h-5 mx-auto mb-0.5 text-slate-400" />
                    <span>Belum ada logo</span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  Logo Resmi Sekolah / Instansi
                  {currentRole === 'guru' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Terkunci
                    </span>
                  )}
                </h4>
              </div>
            </div>

            {currentRole === 'admin' && (
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  id="page-custom-logo-input"
                  onChange={handleCustomLogoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="page-custom-logo-input"
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{formData.customLogoUrl ? 'Ganti Logo' : 'Unggah Logo'}</span>
                </label>

                {formData.customLogoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      handleChange('customLogoUrl', undefined);
                      handleChange('logoType', 'none');
                    }}
                    className="px-3 py-2 bg-white hover:bg-red-50 text-red-600 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                    title="Hapus logo yang diunggah"
                  >
                    Hapus
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kop Baris 1
              </label>
              <input
                type="text"
                value={formData.kopBaris1}
                readOnly={currentRole === 'guru'}
                onChange={(e) => handleChange('kopBaris1', e.target.value)}
                placeholder="DINAS PENDIDIKAN KABUPATEN BEKASI"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
                  currentRole === 'guru'
                    ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed'
                    : 'bg-white border-slate-300 text-slate-900 focus:outline-blue-600'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kop Baris 2
              </label>
              <input
                type="text"
                value={formData.kopBaris2}
                readOnly={currentRole === 'guru'}
                onChange={(e) => handleChange('kopBaris2', e.target.value)}
                placeholder="JURNAL HARIAN KINERJA"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
                  currentRole === 'guru'
                    ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed'
                    : 'bg-white border-slate-300 text-slate-900 focus:outline-blue-600'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kop Baris 3
              </label>
              <input
                type="text"
                value={formData.kopBaris3}
                readOnly={currentRole === 'guru'}
                onChange={(e) => handleChange('kopBaris3', e.target.value)}
                placeholder="SD NEGERI SUKABUDI 02"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black border transition-colors ${
                  currentRole === 'guru'
                    ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed'
                    : 'bg-white border-slate-300 text-slate-900 focus:outline-blue-600'
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Lengkap Satuan Pendidikan / Sekolah
              </label>
              <input
                type="text"
                value={formData.kopAlamat}
                readOnly={currentRole === 'guru'}
                onChange={(e) => handleChange('kopAlamat', e.target.value)}
                placeholder="Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi, Kab. Bekasi, Jawa Barat 17620"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border transition-colors ${
                  currentRole === 'guru'
                    ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed'
                    : 'bg-white border-slate-300 text-slate-900 focus:outline-blue-600'
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kontak / No. Telepon / Pos-el / Website Sekolah (Opsional)
              </label>
              <input
                type="text"
                value={formData.kopKontak}
                readOnly={currentRole === 'guru'}
                onChange={(e) => handleChange('kopKontak', e.target.value)}
                placeholder="Telp: (021) 8765432 | Pos-el: sdn02sukabudi@disdik.bekasikab.go.id"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border transition-colors ${
                  currentRole === 'guru'
                    ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed'
                    : 'bg-white border-slate-300 text-slate-900 focus:outline-blue-600'
                }`}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">

            {currentRole === 'admin' && (
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Kop</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FOTO PROFIL PEGAWAI & AVATAR INISIAL */}
      {activeSubTab === 'avatar' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left: Avatar Display Card */}
            <div className="md:col-span-1 bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col items-center text-center">
              <div className="relative group">
                <div
                  className={`w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center ${
                    formData.avatarUrl
                      ? 'bg-slate-100'
                      : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white'
                  }`}
                >
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt={formData.namaLengkap}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black tracking-wider drop-shadow-xs">
                      {getInitials(formData.namaLengkap)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  {formData.namaLengkap || 'Nama Pegawai'}
                </h4>
                <p className="text-xs text-slate-500">
                  {formData.jabatan || 'Guru'} • NIP. {formData.nip || '-'}
                </p>
              </div>

              <div className="mt-4 w-full">
                {formData.avatarUrl && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Foto Kustom Terpasang
                  </span>
                )}
              </div>
            </div>

            {/* Right: Upload controls */}
            <div className="md:col-span-2 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  id="avatar-photo-upload"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <label
                  htmlFor="avatar-photo-upload"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>Unggah / Ganti Foto Pegawai</span>
                </label>

                {formData.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Foto (Gunakan Inisial Nama)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Foto Profil Pegawai</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: EVIDENCE SIKAWAN (FOTO) */}
      {activeSubTab === 'evidence' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-600" />
              Konfigurasi Watermark & Stempel Bukti Evidence Sikawan
            </h3>
          </div>

          {/* Visual Live Preview of the Sikawan Watermark */}
          <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3 relative overflow-hidden shadow-inner">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Pratinjau Tampilan Stempel pada Foto Bukti:
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
                <p className="font-black text-xs tracking-tight">Rabu, 20/08/2025</p>
                <p className="font-semibold text-[11px] leading-tight text-slate-100">
                  {formData.alamatEvidence || 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi, Kabupaten Bekasi, Jawa Barat 17620'}
                </p>
                <p className="font-normal text-[10px] text-slate-300 font-mono pt-0.5">
                  {formData.koordinatEvidence || '6.139568°S, 107.110048°E'}
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields for Evidence */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Label Teks Stempel (Badge Kuning)
              </label>
              <input
                type="text"
                value={formData.labelEvidence || 'Absensi'}
                onChange={(e) => handleChange('labelEvidence', e.target.value)}
                placeholder="Absensi"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:outline-blue-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  Alamat Lengkap untuk Stempel Foto Timemark
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange('alamatEvidence', 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620')}
                    className="text-xs text-amber-800 hover:text-amber-950 font-bold cursor-pointer"
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
                    className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-blue-600 font-medium leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-blue-500" />
                  Koordinat GPS (Lintang & Bujur)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange('koordinatEvidence', '6.139568°S, 107.110048°E')}
                    className="text-xs text-amber-800 hover:text-amber-950 font-bold cursor-pointer"
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
                    className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:outline-blue-600 font-bold bg-slate-50/50"
              />
              <div className="flex items-center gap-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => handleChange('koordinatEvidence', '6.139568°S, 107.110048°E')}
                  className="text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  📍 Koordinat Default: 6.139568°S, 107.110048°E
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-purple-600" />
                  Kode Foto Default (Timemark Verified)
                </label>
                <button
                  type="button"
                  onClick={() => handleChange('kodeFotoDefault', generateTimemarkPhotoCode())}
                  className="text-xs text-purple-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Acak Kode Foto Baru
                </button>
              </div>
              <input
                type="text"
                value={formData.kodeFotoDefault || ''}
                onChange={(e) => handleChange('kodeFotoDefault', e.target.value.toUpperCase())}
                placeholder="NEH21B41DAUBCH"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-mono uppercase tracking-wider focus:outline-blue-600"
              />
            </div>

            {/* Ukuran Stempel Proporsional */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Ukuran Stempel Default (Proporsional terhadap Foto)
                </label>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  {Math.round((formData.skalaWatermark ?? 0.55) * 48.6)}% Lebar Foto
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleChange('skalaWatermark', 0.45)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    (formData.skalaWatermark ?? 0.55) <= 0.48
                      ? 'border-blue-600 bg-blue-600 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Sangat Kecil (22%)
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('skalaWatermark', 0.58)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    (formData.skalaWatermark ?? 0.55) > 0.48 && (formData.skalaWatermark ?? 0.55) <= 0.65
                      ? 'border-blue-600 bg-blue-600 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Pas / Proporsional (28%) ★
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('skalaWatermark', 0.72)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    (formData.skalaWatermark ?? 0.55) > 0.65
                      ? 'border-blue-600 bg-blue-600 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Sedang (35%)
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                *Rekomendasi 28% mengikuti standar Evidence Sikawan asli agar tidak menutupi wajah atau obyek utama foto.
              </p>
            </div>

            {/* Posisi Stempel */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Posisi Stempel Default pada Foto
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleChange('posisiWatermark', 'kiri-bawah')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    (formData.posisiWatermark || 'kiri-bawah') === 'kiri-bawah'
                      ? 'border-blue-600 bg-blue-600 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Kiri Bawah (Standar)
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('posisiWatermark', 'kiri-tengah')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    formData.posisiWatermark === 'kiri-tengah'
                      ? 'border-blue-600 bg-blue-600 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Kiri Tengah
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('posisiWatermark', 'kiri-atas')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    formData.posisiWatermark === 'kiri-atas'
                      ? 'border-blue-600 bg-blue-600 text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Kiri Atas
                </button>
              </div>
            </div>

            {/* Cantumkan Deskripsi di Foto Toggle */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Cantumkan Teks Ringkasan Kegiatan di Foto
                </span>
                <span className="text-[11px] text-slate-500">
                  Nonaktifkan agar stempel tetap ringkas dan tidak menutupi dokumentasi kegiatan
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.sertakanCatatanDiFoto ?? false}
                onChange={(e) => handleChange('sertakanCatatanDiFoto', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Evidence</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: LOGO LAYAR LOGIN */}
      {activeSubTab === 'login-logo' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="p-5 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Pratinjau Logo Login
              </h4>
            </div>
            {/* Live Mini Preview of Login Squircle */}
            <div className="w-20 h-20 rounded-3xl bg-[#edf3fa] shadow-[6px_6px_12px_#cad7e6,-6px_-6px_12px_#ffffff] border border-white flex items-center justify-center p-2.5 shrink-0">
              {formData.loginLogoType === 'custom' && (formData.loginLogoUrl || formData.customLogoUrl) ? (
                <img
                  src={formData.loginLogoUrl || formData.customLogoUrl}
                  alt="Preview Login"
                  className="w-14 h-14 object-contain drop-shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-sm shadow-xs">
                  3D
                </div>
              )}
            </div>
          </div>

          {currentRole === 'admin' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  type="button"
                  onClick={() => handleChange('loginLogoType', 'default')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    (!formData.loginLogoType || formData.loginLogoType === 'default')
                      ? 'border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white/70'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-extrabold text-xs">
                    3D
                  </div>
                  <span className="text-xs font-bold text-slate-800">Emblem Standar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('loginLogoType', 'custom')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    formData.loginLogoType === 'custom'
                      ? 'border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white/70'
                  }`}
                >
                  {formData.loginLogoUrl || formData.customLogoUrl ? (
                    <img
                      src={formData.loginLogoUrl || formData.customLogoUrl}
                      alt="Logo"
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <Upload className="w-6 h-6 text-slate-500" />
                  )}
                  <span className="text-xs font-bold text-slate-800">Unggah Logo</span>
                </button>
              </div>

              {formData.loginLogoType === 'custom' && (
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    id="page-login-logo-upload-input"
                    onChange={handleLoginLogoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="page-login-logo-upload-input"
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Unggah File Logo Khusus Login
                  </label>
                  {formData.customLogoUrl && !formData.loginLogoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('loginLogoUrl', formData.customLogoUrl);
                        handleChange('loginLogoType', 'custom');
                      }}
                      className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      Gunakan Logo Kop Surat yang Sudah Diunggah
                    </button>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan Logo Login</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Logo layar login telah disinkronkan dari Admin Sekolah</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PENGESAHAN & LOKASI */}
      {activeSubTab === 'pengesahan' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Pengesahan Laporan &amp; Pejabat Penilai / Atasan
            </h3>
          </div>

          {/* Kota Lokasi Penetapan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kota / Kabupaten Lokasi Pengesahan Dokumen
            </label>
            <input
              type="text"
              value={formData.kotaPenetapan}
              readOnly={currentRole === 'guru'}
              onChange={(e) => handleChange('kotaPenetapan', e.target.value)}
              placeholder="Bekasi"
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
                currentRole === 'guru'
                  ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed'
                  : 'bg-white border-slate-300 text-slate-900 focus:outline-blue-600'
              }`}
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Contoh penulisan pada lembar tanda tangan: &quot;{formData.kotaPenetapan || 'Bekasi'}, [Tanggal Dokumen]&quot;
            </span>
          </div>

          {/* Toggle Sertakan Atasan Langsung */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                disabled={currentRole === 'guru'}
                checked={formData.sertakanAtasan}
                onChange={(e) => handleChange('sertakanAtasan', e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
              />
              <div>
                <span className="font-bold text-slate-800 text-xs sm:text-sm block">
                  Sertakan Kolom Mengetahui Kepala Sekolah / Atasan Langsung
                </span>
                <span className="text-xs text-slate-500 block">
                  Jika diaktifkan, lembar pengesahan akan memuat 2 kolom tanda tangan: Atasan (kiri) dan Guru/Pegawai (kanan).
                </span>
              </div>
            </label>

            {formData.sertakanAtasan && (
              <div className="pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap &amp; Gelar Atasan Langsung <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.namaAtasan || ''}
                    readOnly={currentRole === 'guru'}
                    onChange={(e) => handleChange('namaAtasan', e.target.value)}
                    placeholder="Dra. Hj. Siti Rohmah, M.M.Pd."
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
                      currentRole === 'guru'
                        ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed'
                        : 'bg-white border-slate-300 text-slate-900 focus:outline-blue-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP / NUPTK Atasan Langsung
                  </label>
                  <input
                    type="text"
                    value={formData.nipAtasan || ''}
                    readOnly={currentRole === 'guru'}
                    onChange={(e) => handleChange('nipAtasan', e.target.value)}
                    placeholder="19680715 199303 2 004"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono border transition-colors ${
                      currentRole === 'guru'
                        ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed'
                        : 'bg-white border-slate-300 text-slate-900 focus:outline-blue-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan Atasan Langsung
                  </label>
                  <input
                    type="text"
                    value={formData.jabatanAtasan || ''}
                    readOnly={currentRole === 'guru'}
                    onChange={(e) => handleChange('jabatanAtasan', e.target.value)}
                    placeholder="Kepala Sekolah"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border transition-colors ${
                      currentRole === 'guru'
                        ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed'
                        : 'bg-white border-slate-300 text-slate-900 focus:outline-blue-600'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tanda Tangan Digital / Paraf */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tanda Tangan Pegawai */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800">
                    Tanda Tangan / Paraf Pegawai (PNG Transparan)
                  </h4>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Milik Pribadi
                  </span>
                </div>
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
                      <span>Belum ada paraf (tanda tangan manual basah)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>{formData.tandaTanganPegawaiUrl ? 'Ganti Paraf' : 'Unggah Paraf'}</span>
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
                    className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>

            {/* Tanda Tangan Atasan */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800">
                    Tanda Tangan / Cap Kepala Sekolah (Opsional)
                  </h4>
                  {currentRole === 'guru' && (
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Dikelola Admin
                    </span>
                  )}
                </div>
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
                      <span>Belum ada stempel/paraf atasan</span>
                    </div>
                  )}
                </div>
              </div>

              {currentRole === 'admin' ? (
                <div className="mt-3 flex items-center justify-between gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>{formData.tandaTanganAtasanUrl ? 'Ganti Cap/TTD' : 'Unggah Cap/TTD'}</span>
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
                      className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-3 text-[11px] text-slate-500 italic">
                  Stempel / TTD Kepala Sekolah dikelola terpusat oleh Admin Sekolah.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Pengesahan</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: AKUN & PASSWORD LOGIN */}
      {activeSubTab === 'akun' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                {currentRole === 'admin' ? 'Pengaturan Akun & Password Sistem' : 'Informasi Akun Login Anda'}
              </h3>
            </div>
          </div>

          {currentRole === 'guru' ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50/60 to-slate-50 border border-blue-200/80 rounded-2xl p-6 max-w-lg space-y-4 shadow-2xs">
                <div className="flex items-center gap-3 pb-3 border-b border-blue-100">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {formData.namaLengkap || 'Akun Guru'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      NIP: {formData.nip || '-'} • Unit: {formData.unitKerja || 'Sekolah'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-600">Username Login:</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                      {formData.username || formData.nip || 'Guru'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-600">Hak Akses:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      GURU (Jurnal Harian, Bukti Foto &amp; Laporan PDF)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Shortcut to Teacher Account Management */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-purple-950 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-purple-700" />
                    Beri Akun (Username &amp; Password) untuk Masing-masing Guru
                  </h4>
                </div>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('kelola-guru')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
                  >
                    Buka Kelola Data Guru →
                  </button>
                )}
              </div>

              {accountSaveSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs sm:text-sm font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Username dan password akun berhasil diperbarui dan langsung aktif untuk sesi login berikutnya!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kartu Akun Admin */}
                <div className="bg-gradient-to-b from-purple-50/50 to-slate-50 border border-purple-200/70 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center gap-3 pb-3 border-b border-purple-100">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        Akun Admin Utama
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                          Akses Penuh
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        Akses kelola data guru, monitoring laporan, dan entri kolektif
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Username Admin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={accounts.admin.username}
                      onChange={(e) =>
                        setAccounts((prev) => ({
                          ...prev,
                          admin: { ...prev.admin, username: e.target.value },
                        }))
                      }
                      placeholder="Admin"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:outline-purple-600 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password Admin <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={accounts.admin.password}
                        onChange={(e) =>
                          setAccounts((prev) => ({
                            ...prev,
                            admin: { ...prev.admin, password: e.target.value },
                          }))
                        }
                        placeholder="Admin123"
                        className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-mono font-bold focus:outline-purple-600 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                        title={showAdminPassword ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Kartu Akun Guru Fallback */}
                <div className="bg-gradient-to-b from-blue-50/50 to-slate-50 border border-blue-200/70 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center gap-3 pb-3 border-b border-blue-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        Akun Guru Umum (Fallback)
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                          Sesi Umum
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        Kredensial login cadangan jika guru belum memiliki akun individual
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Username Guru Umum <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={accounts.guru.username}
                      onChange={(e) =>
                        setAccounts((prev) => ({
                          ...prev,
                          guru: { ...prev.guru, username: e.target.value },
                        }))
                      }
                      placeholder="Guru"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:outline-blue-600 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password Guru Umum <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showGuruPassword ? 'text' : 'password'}
                        value={accounts.guru.password}
                        onChange={(e) =>
                          setAccounts((prev) => ({
                            ...prev,
                            guru: { ...prev.guru, password: e.target.value },
                          }))
                        }
                        placeholder="Guru123"
                        className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-mono font-bold focus:outline-blue-600 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGuruPassword(!showGuruPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                        title={showGuruPassword ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showGuruPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetDefaultAccounts}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Akun Default (Admin: Admin/Admin123 &amp; Guru: Guru/Guru123)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAccounts}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Username &amp; Password</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
