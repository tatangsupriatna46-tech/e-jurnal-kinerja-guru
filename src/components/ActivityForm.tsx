import React, { useState } from 'react';
import { ActivityItem, DailyReport, Profile, Pegawai, UserRole } from '../types';
import { applyWatermarkToImage, generateTimemarkPhotoCode } from '../utils/watermark';
import { uploadImageToStorage } from '../utils/supabaseClient';
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  FileText,
  Camera,
  CheckSquare,
  Loader2,
  ZoomIn,
  X,
  FileCheck2,
  Copy,
  Save,
  Check,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { formatTanggalLengkapIndo } from '../utils/dateUtils';
import { saveCurrentReport, saveToHistory } from '../utils/storage';

import { WatermarkCustomizerModal } from './WatermarkCustomizerModal';
import { formatTanggalSikawan, extractTimeHHMM } from '../utils/dateUtils';

interface ActivityFormProps {
  report: DailyReport;
  profile: Profile;
  onChangeReport: (updated: DailyReport) => void;
  onOpenPreview: () => void;
  onSave?: (savedReport: DailyReport) => void;
  currentRole?: UserRole;
  pegawaiList?: Pegawai[];
  selectedPegawaiId?: string;
  onSelectPegawai?: (pegawai: Pegawai) => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  report,
  profile,
  onChangeReport,
  onOpenPreview,
  onSave,
  currentRole = 'guru',
  pegawaiList = [],
  selectedPegawaiId,
  onSelectPegawai,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const [customizingItemId, setCustomizingItemId] = useState<string | null>(null);
  const [isJustSaved, setIsJustSaved] = useState(false);

  const handleSave = () => {
    saveCurrentReport(report);
    saveToHistory(report);
    setIsJustSaved(true);
    setTimeout(() => {
      setIsJustSaved(false);
    }, 2500);
    if (onSave) {
      onSave(report);
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<ActivityItem>) => {
    const newList = report.kegiatanList.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    onChangeReport({
      ...report,
      kegiatanList: newList,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddItem = (preset?: Partial<ActivityItem>) => {
    const defaultTimeByPosition =
      report.kegiatanList.length === 0
        ? '06.30 - 07.30'
        : report.kegiatanList.length === 1
        ? '07.30 - 13.00'
        : report.kegiatanList.length === 2
        ? '13.00 - 15.00'
        : '15.00 - 16.00';

    const newItem: ActivityItem = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      waktu: preset?.waktu || defaultTimeByPosition,
      deskripsi: preset?.deskripsi || '',
      keterangan: preset?.keterangan || 'Selesai 100% (Sesuai Target)',
      kategori: preset?.kategori || 'Kegiatan Kedinasan',
    };

    onChangeReport({
      ...report,
      kegiatanList: [...report.kegiatanList, newItem],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDuplicateItem = (item: ActivityItem) => {
    const newItem: ActivityItem = {
      ...item,
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      deskripsi: item.deskripsi + ' (Lanjutan)',
    };
    onChangeReport({
      ...report,
      kegiatanList: [...report.kegiatanList, newItem],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteItem = (id: string) => {
    if (report.kegiatanList.length <= 1) {
      alert('Minimal harus terdapat 1 kegiatan dalam laporan harian.');
      return;
    }
    const newList = report.kegiatanList.filter((item) => item.id !== id);
    onChangeReport({
      ...report,
      kegiatanList: newList,
      updatedAt: new Date().toISOString(),
    });
  };

  // Upload foto with automatic Evidence Sikawan Timestamp Watermark
  const handlePhotoUpload = async (id: string, file: File) => {
    try {
      setProcessingId(id);
      const targetItem = report.kegiatanList.find((i) => i.id === id);

      // Save raw original for easy re-stamping
      const reader = new FileReader();
      const rawDataUrl: string = await new Promise((res, rej) => {
        reader.onload = () => res(reader.result as string);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });

      // Prepare Judul, time & date, address, coords, and kode foto based on targetItem, profile, or Timemark sample
      const labelEvidence = targetItem?.customLabel || profile.labelEvidence || 'Absensi';
      const timeHHMM = targetItem?.customTimeHHMM || extractTimeHHMM(targetItem?.waktu) || '08:46';
      const dateText =
        targetItem?.customDateText ||
        (report.tanggal ? formatTanggalLengkapIndo(report.tanggal) : 'Senin, 26 Oktober 2026');
      const rawAddr = targetItem?.customAddressText || profile.alamatEvidence;
      const addressText =
        !rawAddr || rawAddr.includes('Jl. Pendidikan No. 01')
          ? 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620'
          : rawAddr;

      const rawCoords = targetItem?.customCoordinates || profile.koordinatEvidence;
      const coordinates =
        !rawCoords ||
        rawCoords === '6.200000°S, 106.816666°E' ||
        rawCoords === '6.139434°S, 107.109875°E'
          ? '6.139568°S, 107.110048°E'
          : rawCoords;

      const kodeFoto =
        targetItem?.customKodeFoto ||
        profile.kodeFotoDefault ||
        generateTimemarkPhotoCode();

      // Add Timemark watermark automatically
      const result = await applyWatermarkToImage(file, {
        labelEvidence,
        timeHHMM,
        dateText,
        addressText,
        coordinates,
        kodeFoto,
        catatanText: targetItem?.deskripsi || 'Pelaksanaan kegiatan belajar mengajar...',
        skala: targetItem?.customSkala ?? profile.skalaWatermark ?? 0.58,
        posisi: targetItem?.customPosisi ?? profile.posisiWatermark ?? 'kiri-bawah',
        sertakanCatatan: profile.sertakanCatatanDiFoto ?? false,
      });

      // Upload to object storage so base64 is NOT stored in database table
      const finalPhotoUrl = await uploadImageToStorage(result.dataUrl, 'evidence', `bukti_${id}`);

      handleUpdateItem(id, {
        originalFotoUrl: rawDataUrl,
        buktiFotoUrl: finalPhotoUrl,
        buktiFotoNama: file.name,
        watermarkDetail: result.stampText,
        customLabel: labelEvidence,
        customTimeHHMM: timeHHMM,
        customDateText: dateText,
        customAddressText: addressText,
        customCoordinates: coordinates,
        customKodeFoto: kodeFoto,
      });
    } catch (err) {
      console.error('Gagal membubuhkan watermark Timemark:', err);
      alert('Gagal memproses gambar foto. Pastikan format file berupa foto JPG atau PNG.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Pemilihan Guru untuk Pengisian Jurnal */}
      {pegawaiList && pegawaiList.length > 0 && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-blue-600/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                <UserCheck className="w-5 h-5 text-amber-300" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Pilih Guru / Pegawai untuk Pengisian Jurnal
              </h3>
            </div>

            {/* Form / Dropdown pemilih nama guru */}
            <div className="w-full md:w-auto">
              <select
                id="admin-teacher-select"
                aria-label="Pilih Guru untuk Pengisian Jurnal"
                value={selectedPegawaiId || report.pegawaiId || ''}
                onChange={(e) => {
                  const targetPegawai = pegawaiList.find((p) => p.id === e.target.value);
                  if (targetPegawai && onSelectPegawai) {
                    onSelectPegawai(targetPegawai);
                  }
                }}
                className="w-full md:w-80 bg-white text-slate-900 font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border-2 border-amber-300 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                {pegawaiList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.namaLengkap} ({p.jabatan || p.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Pengisian Kegiatan Kinerja Guru & Pegawai
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 shadow-2xs">
              <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block uppercase">
                  Tanggal Laporan
                </label>
                <input
                  type="date"
                  value={report.tanggal}
                  onChange={(e) =>
                    onChangeReport({
                      ...report,
                      tanggal: e.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenPreview}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <FileCheck2 className="w-4 h-4" />
              Pratinjau PDF
            </button>
          </div>
        </div>

        {/* Info Strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Laporan Untuk:</span>
            <span className="bg-slate-100 text-slate-800 font-medium px-2 py-0.5 rounded">
              {formatTanggalLengkapIndo(report.tanggal)}
            </span>
          </div>

          {isJustSaved && (
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold animate-pulse text-xs">
              <Check className="w-3.5 h-3.5" />
              <span>Inputan jurnal harian berhasil disimpan</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold text-slate-900 text-sm md:text-base">
          Daftar Kegiatan
        </h3>

        <div className="flex items-center gap-2">
          {/* Add Activity Button */}
          <button
            type="button"
            onClick={() => handleAddItem()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            Tambah Kegiatan
          </button>

          {/* Quick Save in toolbar */}
          <button
            type="button"
            onClick={handleSave}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors ${
              isJustSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {isJustSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dynamic Activity List / Cards */}
      <div className="space-y-4">
        {report.kegiatanList.map((item, index) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-4 relative"
          >
            {/* Row Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Kegiatan {index + 1}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDuplicateItem(item)}
                  title="Duplikat baris ini"
                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  title="Hapus kegiatan ini"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Input Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Kolom Waktu (3 Cols on Desktop) */}
              <div className="md:col-span-3 space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Waktu Pelaksanaan
                </label>
                <input
                  type="text"
                  value={item.waktu}
                  onChange={(e) => handleUpdateItem(item.id, { waktu: e.target.value })}
                  placeholder="Contoh: 07.30 - 13.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs md:text-sm font-medium text-slate-900 focus:outline-emerald-600"
                />
              </div>

              {/* Kolom Deskripsi Kegiatan (5 Cols on Desktop) */}
              <div className="md:col-span-5 space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Uraian / Rincian Kegiatan
                </label>
                <textarea
                  rows={4}
                  value={item.deskripsi}
                  onChange={(e) => handleUpdateItem(item.id, { deskripsi: e.target.value })}
                  placeholder="Deskripsikan kegiatan yang dilaksanakan secara rinci dan terukur..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs md:text-sm text-slate-900 focus:outline-emerald-600 leading-relaxed"
                />
              </div>

              {/* Kolom Bukti Foto Ber-watermark & Keterangan (4 Cols on Desktop) */}
              <div className="md:col-span-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      Foto Bukti Dukung (Auto-Timestamp)
                    </label>
                  </div>

                  {item.buktiFotoUrl ? (
                    <div className="relative border border-slate-300 rounded-xl overflow-hidden bg-slate-900 group shadow-2xs">
                      <img
                        src={item.buktiFotoUrl}
                        alt="Bukti foto Evidence Sikawan"
                        className="w-full h-32 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-1.5 p-2">
                        <button
                          type="button"
                          onClick={() => setActivePhotoModal(item.buktiFotoUrl!)}
                          className="px-2 py-1 bg-white/95 rounded-lg text-slate-900 hover:bg-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                        >
                          <ZoomIn className="w-3.5 h-3.5" /> Lihat
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomizingItemId(item.id)}
                          className="px-2 py-1 bg-amber-400 hover:bg-amber-500 rounded-lg text-slate-950 text-xs font-bold flex items-center gap-1 shadow-xs"
                          title="Ubah judul, jam, tanggal, alamat, GPS, atau kode foto"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Edit Timemark
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateItem(item.id, {
                              buktiFotoUrl: undefined,
                              originalFotoUrl: undefined,
                              buktiFotoNama: undefined,
                              watermarkDetail: undefined,
                            })
                          }
                          className="px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-semibold flex items-center gap-1 shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                      <div className="p-1.5 bg-slate-950/90 text-white text-[10px] flex items-center justify-between">
                        <span className="text-amber-400 font-bold truncate max-w-[180px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          {item.watermarkDetail || 'Timemark Verified'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCustomizingItemId(item.id)}
                            className="text-[10px] text-amber-300 hover:underline font-semibold"
                          >
                            Edit Stempel
                          </button>
                          <label className="text-[10px] text-slate-300 hover:text-white hover:underline cursor-pointer">
                            Ganti
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePhotoUpload(item.id, file);
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-amber-50/40 hover:bg-amber-50/70 transition-all text-center">
                        {processingId === item.id ? (
                          <div className="py-2 flex flex-col items-center text-amber-700">
                            <Loader2 className="w-6 h-6 animate-spin mb-1" />
                            <span className="text-xs font-bold">Membubuhkan Evidence Sikawan...</span>
                          </div>
                        ) : (
                          <>
                            <div className="p-2 bg-amber-200 text-amber-900 rounded-full mb-1">
                              <Camera className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-800">
                              Unggah Foto Bukti
                            </span>
                            <span className="text-[10px] text-amber-900/80 mt-0.5 font-medium">
                              Langsung dicap stempel <strong>Evidence Sikawan</strong> otomatis
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={processingId === item.id}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(item.id, file);
                          }}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setProcessingId(item.id);
                            const res = await fetch('/assets/aistudio/Evidence_20_Agustus_2025_1f5c710d.jpg');
                            const blob = await res.blob();
                            const sampleFile = new File([blob], 'Evidence_20_Agustus_2025.jpg', {
                              type: 'image/jpeg',
                            });
                            await handlePhotoUpload(item.id, sampleFile);
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setProcessingId(null);
                          }
                        }}
                        className="w-full text-center text-[10px] text-amber-800 hover:text-amber-950 hover:underline font-semibold"
                      >
                        ⚡ Pasang Foto Contoh Sikawan
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Keterangan Status
                  </label>
                  <input
                    type="text"
                    value={item.keterangan}
                    onChange={(e) => handleUpdateItem(item.id, { keterangan: e.target.value })}
                    placeholder="Selesai 100% (Sesuai Target)"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-emerald-800 focus:outline-emerald-600 bg-emerald-50/30"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Action: Tambah Baris */}
      <div className="pt-2 flex items-center justify-center">
        <button
          type="button"
          onClick={() => handleAddItem()}
          className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-dashed border-emerald-300 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01]"
        >
          <Plus className="w-5 h-5 text-emerald-600" />
          Tambah Baris Kegiatan Baru
        </button>
      </div>

      {/* Photo Preview Modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activePhotoModal}
              alt="Bukti Dukung Penuh"
              className="max-h-[80vh] w-auto object-contain"
            />
            <div className="p-3 text-white text-xs bg-slate-950 w-full text-center">
              Foto Bukti Dukung Fisik dengan Stempel Watermark Resmi
            </div>
          </div>
        </div>
      )}

      {/* Evidence Sikawan Watermark Customizer Modal */}
      {customizingItemId && (
        (() => {
          const targetItem = report.kegiatanList.find((i) => i.id === customizingItemId);
          if (!targetItem) return null;
          return (
            <WatermarkCustomizerModal
              isOpen={true}
              onClose={() => setCustomizingItemId(null)}
              item={targetItem}
              profile={profile}
              reportDate={report.tanggal}
              onSaveUpdatedItem={(updates) => {
                handleUpdateItem(customizingItemId, updates);
                setCustomizingItemId(null);
              }}
            />
          );
        })()
      )}
    </div>
  );
};
