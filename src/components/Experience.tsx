import type { ExperienceItem } from '../types/cv.types';
import type { Language } from '../App';

interface ExperienceProps {
  items: ExperienceItem[];
  language: Language;
}

export function Experience({ items, language }: ExperienceProps) {
  const isTr = language === 'tr';
  if (!items.length) return null;

  return (
    <section className="cv-section">
      <h2 className="cv-section-title">{isTr ? 'DENEYİM' : 'EXPERIENCE'}</h2>
      {items.map((item, index) => (
        <div key={index} style={{ marginBottom: '14px' }}>
          <p style={{ margin: '0 0 2px 0' }}>
            <strong>{item.position}</strong>
            {item.company ? `, ${item.company}` : ''}
          </p>
          <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#333333' }}>
            {item.dateRange}
            {item.location ? ` | ${item.location}` : ''}
          </p>
          {item.responsibilities.length > 0 && (
            <ul style={{ margin: '0 0 4px 0', paddingLeft: '18px' }}>
              {item.responsibilities.map((r, i) => (
                <li key={i} style={{ marginBottom: '2px' }}>
                  {r}
                </li>
              ))}
            </ul>
          )}
          {item.technologies ? (
            <p style={{ margin: 0, fontSize: '11px', color: '#333333' }}>
              <strong>{isTr ? 'Teknolojiler:' : 'Technologies:'}</strong> {item.technologies}
            </p>
          ) : null}
        </div>
      ))}
    </section>
  );
}
