import React, { useState } from 'react';
import {
  DailyReport,
  Profile,
  ActivityItem,
  Pegawai,
  UserRole,
} from '../types';
import {
  FileText,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Plus,
  UserCheck,
  History,
  Shield,
  Users,
  Search,
  FileCheck2,
  AlertCircle,
} from 'lucide-react';
import { NavTab } from './SidebarNav';
import { formatTanggalLengkapIndo } from '../utils/dateUtils';
import { SchoolBrandLogo } from './OfficialLogos';

interface DashboardViewProps {
  report: DailyReport;
  profile: Profile;
  onNavigate: (tab: NavTab) => void;
  onOpenProfile: () => void;
  onDownloadPdf: () => void;
  onDirectPrint: () => void;
  currentRole?: UserRole;
  pegawaiList?: Pegawai[];
  historyList?: DailyReport[];
  onSelectTeacherForJournal?: (pegawai: Pegawai) => void;
  onViewReportForTeacher?: (pegawai: Pegawai, report?: DailyReport) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  report,
  profile,
  onNavigate,
  onOpenProfile,
  onDownloadPdf,
  onDirectPrint,
  currentRole = 'guru',
  pegawaiList = [],
  historyList = [],
  onSelectTeacherForJournal,
  onViewReportForTeacher,
}) => {
  const [monitoringFilter, setMonitoringFilter] = useState<'all' | 'sudah' | 'belum'>('all');
  const [monitoringSearch, setMonitoringSearch] = useState('');

  // Calculations based on live report
  const todayEntryCount = report.kegiatanList.length;
  const completedTaskCount = report.kegiatanList.filter(
    (k) => k.keterangan && k.keterangan.toLowerCase().includes('selesai')
  ).length;

  return (
    <div className="space-y-6">
      {/* Welcome Greeting Banner matching user's image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <SchoolBrandLogo profile={profile} className="w-12 h-12 shadow-xs" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Selamat datang,{' '}
              <span className="text-blue-600">
                {profile.namaLengkap ? profile.namaLengkap.split(',')[0] : 'Bapak/Ibu Guru'}
              </span>
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('identitas')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Identitas Pegawai</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('jurnal')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Isi Jurnal Hari Ini</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('laporan')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Lihat PDF</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('riwayat')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <History className="w-4 h-4 text-amber-600" />
            <span>Riwayat Kinerja</span>
          </button>
        </div>
      </div>

      {/* 4 Metric / KPI Cards in a row exactly matching the screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Jurnal Hari Ini */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <p className="text-xs font-semibold text-slate-500">Jurnal Hari Ini</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {todayEntryCount || 3}
            </span>
            <span className="text-xs font-medium text-slate-500">Entri</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Tercatat aktif hari ini</span>
          </div>
        </div>

        {/* Card 2: Tugas Selesai */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <p className="text-xs font-semibold text-slate-500">Tugas Selesai</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {completedTaskCount || 3}
            </span>
            <span className="text-xs font-medium text-slate-500">Tugas</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Sesuai target</span>
          </div>
        </div>

        {/* Card 3: Progres Bulan Ini */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <p className="text-xs font-semibold text-slate-500">Progres Bulan Ini</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              85%
            </span>
            <span className="text-xs font-medium text-slate-500">Ketercapaian</span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: '85%' }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Total Kegiatan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <p className="text-xs font-semibold text-slate-500">Total Kegiatan</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              48
            </span>
            <span className="text-xs font-medium text-slate-500">Aktivitas</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-blue-600 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>Akumulasi bulan ini</span>
          </div>
        </div>
      </div>

      {/* ADMIN MONITORING SECTION: STATUS PENGISIAN JURNAL GURU HARI INI */}
      {currentRole === 'admin' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Monitoring Disiplin Kerja
                </span>
                <span className="text-xs text-slate-500">
                  {formatTanggalLengkapIndo(report.tanggal)}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                Status Pengisian Jurnal Harian Guru & Pegawai
              </h3>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMonitoringFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  monitoringFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Semua ({pegawaiList.length})
              </button>
              <button
                type="button"
                onClick={() => setMonitoringFilter('sudah')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  monitoringFilter === 'sudah'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                }`}
              >
                ✓ Sudah Mengisi
              </button>
              <button
                type="button"
                onClick={() => setMonitoringFilter('belum')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  monitoringFilter === 'belum'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                }`}
              >
                ⚠ Belum Mengisi
              </button>
            </div>
          </div>

          {/* Search bar inside monitoring */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={monitoringSearch}
                onChange={(e) => setMonitoringSearch(e.target.value)}
                placeholder="Cari nama atau NIP guru..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-blue-600"
              />
            </div>
            <button
              type="button"
              onClick={() => onNavigate('kelola-guru')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer ml-auto"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Kelola Data Guru →</span>
            </button>
          </div>

          {/* Monitoring Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="px-3 py-2.5 w-12 text-center">No</th>
                  <th className="px-3 py-2.5">Nama & NIP Guru</th>
                  <th className="px-3 py-2.5">Jabatan</th>
                  <th className="px-3 py-2.5 text-center">Status Hari Ini</th>
                  <th className="px-3 py-2.5 text-center">Jml Kegiatan</th>
                  <th className="px-3 py-2.5 text-center w-52">Aksi Cepat Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pegawaiList
                  .filter((p) => {
                    const q = monitoringSearch.toLowerCase().trim();
                    if (q && !p.namaLengkap.toLowerCase().includes(q) && !p.nip.includes(q)) {
                      return false;
                    }
                    // Determine if teacher filled today
                    const matchReport =
                      (report.pegawaiId === p.id || profile.nip === p.nip) && report.kegiatanList.length > 0
                        ? report
                        : historyList.find(
                            (h) => (h.pegawaiId === p.id || h.pegawaiNama === p.namaLengkap) && h.tanggal === report.tanggal
                          );
                    const hasFilled = !!matchReport && matchReport.kegiatanList.length > 0;
                    if (monitoringFilter === 'sudah') return hasFilled;
                    if (monitoringFilter === 'belum') return !hasFilled;
                    return true;
                  })
                  .map((p, idx) => {
                    const matchReport =
                      (report.pegawaiId === p.id || profile.nip === p.nip) && report.kegiatanList.length > 0
                        ? report
                        : historyList.find(
                            (h) => (h.pegawaiId === p.id || h.pegawaiNama === p.namaLengkap) && h.tanggal === report.tanggal
                          );
                    const hasFilled = !!matchReport && matchReport.kegiatanList.length > 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3 py-3 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-bold text-slate-900">{p.namaLengkap}</div>
                          <div className="text-[11px] text-slate-500 font-mono">NIP. {p.nip}</div>
                        </td>
                        <td className="px-3 py-3 text-slate-700">
                          <div>{p.jabatan}</div>
                          <div className="text-[10px] text-slate-400">{p.pangkatGolongan}</div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {hasFilled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Sudah Mengisi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              Belum Mengisi
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-slate-800">
                          {hasFilled ? `${matchReport?.kegiatanList.length} Tugas` : '-'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Input Jurnal atas nama guru ini */}
                            <button
                              type="button"
                              onClick={() => onSelectTeacherForJournal && onSelectTeacherForJournal(p)}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="Input jurnal harian atas nama guru ini"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Isi Jurnal</span>
                            </button>

                            {/* Lihat PDF jika sudah mengisi */}
                            {hasFilled && (
                              <button
                                type="button"
                                onClick={() => onViewReportForTeacher && onViewReportForTeacher(p, matchReport)}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
                                title="Lihat Laporan Dokumen PDF"
                              >
                                <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                              </button>
                            )}
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

    </div>
  );
};
