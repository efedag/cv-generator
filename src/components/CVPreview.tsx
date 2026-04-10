import type { ReactNode } from 'react';
import type { CVData, CvSectionId } from '../types/cv.types';
import type { Language } from '../App';
import type { PreviewMargin } from '../types/appState.types';
import { PersonalInfo } from './PersonalInfo';
import { Summary } from './Summary';
import { Skills } from './Skills';
import { Experience } from './Experience';
import { Education } from './Education';
import { Projects } from './Projects';
import { Certifications } from './Certifications';
import { generatePDF } from '../utils/pdfGenerator';
import { getSectionOrder } from '../utils/cvDataNormalize';
import { ExportBar } from './ExportBar';
import { cvBaseFilename } from '../utils/cvFilename';

interface CVPreviewProps {
  data: CVData;
  language: Language;
  previewMargin: PreviewMargin;
}

export function CVPreview({ data, language, previewMargin }: CVPreviewProps) {
  const isTr = language === 'tr';

  const handleDownload = () => {
    const filenameBase = cvBaseFilename(data.personalInfo.fullName);
    generatePDF(`${filenameBase || 'cv'}.pdf`, data).catch(console.error);
  };

  const order = getSectionOrder(data);
  const sectionBlocks: Record<CvSectionId, ReactNode> = {
    summary: <Summary key="summary" text={data.summary} language={language} />,
    skills: <Skills key="skills" data={data.skills} language={language} />,
    experience: <Experience key="experience" items={data.experience} language={language} />,
    education: <Education key="education" items={data.education} language={language} />,
    projects: <Projects key="projects" items={data.projects} language={language} />,
    certifications: (
      <Certifications key="certifications" items={data.certifications} language={language} />
    ),
  };

  return (
    <div className="preview-panel">
      <div className="preview-actions">
        <button type="button" className="download-btn" onClick={handleDownload}>
          {isTr ? 'PDF İndir' : 'Download PDF'}
        </button>
        <button type="button" className="print-pdf-btn" onClick={() => window.print()}>
          {isTr ? 'Yazdır (metinli PDF)' : 'Print (searchable PDF)'}
        </button>
      </div>
      <ExportBar data={data} language={language} />
      <div id="cv-content" className={`cv-margin-${previewMargin}`}>
        <PersonalInfo data={data.personalInfo} language={language} />
        {order.map((id) => sectionBlocks[id])}
      </div>
    </div>
  );
}
