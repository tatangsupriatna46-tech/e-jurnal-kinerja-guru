import React from 'react';
import { DailyReport, Profile } from '../types';
import {
  TrendingUp,
  Award,
  CheckCircle,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
} from 'lucide-react';

interface AnalyticsViewProps {
  report: DailyReport;
  profile: Profile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ report, profile }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Analisis Capaian Kinerja Guru
        </h2>
        <p className="text-xs text-slate-500">
          Statistik pemenuhan jam kerja kedinasan dan indikator sasaran kinerja pegawai (SKP)
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Jam Terpenuhi</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tabular-nums">
            37.5 Jam
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            +2.5 jam di atas target mingguan (35 jam)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Indeks Kinerja Pegawai</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tabular-nums">
            96.8 / 100
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Predikat: <strong className="text-emerald-700">Sangat Baik</strong>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tingkat Kelengkapan Bukti</span>
            <CheckCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tabular-nums">
            100%
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Seluruh bukti Evidence Sikawan valid berstempel
          </p>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Rincian Distribusi Tugas Pembelajaran
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Jumlah Kegiatan</th>
                <th className="py-2.5 px-3">Estimasi Durasi</th>
                <th className="py-2.5 px-3">Persentase</th>
                <th className="py-2.5 px-3">Status Evaluasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">
                  Kegiatan Belajar Mengajar (KBM) Tatap Muka
                </td>
                <td className="py-3 px-3 tabular-nums">22 Sesi</td>
                <td className="py-3 px-3 font-mono">18.5 Jam</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="font-bold tabular-nums">45%</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    Optimal
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">
                  Penyusunan Perangkat & Analisis Administrasi
                </td>
                <td className="py-3 px-3 tabular-nums">12 Sesi</td>
                <td className="py-3 px-3 font-mono">10.0 Jam</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="font-bold tabular-nums">25%</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    Selesai
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">
                  Penilaian / Asesmen Formatif & Koreksi LKPD
                </td>
                <td className="py-3 px-3 tabular-nums">8 Sesi</td>
                <td className="py-3 px-3 font-mono">6.5 Jam</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                    <span className="font-bold tabular-nums">20%</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    Berjalan
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">
                  Pembiasaan Karakter & Piket Sekolah
                </td>
                <td className="py-3 px-3 tabular-nums">6 Sesi</td>
                <td className="py-3 px-3 font-mono">2.5 Jam</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    <span className="font-bold tabular-nums">10%</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    Tercapai
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
