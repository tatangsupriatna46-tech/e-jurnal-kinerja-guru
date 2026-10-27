import React, { useState } from 'react';
import { DailyReport } from '../types';
import {
  X,
  History,
  Calendar,
  Trash2,
  FolderOpen,
  AlertTriangle,
} from 'lucide-react';
import { formatTanggalLengkapIndo } from '../utils/dateUtils';
import { deleteReportFromHistory } from '../utils/storage';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyList: DailyReport[];
  currentReportId: string;
  onSelectReport: (report: DailyReport) => void;
  onRefreshHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  historyList,
  currentReportId,
  onSelectReport,
  onRefreshHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reportToDelete, setReportToDelete] = useState<DailyReport | null>(null);

  if (!isOpen) return null;

  const filtered = historyList.filter(
    (item) =>
      item.tanggal.includes(searchTerm) ||
      item.kegiatanList.some((k) =>
        k.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleConfirmDelete = () => {
    if (!reportToDelete) return;
    deleteReportFromHistory(reportToDelete.id, reportToDelete.tanggal);
    setReportToDelete(null);
    onRefreshHistory();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-2xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 bg-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-blue-200" />
            <div>
              <h3 className="font-bold text-base">Arsip & Riwayat Jurnal</h3>
              <p className="text-[11px] text-blue-100">
                Laporan harian yang tersimpan ({historyList.length})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Search Only */}
        <div className="p-3 border-b border-slate-200 bg-slate-50">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tanggal atau kata kunci kegiatan..."
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-blue-600 bg-white"
          />
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
              <FolderOpen className="w-8 h-8 mb-2 opacity-50" />
              <span>Belum ada arsip riwayat jurnal lainnya.</span>
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = item.id === currentReportId;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectReport(item);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      {item.tanggal}
                    </span>
                    <div className="flex items-center gap-1">
                      {isSelected && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Sedang Dibuka
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportToDelete(item);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        title="Hapus riwayat ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="font-semibold text-slate-700">
                    {formatTanggalLengkapIndo(item.tanggal)}
                  </p>

                  <div className="mt-1 text-slate-500 line-clamp-2">
                    {item.kegiatanList.length} Kegiatan:{' '}
                    {item.kegiatanList.map((k) => k.deskripsi.slice(0, 20)).join(', ')}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Hapus Jurnal Kinerja?
                </h4>
                <p className="text-[11px] text-slate-500">
                  {formatTanggalLengkapIndo(reportToDelete.tanggal)}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus jurnal ini secara permanen?
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
