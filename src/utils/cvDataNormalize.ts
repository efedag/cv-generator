import type { CVData, CvSectionId } from '../types/cv.types';
import { DEFAULT_SECTION_ORDER } from '../types/cv.types';

const SECTION_SET = new Set<CvSectionId>(DEFAULT_SECTION_ORDER);

function isCvSectionId(x: string): x is CvSectionId {
  return SECTION_SET.has(x as CvSectionId);
}

/** Eksik/tekrarlı bölüm id'lerini düzeltir */
export function normalizeCvData(data: CVData): CVData {
  const raw = data.sectionOrder?.filter((id): id is CvSectionId => isCvSectionId(id)) ?? [];
  const seen = new Set<CvSectionId>();
  const unique: CvSectionId[] = [];
  for (const id of raw) {
    if (!seen.has(id)) {
      seen.add(id);
      unique.push(id);
    }
  }
  for (const id of DEFAULT_SECTION_ORDER) {
    if (!seen.has(id)) unique.push(id);
  }
  return { ...data, sectionOrder: unique };
}

export function getSectionOrder(data: CVData): CvSectionId[] {
  return normalizeCvData(data).sectionOrder ?? [...DEFAULT_SECTION_ORDER];
}
