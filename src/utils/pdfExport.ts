import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  elementId: string;
  filename: string;
  paperSize?: 'A4' | 'F4';
  onStart?: () => void;
  onSuccess?: (result: { blobUrl: string; filename: string }) => void;
  onError?: (err: Error) => void;
}

export interface PdfExportResult {
  success: boolean;
  blobUrl: string;
  filename: string;
}

/**
 * High-definition PDF Export using html2canvas-pro (with full modern CSS & OKLCH color support)
 * and jsPDF. Generates exact A4 or F4 formatted official civil service PDF documents.
 */
export async function exportElementToPdf({
  elementId,
  filename,
  paperSize = 'A4',
  onStart,
  onSuccess,
  onError,
}: PdfExportOptions): Promise<PdfExportResult> {
  const element = document.getElementById(elementId);
  if (!element) {
    const err = new Error(`Elemen dokumen #${elementId} tidak ditemukan.`);
    onError?.(err);
    throw err;
  }

  onStart?.();

  try {
    // Wait briefly to ensure fonts and layout settle
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Render DOM element to high-res canvas using html2canvas-pro
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Dimensions in mm
    // A4: 210 x 297 mm, F4 (Folio dinas): 215 x 330 mm
    const isF4 = paperSize === 'F4';
    const pdfWidth = isF4 ? 215 : 210;
    const pdfHeight = isF4 ? 330 : 297;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: isF4 ? [215, 330] : 'a4',
      compress: true,
    });

    const imgProps = pdf.getImageProperties(imgData);
    const contentHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Daily Journal report is an official single-sheet document ("Halaman 1 dari 1").
    // We scale the content proportionally to fit strictly within 1 page without ever creating an unwanted second page.
    const scaleToFit = Math.min(1, pdfHeight / contentHeight);
    const renderedWidth = pdfWidth * scaleToFit;
    const renderedHeight = contentHeight * scaleToFit;
    const offsetX = (pdfWidth - renderedWidth) / 2;
    const offsetY = 0;

    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderedWidth, renderedHeight, undefined, 'FAST');

    const cleanFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;

    // 1. Generate Blob & Blob URL
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    // 2. Direct browser download trigger via <a> tag
    try {
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = cleanFilename;
      downloadLink.target = '_blank';
      downloadLink.rel = 'noopener noreferrer';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      setTimeout(() => {
        if (downloadLink.parentNode) {
          document.body.removeChild(downloadLink);
        }
      }, 2000);
    } catch (linkErr) {
      console.warn('Anchor download fallback to pdf.save():', linkErr);
      pdf.save(cleanFilename);
    }

    const result = { blobUrl, filename: cleanFilename };
    onSuccess?.(result);
    return { success: true, ...result };
  } catch (error) {
    console.error('Error saat export PDF:', error);
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    throw err;
  }
}

/**
 * Direct print function. Calls browser print directly synchronously so user activation is preserved.
 * Falls back gracefully if running in an iframe with strict modal restrictions.
 */
export function triggerDirectPrint(): boolean {
  try {
    window.print();
    return true;
  } catch (err) {
    console.warn('Direct window.print() failed:', err);
    return false;
  }
}
