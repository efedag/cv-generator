import type { Language } from '../App';
import type { PreviewMargin, ThemeMode } from '../types/appState.types';

interface ThemeMarginControlsProps {
  theme: ThemeMode;
  onTheme: (t: ThemeMode) => void;
  previewMargin: PreviewMargin;
  onPreviewMargin: (m: PreviewMargin) => void;
  language: Language;
}

export function ThemeMarginControls({
  theme,
  onTheme,
  previewMargin,
  onPreviewMargin,
  language,
}: ThemeMarginControlsProps) {
  const isTr = language === 'tr';

  return (
    <div className="theme-margin-controls" role="group" aria-label={isTr ? 'Görünüm' : 'Appearance'}>
      <button
        type="button"
        className={`toolbar-btn ${theme === 'dark' ? 'toolbar-btn--active' : ''}`}
        onClick={() => onTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-pressed={theme === 'dark'}
        title={isTr ? 'Koyu tema' : 'Dark theme'}
      >
        {theme === 'dark' ? (isTr ? 'Açık tema' : 'Light') : isTr ? 'Koyu tema' : 'Dark'}
      </button>
      <label className="toolbar-label" htmlFor="margin-select">
        {isTr ? 'Önizleme boşluğu' : 'Preview margin'}
      </label>
      <select
        id="margin-select"
        className="margin-select"
        value={previewMargin}
        onChange={(e) => onPreviewMargin(e.target.value as PreviewMargin)}
      >
        <option value="compact">{isTr ? 'Dar' : 'Compact'}</option>
        <option value="normal">{isTr ? 'Normal' : 'Normal'}</option>
        <option value="spacious">{isTr ? 'Geniş' : 'Spacious'}</option>
      </select>
    </div>
  );
}
