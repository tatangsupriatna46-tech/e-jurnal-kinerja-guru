import React, { useState, useMemo } from 'react';
import { DailyReport, Profile, Pegawai, UserRole } from '../types';
import {
  Clock,
  Printer,
  Search,
  CheckCircle2,
  Camera,
  FolderOpen,
  CalendarDays,
  FileCheck2,
  Edit3,
  Trash2,
  AlertTriangle,
  X,
  User,
  Shield,
} from 'lucide-react';
import { formatTanggalLengkapIndo } from '../utils/dateUtils';

interface HistoryViewProps {
  historyList: DailyReport[];
  currentReport: DailyReport;
  profile: Profile;
  onSelectReport: (report: DailyReport) => void;
  onOpenReportView: (report: DailyReport) => void;
  onDirectPrintForReport: (report: DailyReport) => void;
  onDeleteReport: (report: DailyReport) => void;
  onRefreshHistory: () => void;
  showToast: (msg: string) => void;
  currentRole?: UserRole;
  pegawaiList?: Pegawai[];
  activePegawaiId?: string;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  historyList,
  currentReport,
  profile,
  onSelectReport,
  onOpenReportView,
  onDirectPrintForReport,
  onDeleteReport,
  currentRole = 'guru',
  pegawaiList = [],
  activePegawaiId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [reportToDelete, setReportToDelete] = useState<DailyReport | null>(null);

  // Directly sort history list descending by date
  const sortedHistory = useMemo(() => {
    return [...historyList].sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
  }, [historyList]);

  // Filter based on RBAC first
  const rbacHistory = useMemo(() => {
    return sortedHistory.filter((item) => {
      if (currentRole === 'admin') {
        if (selectedTeacher !== 'all') {
          return item.pegawaiId === selectedTeacher;
        }
        return true;
      }
      // Role Guru: only see journals belonging to self
      if (activePegawaiId) {
        return (
          item.pegawaiId === activePegawaiId ||
          !item.pegawaiId ||
          item.pegawaiNama === profile.namaLengkap
        );
      }
      return true;
    });
  }, [sortedHistory, currentRole, selectedTeacher, activePegawaiId, profile.namaLengkap]);

  // Extract unique available months from dates
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    rbacHistory.forEach((item) => {
      if (item.tanggal && item.tanggal.length >= 7) {
        set.add(item.tanggal.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [rbacHistory]);

  // Filter based on search term and selected month
  const filteredList = useMemo(() => {
    return rbacHistory.filter((item) => {
      const matchMonth =
        selectedMonth === 'all' || item.tanggal.startsWith(selectedMonth);

      const q = searchTerm.toLowerCase().trim();
      if (!q) return matchMonth;

      const dateStrIndo = formatTanggalLengkapIndo(item.tanggal).toLowerCase();
      const matchDate =
        item.tanggal.includes(q) || dateStrIndo.includes(q) || (item.pegawaiNama && item.pegawaiNama.toLowerCase().includes(q));

      const matchActivities = item.kegiatanList?.some(
        (k) =>
          k.deskripsi.toLowerCase().includes(q) ||
          (k.keterangan && k.keterangan.toLowerCase().includes(q)) ||
          k.waktu.toLowerCase().includes(q)
      );

      return matchMonth && (matchDate || matchActivities);
    });
  }, [rbacHistory, searchTerm, selectedMonth]);

  // Total stats calculations
  const totalDays = rbacHistory.length;
  const totalActivities = rbacHistory.reduce(
    (acc, curr) => acc + (curr.kegiatanList?.length || 0),
    0
  );
  const totalPhotos = rbacHistory.reduce(
    (acc, curr) =>
      acc + (curr.kegiatanList?.filter((k) => !!k.buktiFotoUrl).length || 0),
    0
  );

  const handleConfirmDelete = () => {
    if (!reportToDelete) return;
    const target = reportToDelete;
    setReportToDelete(null);
    onDeleteReport(target);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Riwayat Pengisian Kinerja Harian
            </h2>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase">Hari Pengisian</span>
              <CalendarDays className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
              {totalDays} <span className="text-xs font-semibold text-slate-500">Hari</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase">Total Kegiatan</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
              {totalActivities} <span className="text-xs font-semibold text-slate-500">Tugas</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase">Bukti Sikawan</span>
              <Camera className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
              {totalPhotos} <span className="text-xs font-semibold text-slate-500">Foto</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase">Jurnal Aktif</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xs font-bold text-slate-800 truncate mt-1">
              {currentReport?.tanggal ? formatTanggalLengkapIndo(currentReport.tanggal) : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tanggal atau uraian kegiatan..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-blue-600 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          {currentRole === 'admin' && (
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-slate-500 shrink-0">
                Filter Guru:
              </label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-blue-600 cursor-pointer shadow-2xs max-w-[180px]"
              >
                <option value="all">Semua Guru ({pegawaiList.length})</option>
                {pegawaiList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.namaLengkap}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-500 shrink-0">
              Filter Bulan:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-blue-600 cursor-pointer shadow-2xs"
            >
              <option value="all">Semua Bulan</option>
              {availableMonths.map((m) => {
                const [year, month] = m.split('-');
                const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('id-ID', {
                  month: 'long',
                  year: 'numeric',
                });
                return (
                  <option key={m} value={m}>
                    {monthName}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Clean Table */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Tidak Ada Riwayat yang Sesuai
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Tidak ditemukan catatan kinerja untuk kata kunci atau bulan yang dipilih.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedMonth('all');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        /* FORMAT TABEL SIMPEL (No | Tanggal | Uraian Kegiatan (1,2,3) | Aksi) */
        <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                {/* Header Baris 1 */}
                <tr className="bg-slate-100 text-slate-900 border-b border-slate-300">
                  <th
                    rowSpan={2}
                    className="border border-slate-300 px-3 py-2.5 text-center font-bold w-12 bg-slate-100"
                  >
                    No
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-300 px-3 py-2.5 text-center font-bold w-40 sm:w-48 bg-slate-100"
                  >
                    Tanggal
                  </th>
                  <th
                    colSpan={3}
                    className="border border-slate-300 px-3 py-2 text-center font-bold bg-slate-100 tracking-wide"
                  >
                    Uraian Kegiatan
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-slate-300 px-3 py-2.5 text-center font-bold w-44 bg-slate-100"
                  >
                    Aksi
                  </th>
                </tr>

                {/* Header Baris 2 (Sub-kolom Kegiatan 1, Kegiatan 2, Kegiatan 3) */}
                <tr className="bg-slate-50 text-slate-800 border-b border-slate-300">
                  <th className="border border-slate-300 px-3 py-2 text-center font-bold w-1/3 bg-slate-50">
                    Kegiatan 1
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-center font-bold w-1/3 bg-slate-50">
                    Kegiatan 2
                  </th>
                  <th className="border border-slate-300 px-3 py-2 text-center font-bold w-1/3 bg-slate-50">
                    Kegiatan 3
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredList.map((item, index) => {
                  const isCurrentlyActive = item.tanggal === currentReport.tanggal;
                  const k1 = item.kegiatanList?.[0];
                  const k2 = item.kegiatanList?.[1];
                  const k3 = item.kegiatanList?.[2];

                  return (
                    <tr
                      key={item.id || item.tanggal}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isCurrentlyActive
                          ? 'bg-blue-50/25'
                          : index % 2 === 1
                          ? 'bg-slate-50/40'
                          : 'bg-white'
                      }`}
                    >
                      {/* Kolom No */}
                      <td className="border border-slate-300 px-2 py-3 text-center font-bold text-slate-700 align-top">
                        {index + 1}
                      </td>

                      {/* Kolom Tanggal */}
                      <td className="border border-slate-300 px-3 py-3 align-top font-medium text-slate-900">
                        <div className="font-bold text-xs text-slate-900">
                          {formatTanggalLengkapIndo(item.tanggal)}
                        </div>
                        {(currentRole === 'admin' || item.pegawaiNama) && (
                          <div className="mt-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-flex items-center gap-1">
                            <User className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate max-w-[130px]">
                              {item.pegawaiNama || profile.namaLengkap}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Sub-kolom Kegiatan 1 */}
                      <td className="border border-slate-300 px-3 py-3 align-top leading-relaxed text-slate-800">
                        {k1?.deskripsi ? (
                          <p className="text-xs text-slate-800 leading-normal font-normal">
                            {k1.deskripsi}
                          </p>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>

                      {/* Sub-kolom Kegiatan 2 */}
                      <td className="border border-slate-300 px-3 py-3 align-top leading-relaxed text-slate-800">
                        {k2?.deskripsi ? (
                          <p className="text-xs text-slate-800 leading-normal font-normal">
                            {k2.deskripsi}
                          </p>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>

                      {/* Sub-kolom Kegiatan 3 */}
                      <td className="border border-slate-300 px-3 py-3 align-top leading-relaxed text-slate-800">
                        {k3?.deskripsi ? (
                          <p className="text-xs text-slate-800 leading-normal font-normal">
                            {k3.deskripsi}
                          </p>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>

                      {/* Kolom Aksi: tombol cetak, edit, hapus, lihat pdf */}
                      <td className="border border-slate-300 px-3 py-3 align-top text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Cetak */}
                          <button
                            type="button"
                            onClick={() => onDirectPrintForReport(item)}
                            className="p-1.5 bg-slate-800 hover:bg-black text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
                            title="Cetak Langsung"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onSelectReport(item)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
                            title="Edit Jurnal"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Hapus */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setReportToDelete(item);
                            }}
                            className="p-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-300 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Jurnal"
                            aria-label="Hapus Jurnal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Lihat PDF */}
                          <button
                            type="button"
                            onClick={() => onOpenReportView(item)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Laporan Dokumen"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS JURNAL */}
      {reportToDelete && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setReportToDelete(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Dialog */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Konfirmasi Hapus Jurnal
                  </h3>
                  <p className="text-xs text-slate-500">
                    Peringatan penghapusan berkas kinerja
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                Tindakan ini tidak dapat dibatalkan. Seluruh uraian kegiatan dan lampiran foto pada tanggal ini akan terhapus dari sistem.
              </p>
            </div>

            {/* Target Information */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tanggal Jurnal:</span>
                <span className="font-bold text-slate-900">
                  {formatTanggalLengkapIndo(reportToDelete.tanggal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Jumlah Kegiatan:</span>
                <span className="font-bold text-slate-800">
                  {reportToDelete.kegiatanList?.length || 0} Tugas
                </span>
              </div>
              {reportToDelete.kegiatanList?.[0]?.deskripsi && (
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 line-clamp-2 italic">
                  &ldquo;{reportToDelete.kegiatanList[0].deskripsi}&rdquo;
                </div>
              )}
            </div>

            {/* Question Text */}
            <p className="text-xs font-semibold text-slate-800 text-center py-1">
              Apakah Anda yakin ingin menghapus jurnal ini?
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center"
              >
                Tidak, Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Jurnal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
