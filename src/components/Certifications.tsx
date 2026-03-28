import type { CertificationItem } from '../types/cv.types';
import type { Language } from '../App';

interface CertificationsProps {
  items: CertificationItem[];
  language: Language;
}

export function Certifications({ items, language }: CertificationsProps) {
  const isTr = language === 'tr';
  if (!items.length) return null;

  return (
    <section className="cv-section">
      <h2 className="cv-section-title">{isTr ? 'SERTİFİKALAR' : 'CERTIFICATIONS'}</h2>
      {items.map((item, index) => (
        <p key={index} style={{ marginBottom: '6px' }}>
          <strong>{item.name}</strong>
          {item.issuer ? `, ${item.issuer}` : ''}
          {item.date ? ` - ${item.date}` : ''}
        </p>
      ))}
    </section>
  );
}
