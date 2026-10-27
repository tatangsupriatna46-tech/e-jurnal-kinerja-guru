import React, { useState } from 'react';
import { DailyReport, Profile } from '../types';
import { formatTanggalLengkapIndo } from '../utils/dateUtils';
import { X, Copy, Check, MessageSquare, Send } from 'lucide-react';

interface CopySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DailyReport;
  profile: Profile;
}

export const CopySummaryModal: React.FC<CopySummaryModalProps> = ({
  isOpen,
  onClose,
  report,
  profile,
}) => {
  const [copied, setCopied] = useState(false);
  const [formatType, setFormatType] = useState<'whatsapp' | 'ekinerja'>('whatsapp');

  if (!isOpen) return null;

  const tanggalStr = formatTanggalLengkapIndo(report.tanggal);

  const generateWhatsappText = () => {
    let text = `*LAPORAN KINERJA HARIAN GURU*\n`;
    text += `*Unit Kerja:* ${profile.unitKerja || '-'}\n`;
    text += `*Hari/Tanggal:* ${tanggalStr}\n`;
    text += `*Nama:* ${profile.namaLengkap}\n`;
    text += `*NIP:* ${profile.nip}\n`;
    text += `*Jabatan:* ${profile.jabatan}\n`;
    text += `------------------------------------\n`;
    text += `*DAFTAR KEGIATAN:*\n`;

    report.kegiatanList.forEach((act, idx) => {
      text += `\n${idx + 1}. *[${act.waktu}]* - ${act.kategori || 'Kegiatan'}\n`;
      text += `   📝 ${act.deskripsi}\n`;
      text += `   📊 Status: ${act.keterangan}\n`;
      if (act.buktiFotoUrl) {
        text += `   📸 Bukti Foto: Ada (Tercap Berstempel)\n`;
      }
    });

    if (report.catatan) {
      text += `\n*Catatan/Hambatan:* ${report.catatan}\n`;
    }

    text += `\n_Laporan ini dibuat otomatis melalui E-Jurnal Kinerja Guru_`;
    return text;
  };

  const generateEKinerjaText = () => {
    let text = `Rincian Kinerja Harian Pegawai (${tanggalStr}):\n\n`;
    report.kegiatanList.forEach((act, idx) => {
      text += `Kegiatan ${idx + 1}:\n`;
      text += `- Waktu: ${act.waktu}\n`;
      text += `- Deskripsi: ${act.deskripsi}\n`;
      text += `- Output / Capaian: ${act.keterangan}\n\n`;
    });
    return text.trim();
  };

  const currentContent = formatType === 'whatsapp' ? generateWhatsappText() : generateEKinerjaText();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWa = () => {
    const encoded = encodeURIComponent(generateWhatsappText());
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-200" />
            <h3 className="font-bold text-sm md:text-base">Salin Ringkasan Kegiatan</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs md:text-sm">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFormatType('whatsapp')}
              className={`flex-1 py-1.5 font-semibold rounded-lg text-xs transition-all ${
                formatType === 'whatsapp'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Format WhatsApp / Grup Sekolah
            </button>
            <button
              onClick={() => setFormatType('ekinerja')}
              className={`flex-1 py-1.5 font-semibold rounded-lg text-xs transition-all ${
                formatType === 'ekinerja'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Format Teks e-Kinerja BKN / PMM
            </button>
          </div>

          <div>
            <textarea
              readOnly
              rows={11}
              value={currentContent}
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            {formatType === 'whatsapp' ? (
              <button
                type="button"
                onClick={handleShareWa}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Kirim ke WhatsApp
              </button>
            ) : (
              <span className="text-[11px] text-slate-500">
                Siap disalin ke portal kinerja
              </span>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-semibold text-xs flex items-center gap-2 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Tersalin!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Salin Teks
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
