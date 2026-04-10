import type { PDFDocumentProxy } from 'pdfjs-dist';

export type OcrProgress = (message: string) => void;
export type PdfImportLocale = 'tr' | 'en';

const RENDER_SCALE = 2.25;

function t(locale: PdfImportLocale, tr: string, en: string): string {
  return locale === 'tr' ? tr : en;
}

export async function ocrPdfDocument(
  pdf: PDFDocumentProxy,
  onProgress: OcrProgress | undefined,
  locale: PdfImportLocale
): Promise<string> {
  const { createWorker } = await import('tesseract.js');

  onProgress?.(t(locale, 'OCR hazırlanıyor…', 'Preparing OCR…'));

  const worker = await createWorker(['tur', 'eng'], 1, {
    logger: (m) => {
      if (m.status === 'loading tesseract core') {
        onProgress?.(t(locale, 'OCR motoru yükleniyor…', 'Loading OCR engine…'));
      }
      if (m.status === 'loading language traineddata') {
        onProgress?.(t(locale, 'Dil verisi indiriliyor (ilk seferde biraz sürebilir)…', 'Downloading language data (first run may take a moment)…'));
      }
      if (m.status === 'recognizing text') {
        onProgress?.(t(locale, 'Metin tanınıyor…', 'Recognizing text…'));
      }
    },
  });

  const parts: string[] = [];

  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress?.(
        t(locale, `OCR: sayfa ${i} / ${pdf.numPages}`, `OCR: page ${i} / ${pdf.numPages}`)
      );
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: RENDER_SCALE });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderTask = page.render({
        canvasContext: ctx,
        viewport,
      });
      await renderTask.promise;

      const {
        data: { text },
      } = await worker.recognize(canvas);
      const trimmed = text.trim();
      if (trimmed) parts.push(trimmed);
    }
  } finally {
    await worker.terminate();
  }

  return parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}
