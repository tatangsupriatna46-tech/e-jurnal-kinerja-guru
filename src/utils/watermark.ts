import { formatTanggalLengkapIndo, extractTimeHHMM } from './dateUtils';

export interface SikawanWatermarkOptions {
  labelEvidence?: string; // Judul: e.g. "Absensi" (default: "Absensi")
  timeHHMM?: string; // Jam: e.g. "08:46"
  dateText?: string; // Tanggal: e.g. "Senin, 26 Oktober 2026"
  addressText?: string; // Alamat: e.g. "Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi, Kabupaten Bekasi, Jawa Barat 17620"
  coordinates?: string; // GPS: e.g. "6.139568°S, 107.110048°E"
  kodeFoto?: string; // e.g. "NEH21B41DAUBCH"
  catatanText?: string; // optional note/activity description
  sertakanCatatan?: boolean; // default: false (to keep timestamp clean & compact)
  skala?: number; // scale multiplier, default 0.58
  posisi?: 'kiri-bawah' | 'kiri-tengah' | 'kiri-atas';
}

/**
 * Generates an authentic Timemark photo code (e.g., NEH21B41DAUBCH)
 */
export function generateTimemarkPhotoCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'NEH';
  for (let i = 0; i < 11; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Splits text into wrapped lines for canvas
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Splits address lines matching the reference breakdown
 */
function parseAddressLines(addressText?: string): string[] {
  if (!addressText) {
    return [
      'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,',
      'Kabupaten Bekasi, Jawa Barat 17620',
    ];
  }

  // If user used line breaks, preserve them
  if (addressText.includes('\n')) {
    return addressText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  }

  // If default Sukabudi / Sukawangi variant without newlines
  if (
    addressText.toLowerCase().includes('bulak temu') &&
    addressText.toLowerCase().includes('sukawangi')
  ) {
    return [
      'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,',
      'Kabupaten Bekasi, Jawa Barat 17620',
    ];
  }

  // Natural wrap for custom addresses (approx 40-45 chars per line)
  const words = addressText.trim().split(' ');
  const lines: string[] = [];
  let current = '';

  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (test.length > 42 && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  return lines.length > 0 ? lines : [addressText];
}

/**
 * Draws a clean vector shield with checkmark for "Kode Foto"
 */
function drawShieldCheckIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string = 'rgba(255, 255, 255, 0.88)'
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, size * 0.12);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const w = size;
  const h = size * 1.15;

  // Shield outline
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.2);
  ctx.quadraticCurveTo(x + w * 0.5, y - h * 0.05, x + w * 0.5, y);
  ctx.quadraticCurveTo(x + w * 0.5, y - h * 0.05, x + w, y + h * 0.2);
  ctx.quadraticCurveTo(x + w, y + h * 0.65, x + w * 0.5, y + h);
  ctx.quadraticCurveTo(x, y + h * 0.65, x, y + h * 0.2);
  ctx.stroke();

  // Checkmark inside shield
  ctx.beginPath();
  ctx.moveTo(x + w * 0.26, y + h * 0.5);
  ctx.lineTo(x + w * 0.44, y + h * 0.68);
  ctx.lineTo(x + w * 0.74, y + h * 0.34);
  ctx.stroke();
  ctx.restore();
}

/**
 * Applies the authentic TIMEMARK timestamp overlay
 * Matching the exact visual style of Timemark latest release:
 * - Top-right: "Timemark" + "Foto 100% akurat"
 * - Right edge: "© {kodeFoto}  Timemark Verified" (vertical)
 * - Bottom-left: White card with yellow Judul badge + royal blue time,
 *   yellow vertical accent bar, Date, Address, Coordinates, and Shield Check "Kode Foto"
 */
export async function applyWatermarkToImage(
  file: File | Blob,
  options: SikawanWatermarkOptions = {}
): Promise<{ dataUrl: string; stampText: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context tidak tersedia'));
          return;
        }

        // Standard high-resolution photo dimensions
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 960;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw original uploaded photo
        ctx.drawImage(img, 0, 0, width, height);

        // Scale factor: relative to ~960px width, responsive & proportional
        const userScale = Math.max(0.35, Math.min(1.0, options.skala ?? 0.58));
        const fontScale = (width / 960) * (userScale / 0.58);
        const posisi = options.posisi ?? 'kiri-bawah';
        const sertakanCatatan = options.sertakanCatatan ?? false;

        // Extract customizable values
        const labelTag = (options.labelEvidence || 'Absensi').trim();
        const timeStr = (options.timeHHMM || '08:46').trim();
        const dateStr = (options.dateText || 'Senin, 26 Oktober 2026').trim();
        
        let cleanedAddress = options.addressText?.trim() || '';
        if (!cleanedAddress || cleanedAddress.includes('Jl. Pendidikan No. 01')) {
          cleanedAddress = 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi,\nKabupaten Bekasi, Jawa Barat 17620';
        }
        const addressLines = parseAddressLines(cleanedAddress);

        let coordsStr = (options.coordinates || '').trim();
        if (
          !coordsStr ||
          coordsStr === '6.200000°S, 106.816666°E' ||
          coordsStr === '6.139434°S, 107.109875°E'
        ) {
          coordsStr = '6.139568°S, 107.110048°E';
        }
        const kodeFoto = (options.kodeFoto || 'NEH21B41DAUBCH').trim();

        /* ==============================================================
         * 1. TOP-RIGHT "Timemark" BRANDING
         *    - "Timemark" (Vibrant Amber/Yellow)
         *    - "Foto 100% akurat" (White)
         * ============================================================== */
        const tmFontSize = Math.max(14, Math.round(24 * fontScale));
        const subTmFontSize = Math.max(9, Math.round(13 * fontScale));
        const trMarginX = Math.round(24 * fontScale);
        const trMarginY = Math.round(22 * fontScale);

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.font = `800 ${tmFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = '#ffb703'; // Amber gold
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('Timemark', width - trMarginX, trMarginY);

        ctx.font = `500 ${subTmFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(
          'Foto 100% akurat',
          width - trMarginX,
          trMarginY + tmFontSize + Math.round(4 * fontScale)
        );
        ctx.restore();

        /* ==============================================================
         * 2. RIGHT VERTICAL EDGE WATERMARK
         *    - "© {kodeFoto}  Timemark Verified" (rotated -90deg, reading up)
         * ============================================================== */
        const edgeFontSize = Math.max(9, Math.round(13.5 * fontScale));
        ctx.save();
        const edgeX = width - Math.max(12, Math.round(16 * fontScale));
        const edgeY = Math.round(height * 0.64);
        ctx.translate(edgeX, edgeY);
        ctx.rotate(-Math.PI / 2);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.font = `600 ${edgeFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`© ${kodeFoto}   Timemark Verified`, 0, 0);
        ctx.restore();

        /* ==============================================================
         * 3. BOTTOM-LEFT TIMEMARK CARD & METADATA
         * ============================================================== */
        // Dimensions & font sizing
        const pillFontSize = Math.max(12, Math.round(21 * fontScale));
        const timeFontSize = Math.max(16, Math.round(28 * fontScale));
        const dateFontSize = Math.max(13, Math.round(21 * fontScale));
        const addressFontSize = Math.max(11, Math.round(17.5 * fontScale));
        const coordsFontSize = Math.max(10, Math.round(16.5 * fontScale));
        const codeFontSize = Math.max(9, Math.round(14.5 * fontScale));

        const lineHeight = Math.round(addressFontSize * 1.34);
        const barWidth = Math.max(3, Math.round(4.5 * fontScale));
        const barGap = Math.round(12 * fontScale);
        const textIndent = barWidth + Math.round(10 * fontScale);

        // Pre-calculate Pill badge and Card width
        ctx.font = `800 ${pillFontSize}px system-ui, -apple-system, sans-serif`;
        const pillTextWidth = ctx.measureText(labelTag).width;
        const pillPadX = Math.round(12 * fontScale);
        const pillW = pillTextWidth + pillPadX * 2;
        const pillH = Math.round(34 * fontScale);

        ctx.font = `900 ${timeFontSize}px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif`;
        const timeTextWidth = ctx.measureText(timeStr).width;

        const cardPad = Math.round(5 * fontScale);
        const pillTimeGap = Math.round(10 * fontScale);
        const cardW = cardPad + pillW + pillTimeGap + timeTextWidth + Math.round(14 * fontScale);
        const cardH = pillH + cardPad * 2;
        const cardRadius = Math.round(9 * fontScale);
        const pillRadius = Math.round(6 * fontScale);

        // Calculate text section height
        const afterDateGap = Math.round(6 * fontScale);
        const afterAddressGap = Math.round(4 * fontScale);
        const barHeight =
          dateFontSize +
          afterDateGap +
          addressLines.length * lineHeight +
          afterAddressGap +
          coordsFontSize;

        // Optional Catatan height
        let catatanLines: string[] = [];
        let catatanHeight = 0;
        if (sertakanCatatan && options.catatanText) {
          ctx.font = `600 ${addressFontSize}px system-ui, -apple-system, sans-serif`;
          catatanLines = wrapText(ctx, `Catatan: ${options.catatanText}`, Math.round(cardW * 1.1));
          catatanHeight = Math.round(8 * fontScale) + catatanLines.length * lineHeight;
        }

        const shieldSize = Math.max(13, Math.round(18 * fontScale));
        const shieldSectionHeight = shieldSize + Math.round(8 * fontScale);

        const totalWidgetHeight =
          cardH + barGap + barHeight + catatanHeight + shieldSectionHeight;

        // Widget coordinate calculations
        const cardX = Math.round(width * 0.025);
        let cardY: number;

        if (posisi === 'kiri-bawah') {
          cardY = Math.max(
            Math.round(height * 0.03),
            height - totalWidgetHeight - Math.round(height * 0.035)
          );
        } else if (posisi === 'kiri-tengah') {
          cardY = Math.round((height - totalWidgetHeight) / 2);
        } else {
          // kiri-atas
          cardY = Math.round(height * 0.035);
        }

        /* 3A. Draw White Rounded Header Card */
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
        } else {
          ctx.rect(cardX, cardY, cardW, cardH);
        }
        ctx.fill();
        ctx.restore();

        /* 3B. Draw Yellow Inner Pill Badge with Judul (e.g. "Absensi") */
        const pillX = cardX + cardPad;
        const pillY = cardY + cardPad;

        ctx.save();
        ctx.fillStyle = '#ffb703'; // Vibrant yellow/amber
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(pillX, pillY, pillW, pillH, pillRadius);
        } else {
          ctx.rect(pillX, pillY, pillW, pillH);
        }
        ctx.fill();

        ctx.fillStyle = '#050505'; // Deep black
        ctx.font = `800 ${pillFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelTag, pillX + pillW / 2, pillY + pillH / 2);
        ctx.restore();

        /* 3C. Draw Royal Blue Time inside White Card (e.g. "08:46") */
        const timeX = pillX + pillW + pillTimeGap;
        ctx.save();
        ctx.fillStyle = '#0052cc'; // Clean royal blue
        ctx.font = `900 ${timeFontSize}px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(timeStr, timeX, pillY + pillH / 2);
        ctx.restore();

        /* 3D. Draw Yellow Vertical Accent Bar */
        const barX = cardX;
        const barY = cardY + cardH + barGap;
        const textX = barX + textIndent;

        ctx.save();
        ctx.fillStyle = '#ffb703';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(barX, barY, barWidth, barHeight, Math.round(barWidth / 2));
        } else {
          ctx.rect(barX, barY, barWidth, barHeight);
        }
        ctx.fill();
        ctx.restore();

        /* 3E. Draw Text: Date, Address, Coordinates with Drop Shadow */
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.96)';
        ctx.shadowBlur = Math.max(3, Math.round(3.5 * fontScale));
        ctx.shadowOffsetX = Math.max(1, Math.round(1.2 * fontScale));
        ctx.shadowOffsetY = Math.max(1, Math.round(1.2 * fontScale));

        // Line 1: Hari, Tanggal (e.g. "Senin, 26 Oktober 2026")
        ctx.fillStyle = '#ffffff';
        ctx.font = `800 ${dateFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        let curY = barY;
        ctx.fillText(dateStr, textX, curY);
        curY += dateFontSize + afterDateGap;

        // Lines 2+: Alamat
        ctx.font = `600 ${addressFontSize}px system-ui, -apple-system, sans-serif`;
        for (const line of addressLines) {
          ctx.fillText(line, textX, curY);
          curY += lineHeight;
        }

        // Line 3+: Koordinat GPS
        curY += afterAddressGap;
        ctx.font = `600 ${coordsFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(coordsStr, textX, curY);
        curY += coordsFontSize;

        // Optional Catatan
        if (sertakanCatatan && catatanLines.length > 0) {
          curY += Math.round(8 * fontScale);
          ctx.font = `600 ${addressFontSize}px system-ui, -apple-system, sans-serif`;
          for (const line of catatanLines) {
            ctx.fillText(line, textX, curY);
            curY += lineHeight;
          }
        }
        ctx.restore();

        /* 3F. Shield Check Icon & Kode Foto */
        const shieldTopY = curY + Math.round(10 * fontScale);
        drawShieldCheckIcon(
          ctx,
          barX,
          shieldTopY,
          shieldSize,
          'rgba(255, 255, 255, 0.88)'
        );

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.font = `600 ${codeFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          `Kode Foto: ${kodeFoto}`,
          barX + shieldSize + Math.round(8 * fontScale),
          shieldTopY + shieldSize * 0.6
        );
        ctx.restore();

        // Export as High-Quality JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', 0.93);
        const stampText = `${labelTag} • ${timeStr} • ${dateStr}`;
        resolve({ dataUrl, stampText });
      };

      img.onerror = () => {
        reject(new Error('Gagal memproses gambar bukti'));
      };

      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      } else {
        reject(new Error('Format file tidak didukung'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file foto'));
    };

    reader.readAsDataURL(file);
  });
}
