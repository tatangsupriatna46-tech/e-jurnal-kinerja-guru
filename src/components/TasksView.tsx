import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { ActivityItem } from '../types';

interface Task {
  id: string;
  title: string;
  timeEstimate: string;
  category: string;
  status: 'Selesai' | 'Proses' | 'Belum';
}

interface TasksViewProps {
  onAddTaskToJournal: (preset: Partial<ActivityItem>) => void;
  onNavigateToJournal: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  onAddTaskToJournal,
  onNavigateToJournal,
}) => {
  const [filter, setFilter] = useState<'all' | 'Selesai' | 'Proses' | 'Belum'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 't-1',
      title: 'Menyiapkan bahan paparan evaluasi program kerja mingguan dan disposisi',
      timeEstimate: '06.30 - 07:30',
      category: 'Paparan & Evaluasi',
      status: 'Selesai',
    },
    {
      id: 't-2',
      title: 'Menyusun dokumen analisis kebutuhan sistem informasi dan koordinasi tim',
      timeEstimate: '07.30 - 13.30',
      category: 'Analisis & Tim Kerja',
      status: 'Selesai',
    },
    {
      id: 't-3',
      title: 'Melaksanakan verifikasi dan validasi data laporan kinerja harian',
      timeEstimate: '13.30 - 15.00',
      category: 'Verifikasi & Validasi Data',
      status: 'Proses',
    },
    {
      id: 't-4',
      title: 'Review dokumen silabus, perangkat ajar & rubrik asesmen formatif',
      timeEstimate: '13:00 - 14:30',
      category: 'Evaluasi & Administrasi',
      status: 'Proses',
    },
    {
      id: 't-5',
      title: 'Presentasi hasil pencapaian kinerja bulanan kepada Kepala Sekolah',
      timeEstimate: '14:00 - 15:30',
      category: 'Rapat & Koordinasi',
      status: 'Belum',
    },
  ]);

  const handleToggleStatus = (id: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          const nextStatus: 'Selesai' | 'Proses' | 'Belum' =
            t.status === 'Belum'
              ? 'Proses'
              : t.status === 'Proses'
              ? 'Selesai'
              : 'Belum';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: 't-' + Date.now(),
      title: newTaskTitle.trim(),
      timeEstimate: '07.30 - 13.30',
      category: 'Kegiatan Pembelajaran',
      status: 'Proses',
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Daftar Tugas & Indikator Kinerja
          </h2>
          <p className="text-xs text-slate-500">
            Kelola target harian Anda dan masukkan langsung ke berkas jurnal ekinerja
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['all', 'Selesai', 'Proses', 'Belum'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setFilter(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === opt
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt === 'all' ? 'Semua' : opt}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Add Bar */}
      <form onSubmit={handleAddNewTask} className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Tambah tugas baru (contoh: 'Penyusunan RPP Modul Ajar Bab 4')..."
          className="flex-1 px-3.5 py-2 text-xs md:text-sm text-slate-800 border border-slate-200 rounded-xl focus:outline-blue-600 bg-slate-50 focus:bg-white"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah</span>
        </button>
      </form>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
            <CheckSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-medium">Tidak ada tugas pada filter ini.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(task.id)}
                  className="mt-0.5"
                  title="Ubah status"
                >
                  <CheckCircle2
                    className={`w-5 h-5 transition-colors ${
                      task.status === 'Selesai'
                        ? 'text-emerald-500'
                        : task.status === 'Proses'
                        ? 'text-blue-500'
                        : 'text-slate-300 hover:text-slate-400'
                    }`}
                  />
                </button>
                <div className="min-w-0">
                  <p
                    className={`text-xs md:text-sm font-semibold transition-all ${
                      task.status === 'Selesai'
                        ? 'line-through text-slate-400'
                        : 'text-slate-900'
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">{task.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {task.timeEstimate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    task.status === 'Selesai'
                      ? 'bg-emerald-50 text-emerald-700'
                      : task.status === 'Proses'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {task.status}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    onAddTaskToJournal({
                      deskripsi: task.title,
                      waktu: task.timeEstimate,
                      kategori: task.category,
                      keterangan: 'Selesai 100% (Sesuai Target)',
                    });
                    onNavigateToJournal();
                  }}
                  className="px-2.5 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Tambahkan ke jurnal hari ini"
                >
                  <span>Ke Jurnal</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  className="p-1 text-slate-300 hover:text-red-600 transition-colors"
                  title="Hapus tugas"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
