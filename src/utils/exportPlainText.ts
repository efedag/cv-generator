import type { CVData } from '../types/cv.types';
import type { Language } from '../App';
import { cvToMarkdown } from './exportMarkdown';

/** ATS dostu düz metin (Markdown’dan basit dönüşüm) */
export function cvToPlainText(data: CVData, language: Language): string {
  const md = cvToMarkdown(data, language);
  return md
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^-\s+/gm, '• ')
    .trim() + '\n';
}
