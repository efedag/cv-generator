import type { CvSectionId } from '../types/cv.types';

export const SECTION_LABEL: Record<CvSectionId, { tr: string; en: string }> = {
  summary: { tr: 'Özet', en: 'Summary' },
  skills: { tr: 'Yetenekler', en: 'Skills' },
  experience: { tr: 'Deneyim', en: 'Experience' },
  education: { tr: 'Eğitim', en: 'Education' },
  projects: { tr: 'Projeler', en: 'Projects' },
  certifications: { tr: 'Sertifikalar', en: 'Certifications' },
};
