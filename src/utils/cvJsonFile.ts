import type { CVData } from '../types/cv.types';
import { parseCvPayload } from './pdfCvEmbed';

export function buildCvJsonExport(data: CVData): string {
  return JSON.stringify(
    {
      cvGeneratorVersion: 1,
      exportedAt: new Date().toISOString(),
      data,
    },
    null,
    2
  );
}

export function parseCvJsonText(text: string): CVData | null {
  try {
    return parseCvPayload(JSON.parse(text));
  } catch {
    return null;
  }
}
