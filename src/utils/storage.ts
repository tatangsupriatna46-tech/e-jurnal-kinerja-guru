import { Profile, DailyReport, ActivityItem, AuthAccounts } from '../types';
import { getLatestWorkingDateString, isWeekendDay } from './dateUtils';

const PROFILE_KEY = 'ejurnal_guru_profile_v1';
const CURRENT_REPORT_KEY = 'ejurnal_guru_current_report_v1';
const REPORT_HISTORY_KEY = 'ejurnal_guru_history_v1';
const ACCOUNTS_KEY = 'ejurnal_auth_accounts_v1';

export const DEFAULT_PROFILE: Profile = {
  avatarUrl: '',
  kopBaris1: 'PEMERINTAH KABUPATEN / KOTA',
  kopBaris2: 'DINAS PENDIDIKAN',
  kopBaris3: 'SD NEGERI CONTOH',
  kopAlamat: 'Jl. Pendidikan No. 01, Wilayah Satuan Pendidikan',
  kopKontak: 'Telp: (021) 1234567 | Pos-el: sekolah@disdik.go.id',
  logoType: 'none',
  loginLogoType: 'default',
  loginLogoUrl: '',
  namaLengkap: 'Nama Guru / Pegawai, S.Pd.',
  nip: '19xxxxxxxxxxxxxx',
  pangkatGolongan: 'Penata Muda / III/a',
  jabatan: 'Guru Kelas / Mata Pelajaran',
  unitKerja: 'SD Negeri Contoh',
  kotaPenetapan: 'Kota / Kabupaten',
  sertakanAtasan: false,
  namaAtasan: 'Nama Kepala Sekolah, M.Pd.',
  nipAtasan: '19xxxxxxxxxxxxxx',
  jabatanAtasan: 'Kepala Sekolah',
  labelEvidence: 'Absensi',
  alamatEvidence: 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620',
  koordinatEvidence: '6.139568°S, 107.110048°E',
  kodeFotoDefault: 'NEH21B41DAUBCH',
  skalaWatermark: 0.58,
  posisiWatermark: 'kiri-bawah',
  sertakanCatatanDiFoto: false,
};

export const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    waktu: '06.30 - 07.30',
    deskripsi: 'Menyiapkan bahan paparan evaluasi program kerja mingguan dan tindak lanjut disposisi pimpinan.',
    keterangan: 'Selesai 100% (Sesuai Target)',
    buktiFotoUrl: '/assets/aistudio/Evidence_20_Agustus_2025_1f5c710d.jpg',
    originalFotoUrl: '/assets/aistudio/Evidence_20_Agustus_2025_1f5c710d.jpg',
    watermarkDetail: 'Evidence Sikawan • 07:05 • 23/10/2026',
    customTimeHHMM: '07:05',
    customDateText: 'Jumat, 23/10/2026',
  },
  {
    id: 'act-2',
    waktu: '07.30 - 13.00',
    deskripsi: 'Menyusun dokumen analisis kebutuhan sistem informasi dan koordinasi teknis bersama tim kerja.',
    keterangan: 'Selesai 100% (Sesuai Target)',
    buktiFotoUrl: '/assets/aistudio/Evidence_20_Agustus_2025_1f5c710d.jpg',
    originalFotoUrl: '/assets/aistudio/Evidence_20_Agustus_2025_1f5c710d.jpg',
    watermarkDetail: 'Evidence Sikawan • 09:40 • 23/10/2026',
    customTimeHHMM: '09:40',
    customDateText: 'Jumat, 23/10/2026',
  },
  {
    id: 'act-3',
    waktu: '13.00 - 15.00',
    deskripsi: 'Melaksanakan verifikasi dan validasi data laporan kinerja harian serta sinkronisasi basis data layanan publik.',
    keterangan: 'Selesai 100% (Sesuai Target)',
    buktiFotoUrl: '/assets/aistudio/Evidence_20_Agustus_2025_1f5c710d.jpg',
    originalFotoUrl: '/assets/aistudio/Evidence_20_Agustus_2025_1f5c710d.jpg',
    watermarkDetail: 'Evidence Sikawan • 14:00 • 23/10/2026',
    customTimeHHMM: '14:00',
    customDateText: 'Jumat, 23/10/2026',
  },
];

export function getInitialReport(): DailyReport {
  return {
    id: 'report-' + Date.now(),
    tanggal: getLatestWorkingDateString(),
    kegiatanList: DEFAULT_ACTIVITIES,
    catatan: '',
    paperSize: 'A4',
    fontFamily: 'arial',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const SCHOOL_BRANDING_KEY = 'ejurnal_school_branding_v2';

export interface SchoolBranding {
  kopBaris1: string;
  kopBaris2: string;
  kopBaris3: string;
  kopAlamat: string;
  kopKontak: string;
  logoType: 'disdik' | 'tutwuri' | 'garuda' | 'kemenag' | 'custom' | 'none';
  customLogoUrl?: string;
  loginLogoType?: 'default' | 'tutwuri' | 'disdik' | 'kemenag' | 'custom';
  loginLogoUrl?: string;
  kotaPenetapan: string;
  unitKerja: string;
  namaAtasan: string;
  nipAtasan: string;
  jabatanAtasan: string;
  sertakanAtasan: boolean;
  labelEvidence?: string;
  alamatEvidence?: string;
  koordinatEvidence?: string;
  kodeFotoDefault?: string;
  skalaWatermark?: number;
  posisiWatermark?: 'kiri-bawah' | 'kiri-tengah' | 'kiri-atas';
  sertakanCatatanDiFoto?: boolean;
}

export function loadSchoolBranding(): Partial<SchoolBranding> {
  try {
    const raw = localStorage.getItem(SCHOOL_BRANDING_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        !parsed.alamatEvidence ||
        parsed.alamatEvidence === 'Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620' ||
        parsed.alamatEvidence === 'Jl. Bulak Temu, Sukabudi, Kec. Sukawangi, Kabupaten Bekasi, Jawa Barat 17620' ||
        parsed.alamatEvidence.includes('Jl. Pendidikan No. 01')
      ) {
        parsed.alamatEvidence = 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620';
      }
      if (
        !parsed.koordinatEvidence ||
        parsed.koordinatEvidence === '6.139434°S, 107.109875°E' ||
        parsed.koordinatEvidence === '6.200000°S, 106.816666°E'
      ) {
        parsed.koordinatEvidence = '6.139568°S, 107.110048°E';
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading school branding', e);
  }
  return {};
}

export function saveSchoolBranding(branding: Partial<SchoolBranding>): void {
  try {
    const existing = loadSchoolBranding();
    const merged = { ...existing, ...branding };
    localStorage.setItem(SCHOOL_BRANDING_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('Error saving school branding', e);
  }
}

export function loadProfile(): Profile {
  try {
    const school = loadSchoolBranding();
    const raw = localStorage.getItem(PROFILE_KEY);
    let profileData: Profile = { ...DEFAULT_PROFILE, ...school };
    if (raw) {
      const parsed = JSON.parse(raw);
      profileData = { ...profileData, ...parsed };
    }
    if (
      !profileData.alamatEvidence ||
      profileData.alamatEvidence === 'Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620' ||
      profileData.alamatEvidence === 'Jl. Bulak Temu, Sukabudi, Kec. Sukawangi, Kabupaten Bekasi, Jawa Barat 17620' ||
      profileData.alamatEvidence.includes('Jl. Pendidikan No. 01')
    ) {
      profileData.alamatEvidence = 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620';
    }
    if (
      !profileData.koordinatEvidence ||
      profileData.koordinatEvidence === '6.139434°S, 107.109875°E' ||
      profileData.koordinatEvidence === '6.200000°S, 106.816666°E'
    ) {
      profileData.koordinatEvidence = '6.139568°S, 107.110048°E';
    }
    return profileData;
  } catch (e) {
    console.error('Error loading profile from localStorage', e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: Profile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    // Persist school branding globally so logos and kop are never lost across logins
    saveSchoolBranding({
      kopBaris1: profile.kopBaris1,
      kopBaris2: profile.kopBaris2,
      kopBaris3: profile.kopBaris3,
      kopAlamat: profile.kopAlamat,
      kopKontak: profile.kopKontak,
      logoType: profile.logoType,
      customLogoUrl: profile.customLogoUrl,
      loginLogoType: profile.loginLogoType,
      loginLogoUrl: profile.loginLogoUrl,
      kotaPenetapan: profile.kotaPenetapan,
      unitKerja: profile.unitKerja,
      namaAtasan: profile.namaAtasan,
      nipAtasan: profile.nipAtasan,
      jabatanAtasan: profile.jabatanAtasan,
      sertakanAtasan: profile.sertakanAtasan,
      labelEvidence: profile.labelEvidence,
      alamatEvidence: profile.alamatEvidence,
      koordinatEvidence: profile.koordinatEvidence,
      kodeFotoDefault: profile.kodeFotoDefault,
      skalaWatermark: profile.skalaWatermark,
      posisiWatermark: profile.posisiWatermark,
      sertakanCatatanDiFoto: profile.sertakanCatatanDiFoto,
    });
  } catch (e) {
    console.error('Error saving profile to localStorage', e);
  }
}

export function loadCurrentReport(): DailyReport {
  try {
    const raw = localStorage.getItem(CURRENT_REPORT_KEY);
    if (raw) {
      const parsed: DailyReport = JSON.parse(raw);
      if (Array.isArray(parsed.kegiatanList) && parsed.kegiatanList.length > 0) {
        const updatedList = parsed.kegiatanList.map((item, idx) => {
          if (idx === 0) {
            return {
              ...item,
              waktu: '06.30 - 07.30',
              deskripsi: item.deskripsi.includes('budaya 5S') ? DEFAULT_ACTIVITIES[0].deskripsi : item.deskripsi,
              buktiFotoUrl: item.buktiFotoUrl || DEFAULT_ACTIVITIES[0].buktiFotoUrl,
              customTimeHHMM: item.customTimeHHMM === '11:22' ? '07:05' : item.customTimeHHMM,
            };
          }
          if (idx === 1) {
            return {
              ...item,
              waktu: '07.30 - 13.00',
              deskripsi: item.deskripsi.includes('kurikulum merdeka') ? DEFAULT_ACTIVITIES[1].deskripsi : item.deskripsi,
              buktiFotoUrl: item.buktiFotoUrl || DEFAULT_ACTIVITIES[1].buktiFotoUrl,
              customTimeHHMM: item.customTimeHHMM || '09:40',
            };
          }
          if (idx === 2) {
            return {
              ...item,
              waktu: '13.00 - 15.00',
              deskripsi: item.deskripsi.includes('LKPD') ? DEFAULT_ACTIVITIES[2].deskripsi : item.deskripsi,
              buktiFotoUrl: item.buktiFotoUrl || DEFAULT_ACTIVITIES[2].buktiFotoUrl,
              customTimeHHMM: item.customTimeHHMM || '14:00',
            };
          }
          return item;
        });

        const activeDate =
          !parsed.tanggal || isWeekendDay(parsed.tanggal)
            ? getLatestWorkingDateString()
            : parsed.tanggal;

        return {
          ...parsed,
          tanggal: activeDate,
          paperSize: parsed.paperSize || 'A4',
          fontFamily: parsed.fontFamily || 'sans',
          kegiatanList: updatedList,
        };
      }
    }
  } catch (e) {
    console.error('Error loading current report', e);
  }
  return getInitialReport();
}

export function saveCurrentReport(report: DailyReport): void {
  try {
    localStorage.setItem(CURRENT_REPORT_KEY, JSON.stringify(report));
    saveToHistory(report);
  } catch (e) {
    console.error('Error saving current report', e);
  }
}

export function loadHistory(): DailyReport[] {
  try {
    const raw = localStorage.getItem(REPORT_HISTORY_KEY);
    if (raw !== null) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        const sanitized = list.map((item: DailyReport) => {
          if (item.tanggal === '2026-10-24') {
            return { ...item, tanggal: '2026-10-23' };
          }
          return item;
        });
        return sanitized.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
      }
    }
  } catch (e) {
    console.error('Error loading history', e);
  }

  // Seed only on brand new first-time load
  const initial = loadCurrentReport();
  const seedList: DailyReport[] = [
    initial,
    {
      id: 'report-sample-2025-08-20',
      tanggal: '2025-08-20',
      kegiatanList: DEFAULT_ACTIVITIES.map((act, i) => ({
        ...act,
        id: `act-seed-${i + 1}`,
      })),
      catatan: 'Seluruh kegiatan terlaksana sesuai jadwal dan eviden sikawan terverifikasi.',
      paperSize: 'A4',
      fontFamily: 'sans',
      createdAt: '2025-08-20T15:00:00.000Z',
      updatedAt: '2025-08-20T15:00:00.000Z',
    },
  ];

  try {
    localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(seedList));
  } catch (e) {
    console.error('Error seeding history', e);
  }
  return seedList;
}

export function saveToHistory(report: DailyReport): void {
  if (!report || !report.tanggal) return;
  try {
    const raw = localStorage.getItem(REPORT_HISTORY_KEY);
    let currentList: DailyReport[] = [];
    if (raw !== null) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          currentList = parsed;
        }
      } catch {
        currentList = [];
      }
    } else {
      currentList = loadHistory();
    }

    const existingIndex = currentList.findIndex(
      (item) =>
        (report.id && item.id === report.id) ||
        (report.tanggal && item.tanggal === report.tanggal)
    );

    let updatedList: DailyReport[];
    if (existingIndex >= 0) {
      updatedList = [...currentList];
      updatedList[existingIndex] = report;
    } else {
      updatedList = [report, ...currentList];
    }
    updatedList.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
    localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(updatedList.slice(0, 180)));
  } catch (e) {
    console.error('Error saving history', e);
  }
}

export function deleteReportFromHistory(reportId?: string, tanggal?: string): DailyReport[] {
  try {
    const raw = localStorage.getItem(REPORT_HISTORY_KEY);
    let currentList: DailyReport[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          currentList = parsed;
        }
      } catch {
        currentList = [];
      }
    } else {
      currentList = loadHistory();
    }

    const updatedList = currentList.filter((item) => {
      if (reportId && item.id && item.id === reportId) return false;
      if (tanggal && item.tanggal && item.tanggal.trim() === tanggal.trim()) return false;
      return true;
    });

    localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(updatedList));
    return updatedList;
  } catch (e) {
    console.error('Error deleting report', e);
    return [];
  }
}

export const DEFAULT_ACCOUNTS: AuthAccounts = {
  admin: {
    role: 'admin',
    username: 'Admin',
    password: 'Admin123',
  },
  guru: {
    role: 'guru',
    username: 'Guru',
    password: 'Guru123',
  },
};

export function loadAuthAccounts(): AuthAccounts {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        admin: {
          role: 'admin',
          username: parsed.admin?.username || 'Admin',
          password: parsed.admin?.password || 'Admin123',
        },
        guru: {
          role: 'guru',
          username: parsed.guru?.username || 'Guru',
          password: parsed.guru?.password || 'Guru123',
        },
      };
    }
  } catch (e) {
    console.error('Error loading auth accounts', e);
  }
  return DEFAULT_ACCOUNTS;
}

export function saveAuthAccounts(accounts: AuthAccounts): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Error saving auth accounts', e);
  }
}

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'PG';
  // Strip common Indonesian academic and honorary titles
  const cleaned = name
    .replace(/\b(S\.Pd|S\.Pd\.I|S\.Ag|S\.Kom|S\.Sos|S\.T|M\.Pd|M\.M|M\.M\.Pd|M\.Si|Gr\.|Dr\.|Dra\.|Drs\.|H\.|Hj\.|Prof\.)\b/gi, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'PG';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

