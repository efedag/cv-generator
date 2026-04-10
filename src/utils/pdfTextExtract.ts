import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PDFDocumentProxy } from 'pdfjs-dist';

let workerConfigured = false;

/** html2pdf.js çıktıları gibi yalnızca görüntü tabanlı PDF'lerde metin çok kısa kalır; OCR tetiklenir. */
const MIN_MEANINGFUL_TEXT_LENGTH = 48;

async function extractTextWithPdfJs(pdf: PDFDocumentProxy): Promise<string> {
  const parts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    let line = '';
    for (const item of content.items) {
      if (!('str' in item)) continue;
      const s = item.str;
      if (!s) continue;
      if (item.hasEOL) {
        line += s;
        parts.push(line.trim());
        line = '';
      } else {
        line += (line && !line.endsWith(' ') ? ' ' : '') + s;
      }
    }
    if (line.trim()) parts.push(line.trim());
    parts.push('');
  }

  return parts.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export type PdfExtractProgress = (message: string) => void;
export type PdfImportLocale = 'tr' | 'en';

export async function extractTextFromPdfBuffer(
  buffer: ArrayBuffer,
  options?: { onProgress?: PdfExtractProgress; locale?: PdfImportLocale }
): Promise<string> {
  const locale = options?.locale ?? 'tr';
  const onProgress = options?.onProgress;
  if (!workerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    workerConfigured = true;
  }

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;

  const direct = await extractTextWithPdfJs(pdf);
  if (direct.replace(/\s/g, '').length >= MIN_MEANINGFUL_TEXT_LENGTH) {
    return direct;
  }

  onProgress?.(
    locale === 'tr'
      ? 'PDF’de metin katmanı yok veya çok kısa; görüntüden okuma (OCR) deneniyor…'
      : 'No real text layer in this PDF; trying OCR on the page image…'
  );

  const { ocrPdfDocument } = await import('./pdfOcrExtract');
  const ocrText = await ocrPdfDocument(pdf, onProgress, locale);

  return ocrText || direct;
}
