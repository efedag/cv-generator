import type { Skills as SkillsType } from '../types/cv.types';
import type { Language } from '../App';

interface SkillsProps {
  data: SkillsType;
  language: Language;
}

export function Skills({ data, language }: SkillsProps) {
  const isTr = language === 'tr';
  const { general, languages, frontend, backend, databases, tools } = data;

  const lines: string[] = [];

  if ((general ?? '').trim()) {
    lines.push((general ?? '').trim());
  }

  const labeled = [
    { label: isTr ? 'Diller' : 'Languages', value: languages },
    { label: 'Frontend', value: frontend },
    { label: 'Backend', value: backend },
    { label: isTr ? 'Veritabanları' : 'Databases', value: databases },
    { label: isTr ? 'Araçlar' : 'Tools', value: tools },
  ].filter((i) => i.value.trim());

  if (labeled.length) {
    const joined = labeled
      .map((i) => `${i.label}: ${i.value.trim()}`)
      .join(isTr ? ' | ' : ' | ');
    lines.push(joined);
  }

  if (lines.length === 0) return null;

  return (
    <section className="cv-section">
      <h2 className="cv-section-title">{isTr ? 'TEKNİK YETENEKLER' : 'TECHNICAL SKILLS'}</h2>
      <div>
        {lines.map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>
    </section>
  );
}
