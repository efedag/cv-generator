import type { CvHint } from '../utils/cvValidation';
import type { Language } from '../App';

interface ValidationHintsProps {
  hints: CvHint[];
  language: Language;
}

export function ValidationHints({ hints, language }: ValidationHintsProps) {
  const isTr = language === 'tr';
  if (!hints.length) return null;

  return (
    <aside
      className="validation-hints"
      aria-label={isTr ? 'İpuçları ve uyarılar' : 'Hints and warnings'}
    >
      <h3 className="validation-hints__title">{isTr ? 'Kontrol listesi' : 'Checklist'}</h3>
      <ul className="validation-hints__list">
        {hints.map((h, i) => (
          <li
            key={i}
            className={h.level === 'warn' ? 'validation-hints__item--warn' : 'validation-hints__item--info'}
            role="status"
          >
            {h.text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
