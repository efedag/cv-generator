import type { CVData } from '../types/cv.types';
import type { Language } from '../App';
import { getSectionOrder } from './cvDataNormalize';

function h(text: string): string {
  return text.replace(/\|/g, '\\|');
}

export function cvToMarkdown(data: CVData, language: Language): string {
  const isTr = language === 'tr';
  const { personalInfo: p } = data;
  const lines: string[] = [];

  lines.push(`# ${h(p.fullName || (isTr ? 'İsimsiz CV' : 'Untitled CV'))}`);
  if (p.title) lines.push(`*${h(p.title)}*`);
  lines.push('');
  const contact: string[] = [];
  if (p.location) contact.push(p.location);
  if (p.phone) contact.push(p.phone);
  if (p.email) contact.push(p.email);
  if (p.linkedin) contact.push(`[LinkedIn](${p.linkedin})`);
  if (p.github) contact.push(`[GitHub](${p.github})`);
  if (contact.length) lines.push(contact.join(' · '), '');

  const order = getSectionOrder(data);
  const sections: Record<(typeof order)[number], () => void> = {
    summary: () => {
      if (!data.summary.trim()) return;
      lines.push(`## ${isTr ? 'Özet' : 'Summary'}`, '', data.summary.trim(), '');
    },
    skills: () => {
      const sk = data.skills;
      const parts: string[] = [];
      if (sk.general.trim()) parts.push(`- **${isTr ? 'Genel' : 'General'}:** ${h(sk.general.trim())}`);
      if (sk.languages.trim()) parts.push(`- **${isTr ? 'Diller' : 'Languages'}:** ${h(sk.languages.trim())}`);
      if (sk.frontend.trim()) parts.push(`- **Frontend:** ${h(sk.frontend.trim())}`);
      if (sk.backend.trim()) parts.push(`- **Backend:** ${h(sk.backend.trim())}`);
      if (sk.databases.trim()) parts.push(`- **${isTr ? 'Veritabanları' : 'Databases'}:** ${h(sk.databases.trim())}`);
      if (sk.tools.trim()) parts.push(`- **${isTr ? 'Araçlar' : 'Tools'}:** ${h(sk.tools.trim())}`);
      if (!parts.length) return;
      lines.push(`## ${isTr ? 'Yetenekler' : 'Skills'}`, '', ...parts, '');
    },
    experience: () => {
      const items = data.experience.filter(
        (e) => e.company.trim() || e.position.trim() || e.responsibilities.length
      );
      if (!items.length) return;
      lines.push(`## ${isTr ? 'Deneyim' : 'Experience'}`, '');
      for (const e of items) {
        lines.push(`### ${h(e.position || '—')}${e.company ? ` — *${h(e.company)}*` : ''}`);
        const meta = [e.dateRange, e.location].filter(Boolean).join(' · ');
        if (meta) lines.push(`*${h(meta)}*`, '');
        for (const r of e.responsibilities) {
          if (r.trim()) lines.push(`- ${h(r.trim())}`);
        }
        if (e.technologies.trim()) {
          lines.push('', `*${isTr ? 'Teknolojiler' : 'Technologies'}:* ${h(e.technologies.trim())}`);
        }
        lines.push('');
      }
    },
    education: () => {
      const items = data.education.filter((e) => e.institution.trim() || e.degree.trim());
      if (!items.length) return;
      lines.push(`## ${isTr ? 'Eğitim' : 'Education'}`, '');
      for (const e of items) {
        lines.push(`- **${h(e.degree)}**, ${h(e.institution)}`);
        const sub = [e.graduationDate, e.gpa ? `${isTr ? 'GNO' : 'GPA'}: ${e.gpa}` : ''].filter(Boolean);
        if (sub.length) lines.push(`  - ${h(sub.join(' · '))}`);
      }
      lines.push('');
    },
    projects: () => {
      const items = data.projects.filter((p) => p.name.trim() || p.description.trim());
      if (!items.length) return;
      lines.push(`## ${isTr ? 'Projeler' : 'Projects'}`, '');
      for (const pr of items) {
        lines.push(`### ${h(pr.name || '—')}`);
        if (pr.description.trim()) lines.push(pr.description.trim());
        if (pr.technologies.trim()) lines.push(`*${h(pr.technologies.trim())}*`);
        if (pr.githubUrl.trim()) lines.push(`[GitHub](${pr.githubUrl.trim()})`);
        lines.push('');
      }
    },
    certifications: () => {
      const items = data.certifications.filter((c) => c.name.trim() || c.issuer.trim());
      if (!items.length) return;
      lines.push(`## ${isTr ? 'Sertifikalar' : 'Certifications'}`, '');
      for (const c of items) {
        lines.push(`- **${h(c.name)}** — ${h(c.issuer)}${c.date ? ` (${h(c.date)})` : ''}`);
      }
      lines.push('');
    },
  };

  for (const id of order) {
    sections[id]?.();
  }

  return lines.join('\n').trim() + '\n';
}
