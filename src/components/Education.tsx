import type { EducationItem } from '../types/cv.types';
import type { Language } from '../App';

interface EducationProps {
  items: EducationItem[];
  language: Language;
}

export function Education({ items, language }: EducationProps) {
  const isTr = language === 'tr';
  if (!items.length) return null;

  return (
    <section className="cv-section">
      <h2 className="cv-section-title">{isTr ? 'EĞİTİM' : 'EDUCATION'}</h2>
      {items.map((item, index) => (
        <div key={index} style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 2px 0' }}>
            <strong>{item.degree}</strong>
            {item.institution ? `, ${item.institution}` : ''}
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#333333' }}>
            {item.graduationDate}
            {item.gpa ? ` | ${isTr ? 'GNO' : 'GPA'}: ${item.gpa}` : ''}
          </p>
        </div>
      ))}
    </section>
  );
}
