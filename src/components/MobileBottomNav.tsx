import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  History,
  User,
} from 'lucide-react';
import { NavTab } from './SidebarNav';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenProfile,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1.5 flex items-center justify-around shadow-lg no-print">
      <button
        type="button"
        onClick={() => onTabChange('dashboard')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-colors ${
          activeTab === 'dashboard'
            ? 'text-blue-600 font-bold'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Dashboard</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('identitas')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-colors ${
          activeTab === 'identitas'
            ? 'text-blue-600 font-bold'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <User className="w-5 h-5" />
        <span>Identitas</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('jurnal')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-colors ${
          activeTab === 'jurnal'
            ? 'text-blue-600 font-bold'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span>Jurnal</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('laporan')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-colors ${
          activeTab === 'laporan'
            ? 'text-blue-600 font-bold'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <FileText className="w-5 h-5" />
        <span>Laporan</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('riwayat')}
        className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-colors ${
          activeTab === 'riwayat'
            ? 'text-blue-600 font-bold'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <History className="w-5 h-5" />
        <span>Riwayat</span>
      </button>
    </nav>
  );
};
