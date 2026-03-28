import type { PersonalInfo as PersonalInfoType } from '../types/cv.types';
import type { Language } from '../App';

interface PersonalInfoProps {
  data: PersonalInfoType;
  language: Language;
}

export function PersonalInfo({ data, language }: PersonalInfoProps) {
  const isTr = language === 'tr';
  const { fullName, title, phone, email, linkedin, github, location } = data;
  return (
    <section className="cv-section">
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#000000' }}>
        {fullName}
      </h1>
      <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#333333' }}>{title}</p>
      {location ? (
        <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#333333' }}>{location}</p>
      ) : null}
      {phone || email ? (
        <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#333333' }}>
          {phone ? `${isTr ? 'Telefon' : 'Phone'}: ${phone}` : ''}
          {phone && email ? ' | ' : ''}
          {email ? `${isTr ? 'E-posta' : 'Email'}: ${email}` : ''}
        </p>
      ) : null}
      {linkedin ? (
        <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#333333' }}>
          LinkedIn:{' '}
          <a href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`}>{linkedin}</a>
        </p>
      ) : null}
      {github ? (
        <p style={{ margin: 0, fontSize: '11px', color: '#333333' }}>
          GitHub:{' '}
          <a href={github.startsWith('http') ? github : `https://${github}`}>{github}</a>
        </p>
      ) : null}
    </section>
  );
}
