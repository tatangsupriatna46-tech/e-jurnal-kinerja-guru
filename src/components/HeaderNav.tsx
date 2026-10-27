import React from 'react';
import {
  FileText,
  Printer,
  Download,
  Settings,
  History,
  Share2,
  Eye,
  Edit3,
  Loader2,
  FileCheck2,
} from 'lucide-react';
import { TutWuriHandayaniLogo } from './OfficialLogos';

interface HeaderNavProps {
  currentView: 'editor' | 'preview';
  onViewChange: (view: 'editor' | 'preview') => void;
  onOpenProfile: () => void;
  onOpenHistory: () => void;
  onOpenCopyModal: () => void;
  onDownloadPdf: () => void;
  onDirectPrint: () => void;
  isGeneratingPdf: boolean;
  paperSize: 'A4' | 'F4';
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentView,
  onViewChange,
  onOpenProfile,
  onOpenHistory,
  onOpenCopyModal,
  onDownloadPdf,
  onDirectPrint,
  isGeneratingPdf,
  paperSize,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-800 p-1 flex items-center justify-center shadow-xs">
              <TutWuriHandayaniLogo className="w-8 h-8 drop-shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                  E-Jurnal Kinerja Guru
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                  Resmi Dinas {paperSize}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Laporan Kinerja Harian Guru & PNS Berstandar Kedinasan
              </p>
            </div>
          </div>

          {/* Center View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onViewChange('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentView === 'editor'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Form</span> Input
            </button>
            <button
              onClick={() => onViewChange('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentView === 'preview'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Pratinjau</span> PDF
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Profil & Kop Button */}
            <button
              onClick={onOpenProfile}
              className="p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-2xs"
              title="Pengaturan Profil & Kop Dinas"
            >
              <Settings className="w-4 h-4 text-emerald-700" />
              <span className="hidden lg:inline">Profil & Kop</span>
            </button>

            {/* Riwayat */}
            <button
              onClick={onOpenHistory}
              className="p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-2xs"
              title="Arsip & Riwayat Jurnal"
            >
              <History className="w-4 h-4 text-emerald-700" />
              <span className="hidden lg:inline">Riwayat</span>
            </button>

            {/* Salin Teks */}
            <button
              onClick={onOpenCopyModal}
              className="p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-2xs"
              title="Salin ke WhatsApp atau e-Kinerja"
            >
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span className="hidden xl:inline">Salin Teks</span>
            </button>

            {/* Print / Cetak Button */}
            <button
              onClick={onDirectPrint}
              className="p-2 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300 shadow-2xs"
              title="Cetak Langsung / Simpan via Dialog Browser"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            {/* Unduh PDF Button */}
            <button
              onClick={onDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Membuat PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
