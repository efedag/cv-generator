import type { CVData } from '../types/cv.types';
import type { Language } from '../App';

export type HintLevel = 'info' | 'warn';

export interface CvHint {
  level: HintLevel;
  text: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function t(isTr: boolean, tr: string, en: string): string {
  return isTr ? tr : en;
}

export function analyzeCv(data: CVData, language: Language): CvHint[] {
  const isTr = language === 'tr';
  const hints: CvHint[] = [];

  const email = data.personalInfo.email.trim();
  if (email && !EMAIL_RE.test(email)) {
    hints.push({
      level: 'warn',
      text: t(isTr, 'E-posta adresi geçerli bir formatta görünmüyor.', 'Email does not look like a valid format.'),
    });
  }

  if (!data.personalInfo.fullName.trim()) {
    hints.push({
      level: 'warn',
      text: t(isTr, 'Ad soyad boş — PDF ve dışa aktarımlarda dosya adı zayıf kalabilir.', 'Full name is empty — export filenames may be generic.'),
    });
  }

  if (!data.summary.trim()) {
    hints.push({
      level: 'info',
      text: t(isTr, 'Özet bölümü boş; çoğu işveren 2–4 cümle özet bekler.', 'Summary is empty; most employers expect a short professional summary.'),
    });
  }

  const wc = data.summary.trim().split(/\s+/).filter(Boolean).length;
  if (wc > 0 && wc < 25) {
    hints.push({
      level: 'info',
      text: t(
        isTr,
        `Özet yaklaşık ${wc} kelime — genelde 40–120 kelime hedeflenir.`,
        `Summary is about ${wc} words — often 40–120 words works well.`
      ),
    });
  }
  if (wc > 220) {
    hints.push({
      level: 'info',
      text: t(
        isTr,
        'Özet oldukça uzun; ATS ve hızlı okumada kısaltmak faydalı olabilir.',
        'Summary is quite long; shortening can help skimming and ATS.'
      ),
    });
  }

  const hasRealExp = data.experience.some(
    (e) => e.company.trim() || e.position.trim() || e.responsibilities.some((r) => r.trim())
  );
  if (!hasRealExp) {
    hints.push({
      level: 'warn',
      text: t(isTr, 'Henüz anlamlı bir iş deneyimi girilmemiş.', 'No substantive work experience entries yet.'),
    });
  }

  const hasRealEdu = data.education.some((e) => e.institution.trim() || e.degree.trim());
  if (!hasRealEdu) {
    hints.push({
      level: 'info',
      text: t(isTr, 'Eğitim bölümü boş.', 'Education section is empty.'),
    });
  }

  const skillFilled = Object.values(data.skills).some((s) => String(s).trim());
  if (!skillFilled) {
    hints.push({
      level: 'info',
      text: t(isTr, 'Yetenekler alanları boş.', 'Skills fields are empty.'),
    });
  }

  return hints;
}

export function countSummaryWords(summary: string): number {
  return summary.trim().split(/\s+/).filter(Boolean).length;
}
