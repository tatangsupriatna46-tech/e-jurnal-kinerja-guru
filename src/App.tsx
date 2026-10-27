/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Profile, DailyReport, ActivityItem, UserRole, Pegawai } from './types';
import {
  loadProfile,
  saveProfile,
  loadCurrentReport,
  saveCurrentReport,
  loadHistory,
  DEFAULT_ACTIVITIES,
  deleteReportFromHistory,
  getInitialReport,
} from './utils/storage';
import {
  loadLocalPegawaiList,
  saveLocalPegawaiList,
  upsertPegawai,
  deletePegawai,
  convertPegawaiToProfile,
  fetchPegawaiList,
} from './utils/supabaseClient';
import { getLatestWorkingDateString, formatTanggalLengkapIndo } from './utils/dateUtils';
import { SidebarNav, NavTab } from './components/SidebarNav';
import { TopNavbar } from './components/TopNavbar';
import { DashboardView } from './components/DashboardView';
import { EmployeeProfileView } from './components/EmployeeProfileView';
import { SettingsPageView } from './components/SettingsPageView';
import { ActivityForm } from './components/ActivityForm';
import { OfficialReportView } from './components/OfficialReportView';
import { HistoryView } from './components/HistoryView';
import { AdminTeacherManagementView } from './components/AdminTeacherManagementView';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { LoginPage } from './components/LoginPage';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ProfileModal } from './components/ProfileModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { CopySummaryModal } from './components/CopySummaryModal';
import { exportElementToPdf, triggerDirectPrint } from './utils/pdfExport';
import {
  Download,
  Printer,
  Edit3,
  Settings,
  CheckCircle,
  HelpCircle,
  Eye,
  FileCheck2,
  ExternalLink,
  X,
  Lock,
} from 'lucide-react';

export default function App() {
  // Authentication & RBAC State
  // Initial state checked against localStorage; default to showing LoginPage if not previously logged in
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ejurnal_is_logged_in') === 'true';
  });
  const [currentRole, setCurrentRole] = useState<UserRole>('guru');
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>(loadLocalPegawaiList);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => {
    const list = loadLocalPegawaiList();
    const defaultGuru = list.find((p) => p.role === 'guru') || list[0];
    return defaultGuru ? defaultGuru.id : 'peg-guru-1';
  });
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [report, setReport] = useState<DailyReport>(() => {
    const loaded = loadCurrentReport();
    const prof = loadProfile();
    return {
      ...loaded,
      pegawaiId: loaded.pegawaiId || 'peg-guru-1',
      pegawaiNama: (loaded.pegawaiNama && !loaded.pegawaiNama.includes('Tatang')) ? loaded.pegawaiNama : prof.namaLengkap,
    };
  });
  const [historyList, setHistoryList] = useState<DailyReport[]>(loadHistory);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [pdfResult, setPdfResult] = useState<{
    isOpen: boolean;
    blobUrl: string;
    filename: string;
  } | null>(null);

  // Status
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const printableRef = useRef<HTMLDivElement | null>(null);

  // Auto-save whenever report changes & keep history synchronized
  useEffect(() => {
    saveCurrentReport(report);
    setHistoryList(loadHistory());
  }, [report]);

  // Sync teachers from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    async function initSupabaseData() {
      try {
        const remoteList = await fetchPegawaiList();
        if (isMounted && Array.isArray(remoteList) && remoteList.length > 0) {
          setPegawaiList(remoteList);
        }
      } catch (e) {
        console.warn('Initial Supabase fetch error:', e);
      }
    }
    initSupabaseData();
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleSaveProfile = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    saveProfile(updatedProfile);

    // Synchronize to pegawaiList and propagate school branding (logos & kop)
    setPegawaiList((prev) => {
      const updated = prev.map((p) => {
        if (p.id === selectedTeacherId) {
          return {
            ...p,
            namaLengkap: updatedProfile.namaLengkap,
            nip: updatedProfile.nip,
            jabatan: updatedProfile.jabatan,
            pangkatGolongan: updatedProfile.pangkatGolongan,
            unitKerja: updatedProfile.unitKerja,
            avatarUrl: updatedProfile.avatarUrl,
            customLogoUrl: updatedProfile.customLogoUrl,
            logoType: updatedProfile.logoType,
            loginLogoUrl: updatedProfile.loginLogoUrl,
            loginLogoType: updatedProfile.loginLogoType,
            kopBaris1: updatedProfile.kopBaris1,
            kopBaris2: updatedProfile.kopBaris2,
            kopBaris3: updatedProfile.kopBaris3,
            kopAlamat: updatedProfile.kopAlamat,
            kopKontak: updatedProfile.kopKontak,
            namaAtasan: updatedProfile.namaAtasan,
            nipAtasan: updatedProfile.nipAtasan,
            jabatanAtasan: updatedProfile.jabatanAtasan,
            sertakanAtasan: updatedProfile.sertakanAtasan,
            kotaPenetapan: updatedProfile.kotaPenetapan,
            labelEvidence: updatedProfile.labelEvidence,
            alamatEvidence: updatedProfile.alamatEvidence,
            koordinatEvidence: updatedProfile.koordinatEvidence,
            skalaWatermark: updatedProfile.skalaWatermark,
            posisiWatermark: updatedProfile.posisiWatermark,
            sertakanCatatanDiFoto: updatedProfile.sertakanCatatanDiFoto,
          };
        }
        // Propagate shared school branding to all other teachers
        return {
          ...p,
          unitKerja: updatedProfile.unitKerja || p.unitKerja,
          customLogoUrl: updatedProfile.customLogoUrl ?? p.customLogoUrl,
          logoType: updatedProfile.logoType || p.logoType,
          loginLogoUrl: updatedProfile.loginLogoUrl ?? p.loginLogoUrl,
          loginLogoType: updatedProfile.loginLogoType || p.loginLogoType,
          kopBaris1: updatedProfile.kopBaris1 || p.kopBaris1,
          kopBaris2: updatedProfile.kopBaris2 || p.kopBaris2,
          kopBaris3: updatedProfile.kopBaris3 || p.kopBaris3,
          kopAlamat: updatedProfile.kopAlamat || p.kopAlamat,
          kopKontak: updatedProfile.kopKontak || p.kopKontak,
          namaAtasan: updatedProfile.namaAtasan || p.namaAtasan,
          nipAtasan: updatedProfile.nipAtasan || p.nipAtasan,
          jabatanAtasan: updatedProfile.jabatanAtasan || p.jabatanAtasan,
          kotaPenetapan: updatedProfile.kotaPenetapan || p.kotaPenetapan,
          labelEvidence: updatedProfile.labelEvidence || p.labelEvidence,
          alamatEvidence: updatedProfile.alamatEvidence || p.alamatEvidence,
          koordinatEvidence: updatedProfile.koordinatEvidence || p.koordinatEvidence,
          skalaWatermark: updatedProfile.skalaWatermark ?? p.skalaWatermark,
          posisiWatermark: updatedProfile.posisiWatermark || p.posisiWatermark,
        };
      });
      saveLocalPegawaiList(updated);

      const activeTeacher = updated.find((p) => p.id === selectedTeacherId);
      if (activeTeacher) {
        upsertPegawai(activeTeacher);
      }
      return updated;
    });

    showToast('Profil pegawai & pengaturan berhasil diperbarui');
  };

  // Switch role between 'admin' and 'guru'
  const handleSwitchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'guru') {
      // Find default guru profile (e.g. Tatang Supriatna)
      const guruPegawai = pegawaiList.find((p) => p.role === 'guru') || pegawaiList[1] || pegawaiList[0];
      if (guruPegawai) {
        setSelectedTeacherId(guruPegawai.id);
        const p = convertPegawaiToProfile(guruPegawai);
        setProfile(p);
        saveProfile(p);
      }
      if (activeTab === 'kelola-guru') {
        setActiveTab('dashboard');
      }
      showToast(`Beralih ke Sesi Guru: ${profile.namaLengkap}`);
    } else {
      showToast('Beralih ke Sesi Admin Utama (Akses Pengisian Kolektif & Monitoring Seluruh Guru)');
    }
  };

  // Admin selects a teacher for inputting journal or viewing
  const handleSelectPegawaiForJournal = (selectedPegawai: Pegawai) => {
    setSelectedTeacherId(selectedPegawai.id);
    const newProfile = convertPegawaiToProfile(selectedPegawai);
    setProfile(newProfile);
    saveProfile(newProfile);

    // Look for existing report for this teacher on current date
    const existingReport = historyList.find(
      (h) => h.pegawaiId === selectedPegawai.id && h.tanggal === report.tanggal
    );

    if (existingReport) {
      setReport(existingReport);
    } else {
      const updatedReport: DailyReport = {
        ...report,
        id: `rep-${selectedPegawai.id}-${Date.now()}`,
        pegawaiId: selectedPegawai.id,
        pegawaiNama: selectedPegawai.namaLengkap,
      };
      setReport(updatedReport);
      saveCurrentReport(updatedReport);
    }

    setActiveTab('jurnal');
    showToast(`Formulir disesuaikan untuk: ${selectedPegawai.namaLengkap}`);
  };

  const handleSavePegawai = async (newOrUpdated: Pegawai) => {
    const updated = await upsertPegawai(newOrUpdated);
    setPegawaiList(updated);
    if (selectedTeacherId === newOrUpdated.id) {
      const p = convertPegawaiToProfile(newOrUpdated);
      setProfile(p);
      saveProfile(p);
    }
    showToast(`Data guru ${newOrUpdated.namaLengkap} berhasil disimpan`);
  };

  const handleDeletePegawai = async (id: string) => {
    const updated = await deletePegawai(id);
    setPegawaiList(updated);
    showToast('Profil guru berhasil dihapus dari sistem');
  };

  const handleCreateNewDay = () => {
    const today = getLatestWorkingDateString();
    const newReport: DailyReport = {
      id: 'report-' + Date.now(),
      tanggal: today,
      pegawaiId: selectedTeacherId,
      pegawaiNama: profile.namaLengkap,
      paperSize: report.paperSize || 'A4',
      fontFamily: report.fontFamily || 'arial',
      kegiatanList: DEFAULT_ACTIVITIES.map((act, i) => ({
        ...act,
        id: `act-${Date.now()}-${i + 1}`,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReport(newReport);
    setHistoryList(loadHistory());
    setActiveTab('jurnal');
    showToast(`Memulai formulir jurnal kerja untuk ${formatTanggalLengkapIndo(today)}`);
  };

  const handleDeleteReport = (reportToDelete: DailyReport) => {
    // 1. Delete from persistent history
    const remaining = deleteReportFromHistory(reportToDelete.id, reportToDelete.tanggal);
    setHistoryList(remaining);

    // 2. Check if the active report matches the one being deleted
    const isCurrent =
      report.id === reportToDelete.id || report.tanggal === reportToDelete.tanggal;

    if (isCurrent) {
      if (remaining.length > 0) {
        setReport(remaining[0]);
        localStorage.setItem('ejurnal_guru_current_report_v1', JSON.stringify(remaining[0]));
      } else {
        const fresh = getInitialReport();
        setReport(fresh);
        localStorage.setItem('ejurnal_guru_current_report_v1', JSON.stringify(fresh));
      }
    }

    showToast(`Arsip jurnal tanggal ${formatTanggalLengkapIndo(reportToDelete.tanggal)} berhasil dihapus`);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast('Sedang merender berkas PDF resmi...');

      const safeName = profile.namaLengkap
        ? profile.namaLengkap.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)
        : 'Pegawai';
      const filename = `Jurnal_Harian_Kinerja_${safeName}_${report.tanggal}.pdf`;

      const res = await exportElementToPdf({
        elementId: 'printable-document',
        filename,
        paperSize: report.paperSize || 'A4',
        onSuccess: (result) => {
          setPdfResult({
            isOpen: true,
            blobUrl: result.blobUrl,
            filename: result.filename,
          });
          showToast('Berkas PDF berhasil digenerate!');
        },
        onError: (err) => {
          console.error('PDF export error:', err);
          showToast('Gagal generate PDF: ' + err.message);
        },
      });

      if (res && res.blobUrl) {
        setPdfResult({
          isOpen: true,
          blobUrl: res.blobUrl,
          filename: res.filename,
        });
      }
    } catch (e) {
      console.error(e);
      showToast('Terjadi kendala saat download. Silakan coba Cetak Langsung.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDirectPrint = () => {
    if (activeTab !== 'laporan') {
      setActiveTab('laporan');
    }
    try {
      const ok = triggerDirectPrint();
      if (!ok) {
        // If direct window.print is blocked by browser/iframe, trigger PDF export
        handleDownloadPdf();
      }
    } catch (e) {
      console.warn('Print error fallback:', e);
      handleDownloadPdf();
    }
  };

  // Login handler
  const handleLogin = (role: UserRole, selectedPegawai?: Pegawai) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    localStorage.setItem('ejurnal_is_logged_in', 'true');

    if (selectedPegawai) {
      setSelectedTeacherId(selectedPegawai.id);
      const p = convertPegawaiToProfile(selectedPegawai);
      setProfile(p);
      saveProfile(p);

      const existingReport = historyList.find(
        (h) =>
          (h.pegawaiId === selectedPegawai.id || (!h.pegawaiId && selectedPegawai.id === 'peg-tatang')) &&
          h.tanggal === report.tanggal
      );
      if (existingReport) {
        setReport(existingReport);
      } else {
        const updatedReport: DailyReport = {
          ...report,
          id: `rep-${selectedPegawai.id}-${Date.now()}`,
          pegawaiId: selectedPegawai.id,
          pegawaiNama: selectedPegawai.namaLengkap,
        };
        setReport(updatedReport);
        saveCurrentReport(updatedReport);
      }
    }

    if (role === 'guru' && activeTab === 'kelola-guru') {
      setActiveTab('dashboard');
    }

    showToast(
      role === 'admin'
        ? '✓ Berhasil masuk sebagai Admin Utama'
        : `✓ Berhasil masuk sebagai Guru: ${selectedPegawai ? selectedPegawai.namaLengkap : profile.namaLengkap}`
    );
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ejurnal_is_logged_in');
    showToast('Anda telah keluar dari aplikasi.');
  };

  // If not authenticated, render the exact Neumorphic LoginPage from mockup
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage
          currentRole={currentRole}
          profile={profile}
          pegawaiList={pegawaiList}
          onLogin={handleLogin}
          onOpenSettings={() => setIsProfileOpen(true)}
        />

        {/* Profile Modal can be opened from login page to immediately test/change logo */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          profile={profile}
          onSave={handleSaveProfile}
        />

        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom duration-200">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex font-sans antialiased">
      {/* Sleek Left Sidebar Navigation */}
      <SidebarNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'kelola-guru' && currentRole !== 'admin') {
            showToast('Akses dibatasi: Menu Kelola Data Guru hanya untuk Admin.');
            setActiveTab('dashboard');
          } else {
            setActiveTab(tab);
          }
        }}
        profile={profile}
        todayCount={report.kegiatanList.length}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        currentRole={currentRole}
        adminName={pegawaiList.find((p) => p.role === 'admin')?.namaLengkap || 'Administrator / Kepala Sekolah, M.Pd.'}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-8">
        {/* Modern Top Navbar */}
        <TopNavbar
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenProfile={() => setActiveTab('pengaturan')}
          onOpenCopyModal={() => setIsCopyModalOpen(true)}
          onDirectPrint={handleDirectPrint}
          onDownloadPdf={handleDownloadPdf}
          isGeneratingPdf={isGeneratingPdf}
          profile={profile}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onQuickNewEntry={() => {
            setActiveTab('jurnal');
          }}
          onLogout={handleLogout}
        />

        {/* Dynamic View Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardView
              report={report}
              profile={profile}
              onNavigate={setActiveTab}
              onOpenProfile={() => setIsProfileOpen(true)}
              onDownloadPdf={handleDownloadPdf}
              onDirectPrint={handleDirectPrint}
              currentRole={currentRole}
              pegawaiList={pegawaiList}
              historyList={historyList}
              onSelectTeacherForJournal={handleSelectPegawaiForJournal}
              onViewReportForTeacher={(teacher, teacherReport) => {
                if (teacherReport) {
                  setReport(teacherReport);
                }
                const p = convertPegawaiToProfile(teacher);
                setProfile(p);
                setActiveTab('laporan');
              }}
            />
          )}

          {/* TAB: IDENTITAS PEGAWAI */}
          {activeTab === 'identitas' && (
            <EmployeeProfileView
              profile={profile}
              currentRole={currentRole}
              onSaveProfile={handleSaveProfile}
              onNavigate={setActiveTab}
            />
          )}

          {/* TAB: JURNAL (EDITOR) */}
          {activeTab === 'jurnal' && (
            <div className="space-y-6">
              <ActivityForm
                report={report}
                profile={profile}
                onChangeReport={(updated) => setReport(updated)}
                onOpenPreview={() => setActiveTab('laporan')}
                onSave={(savedReport) => {
                  const withMeta: DailyReport = {
                    ...savedReport,
                    pegawaiId: selectedTeacherId,
                    pegawaiNama: profile.namaLengkap,
                  };
                  saveCurrentReport(withMeta);
                  setHistoryList(loadHistory());
                  showToast('✓ Inputan jurnal harian berhasil disimpan!');
                }}
                currentRole={currentRole}
                pegawaiList={pegawaiList}
                selectedPegawaiId={selectedTeacherId}
                onSelectPegawai={handleSelectPegawaiForJournal}
              />
            </div>
          )}

          {/* TAB: KELOLA GURU (ADMIN ONLY) */}
          {activeTab === 'kelola-guru' && (
            currentRole === 'admin' ? (
              <AdminTeacherManagementView
                pegawaiList={pegawaiList}
                currentProfile={profile}
                onSavePegawai={handleSavePegawai}
                onDeletePegawai={handleDeletePegawai}
                onSelectPegawaiForJournal={handleSelectPegawaiForJournal}
                showToast={showToast}
              />
            ) : (
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center space-y-4 max-w-lg mx-auto shadow-sm my-8">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Menu Khusus Admin Sekolah</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Fitur <strong>Kelola Data Guru</strong> disembunyikan dan dibatasi khusus untuk akun <strong>Admin</strong>. Anda saat ini masuk dengan hak akses <strong>Guru</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            )
          )}



          {/* TAB: LAPORAN (OFFICIAL PDF PREVIEW) */}
          {activeTab === 'laporan' && (
            <div className="space-y-6">
              {/* Document Toolbar */}
              <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab('jurnal')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Isi Jurnal
                  </button>

                  <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-700">Kertas:</span>
                    <select
                      value={report.paperSize}
                      onChange={(e) =>
                        setReport({
                          ...report,
                          paperSize: e.target.value as 'A4' | 'F4',
                        })
                      }
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-700 focus:outline-blue-600 cursor-pointer"
                    >
                      <option value="F4">F4 / Folio (215 x 330 mm)</option>
                      <option value="A4">A4 Standar (210 x 297 mm)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-700">Gaya Huruf:</span>
                    <select
                      value={report.fontFamily}
                      onChange={(e) =>
                        setReport({
                          ...report,
                          fontFamily: e.target.value as 'arial' | 'times' | 'merriweather' | 'sans',
                        })
                      }
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-blue-600 cursor-pointer"
                    >
                      <option value="arial">Arial (Standar Kedinasan)</option>
                      <option value="times">Resmi Dinas (Times/Serif)</option>
                      <option value="merriweather">Klasik Kedinasan</option>
                      <option value="sans">Modern (Sans-Serif)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('pengaturan')}
                    className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Ubah Kop
                  </button>

                  <button
                    onClick={handleDirectPrint}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak Langsung
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isGeneratingPdf ? 'Membuat PDF...' : 'Unduh Berkas PDF'}
                  </button>
                </div>
              </div>

              {/* Printable Official Paper Container */}
              <div className="print-clean-wrapper bg-slate-200/80 p-2 sm:p-6 rounded-2xl shadow-inner border border-slate-300/80 overflow-x-auto print:bg-white print:p-0 print:m-0 print:border-none print:shadow-none">
                <OfficialReportView
                  profile={profile}
                  report={report}
                  printableRef={printableRef}
                />
              </div>
            </div>
          )}

          {/* TAB: RIWAYAT (HISTORY PER DATE) */}
          {activeTab === 'riwayat' && (
            <HistoryView
              historyList={historyList}
              currentReport={report}
              profile={profile}
              onSelectReport={(selectedReport) => {
                setReport(selectedReport);
                saveCurrentReport(selectedReport);
                setActiveTab('jurnal');
                showToast(`Membuka jurnal tanggal ${selectedReport.tanggal}`);
              }}
              onOpenReportView={(selectedReport) => {
                setReport(selectedReport);
                saveCurrentReport(selectedReport);
                setActiveTab('laporan');
                showToast(`Menampilkan dokumen laporan tanggal ${selectedReport.tanggal}`);
              }}
              onDirectPrintForReport={(selectedReport) => {
                setReport(selectedReport);
                saveCurrentReport(selectedReport);
                setTimeout(() => {
                  handleDirectPrint();
                }, 150);
              }}
              onDeleteReport={handleDeleteReport}
              onRefreshHistory={() => {
                setHistoryList(loadHistory());
              }}
              showToast={showToast}
              currentRole={currentRole}
              pegawaiList={pegawaiList}
              activePegawaiId={selectedTeacherId}
            />
          )}

          {/* TAB: PENGATURAN (SETTINGS INLINE PAGE VIEW - SAME AS IDENTITAS PEGAWAI) */}
          {activeTab === 'pengaturan' && (
            <SettingsPageView
              profile={profile}
              currentRole={currentRole}
              onSaveProfile={handleSaveProfile}
              onNavigate={setActiveTab}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Offscreen printable document when not on 'laporan' tab so PDF download & print work from anywhere */}
      {activeTab !== 'laporan' && (
        <div
          className="no-print"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: report.paperSize === 'F4' ? '215mm' : '210mm',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <OfficialReportView
            profile={profile}
            report={report}
            printableRef={printableRef}
          />
        </div>
      )}

      {/* Mobile Bottom Navigation matching smartphone mockup */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenProfile={() => setActiveTab('pengaturan')}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-18 lg:bottom-5 right-5 z-50 bg-slate-900 text-white text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom duration-200 no-print">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Help Button */}
      <button
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-18 lg:bottom-5 left-5 z-30 p-2.5 bg-white text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-full shadow-lg border border-slate-200 transition-all no-print flex items-center gap-1.5 text-xs font-semibold"
        title="Petunjuk Penggunaan"
      >
        <HelpCircle className="w-4 h-4 text-blue-600" />
        <span className="hidden sm:inline">Bantuan</span>
      </button>

      {/* Modals & Drawers */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        currentRole={currentRole}
        onSave={handleSaveProfile}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyList={historyList}
        currentReportId={report.id}
        onSelectReport={(selected) => setReport(selected)}
        onRefreshHistory={() => setHistoryList(loadHistory())}
      />

      <CopySummaryModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        report={report}
        profile={profile}
      />

      {/* Supabase RLS & Cloud Sync Configuration Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        showToast={showToast}
      />

      {/* Quick Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Petunjuk Pembuatan Laporan Kinerja Harian
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
              <li>
                <strong>Dashboard Kinerja:</strong> Menyajikan ringkasan statistik, tren aktivitas 7 hari, dan status ketercapaian target.
              </li>
              <li>
                <strong>Form Jurnal Harian:</strong> Pengisian jam pelaksanaan default (`06.30 - 07:30`, `07.30 - 13.30`, `13.30 - 15.00`), rincian tugas guru, dan unggah foto Evidence Sikawan ber-timestamp.
              </li>
              <li>
                <strong>Laporan & Ekspor PDF:</strong> Cetak berkas Jurnal Harian Kinerja resmi dengan pilihan font Arial atau Times/Dinas pada kertas F4/Folio atau A4 tanpa terpotong.
              </li>
              <li>
                <strong>Kop Dinas & Profil:</strong> Atur logo Tut Wuri Handayani, Garuda, Kemenag, atau logo sekolah kustom via menu Pengaturan.
              </li>
            </ul>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Ready & Direct Download/Print Confirmation Modal */}
      {pdfResult?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 no-print backdrop-blur-2xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Berkas PDF Siap!
                  </h3>
                  <p className="text-xs text-slate-500">
                    Laporan kinerja tanggal {formatTanggalLengkapIndo(report.tanggal)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPdfResult(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Format Kertas:</span>
                <span className="font-bold text-slate-800">{report.paperSize || 'A4'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Nama Berkas:</span>
                <span className="font-mono text-[10px] text-blue-700 truncate max-w-[200px]" title={pdfResult.filename}>
                  {pdfResult.filename}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {/* Direct Download Button (Permanent User Click - Works in any iframe!) */}
              <a
                href={pdfResult.blobUrl}
                download={pdfResult.filename}
                onClick={() => {
                  showToast('Mengunduh berkas PDF ke perangkat...');
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Simpan / Unduh File PDF</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                {/* Open in Tab */}
                <a
                  href={pdfResult.blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span>Buka Tab Baru</span>
                </a>

                {/* Print button */}
                <button
                  type="button"
                  onClick={() => {
                    setPdfResult(null);
                    handleDirectPrint();
                  }}
                  className="py-2 px-3 bg-slate-800 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Langsung</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
