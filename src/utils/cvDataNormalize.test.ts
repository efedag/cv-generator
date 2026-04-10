import { describe, it, expect } from 'vitest';
import { normalizeCvData, getSectionOrder } from './cvDataNormalize';
import { defaultCV } from '../data/defaultCV';
import type { CvSectionId } from '../types/cv.types';

describe('normalizeCvData', () => {
  it('appends missing section ids', () => {
    const d = {
      ...structuredClone(defaultCV),
      sectionOrder: ['experience', 'summary'] as CvSectionId[],
    };
    const n = normalizeCvData(d);
    expect(getSectionOrder(n)).toEqual([
      'experience',
      'summary',
      'skills',
      'education',
      'projects',
      'certifications',
    ]);
  });

  it('deduplicates section ids', () => {
    const d = {
      ...structuredClone(defaultCV),
      sectionOrder: ['summary', 'summary', 'skills'] as CvSectionId[],
    };
    const n = normalizeCvData(d);
    expect(getSectionOrder(n).filter((x) => x === 'summary').length).toBe(1);
  });
});
