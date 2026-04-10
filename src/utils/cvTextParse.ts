import type {
  CVData,
  CertificationItem,
  EducationItem,
  ExperienceItem,
  PersonalInfo,
  ProjectItem,
  Skills,
} from '../types/cv.types';
import { defaultCV } from '../data/defaultCV';
import { normalizeCvData } from './cvDataNormalize';

type SectionKey =
  | 'header'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'rest';

const DATEISH =
  /\b(19|20)\d{2}\b|\b\d{1,2}[./-]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Oca|Şub|Mar|Nis|May|Haz|Tem|Ağu|Eyl|Eki|Kas|Ara)[a-z]*\.?\s+\d{4}\b/i;

/** Başlık satırını sadeleştir (OCR / PDF artefact) */
function normalizeHeaderCandidate(line: string): string {
  return line
    .replace(/^[\s\-–—|_=•·]+|[\s\-–—|_.:·]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Türkçe karakterleri ASCII’ye yaklaştır (başlık eşleştirme) */
function foldAscii(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\u0307/g, '')
    .replace(/\u0300-\u036f/g, '')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c')
    .toLowerCase();
}

const SECTION_STRICT: { key: Exclude<SectionKey, 'header' | 'rest'>; re: RegExp }[] = [
  {
    key: 'summary',
    re: /^(ozet|summary|professional summary|profile|about( me)?|hakkimda|kisisel ozet|objective)$/i,
  },
  {
    key: 'experience',
    re: /^(deneyim|deneyimi|experience|work experience|employment|work history|is deneyimi|professional experience|career)$/i,
  },
  {
    key: 'education',
    re: /^(egitim|education|academic|academic background|universite|university)$/i,
  },
  {
    key: 'skills',
    re: /^(yetenekler|skills|technical skills|teknik yetenekler|tech stack|competencies|yetkinlikler)$/i,
  },
  {
    key: 'projects',
    re: /^(projeler|projects|selected projects|one cikan projeler|portfolio|open source)$/i,
  },
  {
    key: 'certifications',
    re: /^(sertifikalar|certifications|certificates|licenses|lisanslar|courses|egitimler|awards|oduller)$/i,
  },
];

function classifySectionLine(line: string): SectionKey | null {
  const raw = line.trim();
  if (!raw || raw.length > 52) return null;

  const h = normalizeHeaderCandidate(raw);
  if (!h) return null;

  const folded = foldAscii(h).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  for (const { key, re } of SECTION_STRICT) {
    if (re.test(folded) || re.test(h)) return key;
  }

  const first = folded.split(/\s+/)[0] ?? '';
  const firstTwo = folded.split(/\s+/).slice(0, 2).join(' ');

  if (
    /^(ozet|summary|profile|objective|about)$/.test(first) ||
    firstTwo === 'professional summary' ||
    firstTwo === 'kisisel ozet'
  ) {
    return 'summary';
  }
  if (
    /^(deneyim|experience|employment|career|work)$/.test(first) ||
    firstTwo === 'work experience' ||
    firstTwo === 'is deneyimi'
  ) {
    return 'experience';
  }
  if (/^(egitim|education|academic|university)$/.test(first) || firstTwo === 'academic background') {
    return 'education';
  }
  if (
    /^(skills|yetenekler|competencies|yetkinlikler|technical|teknik)$/.test(first) ||
    firstTwo === 'technical skills' ||
    firstTwo === 'teknik yetenekler' ||
    firstTwo === 'tech stack'
  ) {
    return 'skills';
  }
  if (/^(projects|projeler|portfolio)$/.test(first) || firstTwo === 'selected projects') {
    return 'projects';
  }
  if (
    /^(certifications|sertifikalar|certificates|licenses|courses|awards|oduller)$/.test(first)
  ) {
    return 'certifications';
  }

  return null;
}

/** OCR: cümle ortasında kırılmış kısa satırları birleştir */
function mergeBrokenOcrLines(lines: string[]): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      out.push('');
      i++;
      continue;
    }
    if (classifySectionLine(line)) {
      out.push(line.trim());
      i++;
      continue;
    }
    let merged = line.trim();
    i++;
    while (i < lines.length) {
      const next = lines[i];
      if (!next.trim()) break;
      if (classifySectionLine(next)) break;
      const m = merged.trim();
      const n = next.trim();
      const mergeable =
        m.length < 52 &&
        !/[.!?:]\s*$/.test(m) &&
        /^[a-zçğıöşüáéíóúàèìòùâêîôûäëïöüÿñ]/.test(n);
      if (!mergeable) break;
      merged = `${m} ${n}`;
      i++;
    }
    out.push(merged);
  }
  return out;
}

function normalizeLines(text: string): string[] {
  return text.split(/\r?\n/).map((l) => l.replace(/\s+/g, ' ').trim());
}

function extractUrlsAndContacts(text: string): Partial<PersonalInfo> {
  const out: Partial<PersonalInfo> = {};
  const emailMatch = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  if (emailMatch) out.email = emailMatch[0];

  const phonePatterns = [
    /\+?\d[\d\s().-]{8,}\d/,
    /\(\d{3}\)\s*\d{3}[-\s]?\d{4}/,
    /\d{3}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}/,
  ];
  for (const re of phonePatterns) {
    const m = text.match(re);
    if (m) {
      out.phone = m[0].replace(/\s+/g, ' ').trim();
      break;
    }
  }

  const li = text.match(/linkedin\.com\/in\/[^\s)\],]+/i);
  if (li) out.linkedin = `https://www.${li[0].replace(/^www\./i, '')}`;

  const gh = text.match(/github\.com\/[^\s)\],]+/i);
  if (gh) out.github = `https://${gh[0].replace(/^https?:\/\//i, '')}`;

  return out;
}

function bucketLinesBySection(lines: string[]): Record<SectionKey, string[]> {
  const buckets: Record<SectionKey, string[]> = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    rest: [],
  };
  let current: SectionKey = 'header';

  for (const line of lines) {
    const next = classifySectionLine(line);
    if (next) {
      current = next;
      continue;
    }
    if (!line && buckets[current].length === 0) continue;
    buckets[current].push(line);
  }
  return buckets;
}

/**
 * Çoğu içerik header’da kaldıysa (başlıklar tanınmadı), ham metinden bölüm kesitleri dene.
 */
function sliceSectionsFromRawText(raw: string): Record<SectionKey, string[]> | null {
  const text = raw.replace(/\r\n/g, '\n');
  const anchors: { key: SectionKey; idx: number }[] = [];

  const marker = (key: SectionKey, pattern: RegExp) => {
    let m: RegExpExecArray | null;
    const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
    while ((m = re.exec(text)) !== null) {
      anchors.push({ key, idx: m.index });
    }
  };

  marker('summary', /(?:^|\n)\s*(ÖZET|Özet|SUMMARY|Profile|Professional Summary|Hakkımda)\s*:?\s*(?=\n|$)/gim);
  marker('experience', /(?:^|\n)\s*(DENEYİM|DENEYIM|Deneyim|EXPERIENCE|Work Experience|İş Deneyimi)\s*:?\s*(?=\n|$)/gim);
  marker('education', /(?:^|\n)\s*(EĞİTİM|EGITIM|Eğitim|EDUCATION)\s*:?\s*(?=\n|$)/gim);
  marker(
    'skills',
    /(?:^|\n)\s*(TEKNİK YETENEKLER|TEKNIK YETENEKLER|TECHNICAL SKILLS|YETENEKLER|SKILLS)\s*:?\s*(?=\n|$)/gim
  );
  marker('projects', /(?:^|\n)\s*(PROJELER|PROJECTS)\s*:?\s*(?=\n|$)/gim);
  marker('certifications', /(?:^|\n)\s*(SERTİFİKALAR|SERTIFIKALAR|CERTIFICATIONS)\s*:?\s*(?=\n|$)/gim);

  if (anchors.length < 2) return null;

  anchors.sort((a, b) => a.idx - b.idx);
  const buckets: Record<SectionKey, string[]> = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    rest: [],
  };

  const firstIdx = anchors[0].idx;
  if (firstIdx > 0) {
    buckets.header = normalizeLines(text.slice(0, firstIdx));
  }

  for (let i = 0; i < anchors.length; i++) {
    const start = anchors[i].idx;
    const end = i + 1 < anchors.length ? anchors[i + 1].idx : text.length;
    let chunk = text.slice(start, end);
    const nl = chunk.indexOf('\n');
    if (nl >= 0) chunk = chunk.slice(nl + 1);
    const key = anchors[i].key;
    buckets[key].push(...normalizeLines(chunk));
  }

  return buckets;
}

function shouldUseSlicedBuckets(
  buckets: Record<SectionKey, string[]>,
  raw: string
): Record<SectionKey, string[]> {
  const expLines = buckets.experience.filter(Boolean).length;
  const eduLines = buckets.education.filter(Boolean).length;
  const skiLines = buckets.skills.filter(Boolean).length;
  const headNonEmpty = buckets.header.filter(Boolean).length;
  const rawLen = raw.replace(/\s/g, '').length;

  const looksFlat = headNonEmpty >= 12 && expLines < 3 && eduLines < 3 && skiLines < 3 && rawLen > 200;
  if (!looksFlat) return buckets;

  const sliced = sliceSectionsFromRawText(raw);
  if (!sliced) return buckets;

  const slicedExp = sliced.experience.filter(Boolean).length;
  const slicedSki = sliced.skills.filter(Boolean).length;
  if (slicedExp + slicedSki > expLines + skiLines + 2) return sliced;

  return buckets;
}

function parseHeaderLines(headerLines: string[], contacts: Partial<PersonalInfo>): Partial<PersonalInfo> {
  const emailLower = contacts.email?.toLowerCase();
  const phoneDigits = contacts.phone?.replace(/\D/g, '') ?? '';

  const filtered = headerLines.filter((l) => {
    const low = l.toLowerCase();
    if (emailLower && low.includes(emailLower)) return false;
    if (phoneDigits.length >= 8 && l.replace(/\D/g, '').includes(phoneDigits)) return false;
    if (/linkedin\.com/i.test(l)) return false;
    if (/github\.com/i.test(l)) return false;
    if (/\btelefon\b|\bphone\b|\be-?posta\b|\bemail\b/i.test(l) && /[:|]/.test(l)) return false;
    if (/@/.test(l) && /\./.test(l)) return false;
    if (classifySectionLine(l)) return false;
    return true;
  });

  const personal: Partial<PersonalInfo> = { ...contacts };

  const nameGuess = filtered.find(
    (l) =>
      l.length >= 3 &&
      l.length <= 55 &&
      /^[A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?:\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+){0,4}$/.test(l.trim())
  );
  if (nameGuess) personal.fullName = nameGuess.trim();
  else if (filtered[0]?.length >= 2) personal.fullName = filtered[0];

  const titleIdx = nameGuess ? filtered.indexOf(nameGuess) + 1 : 1;
  const titleLine = filtered[titleIdx];
  if (titleLine && titleLine.length >= 2 && titleLine.length < 90 && !personal.fullName?.includes(titleLine)) {
    personal.title = titleLine;
  }

  const locLine = filtered.find(
    (l) =>
      /,\s*[A-Za-zğüşıöçĞÜŞİÖÇ]/.test(l) ||
      /\b(istanbul|ankara|izmir|berlin|london|remote|uzaktan|turkey|türkiye|turkiye)\b/i.test(l)
  );
  if (locLine && !personal.location) personal.location = locLine;

  return personal;
}

function splitParagraphs(sectionLines: string[]): string[][] {
  const blocks: string[][] = [];
  let cur: string[] = [];
  for (const line of sectionLines) {
    if (!line.trim()) {
      if (cur.length) {
        blocks.push(cur);
        cur = [];
      }
      continue;
    }
    cur.push(line);
  }
  if (cur.length) blocks.push(cur);
  return blocks.length ? blocks : [sectionLines.filter(Boolean)];
}

const BULLET_RE =
  /^\s*[-•*▪·º›»□■○●]\s|^\s*[oO0]\s+(?=[A-Za-zÀ-ÿ])|^\s*\d+[.)]\s/;

function isBulletLine(line: string): boolean {
  return BULLET_RE.test(line);
}

/** İş deneyimi: boş satır yoksa yeni pozisyon başlangıcını sezgisel ayır */
function splitExperienceBlocks(lines: string[]): string[][] {
  const paras = splitParagraphs(lines);
  const out: string[][] = [];

  for (const p of paras) {
    if (p.length <= 6) {
      out.push(p);
      continue;
    }
    out.push(...splitExperienceHeuristic(p));
  }

  return out.length ? out : [lines.filter(Boolean)];
}

function splitExperienceHeuristic(lines: string[]): string[][] {
  const blocks: string[][] = [];
  let cur: string[] = [];
  let seenBullet = false;

  const flush = () => {
    if (cur.length) blocks.push([...cur]);
    cur = [];
    seenBullet = false;
  };

  for (const line of lines) {
    if (!line.trim()) {
      flush();
      continue;
    }

    const bullet = isBulletLine(line);

    if (!bullet && seenBullet && cur.length >= 2) {
      const looksLikeNewRole =
        /,/.test(line) ||
        /\s@\s|\s+at\s+/i.test(line) ||
        /\s[-–—]\s/.test(line) ||
        (DATEISH.test(line) && !cur.some((l) => DATEISH.test(l)));

      if (looksLikeNewRole) flush();
    }

    cur.push(line);
    if (bullet) seenBullet = true;
  }
  flush();
  return blocks.length ? blocks : [lines];
}

function stripBulletContent(line: string): string {
  return line
    .replace(/^\s*[-•*▪·º›»□■○●]\s*/, '')
    .replace(/^\s*[oO0]\s+(?=[A-Za-zÀ-ÿ])/, '')
    .replace(/^\s*\d+[.)]\s/, '')
    .trim();
}

function withBulletBody(originalLine: string, body: string): string {
  const stripped = stripBulletContent(originalLine);
  const idx = originalLine.indexOf(stripped);
  if (idx < 0) return `• ${body}`;
  return originalLine.slice(0, idx) + body;
}

/** OCR: madde işareti satırı ile metin satırı ayrıldıysa veya cümle bölündüyse birleştir */
function mergeBulletContinuations(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    if (!line.trim()) {
      out.push(line);
      continue;
    }
    if (isBulletLine(line)) {
      out.push(line);
      continue;
    }
    const t = line.trim();
    if (out.length === 0) {
      out.push(line);
      continue;
    }
    const prev = out[out.length - 1];
    if (!prev.trim() || !isBulletLine(prev)) {
      out.push(line);
      continue;
    }
    const prevBody = stripBulletContent(prev);
    const prevEnds = /[.!?;:]\s*$/.test(prevBody);
    const looksLikeTitle =
      DATEISH.test(t) || /^[A-ZÇĞİÖŞÜ][^,]{0,50},\s*[A-Z]/.test(t) || /\s@\s|\s+at\s+/i.test(t);
    const mergeAsCont =
      !looksLikeTitle &&
      !prevEnds &&
      (prevBody.length === 0 ||
        /^[a-zçğıöşü0-9“(‘"']/.test(t) ||
        (t.length < 120 && !/,/.test(t) && !DATEISH.test(t)));

    if (mergeAsCont) {
      const nextBody = prevBody ? `${prevBody} ${t}` : t;
      out[out.length - 1] = withBulletBody(prev, nextBody);
      continue;
    }
    out.push(line);
  }
  return out;
}

function parseExperienceBlock(rawLines: string[]): ExperienceItem {
  const lines = mergeBulletContinuations(rawLines);
  const bullets: string[] = [];
  const meta: string[] = [];
  for (const line of lines) {
    if (isBulletLine(line)) {
      bullets.push(
        line
          .replace(/^\s*[-•*▪·º›»□■○●]\s/, '')
          .replace(/^\s*[oO0]\s+/, '')
          .replace(/^\s*\d+[.)]\s/, '')
          .trim()
      );
    } else {
      meta.push(line);
    }
  }

  let position = '';
  let company = '';
  let dateRange = '';
  let location = '';
  let technologies = '';

  const techLineIdx = meta.findIndex((l) => /^(technologies|teknolojiler|tech stack|stack)\s*:/i.test(l));
  if (techLineIdx >= 0) {
    const raw = meta[techLineIdx];
    technologies = raw.replace(/^(technologies|teknolojiler|tech stack|stack)\s*:\s*/i, '').trim();
    meta.splice(techLineIdx, 1);
  }

  const dateIdx = meta.findIndex((l) => DATEISH.test(l));
  if (dateIdx >= 0) {
    const dl = meta[dateIdx];
    const pipe = dl.split(/\s*\|\s*/);
    dateRange = pipe[0]?.trim() ?? '';
    if (pipe.length > 1) {
      const rest = pipe.slice(1).join(' | ').trim();
      if (!/gpa|gno|telefon|phone|email/i.test(rest)) location = rest;
    } else {
      const paren = dl.match(/\(([^)]+)\)/);
      if (paren) location = paren[1].trim();
    }
    meta.splice(dateIdx, 1);
  }

  if (meta[0]) {
    const first = meta[0];
    const atSplit = first.split(/\s+@\s+|\s+at\s+/i);
    if (atSplit.length === 2) {
      position = atSplit[0].trim();
      company = atSplit[1].replace(/[,–-]\s*$/, '').trim();
    } else if (/\s[-–—]\s/.test(first) && !first.includes(',')) {
      const parts = first.split(/\s[-–—]\s/);
      position = parts[0]?.trim() ?? '';
      company = parts[1]?.trim() ?? '';
    } else if (/,/.test(first)) {
      const parts = first.split(',').map((p) => p.trim());
      position = parts[0] ?? '';
      company = parts.slice(1).join(', ');
    } else {
      position = first;
      company = meta[1]?.replace(/^[-–@]\s*/, '').trim() ?? '';
    }
  }

  const extraMeta = meta.slice(company ? 2 : 1).filter(Boolean);
  if (!technologies && extraMeta.length) {
    technologies = extraMeta.join(' ');
  }

  return {
    company,
    position,
    dateRange,
    location,
    responsibilities: bullets,
    technologies,
  };
}

/** Önizleme: satır 1 = "Derece, Kurum"; satır 2 = tarih | GNO */
function parseEducationBlock(lines: string[]): EducationItem {
  const first = (lines[0] ?? '').trim();
  let institution = '';
  let degree = '';

  if (first.includes(',')) {
    const idx = first.indexOf(',');
    degree = first.slice(0, idx).trim();
    institution = first.slice(idx + 1).trim();
  } else {
    degree = first;
    institution = (lines[1] ?? '').trim();
  }

  let graduationDate = '';
  let gpa = '';
  const startIdx = first.includes(',') ? 1 : 2;
  for (let i = startIdx; i < lines.length; i++) {
    const l = lines[i];
    if (/gpa|gno|not ortalaması/i.test(l)) {
      const g = l.replace(/^.*?(gpa|gno|not ortalaması|ortalama)\s*[:.]?\s*/i, '').trim();
      if (g) gpa = g;
    } else if (DATEISH.test(l)) {
      const pipe = l.split('|').map((s) => s.trim());
      if (!graduationDate) graduationDate = pipe[0] ?? l;
      const gpaSeg = pipe.find((p) => /gpa|gno/i.test(p));
      if (gpaSeg && !gpa) gpa = gpaSeg.replace(/^.*?:\s*/, '').trim();
    }
  }

  return { institution, degree, graduationDate, gpa };
}

function parseProjectBlock(lines: string[]): ProjectItem {
  const name = lines[0]?.trim() ?? '';
  const rest = lines.slice(1);
  let githubUrl = '';
  const descLines: string[] = [];
  let technologies = '';
  for (const l of rest) {
    if (/github\.com/i.test(l)) {
      const m = l.match(/https?:\/\/github\.com\/[^\s]+/i) || l.match(/github\.com\/[^\s]+/i);
      githubUrl = m ? (m[0].startsWith('http') ? m[0] : `https://${m[0]}`) : l;
    } else if (/^(technologies|teknolojiler|stack)\s*:/i.test(l)) {
      technologies = l.replace(/^(technologies|teknolojiler|stack)\s*:\s*/i, '').trim();
    } else {
      descLines.push(l);
    }
  }
  return {
    name,
    description: descLines.join('\n').trim(),
    technologies,
    githubUrl,
  };
}

function parseCertBlock(lines: string[]): CertificationItem {
  const name = lines[0]?.trim() ?? '';
  const issuer = lines[1]?.trim() ?? '';
  const dateLine = lines.find((l) => DATEISH.test(l)) ?? lines[2] ?? '';
  return { name, issuer, date: dateLine.trim() };
}

function parsePipeLabeledSegment(line: string): Partial<Skills> | null {
  if (!line.includes('|')) return null;
  const segments = line.split('|').map((s) => s.trim()).filter(Boolean);
  if (segments.length < 2) return null;

  const labelMap: Record<string, keyof Skills> = {
    diller: 'languages',
    languages: 'languages',
    frontend: 'frontend',
    backend: 'backend',
    veritabanlari: 'databases',
    veritabanları: 'databases',
    veritabani: 'databases',
    databases: 'databases',
    araclar: 'tools',
    araçlar: 'tools',
    tools: 'tools',
    genel: 'general',
    general: 'general',
  };

  const out: Partial<Skills> = {};
  for (const seg of segments) {
    const m = seg.match(/^([\wğüşıöçĞÜŞİÖÇ]+)\s*:\s*(.+)$/i);
    if (!m) continue;
    const lab = foldAscii(m[1]).replace(/\s+/g, '');
    const val = m[2].trim();
    const key = labelMap[lab];
    if (key && val) out[key] = val;
  }
  return Object.keys(out).length ? out : null;
}

function parseSkillsSection(lines: string[]): Partial<Skills> {
  const skills: Partial<Skills> = {};
  const sub: Record<string, keyof Skills> = {
    languages: 'languages',
    diller: 'languages',
    frontend: 'frontend',
    backend: 'backend',
    databases: 'databases',
    veritabanı: 'databases',
    veritabanları: 'databases',
    tools: 'tools',
    araçlar: 'tools',
    genel: 'general',
    general: 'general',
  };

  let current: keyof Skills | 'free' = 'free';
  const freeChunks: string[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const pipeSkills = parsePipeLabeledSegment(line);
    if (pipeSkills) {
      Object.assign(skills, pipeSkills);
      continue;
    }

    const keyMatch = line.match(/^([\wğüşıöçĞÜŞİÖÇ]+)\s*:\s*(.*)$/i);
    if (keyMatch) {
      const label = keyMatch[1].toLowerCase();
      const rest = keyMatch[2].trim();
      const mapped = sub[label];
      if (mapped) {
        current = mapped;
        if (rest) skills[mapped] = rest;
        continue;
      }
    }

    const alone = line.replace(/:$/, '').trim().toLowerCase();
    if (sub[alone]) {
      current = sub[alone];
      continue;
    }

    if (current !== 'free') {
      const prev = skills[current] ?? '';
      skills[current] = prev ? `${prev}\n${line}` : line;
    } else {
      freeChunks.push(line);
    }
  }

  if (freeChunks.length && !skills.general) {
    skills.general = freeChunks.join('\n');
  } else if (freeChunks.length) {
    skills.general = [skills.general, ...freeChunks].filter(Boolean).join('\n');
  }

  return skills;
}

type CvTextImportPatch = Omit<Partial<CVData>, 'skills' | 'personalInfo'> & {
  personalInfo?: Partial<PersonalInfo>;
  skills?: Partial<Skills>;
};

function mergeIntoDefault(parsed: CvTextImportPatch): CVData {
  const base: CVData = JSON.parse(JSON.stringify(defaultCV)) as CVData;
  base.personalInfo = { ...base.personalInfo, ...(parsed.personalInfo ?? {}) };
  if (parsed.summary !== undefined) base.summary = parsed.summary;
  base.skills = {
    ...base.skills,
    ...(parsed.skills ?? {}),
  };
  if (parsed.experience?.length) base.experience = parsed.experience;
  if (parsed.education?.length) base.education = parsed.education;
  if (parsed.projects?.length) base.projects = parsed.projects;
  if (parsed.certifications?.length) base.certifications = parsed.certifications;
  return base;
}

export function parseCvPlainText(raw: string): CVData {
  const normalized = raw.replace(/\u00a0/g, ' ').trim();
  const contacts = extractUrlsAndContacts(normalized);
  const lines = mergeBrokenOcrLines(normalizeLines(normalized));
  let buckets = bucketLinesBySection(lines);
  buckets = shouldUseSlicedBuckets(buckets, normalized);

  const personalInfo = parseHeaderLines(buckets.header, contacts);

  const summary = buckets.summary.filter(Boolean).join('\n').trim();

  const expBlocks = splitExperienceBlocks(buckets.experience);
  const experience: ExperienceItem[] = expBlocks
    .map(parseExperienceBlock)
    .filter((e) => e.position || e.company || e.responsibilities.length > 0 || e.technologies);

  const eduBlocks = splitParagraphs(buckets.education);
  const education: EducationItem[] = eduBlocks
    .map(parseEducationBlock)
    .filter((e) => e.institution || e.degree);

  const skillsPartial = parseSkillsSection(buckets.skills);

  const projBlocks = splitParagraphs(buckets.projects);
  const projects: ProjectItem[] = projBlocks
    .map(parseProjectBlock)
    .filter((p) => p.name || p.description);

  const certBlocks = splitParagraphs(buckets.certifications);
  const certifications: CertificationItem[] = certBlocks
    .map(parseCertBlock)
    .filter((c) => c.name || c.issuer);

  const restText = buckets.rest.filter(Boolean).join('\n').trim();
  let finalSummary = summary;
  if (restText && !finalSummary) finalSummary = restText;
  else if (restText) finalSummary = `${finalSummary}\n\n${restText}`.trim();

  return normalizeCvData(
    mergeIntoDefault({
      personalInfo,
      summary: finalSummary,
      skills: skillsPartial,
      experience: experience.length ? experience : undefined,
      education: education.length ? education : undefined,
      projects: projects.length ? projects : undefined,
      certifications: certifications.length ? certifications : undefined,
    })
  );
}
