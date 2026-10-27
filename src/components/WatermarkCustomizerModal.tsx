import React, { useState } from 'react';
import { ActivityItem, Profile } from '../types';
import { applyWatermarkToImage, generateTimemarkPhotoCode } from '../utils/watermark';
import { uploadImageToStorage } from '../utils/supabaseClient';
import { formatTanggalLengkapIndo, extractTimeHHMM, getCurrentTimeHHMM } from '../utils/dateUtils';
import {
  X,
  Clock,
  Calendar,
  MapPin,
  Navigation,
  Sparkles,
  Check,
  Loader2,
  Maximize2,
  Move,
  Hash,
  RefreshCw,
  ShieldCheck,
  Tag,
} from 'lucide-react';

interface WatermarkCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ActivityItem;
  profile: Profile;
  reportDate: string;
  onSaveUpdatedItem: (updated: Partial<ActivityItem>) => void;
}

export const WatermarkCustomizerModal: React.FC<WatermarkCustomizerModalProps> = ({
  isOpen,
  onClose,
  item,
  profile,
  reportDate,
  onSaveUpdatedItem,
}) => {
  // 1. Judul (Label)
  const [label, setLabel] = useState(
    item.customLabel || profile.labelEvidence || 'Absensi'
  );

  // 2. Waktu / Jam
  const [time, setTime] = useState(
    item.customTimeHHMM || extractTimeHHMM(item.waktu) || '08:46'
  );

  // 3. Tanggal
  const [dateStr, setDateStr] = useState(
    item.customDateText ||
      (reportDate ? formatTanggalLengkapIndo(reportDate) : 'Senin, 26 Oktober 2026')
  );

  // 4. Alamat
  const [address, setAddress] = useState(() => {
    const raw = item.customAddressText || profile.alamatEvidence;
    if (
      !raw ||
      raw === 'Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620' ||
      raw === 'Jl. Bulak Temu, Sukabudi, Kec. Sukawangi, Kabupaten Bekasi, Jawa Barat 17620' ||
      raw.includes('Jl. Pendidikan No. 01')
    ) {
      return 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620';
    }
    return raw;
  });

  // 5. Titik Koordinat GPS
  const [coords, setCoords] = useState(() => {
    const raw = item.customCoordinates || profile.koordinatEvidence;
    if (
      !raw ||
      raw === '6.200000°S, 106.816666°E' ||
      raw === '6.139434°S, 107.109875°E'
    ) {
      return '6.139568°S, 107.110048°E';
    }
    return raw;
  });

  // 6. Kode Foto
  const [kodeFoto, setKodeFoto] = useState(
    item.customKodeFoto ||
      profile.kodeFotoDefault ||
      'NEH21B41DAUBCH'
  );

  // Skala & Posisi
  const [skala, setSkala] = useState<number>(
    item.customSkala ?? profile.skalaWatermark ?? 0.58
  );
  const [posisi, setPosisi] = useState<'kiri-bawah' | 'kiri-tengah' | 'kiri-atas'>(
    item.customPosisi ?? profile.posisiWatermark ?? 'kiri-bawah'
  );
  const [sertakanCatatan, setSertakanCatatan] = useState<boolean>(
    profile.sertakanCatatanDiFoto ?? false
  );

  const [isApplying, setIsApplying] = useState(false);
  const [isGettingGps, setIsGettingGps] = useState(false);

  if (!isOpen) return null;

  const handleGetCurrentGps = () => {
    if (!navigator.geolocation) {
      alert('Geolokasi tidak didukung oleh browser Anda. Menggunakan koordinat default: 6.139568°S, 107.110048°E');
      setCoords('6.139568°S, 107.110048°E');
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const latDir = lat >= 0 ? 'N' : 'S';
        const lngDir = lng >= 0 ? 'E' : 'W';
        const formatted = `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`;
        setCoords(formatted);
        setIsGettingGps(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setCoords('6.139568°S, 107.110048°E');
        setIsGettingGps(false);
      },
      { timeout: 7000 }
    );
  };

  const handleRandomizeKodeFoto = () => {
    setKodeFoto(generateTimemarkPhotoCode());
  };

  const handleSetSampleTimemark = () => {
    setLabel('Absensi');
    setTime('08:46');
    setDateStr('Senin, 26 Oktober 2026');
    setAddress('Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620');
    setCoords('6.139568°S, 107.110048°E');
    setKodeFoto('NEH21B41DAUBCH');
    setSkala(0.58);
    setPosisi('kiri-bawah');
    setSertakanCatatan(false);
  };

  const handleApply = async () => {
    const rawImageSource = item.originalFotoUrl || item.buktiFotoUrl;
    if (!rawImageSource) {
      onClose();
      return;
    }

    try {
      setIsApplying(true);

      const res = await fetch(rawImageSource);
      const blob = await res.blob();

      const result = await applyWatermarkToImage(blob, {
        labelEvidence: label,
        timeHHMM: time,
        dateText: dateStr,
        addressText: address,
        coordinates: coords,
        kodeFoto: kodeFoto,
        catatanText: item.deskripsi,
        sertakanCatatan,
        skala,
        posisi,
      });

      // Upload ke Object Storage agar URL publik yang disimpan ke database, bukan Base64 besar
      const finalPhotoUrl = await uploadImageToStorage(result.dataUrl, 'evidence', `bukti_edit_${item.id}`);

      onSaveUpdatedItem({
        buktiFotoUrl: finalPhotoUrl,
        watermarkDetail: result.stampText,
        customLabel: label,
        customTimeHHMM: time,
        customDateText: dateStr,
        customAddressText: address,
        customCoordinates: coords,
        customKodeFoto: kodeFoto,
        customSkala: skala,
        customPosisi: posisi,
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui stempel foto Timemark.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 px-5 py-4 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-black/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base leading-tight">
                  Kustomisasi Stempel Timemark
                </h3>
                <span className="bg-slate-950 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Foto 100% Akurat
                </span>
              </div>
              <p className="text-xs text-slate-900/80 font-medium">
                Sesuaikan judul, jam, tanggal, alamat, GPS, dan kode foto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-lg hover:bg-black/10 text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-5 py-2.5 bg-amber-50/70 border-b border-amber-200/80 flex items-center justify-between text-xs">
          <span className="font-semibold text-amber-900">Preset Cepat:</span>
          <button
            type="button"
            onClick={handleSetSampleTimemark}
            className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-950 rounded-lg font-bold transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Reset Sesuai Foto Contoh
          </button>
        </div>

        {/* Form Inputs & Live Preview */}
        <div className="p-5 space-y-4 text-xs md:text-sm max-h-[64vh] overflow-y-auto">
          {/* LIVE VISUAL PREVIEW CARD */}
          <div className="bg-slate-900 rounded-xl p-4 text-white relative shadow-inner overflow-hidden border border-slate-800">
            {/* Top right branding */}
            <div className="absolute top-3 right-3 text-right">
              <span className="text-amber-400 font-extrabold text-xs block leading-tight">
                Timemark
              </span>
              <span className="text-slate-300 text-[9px] block">Foto 100% akurat</span>
            </div>

            {/* Right edge vertical watermark preview */}
            <div className="absolute right-1 bottom-10 origin-bottom-right -rotate-90 text-[8px] text-white/70 font-mono tracking-tight pointer-events-none select-none">
              © {kodeFoto || 'NEH21B41DAUBCH'} &nbsp; Timemark Verified
            </div>

            <p className="text-[10px] text-amber-400 uppercase tracking-wider font-bold mb-2">
              Pratinjau Langsung Stempel Timemark:
            </p>

            {/* Main Timemark Bottom-Left Widget */}
            <div className="space-y-2 max-w-[85%]">
              {/* White rounded badge */}
              <div className="inline-flex items-center bg-white p-1 rounded-lg shadow-md gap-2">
                <span className="bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded text-xs leading-none">
                  {label || 'Absensi'}
                </span>
                <span className="text-blue-700 font-black text-sm pr-2 font-mono leading-none">
                  {time || '08:46'}
                </span>
              </div>

              {/* Vertical accent bar + metadata */}
              <div className="flex items-stretch gap-2 pl-0.5">
                <div className="w-1 bg-amber-400 rounded-full shrink-0 shadow-xs" />
                <div className="space-y-0.5 text-slate-100 text-[11px] leading-snug drop-shadow-md">
                  <div className="font-extrabold text-white text-xs">{dateStr}</div>
                  <div className="font-medium text-slate-200 whitespace-pre-line text-[10px]">
                    {address}
                  </div>
                  <div className="font-mono text-slate-300 text-[10px]">{coords}</div>
                </div>
              </div>

              {/* Shield Icon + Kode Foto */}
              <div className="flex items-center gap-1.5 text-slate-300 text-[10px] font-semibold pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span>
                  Kode Foto:{' '}
                  <span className="font-mono text-white font-bold">{kodeFoto}</span>
                </span>
              </div>
            </div>
          </div>

          {/* 1. JUDUL TIMESTAMP */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              Judul Stempel (Badge Kuning)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Contoh: Absensi"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-amber-500 bg-amber-50/20"
            />
            {/* Quick Title Presets */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {[
                'Absensi',
                'Kegiatan Pembelajaran',
                'Bimbingan Siswa',
                'Rapat / Bimtek',
                'Piket Sekolah',
                'Upacara Bendera',
                'Evidence Sikawan',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setLabel(preset)}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border transition-all ${
                    label === preset
                      ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* 2. WAKTU / JAM & TANGGAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Waktu / Jam */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-700" />
                  Waktu / Jam
                </label>
                <button
                  type="button"
                  onClick={() => setTime(getCurrentTimeHHMM())}
                  className="text-[10px] text-blue-700 hover:text-blue-900 font-bold"
                >
                  Jam Sekarang
                </button>
              </div>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="08:46"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-blue-900 font-black text-base focus:outline-blue-600 bg-slate-50 font-mono"
              />
              <div className="flex gap-1 mt-1">
                {['06:45', '07:15', '08:46', '10:00', '11:22', '13:30'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTime(preset)}
                    className="text-[10px] bg-slate-100 hover:bg-amber-100 text-slate-700 px-1.5 py-0.5 rounded font-mono"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Tanggal */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Hari & Tanggal
                </label>
                {reportDate && (
                  <button
                    type="button"
                    onClick={() => setDateStr(formatTanggalLengkapIndo(reportDate))}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold"
                  >
                    Ikuti Laporan
                  </button>
                )}
              </div>
              <input
                type="text"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                placeholder="Senin, 26 Oktober 2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-amber-500"
              />
              <div className="flex gap-1 mt-1">
                <button
                  type="button"
                  onClick={() => setDateStr('Senin, 26 Oktober 2026')}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded"
                >
                  Senin, 26 Okt 2026
                </button>
                <button
                  type="button"
                  onClick={() => setDateStr(formatTanggalLengkapIndo(new Date()))}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded"
                >
                  Hari Ini
                </button>
              </div>
            </div>
          </div>

          {/* 3. ALAMAT LENGKAP */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                Alamat Lokasi Kegiatan
              </label>
              <button
                type="button"
                onClick={() =>
                  setAddress(
                    'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620'
                  )
                }
                className="text-[10px] text-amber-800 hover:text-amber-950 font-bold"
              >
                Reset Alamat Contoh
              </button>
            </div>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi, Kabupaten Bekasi, Jawa Barat 17620"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-amber-500 leading-relaxed font-medium"
            />
          </div>

          {/* 4. TITIK KOORDINAT GPS */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                Titik Koordinat GPS
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCoords('6.139568°S, 107.110048°E')}
                  className="text-[10px] text-amber-800 hover:text-amber-950 font-bold"
                >
                  Reset Koordinat Default
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleGetCurrentGps}
                  disabled={isGettingGps}
                  className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
                >
                  {isGettingGps ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Navigation className="w-3 h-3" />
                  )}
                  Deteksi GPS Perangkat
                </button>
              </div>
            </div>
            <input
              type="text"
              value={coords}
              onChange={(e) => setCoords(e.target.value)}
              placeholder="6.139568°S, 107.110048°E"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:outline-amber-500 font-bold bg-slate-50/50"
            />
            <div className="flex items-center gap-1.5 mt-1.5">
              <button
                type="button"
                onClick={() => setCoords('6.139568°S, 107.110048°E')}
                className="text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 transition-colors"
              >
                📍 Lokasi Default: 6.139568°S, 107.110048°E
              </button>
            </div>
          </div>

          {/* 5. KODE FOTO */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-purple-600" />
                Kode Foto (Timemark Verified)
              </label>
              <button
                type="button"
                onClick={handleRandomizeKodeFoto}
                className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Acak Kode Baru
              </button>
            </div>
            <input
              type="text"
              value={kodeFoto}
              onChange={(e) => setKodeFoto(e.target.value.toUpperCase())}
              placeholder="NEH21B41DAUBCH"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs uppercase tracking-wider focus:outline-amber-500"
            />
          </div>

          {/* PENGATURAN UKURAN / SKALA PROPORSI */}
          <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-amber-700" />
                Ukuran Stempel pada Foto
              </label>
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                {Math.round(skala * 48.6)}% Lebar Foto
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSkala(0.45)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  skala <= 0.48
                    ? 'border-amber-600 bg-amber-500 text-slate-950 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-amber-50'
                }`}
              >
                Kecil (22%)
              </button>
              <button
                type="button"
                onClick={() => setSkala(0.58)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  skala > 0.48 && skala <= 0.65
                    ? 'border-amber-600 bg-amber-500 text-slate-950 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-amber-50'
                }`}
              >
                Pas / Standar (28%) ★
              </button>
              <button
                type="button"
                onClick={() => setSkala(0.72)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  skala > 0.65
                    ? 'border-amber-600 bg-amber-500 text-slate-950 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-amber-50'
                }`}
              >
                Sedang (35%)
              </button>
            </div>

            <input
              type="range"
              min="0.35"
              max="0.85"
              step="0.02"
              value={skala}
              onChange={(e) => setSkala(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {/* POSISI STEMPEL */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Move className="w-3.5 h-3.5 text-slate-600" />
              Posisi Stempel di Foto
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPosisi('kiri-bawah')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  posisi === 'kiri-bawah'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                Kiri Bawah (Pojok)
              </button>
              <button
                type="button"
                onClick={() => setPosisi('kiri-tengah')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  posisi === 'kiri-tengah'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                Kiri Tengah
              </button>
              <button
                type="button"
                onClick={() => setPosisi('kiri-atas')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  posisi === 'kiri-atas'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                Kiri Atas
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 rounded-lg text-xs font-semibold"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={isApplying}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-slate-950 rounded-xl text-xs md:text-sm font-extrabold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Membubuhkan Stempel Timemark...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Terapkan ke Foto
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
