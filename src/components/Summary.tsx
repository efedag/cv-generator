import type { Language } from '../App';

interface SummaryProps {
  text: string;
  language: Language;
}

export function Summary({ text, language }: SummaryProps) {
  const isTr = language === 'tr';
  if (!text.trim()) return null;
  return (
    <section className="cv-section">
      <h2 className="cv-section-title">{isTr ? 'ÖZET' : 'SUMMARY'}</h2>
      <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
    </section>
  );
}
