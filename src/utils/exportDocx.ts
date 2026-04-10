import { Document, Packer, Paragraph, TextRun } from 'docx';
import type { CVData } from '../types/cv.types';
import type { Language } from '../App';
import { getSectionOrder } from './cvDataNormalize';

function p(text: string, opts?: { bold?: boolean; size?: number; breakAfter?: boolean }): Paragraph {
  return new Paragraph({
    spacing: opts?.breakAfter ? { after: 120 } : { after: 60 },
    children: [
      new TextRun({
        text,
        bold: opts?.bold,
        size: opts?.size ?? 22,
      }),
    ],
  });
}

function blank(): Paragraph {
  return new Paragraph({ text: '' });
}

export async function cvToDocxBlob(data: CVData, language: Language): Promise<Blob> {
  const isTr = language === 'tr';
  const children: Paragraph[] = [];

  const name = data.personalInfo.fullName.trim() || (isTr ? 'CV' : 'Resume');
  children.push(p(name, { bold: true, size: 36, breakAfter: true }));
  if (data.personalInfo.title.trim()) {
    children.push(p(data.personalInfo.title.trim(), { size: 24 }));
  }
  const bits: string[] = [];
  if (data.personalInfo.location) bits.push(data.personalInfo.location);
  if (data.personalInfo.phone) bits.push(data.personalInfo.phone);
  if (data.personalInfo.email) bits.push(data.personalInfo.email);
  if (bits.length) children.push(p(bits.join(' · '), { size: 22 }));
  if (data.personalInfo.linkedin) children.push(p(data.personalInfo.linkedin, { size: 20 }));
  if (data.personalInfo.github) children.push(p(data.personalInfo.github, { size: 20 }));
  children.push(blank());

  const order = getSectionOrder(data);

  const emitSummary = () => {
    if (!data.summary.trim()) return;
    children.push(p(isTr ? 'ÖZET' : 'SUMMARY', { bold: true, size: 26, breakAfter: true }));
    for (const line of data.summary.trim().split(/\n/)) {
      if (line.trim()) children.push(p(line.trim(), { size: 22 }));
    }
    children.push(blank());
  };

  const emitSkills = () => {
    const sk = data.skills;
    const rows: string[] = [];
    if (sk.general.trim()) rows.push(`${isTr ? 'Genel' : 'General'}: ${sk.general.trim()}`);
    if (sk.languages.trim()) rows.push(`${isTr ? 'Diller' : 'Languages'}: ${sk.languages.trim()}`);
    if (sk.frontend.trim()) rows.push(`Frontend: ${sk.frontend.trim()}`);
    if (sk.backend.trim()) rows.push(`Backend: ${sk.backend.trim()}`);
    if (sk.databases.trim()) rows.push(`${isTr ? 'Veritabanları' : 'Databases'}: ${sk.databases.trim()}`);
    if (sk.tools.trim()) rows.push(`${isTr ? 'Araçlar' : 'Tools'}: ${sk.tools.trim()}`);
    if (!rows.length) return;
    children.push(p(isTr ? 'YETENEKLER' : 'SKILLS', { bold: true, size: 26, breakAfter: true }));
    for (const row of rows) children.push(p(row, { size: 22 }));
    children.push(blank());
  };

  const emitExperience = () => {
    const items = data.experience.filter(
      (e) => e.company.trim() || e.position.trim() || e.responsibilities.some((r) => r.trim())
    );
    if (!items.length) return;
    children.push(p(isTr ? 'DENEYİM' : 'EXPERIENCE', { bold: true, size: 26, breakAfter: true }));
    for (const e of items) {
      const head = [e.position, e.company].filter(Boolean).join(', ');
      if (head) children.push(p(head, { bold: true, size: 24 }));
      const meta = [e.dateRange, e.location].filter(Boolean).join(' | ');
      if (meta) children.push(p(meta, { size: 20 }));
      for (const r of e.responsibilities) {
        if (r.trim()) children.push(p(`• ${r.trim()}`, { size: 22 }));
      }
      if (e.technologies.trim()) {
        children.push(
          p(`${isTr ? 'Teknolojiler' : 'Technologies'}: ${e.technologies.trim()}`, { size: 20 })
        );
      }
      children.push(blank());
    }
  };

  const emitEducation = () => {
    const items = data.education.filter((e) => e.institution.trim() || e.degree.trim());
    if (!items.length) return;
    children.push(p(isTr ? 'EĞİTİM' : 'EDUCATION', { bold: true, size: 26, breakAfter: true }));
    for (const e of items) {
      children.push(p(`${e.degree}${e.institution ? `, ${e.institution}` : ''}`, { bold: true, size: 22 }));
      const sub = [e.graduationDate, e.gpa ? `${isTr ? 'GNO' : 'GPA'}: ${e.gpa}` : ''].filter(Boolean);
      if (sub.length) children.push(p(sub.join(' | '), { size: 20 }));
      children.push(blank());
    }
  };

  const emitProjects = () => {
    const items = data.projects.filter((pr) => pr.name.trim() || pr.description.trim());
    if (!items.length) return;
    children.push(p(isTr ? 'PROJELER' : 'PROJECTS', { bold: true, size: 26, breakAfter: true }));
    for (const pr of items) {
      if (pr.name.trim()) children.push(p(pr.name.trim(), { bold: true, size: 22 }));
      if (pr.description.trim()) {
        for (const line of pr.description.trim().split(/\n/)) {
          if (line.trim()) children.push(p(line.trim(), { size: 22 }));
        }
      }
      if (pr.technologies.trim()) children.push(p(pr.technologies.trim(), { size: 20 }));
      if (pr.githubUrl.trim()) children.push(p(pr.githubUrl.trim(), { size: 20 }));
      children.push(blank());
    }
  };

  const emitCerts = () => {
    const items = data.certifications.filter((c) => c.name.trim() || c.issuer.trim());
    if (!items.length) return;
    children.push(p(isTr ? 'SERTİFİKALAR' : 'CERTIFICATIONS', { bold: true, size: 26, breakAfter: true }));
    for (const c of items) {
      children.push(p(`${c.name} — ${c.issuer}${c.date ? ` (${c.date})` : ''}`, { size: 22 }));
    }
    children.push(blank());
  };

  const emitters: Record<(typeof order)[number], () => void> = {
    summary: emitSummary,
    skills: emitSkills,
    experience: emitExperience,
    education: emitEducation,
    projects: emitProjects,
    certifications: emitCerts,
  };

  for (const id of order) {
    emitters[id]?.();
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}
