import { describe, it, expect } from 'vitest';
import { embedCvPayloadInPdf, tryExtractEmbeddedCvFromPdf, parseCvPayload } from './pdfCvEmbed';
import { defaultCV } from '../data/defaultCV';
import { normalizeCvData } from './cvDataNormalize';

describe('pdfCvEmbed', () => {
  it('embeds and extracts payload after fake pdf bytes', () => {
    const encoder = new TextEncoder();
    const fakePdf = encoder.encode('%PDF-1.4\n%%EOF\n');
    const cv = normalizeCvData(structuredClone(defaultCV));
    cv.personalInfo.fullName = 'Embed Test';
    const out = embedCvPayloadInPdf(fakePdf, cv);
    const sliced = out.slice();
    const back = tryExtractEmbeddedCvFromPdf(sliced.buffer as ArrayBuffer);
    expect(back).not.toBeNull();
    expect(back!.personalInfo.fullName).toBe('Embed Test');
  });

  it('parseCvPayload accepts data wrapper', () => {
    const cv = normalizeCvData(structuredClone(defaultCV));
    const wrapped = { cvGeneratorVersion: 1, data: cv };
    const back = parseCvPayload(wrapped);
    expect(back).not.toBeNull();
    expect(back!.personalInfo).toEqual(cv.personalInfo);
  });
});
