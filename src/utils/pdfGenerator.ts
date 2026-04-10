import html2pdf from 'html2pdf.js';
import type { CVData } from '../types/cv.types';
import { embedCvPayloadInPdf } from './pdfCvEmbed';

/** html2pdf zinciri Promise ile karışık tipi; thenExternal gerçek Promise döndürür */
type Html2PdfChain = {
  outputPdf: (type: string) => { thenExternal: <T>(cb: (v: T) => void) => Promise<void> };
};

export function generatePDF(filename = 'cv.pdf', cvData: CVData): Promise<void> {
  const element = document.getElementById('cv-content');
  if (!element) {
    return Promise.reject(new Error('CV content element not found'));
  }

  const opt = {
    margin: [20, 20] as [number, number],
    filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
  };

  const worker = html2pdf().set(opt).from(element) as unknown as Html2PdfChain;

  return worker.outputPdf('arraybuffer').thenExternal((arrayBuffer: ArrayBuffer) => {
    const raw = new Uint8Array(arrayBuffer);
    const withPayload = embedCvPayloadInPdf(raw, cvData);
    const blobBytes = new Uint8Array(withPayload.length);
    blobBytes.set(withPayload);
    const blob = new Blob([blobBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
}
