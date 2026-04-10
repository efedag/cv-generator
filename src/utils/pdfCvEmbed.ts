import type { CVData, CvSectionId } from '../types/cv.types';
import { defaultCV } from '../data/defaultCV';
import { normalizeCvData } from './cvDataNormalize';

const START = '%CV-GENERATOR-DATA-V1';
const END = '%CV-GENERATOR-END';

function utf8ToBase64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToUtf8(b64: string): string {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}

/** html2pdf çıktısının sonuna PDF yorum satırları olarak gömülür; %%EOF sonrası okuyucular genelde yoksayar, pdf.js açılışı bozmaz. */
export function embedCvPayloadInPdf(pdfBytes: Uint8Array, cv: CVData): Uint8Array {
  const payload = { v: 1 as const, cv };
  const b64 = utf8ToBase64(JSON.stringify(payload));
  const lines = [START];
  for (let i = 0; i < b64.length; i += 120) {
    lines.push(`%${b64.slice(i, i + 120)}`);
  }
  lines.push(END);
  const suffix = new TextEncoder().encode(`\n${lines.join('\n')}\n`);
  const out = new Uint8Array(pdfBytes.length + suffix.length);
  out.set(pdfBytes);
  out.set(suffix, pdfBytes.length);
  return out;
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

export function parseCvPayload(raw: unknown): CVData | null {
  if (!isRecord(raw)) return null;
  const root = isRecord(raw.cv) ? raw.cv : isRecord(raw.data) ? raw.data : raw;
  if (!isRecord(root.personalInfo)) return null;
  if (typeof root.summary !== 'string') return null;
  if (!isRecord(root.skills)) return null;
  if (!Array.isArray(root.experience)) return null;
  if (!Array.isArray(root.education)) return null;
  if (!Array.isArray(root.projects)) return null;
  if (!Array.isArray(root.certifications)) return null;

  const base = JSON.parse(JSON.stringify(defaultCV)) as CVData;
  const p = root.personalInfo;
  base.personalInfo = {
    fullName: typeof p.fullName === 'string' ? p.fullName : '',
    title: typeof p.title === 'string' ? p.title : '',
    phone: typeof p.phone === 'string' ? p.phone : '',
    email: typeof p.email === 'string' ? p.email : '',
    linkedin: typeof p.linkedin === 'string' ? p.linkedin : '',
    github: typeof p.github === 'string' ? p.github : '',
    location: typeof p.location === 'string' ? p.location : '',
  };
  base.summary = root.summary;
  const sk = root.skills;
  base.skills = {
    general: typeof sk.general === 'string' ? sk.general : '',
    languages: typeof sk.languages === 'string' ? sk.languages : '',
    frontend: typeof sk.frontend === 'string' ? sk.frontend : '',
    backend: typeof sk.backend === 'string' ? sk.backend : '',
    databases: typeof sk.databases === 'string' ? sk.databases : '',
    tools: typeof sk.tools === 'string' ? sk.tools : '',
  };

  base.experience = root.experience.map((e: unknown) => {
    if (!isRecord(e)) return { ...defaultCV.experience[0] };
    return {
      company: typeof e.company === 'string' ? e.company : '',
      position: typeof e.position === 'string' ? e.position : '',
      dateRange: typeof e.dateRange === 'string' ? e.dateRange : '',
      location: typeof e.location === 'string' ? e.location : '',
      responsibilities: Array.isArray(e.responsibilities)
        ? e.responsibilities.filter((x): x is string => typeof x === 'string')
        : [],
      technologies: typeof e.technologies === 'string' ? e.technologies : '',
    };
  });

  base.education = root.education.map((e: unknown) => {
    if (!isRecord(e)) return { ...defaultCV.education[0] };
    return {
      institution: typeof e.institution === 'string' ? e.institution : '',
      degree: typeof e.degree === 'string' ? e.degree : '',
      graduationDate: typeof e.graduationDate === 'string' ? e.graduationDate : '',
      gpa: typeof e.gpa === 'string' ? e.gpa : '',
    };
  });

  base.projects = root.projects.map((e: unknown) => {
    if (!isRecord(e)) return { ...defaultCV.projects[0] };
    return {
      name: typeof e.name === 'string' ? e.name : '',
      description: typeof e.description === 'string' ? e.description : '',
      technologies: typeof e.technologies === 'string' ? e.technologies : '',
      githubUrl: typeof e.githubUrl === 'string' ? e.githubUrl : '',
    };
  });

  base.certifications = root.certifications.map((e: unknown) => {
    if (!isRecord(e)) return { name: '', issuer: '', date: '' };
    return {
      name: typeof e.name === 'string' ? e.name : '',
      issuer: typeof e.issuer === 'string' ? e.issuer : '',
      date: typeof e.date === 'string' ? e.date : '',
    };
  });

  if (base.experience.length === 0) base.experience = JSON.parse(JSON.stringify(defaultCV.experience));
  if (base.education.length === 0) base.education = JSON.parse(JSON.stringify(defaultCV.education));
  if (base.projects.length === 0) base.projects = JSON.parse(JSON.stringify(defaultCV.projects));

  if (Array.isArray(root.sectionOrder)) {
    const ids = root.sectionOrder.filter((x): x is string => typeof x === 'string');
    if (ids.length) base.sectionOrder = ids as CvSectionId[];
  }

  return normalizeCvData(base);
}

function indexOfBytes(haystack: Uint8Array, needle: Uint8Array, from = 0): number {
  if (needle.length === 0) return 0;
  for (let i = from; i <= haystack.length - needle.length; i++) {
    let j = 0;
    while (j < needle.length && haystack[i + j] === needle[j]) j++;
    if (j === needle.length) return i;
  }
  return -1;
}

export function tryExtractEmbeddedCvFromPdf(buffer: ArrayBuffer): CVData | null {
  const u8 = new Uint8Array(buffer);
  const enc = new TextEncoder();
  const startMark = enc.encode(START);
  const endMark = enc.encode(END);
  const start = indexOfBytes(u8, startMark);
  if (start < 0) return null;
  const end = indexOfBytes(u8, endMark, start + startMark.length);
  if (end < 0) return null;

  const mid = u8.subarray(start + startMark.length, end);
  const chunk = new TextDecoder('latin1').decode(mid);
  const lines = chunk.split(/\r?\n/);
  let b64 = '';
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('%')) b64 += t.slice(1);
  }
  b64 = b64.replace(/\s/g, '');
  if (!b64.length) return null;

  try {
    const json = base64ToUtf8(b64);
    const parsed = JSON.parse(json) as unknown;
    return parseCvPayload(parsed);
  } catch {
    return null;
  }
}
