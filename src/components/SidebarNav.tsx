import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Calendar,
  FileText,
  History,
  Settings,
  BookOpen,
  ChevronRight,
  Users,
  Shield,
  LogOut,
} from 'lucide-react';
import { Profile, UserRole } from '../types';
import { getInitials } from '../utils/storage';
import { SchoolBrandLogo } from './OfficialLogos';

export type NavTab =
  | 'dashboard'
  | 'identitas'
  | 'jurnal'
  | 'laporan'
  | 'riwayat'
  | 'pengaturan'
  | 'kelola-guru';

interface SidebarNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  profile: Profile;
  todayCount?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentRole?: UserRole;
  adminName?: string;
  onLogout?: () => void;
  onGoToLogin?: () => void;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasSubmenu?: boolean;
  badge?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  profile,
  isOpenMobile,
  onCloseMobile,
  currentRole = 'guru',
  onLogout,
  onGoToLogin,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'identitas' as NavTab,
      label: 'Identitas Pegawai',
      icon: UserCheck,
    },
    {
      id: 'jurnal' as NavTab,
      label: 'Jurnal Harian',
      icon: Calendar,
    },
    {
      id: 'laporan' as NavTab,
      label: 'Laporan',
      icon: FileText,
      hasSubmenu: true,
    },
    {
      id: 'riwayat' as NavTab,
      label: 'Riwayat',
      icon: History,
    },
    ...(currentRole === 'admin'
      ? [
          {
            id: 'kelola-guru' as NavTab,
            label: 'Kelola Data Guru',
            icon: Users,
          },
        ]
      : []),
    {
      id: 'pengaturan' as NavTab,
      label: 'Pengaturan',
      icon: Settings,
    },
  ];

  const handleSelect = (tab: NavTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } no-print`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
            <SchoolBrandLogo profile={profile} className="w-9 h-9" />
            <div>
              <h1 className="text-sm font-arial-black text-slate-900 tracking-tight leading-tight">
                E-Jurnal Kinerja Guru
              </h1>
              <p className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                {profile.unitKerja || 'Satuan Pendidikan'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-purple-100 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.hasSubmenu && !item.badge && (
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isActive ? 'text-white/80' : 'text-slate-300 group-hover:text-slate-500'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Mini Card in Sidebar */}
        <div className="p-3 border-t border-slate-100">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden shadow-2xs font-extrabold text-xs ${
                profile.avatarUrl
                  ? 'bg-slate-100'
                  : currentRole === 'admin'
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                  : 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white'
              }`}
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.namaLengkap || 'Profil Pegawai'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="tracking-tight text-[11px] font-black">
                  {getInitials(profile.namaLengkap)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    currentRole === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {currentRole}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                {profile.namaLengkap || 'Nama Guru / Pegawai'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {profile.jabatan || 'Guru'} • {profile.nip || 'NIP Pegawai'}
              </p>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 cursor-pointer shrink-0"
                title="Keluar / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
