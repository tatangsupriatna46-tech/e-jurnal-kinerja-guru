import React from 'react';
import { Menu } from 'lucide-react';
import { Profile, UserRole } from '../types';
import { NavTab } from './SidebarNav';
import { SchoolBrandLogo } from './OfficialLogos';

interface TopNavbarProps {
  activeTab: NavTab;
  onOpenMobileMenu: () => void;
  onOpenProfile: () => void;
  onOpenCopyModal?: () => void;
  onDirectPrint?: () => void;
  onDownloadPdf?: () => void;
  isGeneratingPdf?: boolean;
  profile: Profile;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onQuickNewEntry?: () => void;
  currentRole?: UserRole;
  onSwitchRole?: (newRole: UserRole) => void;
  onOpenSupabaseModal?: () => void;
  onLogout?: () => void;
  onGoToLogin?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenProfile,
  profile,
  onLogout,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Kinerja';
      case 'identitas':
        return 'Identitas Pegawai';
      case 'jurnal':
        return 'Jurnal Harian';
      case 'laporan':
        return 'Laporan & Ekspor PDF';
      case 'riwayat':
        return 'Riwayat Pengisian Kinerja';
      case 'kelola-guru':
        return 'Kelola Data Guru & Pegawai';
      case 'pengaturan':
        return 'Pengaturan Profil & Kop Dinas';
      default:
        return 'Jurnal Kinerja';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 no-print">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden flex items-center shrink-0">
          <SchoolBrandLogo profile={profile} className="w-8 h-8" />
        </div>

        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {getTabTitle()}
        </h1>
      </div>

    </header>
  );
};
