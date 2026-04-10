import type { CvProfile } from '../types/appState.types';
import type { Language } from '../App';

interface ProfileBarProps {
  profiles: CvProfile[];
  activeProfileId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  language: Language;
}

export function ProfileBar({
  profiles,
  activeProfileId,
  onSelect,
  onAdd,
  onRename,
  onRemove,
  language,
}: ProfileBarProps) {
  const isTr = language === 'tr';

  const handleRename = (id: string, current: string) => {
    const next = window.prompt(
      isTr ? 'Profil adı' : 'Profile name',
      current
    );
    if (next !== null) onRename(id, next);
  };

  const handleRemove = (id: string) => {
    if (profiles.length <= 1) return;
    if (window.confirm(isTr ? 'Bu profili silmek istiyor musunuz?' : 'Delete this profile?')) {
      onRemove(id);
    }
  };

  return (
    <div
      className="profile-bar"
      role="group"
      aria-label={isTr ? 'CV profilleri' : 'CV profiles'}
    >
      <label className="sr-only" htmlFor="profile-select">
        {isTr ? 'Aktif profil' : 'Active profile'}
      </label>
      <select
        id="profile-select"
        className="profile-select"
        value={activeProfileId}
        onChange={(e) => onSelect(e.target.value)}
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <button type="button" className="toolbar-btn" onClick={onAdd}>
        {isTr ? '+ Yeni profil' : '+ New profile'}
      </button>
      <button
        type="button"
        className="toolbar-btn"
        onClick={() => {
          const p = profiles.find((x) => x.id === activeProfileId);
          if (p) handleRename(p.id, p.name);
        }}
      >
        {isTr ? 'Yeniden adlandır' : 'Rename'}
      </button>
      <button
        type="button"
        className="toolbar-btn"
        disabled={profiles.length <= 1}
        onClick={() => handleRemove(activeProfileId)}
      >
        {isTr ? 'Sil' : 'Delete'}
      </button>
    </div>
  );
}
