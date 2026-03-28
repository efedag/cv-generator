import type { CVData } from '../types/cv.types';
import type { Language } from '../App';
import { PersonalInfo } from './PersonalInfo';
import { Summary } from './Summary';
import { Skills } from './Skills';
import { Experience } from './Experience';
import { Education } from './Education';
import { Projects } from './Projects';
import { Certifications } from './Certifications';
import { generatePDF } from '../utils/pdfGenerator';

interface CVPreviewProps {
  data: CVData;
  language: Language;
}

function toAtsFriendlyFilename(fullName: string): string {
  const normalized = fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  if (!normalized) return 'cv';

  const parts = normalized.split(' ');
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : '';
  const base = last ? `${first}_${last}` : first;

  return base;
}

export function CVPreview({ data, language }: CVPreviewProps) {
  const isTr = language === 'tr';

  const handleDownload = () => {
    const filenameBase = toAtsFriendlyFilename(data.personalInfo.fullName);
    generatePDF(`${filenameBase || 'cv'}.pdf`).catch(console.error);
  };

  return (
    <div className="preview-panel">
      <button type="button" className="download-btn" onClick={handleDownload}>
        {isTr ? 'PDF İndir' : 'Download PDF'}
      </button>
      <div id="cv-content">
        <PersonalInfo data={data.personalInfo} language={language} />
        <Summary text={data.summary} language={language} />
        <Skills data={data.skills} language={language} />
        <Experience items={data.experience} language={language} />
        <Education items={data.education} language={language} />
        <Projects items={data.projects} language={language} />
        <Certifications items={data.certifications} language={language} />
      </div>
    </div>
  );
}
