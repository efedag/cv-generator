import { useState } from 'react';
import type { CvSectionId } from '../types/cv.types';
import type { Language } from '../App';
import { getSectionOrder } from '../utils/cvDataNormalize';
import { SECTION_LABEL } from '../i18n/sections';
import type { CVData } from '../types/cv.types';

interface SectionOrderControlsProps {
  data: CVData;
  onChange: (data: CVData) => void;
  language: Language;
}

export function SectionOrderControls({ data, onChange, language }: SectionOrderControlsProps) {
  const isTr = language === 'tr';
  const order = getSectionOrder(data);
  const [dragId, setDragId] = useState<CvSectionId | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange({ ...data, sectionOrder: next });
  };

  return (
    <div className="section-order-block">
      <h3 className="section-order-block__title">
        {isTr ? 'Bölüm sırası (önizleme & dışa aktarma)' : 'Section order (preview & export)'}
      </h3>
      <p className="section-order-block__hint">
        {isTr
          ? 'Satırları sürükleyip bırakın. Kişisel bilgi her zaman en üstte kalır.'
          : 'Drag and drop rows. Personal info always stays at the top.'}
      </p>
      <ol className="section-order-list" aria-label={isTr ? 'Bölüm sırası' : 'Section order'}>
        {order.map((id, index) => (
          <li
            key={id}
            className="section-order-list__item"
            draggable
            onDragStart={() => setDragId(id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId === null) return;
              const from = order.indexOf(dragId);
              const to = index;
              if (from !== -1) move(from, to);
              setDragId(null);
            }}
            onDragEnd={() => setDragId(null)}
          >
            <span className="section-order-list__grip" aria-hidden>
              ⋮⋮
            </span>
            <span>{SECTION_LABEL[id][isTr ? 'tr' : 'en']}</span>
            <span className="section-order-list__actions">
              <button
                type="button"
                className="section-order-btn"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                aria-label={isTr ? 'Yukarı' : 'Move up'}
              >
                ↑
              </button>
              <button
                type="button"
                className="section-order-btn"
                disabled={index === order.length - 1}
                onClick={() => move(index, index + 1)}
                aria-label={isTr ? 'Aşağı' : 'Move down'}
              >
                ↓
              </button>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
