import html2pdf from 'html2pdf.js';

export function generatePDF(filename = 'cv-fullstack-developer.pdf'): Promise<void> {
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

  return html2pdf().set(opt).from(element).save();
}
