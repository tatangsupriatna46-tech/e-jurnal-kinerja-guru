export const NAMA_HARI = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function formatTanggalLengkapIndo(dateInput: string | Date): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : dateInput;
  if (isNaN(d.getTime())) return '';

  const hari = NAMA_HARI[d.getDay()];
  const tanggal = d.getDate();
  const bulan = NAMA_BULAN[d.getMonth()];
  const tahun = d.getFullYear();

  return `${hari}, ${tanggal} ${bulan} ${tahun}`;
}

/**
 * Format specifically like the user's Evidence Sikawan sample:
 * "Rabu, 20/08/2025"
 */
export function formatTanggalSikawan(dateInput?: string | Date): string {
  const d = !dateInput
    ? new Date()
    : typeof dateInput === 'string'
    ? new Date(dateInput.includes('T') ? dateInput : dateInput + 'T00:00:00')
    : dateInput;

  if (isNaN(d.getTime())) return 'Rabu, 20/08/2025';

  const hari = NAMA_HARI[d.getDay()];
  const tanggal = String(d.getDate()).padStart(2, '0');
  const bulan = String(d.getMonth() + 1).padStart(2, '0');
  const tahun = d.getFullYear();

  return `${hari}, ${tanggal}/${bulan}/${tahun}`;
}

export function formatTanggalBulanTahun(dateInput: string | Date): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : dateInput;
  if (isNaN(d.getTime())) return '';

  const tanggal = d.getDate();
  const bulan = NAMA_BULAN[d.getMonth()];
  const tahun = d.getFullYear();

  return `${tanggal} ${bulan} ${tahun}`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the most recent Monday - Friday working day (Senin - Jumat).
 * If today is Saturday (6) or Sunday (0), it automatically rolls back to Friday (Jumat).
 */
export function getLatestWorkingDateString(): string {
  const d = new Date();
  const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
  if (dayOfWeek === 6) {
    // Saturday -> rollback to Friday (-1 day)
    d.setDate(d.getDate() - 1);
  } else if (dayOfWeek === 0) {
    // Sunday -> rollback to Friday (-2 days)
    d.setDate(d.getDate() - 2);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isWeekendDay(dateInput: string | Date): boolean {
  if (!dateInput) return false;
  const d = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : dateInput;
  if (isNaN(d.getTime())) return false;
  const day = d.getDay();
  return day === 0 || day === 6; // 0=Minggu, 6=Sabtu
}

export function getCurrentTimeHHMM(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function extractTimeHHMM(timeString?: string): string {
  if (!timeString) return getCurrentTimeHHMM();
  // Match patterns like "11:22", "08:00", "08.00"
  const match = timeString.match(/(\d{1,2})[:.](\d{2})/);
  if (match) {
    const hh = match[1].padStart(2, '0');
    const mm = match[2];
    return `${hh}:${mm}`;
  }
  return getCurrentTimeHHMM();
}

export function getCurrentTimeWIB(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} WIB`;
}

export function getNowTimestampFormatted(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = NAMA_BULAN[now.getMonth()].substring(0, 3);
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${day} ${month} ${year} ${hours}:${minutes}:${seconds} WIB`;
}
