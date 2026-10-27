export type UserRole = 'admin' | 'guru';

export interface UserAccount {
  role: UserRole;
  username: string;
  password: string;
}

export interface AuthAccounts {
  admin: UserAccount;
  guru: UserAccount;
}

export interface Pegawai {
  id: string; // e.g. "peg-tatang", "peg-nabra", or uuid
  authUserId?: string; // Supabase auth.users id
  namaLengkap: string;
  nip: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  pangkatGolongan: string;
  jabatan: string;
  unitKerja: string;
  kotaPenetapan: string;
  avatarUrl?: string;

  // Atasan Langsung
  sertakanAtasan: boolean;
  namaAtasan: string;
  nipAtasan: string;
  jabatanAtasan: string;

  // Kop Dinas
  kopBaris1: string;
  kopBaris2: string;
  kopBaris3: string;
  kopAlamat?: string;
  kopKontak?: string;
  logoType: 'disdik' | 'tutwuri' | 'garuda' | 'kemenag' | 'custom' | 'none';
  customLogoUrl?: string;
  loginLogoUrl?: string;
  loginLogoType?: 'default' | 'tutwuri' | 'disdik' | 'kemenag' | 'custom';

  // Watermark Settings
  labelEvidence?: string;
  alamatEvidence?: string;
  koordinatEvidence?: string;
  kodeFotoDefault?: string;
  skalaWatermark?: number;
  posisiWatermark?: 'kiri-bawah' | 'kiri-tengah' | 'kiri-atas';
  sertakanCatatanDiFoto?: boolean;
}

export interface Profile {
  avatarUrl?: string;
  kopBaris1: string; // e.g. "DINAS PENDIDIKAN KABUPATEN BEKASI"
  kopBaris2: string; // e.g. "JURNAL HARIAN KINERJA"
  kopBaris3: string; // e.g. "SD NEGERI SUKABUDI 02"
  kopAlamat: string;
  kopKontak: string;
  logoType: 'disdik' | 'tutwuri' | 'garuda' | 'kemenag' | 'custom' | 'none';
  customLogoUrl?: string;
  loginLogoUrl?: string;
  loginLogoType?: 'default' | 'tutwuri' | 'disdik' | 'kemenag' | 'custom';

  namaLengkap: string;
  nip: string;
  username?: string;
  password?: string;
  pangkatGolongan: string;
  jabatan: string;
  unitKerja: string;
  kotaPenetapan: string;

  // Atasan Langsung / Kepala Sekolah
  sertakanAtasan: boolean;
  namaAtasan: string;
  nipAtasan: string;
  jabatanAtasan: string;

  // Evidence Sikawan / Timemark Timestamp Settings
  labelEvidence?: string; // e.g. "Absensi"
  alamatEvidence?: string;
  koordinatEvidence?: string;
  kodeFotoDefault?: string;
  skalaWatermark?: number;
  posisiWatermark?: 'kiri-bawah' | 'kiri-tengah' | 'kiri-atas';
  sertakanCatatanDiFoto?: boolean;

  // Digital Signatures
  tandaTanganPegawaiUrl?: string;
  tandaTanganAtasanUrl?: string;
}

export interface ActivityItem {
  id: string;
  waktu: string; // e.g. "06.30 - 07.30"
  deskripsi: string;
  buktiFotoUrl?: string; // base64 with Timemark watermark
  originalFotoUrl?: string; // raw image for re-stamping
  buktiFotoNama?: string;
  watermarkDetail?: string; // e.g. "Absensi • 08:46 • 26/10/2026"
  keterangan: string; // default: "Selesai 100% (Sesuai Target)"
  kategori?: string;
  // Specific custom overrides for Timemark
  customLabel?: string; // Judul: e.g. "Absensi"
  customTimeHHMM?: string; // Jam: e.g. "08:46"
  customDateText?: string; // Tanggal: e.g. "Senin, 26 Oktober 2026"
  customAddressText?: string; // Alamat lengkap
  customCoordinates?: string; // GPS: e.g. "6.139568°S, 107.110048°E"
  customKodeFoto?: string; // Kode Foto: e.g. "NEH21B41DAUBCH"
  customSkala?: number;
  customPosisi?: 'kiri-bawah' | 'kiri-tengah' | 'kiri-atas';
}

export interface DailyReport {
  id: string;
  pegawaiId?: string; // foreign key to Pegawai (id / auth.uid())
  pegawaiNama?: string;
  tanggal: string; // YYYY-MM-DD
  nomorSurat?: string;
  kegiatanList: ActivityItem[];
  catatan?: string;
  paperSize: 'A4' | 'F4';
  fontFamily: 'arial' | 'merriweather' | 'times' | 'sans';
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  role: UserRole; // 'admin' | 'guru'
  pegawaiId: string; // the logged-in user's identity ID
  nama: string;
  email: string;
  nip: string;
}
