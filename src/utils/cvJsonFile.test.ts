import { describe, it, expect } from 'vitest';
import { buildCvJsonExport, parseCvJsonText } from './cvJsonFile';
import { defaultCV } from '../data/defaultCV';
import { normalizeCvData } from './cvDataNormalize';

describe('cvJsonFile', () => {
  it('roundtrips wrapped export', () => {
    const d = normalizeCvData(structuredClone(defaultCV));
    d.personalInfo.fullName = 'Test User';
    const json = buildCvJsonExport(d);
    const back = parseCvJsonText(json);
    expect(back).not.toBeNull();
    expect(back!.personalInfo.fullName).toBe('Test User');
    expect(back!.sectionOrder?.length).toBeGreaterThan(0);
  });

  it('parses raw cv object', () => {
    const d = normalizeCvData(structuredClone(defaultCV));
    const raw = JSON.stringify(d);
    const back = parseCvJsonText(raw);
    expect(back).not.toBeNull();
    expect(back!.summary).toBe(d.summary);
  });
});
