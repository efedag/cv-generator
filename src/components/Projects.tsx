import type { ProjectItem } from '../types/cv.types';
import type { Language } from '../App';

interface ProjectsProps {
  items: ProjectItem[];
  language: Language;
}

export function Projects({ items, language }: ProjectsProps) {
  const isTr = language === 'tr';
  if (!items.length) return null;

  return (
    <section className="cv-section">
      <h2 className="cv-section-title">{isTr ? 'PROJELER' : 'PROJECTS'}</h2>
      {items.map((item, index) => (
        <div key={index} style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 2px 0' }}>
            <strong>{item.name}</strong>
            {item.githubUrl ? (
              <> - <a href={item.githubUrl.startsWith('http') ? item.githubUrl : `https://${item.githubUrl}`}>{item.githubUrl}</a></>
            ) : null}
          </p>
          <p style={{ margin: '0 0 4px 0' }}>{item.description}</p>
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
