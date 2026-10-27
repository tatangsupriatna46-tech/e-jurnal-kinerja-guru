import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pegawai, DailyReport, UserRole } from '../types';
import { loadSchoolBranding } from './storage';

// Default initial teachers for SD Negeri Sukabudi 02
export const INITIAL_PEGAWAI_LIST: Pegawai[] = [
  {
    id: 'peg-admin',
    nip: '19xxxxxxxxxxxxxx',
    namaLengkap: 'Administrator / Kepala Sekolah, M.Pd.',
    email: 'admin@sekolah.sch.id',
    username: 'Admin',
    password: 'Admin123',
    role: 'admin',
    pangkatGolongan: 'Pembina / IV/a',
    jabatan: 'Kepala Sekolah & Admin Utama',
    unitKerja: 'SD Negeri Contoh',
    kotaPenetapan: 'Kota / Kabupaten',
    sertakanAtasan: false,
    namaAtasan: '-',
    nipAtasan: '-',
    jabatanAtasan: '-',
    kopBaris1: 'PEMERINTAH KABUPATEN / KOTA',
    kopBaris2: 'DINAS PENDIDIKAN',
    kopBaris3: 'SD NEGERI CONTOH',
    kopAlamat: 'Jl. Pendidikan No. 01, Wilayah Satuan Pendidikan',
    kopKontak: 'Email: sekolah@disdik.go.id',
    logoType: 'none',
    labelEvidence: 'Evidence Sikawan',
    alamatEvidence: 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620',
    koordinatEvidence: '6.139568°S, 107.110048°E',
    skalaWatermark: 0.55,
    posisiWatermark: 'kiri-bawah',
    sertakanCatatanDiFoto: false,
  },
  {
    id: 'peg-guru-1',
    nip: '19xxxxxxxxxxxxxx',
    namaLengkap: 'Nama Guru / Pegawai, S.Pd.',
    email: 'guru@sekolah.sch.id',
    username: 'guru',
    password: 'Guru123',
    role: 'guru',
    pangkatGolongan: 'Penata Muda / III/a',
    jabatan: 'Guru Kelas / Mata Pelajaran',
    unitKerja: 'SD Negeri Contoh',
    kotaPenetapan: 'Kota / Kabupaten',
    sertakanAtasan: true,
    namaAtasan: 'Nama Kepala Sekolah, M.Pd.',
    nipAtasan: '19xxxxxxxxxxxxxx',
    jabatanAtasan: 'Kepala Sekolah',
    kopBaris1: 'PEMERINTAH KABUPATEN / KOTA',
    kopBaris2: 'DINAS PENDIDIKAN',
    kopBaris3: 'SD NEGERI CONTOH',
    kopAlamat: 'Jl. Pendidikan No. 01, Wilayah Satuan Pendidikan',
    kopKontak: 'Email: sekolah@disdik.go.id',
    logoType: 'none',
    labelEvidence: 'Evidence Sikawan',
    alamatEvidence: 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620',
    koordinatEvidence: '6.139568°S, 107.110048°E',
    skalaWatermark: 0.55,
    posisiWatermark: 'kiri-bawah',
    sertakanCatatanDiFoto: false,
  },
  {
    id: 'peg-guru-2',
    nip: '19xxxxxxxxxxxxxx',
    namaLengkap: 'Guru Pengajar 2, S.Pd.Gr.',
    email: 'guru2@sekolah.sch.id',
    username: 'guru2',
    password: 'Guru123',
    role: 'guru',
    pangkatGolongan: 'Penata Muda Tk. I / III/b',
    jabatan: 'Guru Kelas / PJOK',
    unitKerja: 'SD Negeri Contoh',
    kotaPenetapan: 'Kota / Kabupaten',
    sertakanAtasan: true,
    namaAtasan: 'Nama Kepala Sekolah, M.Pd.',
    nipAtasan: '19xxxxxxxxxxxxxx',
    jabatanAtasan: 'Kepala Sekolah',
    kopBaris1: 'PEMERINTAH KABUPATEN / KOTA',
    kopBaris2: 'DINAS PENDIDIKAN',
    kopBaris3: 'SD NEGERI CONTOH',
    kopAlamat: 'Jl. Pendidikan No. 01, Wilayah Satuan Pendidikan',
    kopKontak: 'Email: sekolah@disdik.go.id',
    logoType: 'none',
    labelEvidence: 'Evidence Sikawan',
    alamatEvidence: 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620',
    koordinatEvidence: '6.139568°S, 107.110048°E',
    skalaWatermark: 0.55,
    posisiWatermark: 'kiri-bawah',
    sertakanCatatanDiFoto: false,
  },
];

const PEGAWAI_LIST_STORAGE_KEY = 'ejurnal_pegawai_list_v2';
const SUPABASE_CONFIG_KEY = 'ejurnal_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export function loadSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }
  return {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || '',
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
    isConnected: false,
  };
}

export function saveSupabaseConfig(cfg: SupabaseConfig): void {
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(cfg));
  } catch (e) {
    console.error(e);
  }
}

// Client Singleton
let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const cfg = loadSupabaseConfig();
  if (cfg.url && cfg.anonKey) {
    if (!supabaseClientInstance) {
      try {
        supabaseClientInstance = createClient(cfg.url, cfg.anonKey);
      } catch (e) {
        console.error('Error creating Supabase client:', e);
      }
    }
    return supabaseClientInstance;
  }
  return null;
}

// ==========================================
// PEGAWAI LOCAL & SUPABASE SYNC
// ==========================================
export function loadLocalPegawaiList(): Pegawai[] {
  try {
    const raw = localStorage.getItem(PEGAWAI_LIST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const migrated = parsed.map((p: Pegawai) => ({
          ...p,
          alamatEvidence:
            !p.alamatEvidence || p.alamatEvidence.includes('Jl. Pendidikan No. 01')
              ? 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620'
              : p.alamatEvidence,
          koordinatEvidence:
            !p.koordinatEvidence ||
            p.koordinatEvidence === '6.200000°S, 106.816666°E' ||
            p.koordinatEvidence === '6.139434°S, 107.109875°E'
              ? '6.139568°S, 107.110048°E'
              : p.koordinatEvidence,
        }));
        return migrated;
      }
    }
  } catch (e) {
    console.error(e);
  }
  // Initialize default
  try {
    localStorage.setItem(PEGAWAI_LIST_STORAGE_KEY, JSON.stringify(INITIAL_PEGAWAI_LIST));
  } catch (e) {
    console.error(e);
  }
  return INITIAL_PEGAWAI_LIST;
}

export function saveLocalPegawaiList(list: Pegawai[]): void {
  try {
    localStorage.setItem(PEGAWAI_LIST_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export async function fetchPegawaiList(): Promise<Pegawai[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('pegawai').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: Pegawai[] = data.map((d: any) => ({
          id: d.id,
          authUserId: d.auth_user_id,
          nip: d.nip,
          namaLengkap: d.nama_lengkap,
          email: d.email || '',
          username: d.username || (d.role === 'admin' ? 'Admin' : (d.email ? d.email.split('@')[0] : d.nip)),
          password: d.password || (d.role === 'admin' ? 'Admin123' : 'Guru123'),
          role: d.role as UserRole,
          pangkatGolongan: d.pangkat_golongan || '',
          jabatan: d.jabatan || '',
          unitKerja: d.unit_kerja || 'SD Negeri Sukabudi 02',
          kotaPenetapan: d.kota_penetapan || 'Bekasi',
          avatarUrl: d.avatar_url || '/src/assets/images/avatar_teacher_profile_1792826785549.jpg',
          sertakanAtasan: d.sertakan_atasan ?? true,
          namaAtasan: d.nama_atasan || 'Dra. Hj. Siti Rohmah, M.M.Pd.',
          nipAtasan: d.nip_atasan || '19680715 199303 2 004',
          jabatanAtasan: d.jabatan_atasan || 'Kepala Sekolah',
          kopBaris1: d.kop_baris1 || 'DINAS PENDIDIKAN KABUPATEN BEKASI',
          kopBaris2: d.kop_baris2 || 'JURNAL HARIAN KINERJA',
          kopBaris3: d.kop_baris3 || 'SD NEGERI SUKABUDI 02',
          kopAlamat: d.kop_alamat || '',
          kopKontak: d.kop_kontak || '',
          logoType: d.logo_type || 'disdik',
          customLogoUrl: d.custom_logo_url,
          loginLogoType: d.login_logo_type || 'default',
          loginLogoUrl: d.login_logo_url,
          labelEvidence: d.label_evidence || 'Evidence Sikawan',
          alamatEvidence: d.alamat_evidence,
          koordinatEvidence: d.koordinat_evidence,
          skalaWatermark: d.skala_watermark ?? 0.55,
          posisiWatermark: d.posisi_watermark || 'kiri-bawah',
          sertakanCatatanDiFoto: d.sertakan_catatan_di_foto ?? false,
        }));
        saveLocalPegawaiList(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase fetchPegawaiList fallback to local:', e);
    }
  }
  return loadLocalPegawaiList();
}

export async function upsertPegawai(pegawai: Pegawai): Promise<Pegawai[]> {
  const current = loadLocalPegawaiList();
  let targetPegawai = { ...pegawai };

  const supabase = getSupabaseClient();
  if (supabase) {
    // 1. Cek dan unggah avatar ke Object Storage jika masih berupa Base64
    if (targetPegawai.avatarUrl && targetPegawai.avatarUrl.startsWith('data:image/')) {
      try {
        targetPegawai.avatarUrl = await uploadImageToStorage(
          targetPegawai.avatarUrl,
          'avatars',
          `avatar_${targetPegawai.nip || targetPegawai.id}`
        );
      } catch (e) {
        console.warn('Gagal upload avatar ke storage:', e);
      }
    }

    // 2. Cek dan unggah logo dinas/sekolah ke Object Storage jika masih berupa Base64
    if (targetPegawai.customLogoUrl && targetPegawai.customLogoUrl.startsWith('data:image/')) {
      try {
        targetPegawai.customLogoUrl = await uploadImageToStorage(
          targetPegawai.customLogoUrl,
          'logos',
          'logo_instansi'
        );
      } catch (e) {
        console.warn('Gagal upload logo instansi ke storage:', e);
      }
    }

    // 3. Cek dan unggah logo login ke Object Storage jika masih berupa Base64
    if (targetPegawai.loginLogoUrl && targetPegawai.loginLogoUrl.startsWith('data:image/')) {
      try {
        targetPegawai.loginLogoUrl = await uploadImageToStorage(
          targetPegawai.loginLogoUrl,
          'logos',
          'logo_login'
        );
      } catch (e) {
        console.warn('Gagal upload logo login ke storage:', e);
      }
    }
  }

  const idx = current.findIndex((p) => p.id === targetPegawai.id || p.nip === targetPegawai.nip);
  let updated: Pegawai[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = targetPegawai;
  } else {
    updated = [...current, targetPegawai];
  }
  saveLocalPegawaiList(updated);

  if (supabase) {
    try {
      await supabase.from('pegawai').upsert({
        id: targetPegawai.id.includes('-') && !targetPegawai.id.startsWith('peg-') ? targetPegawai.id : undefined,
        nip: targetPegawai.nip,
        nama_lengkap: targetPegawai.namaLengkap,
        email: targetPegawai.email,
        username: targetPegawai.username || (targetPegawai.role === 'admin' ? 'Admin' : (targetPegawai.email ? targetPegawai.email.split('@')[0] : targetPegawai.nip)),
        password: targetPegawai.password || (targetPegawai.role === 'admin' ? 'Admin123' : 'Guru123'),
        role: targetPegawai.role,
        pangkat_golongan: targetPegawai.pangkatGolongan,
        jabatan: targetPegawai.jabatan,
        unit_kerja: targetPegawai.unitKerja,
        kota_penetapan: targetPegawai.kotaPenetapan,
        sertakan_atasan: targetPegawai.sertakanAtasan,
        nama_atasan: targetPegawai.namaAtasan,
        nip_atasan: targetPegawai.nipAtasan,
        jabatan_atasan: targetPegawai.jabatanAtasan,
        kop_baris1: targetPegawai.kopBaris1,
        kop_baris2: targetPegawai.kopBaris2,
        kop_baris3: targetPegawai.kopBaris3,
        kop_alamat: targetPegawai.kopAlamat,
        kop_kontak: targetPegawai.kopKontak,
        logo_type: targetPegawai.logoType,
        custom_logo_url: targetPegawai.customLogoUrl,
        login_logo_type: targetPegawai.loginLogoType,
        login_logo_url: targetPegawai.loginLogoUrl,
        label_evidence: targetPegawai.labelEvidence,
        alamat_evidence: targetPegawai.alamatEvidence,
        koordinat_evidence: targetPegawai.koordinatEvidence,
        skala_watermark: targetPegawai.skalaWatermark,
        posisi_watermark: targetPegawai.posisiWatermark,
        sertakan_catatan_di_foto: targetPegawai.sertakanCatatanDiFoto,
        avatar_url: targetPegawai.avatarUrl,
      });
    } catch (e) {
      console.warn('Supabase upsertPegawai error:', e);
    }
  }
  return updated;
}

export async function deletePegawai(pegawaiId: string): Promise<Pegawai[]> {
  const current = loadLocalPegawaiList();
  const updated = current.filter((p) => p.id !== pegawaiId);
  saveLocalPegawaiList(updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('pegawai').delete().eq('id', pegawaiId);
    } catch (e) {
      console.warn('Supabase deletePegawai error:', e);
    }
  }
  return updated;
}

// Convert a Pegawai item to Profile format
export function convertPegawaiToProfile(pegawai: Pegawai) {
  const school = loadSchoolBranding();
  return {
    avatarUrl: pegawai.avatarUrl || '',
    namaLengkap: pegawai.namaLengkap,
    nip: pegawai.nip,
    pangkatGolongan: pegawai.pangkatGolongan,
    jabatan: pegawai.jabatan,
    unitKerja: pegawai.unitKerja || school.unitKerja || 'SD Negeri Contoh',
    kotaPenetapan: pegawai.kotaPenetapan || school.kotaPenetapan || 'Kota / Kabupaten',
    sertakanAtasan: pegawai.sertakanAtasan ?? school.sertakanAtasan ?? true,
    namaAtasan: pegawai.namaAtasan || school.namaAtasan || '-',
    nipAtasan: pegawai.nipAtasan || school.nipAtasan || '-',
    jabatanAtasan: pegawai.jabatanAtasan || school.jabatanAtasan || 'Kepala Sekolah',
    kopBaris1: pegawai.kopBaris1 || school.kopBaris1 || 'PEMERINTAH KABUPATEN / KOTA',
    kopBaris2: pegawai.kopBaris2 || school.kopBaris2 || 'DINAS PENDIDIKAN',
    kopBaris3: pegawai.kopBaris3 || school.kopBaris3 || 'SD NEGERI CONTOH',
    kopAlamat: pegawai.kopAlamat || school.kopAlamat || '',
    kopKontak: pegawai.kopKontak || school.kopKontak || '',
    logoType: (pegawai.logoType && pegawai.logoType !== 'none') ? pegawai.logoType : (school.logoType || 'none'),
    customLogoUrl: pegawai.customLogoUrl || school.customLogoUrl,
    loginLogoUrl: pegawai.loginLogoUrl || school.loginLogoUrl,
    loginLogoType: (pegawai.loginLogoType && pegawai.loginLogoType !== 'default') ? pegawai.loginLogoType : (school.loginLogoType || 'default'),
    labelEvidence: pegawai.labelEvidence || school.labelEvidence || 'Absensi',
    alamatEvidence:
      (!pegawai.alamatEvidence || pegawai.alamatEvidence.includes('Jl. Pendidikan No. 01'))
        ? (school.alamatEvidence || 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620')
        : pegawai.alamatEvidence,
    koordinatEvidence:
      (!pegawai.koordinatEvidence ||
        pegawai.koordinatEvidence === '6.200000°S, 106.816666°E' ||
        pegawai.koordinatEvidence === '6.139434°S, 107.109875°E')
        ? (school.koordinatEvidence && school.koordinatEvidence !== '6.200000°S, 106.816666°E' && school.koordinatEvidence !== '6.139434°S, 107.109875°E'
            ? school.koordinatEvidence
            : '6.139568°S, 107.110048°E')
        : pegawai.koordinatEvidence,
    skalaWatermark: pegawai.skalaWatermark ?? school.skalaWatermark ?? 0.58,
    posisiWatermark: pegawai.posisiWatermark || school.posisiWatermark || 'kiri-bawah',
    sertakanCatatanDiFoto: pegawai.sertakanCatatanDiFoto ?? school.sertakanCatatanDiFoto ?? false,
  };
}


// ==========================================
// OBJECT STORAGE & IMAGE COMPRESSION HELPERS
// Simpan URL foto di database, BUKAN file fisik Base64/BLOB besar
// ==========================================

export async function compressImage(
  imageSource: string | File | Blob,
  maxWidth = 1200,
  quality = 0.82
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    let srcUrl = "";
    let isCreatedUrl = false;

    if (typeof imageSource === "string") {
      srcUrl = imageSource;
    } else {
      srcUrl = URL.createObjectURL(imageSource);
      isCreatedUrl = true;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        if (isCreatedUrl) URL.revokeObjectURL(srcUrl);
        reject(new Error("Canvas 2D context not available"));
        return;
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      canvas.toBlob(
        (blob) => {
          if (isCreatedUrl) URL.revokeObjectURL(srcUrl);
          if (blob) {
            resolve({ blob, dataUrl });
          } else {
            resolve({ blob: new Blob([]), dataUrl });
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = (e) => {
      if (isCreatedUrl) URL.revokeObjectURL(srcUrl);
      reject(e);
    };

    img.src = srcUrl;
  });
}

/**
 * Uploads an image to Supabase Object Storage (bucket: evidence-photos)
 * and returns the public HTTP URL string.
 * If Supabase is offline or not configured, gracefully returns the optimized compressed dataUrl.
 */
export async function uploadImageToStorage(
  imageSource: string | File | Blob,
  folder: "evidence" | "avatars" | "logos" | "signatures" = "evidence",
  filenamePrefix?: string
): Promise<string> {
  // If it is already an HTTP / HTTPS URL, no need to upload again
  if (typeof imageSource === "string" && (imageSource.startsWith("http://") || imageSource.startsWith("https://"))) {
    return imageSource;
  }

  try {
    // 1. Client-side compression to ensure lightweight transmission & storage
    const { blob, dataUrl } = await compressImage(imageSource, 1200, 0.82);

    // 2. Check Supabase client
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Offline / Local fallback: return compressed local URL
      return dataUrl;
    }

    const cleanPrefix = (filenamePrefix || folder).replace(/[^a-zA-Z0-9_-]/g, "_");
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filePath = `${folder}/${cleanPrefix}_${timestamp}_${randomStr}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("evidence-photos")
      .upload(filePath, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.warn("Peringatan: Gagal unggah ke Supabase Storage (evidence-photos):", uploadError.message);
      return dataUrl;
    }

    const { data } = supabase.storage
      .from("evidence-photos")
      .getPublicUrl(filePath);

    if (data?.publicUrl) {
      return data.publicUrl;
    }

    return dataUrl;
  } catch (err) {
    console.warn("Gagal memproses/mengunggah gambar ke Object Storage:", err);
    return typeof imageSource === "string" ? imageSource : "";
  }
}

/**
 * Sync daily report to Supabase table jurnal_harian.
 * Strips raw heavy base64 strings if any and stores clean public URLs.
 */
export async function syncDailyReportToSupabase(report: DailyReport): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    // Pastikan seluruh foto bukti tersimpan di Object Storage (Supabase Storage)
    // dan hanya URL gambar yang disimpan ke dalam kolom JSONB tabel database
    const cleanedKegiatan = await Promise.all(
      (report.kegiatanList || []).map(async (item) => {
        let finalBuktiFotoUrl = item.buktiFotoUrl;
        if (finalBuktiFotoUrl && finalBuktiFotoUrl.startsWith('data:image/')) {
          try {
            finalBuktiFotoUrl = await uploadImageToStorage(
              finalBuktiFotoUrl,
              'evidence',
              `bukti_${report.pegawaiId || 'peg'}_${report.tanggal || 'tgl'}_${item.id}`
            );
          } catch (uploadErr) {
            console.warn('Gagal unggah foto bukti ke storage:', uploadErr);
          }
        }

        return {
          id: item.id,
          waktu: item.waktu,
          deskripsi: item.deskripsi,
          keterangan: item.keterangan,
          buktiFotoUrl: finalBuktiFotoUrl, // Hanya URL publik Supabase Storage (bukan Base64/BLOB besar)
          watermarkDetail: item.watermarkDetail,
          customLabel: item.customLabel,
          customTimeHHMM: item.customTimeHHMM,
          customDateText: item.customDateText,
          customAddressText: item.customAddressText,
          customCoordinates: item.customCoordinates,
          customKodeFoto: item.customKodeFoto,
          customSkala: item.customSkala,
          customPosisi: item.customPosisi,
        };
      })
    );

    const payload = {
      id: report.id,
      pegawai_id: report.pegawaiId,
      pegawai_nama: report.pegawaiNama,
      tanggal: report.tanggal,
      nomor_surat: report.nomorSurat,
      kegiatan_list: cleanedKegiatan,
      catatan: report.catatan,
      paper_size: report.paperSize || "A4",
      font_family: report.fontFamily || "arial",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("jurnal_harian").upsert(payload, {
      onConflict: "pegawai_id,tanggal",
    });

    if (error) {
      console.warn("Supabase syncDailyReport error:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("Supabase syncDailyReport exception:", e);
    return false;
  }
}
