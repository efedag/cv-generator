import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCvAppState } from './hooks/useCvAppState';
import { EditForm } from './components/EditForm';
import { CVPreview } from './components/CVPreview';
import { ProfileBar } from './components/ProfileBar';
import { ThemeMarginControls } from './components/ThemeMarginControls';
import { Toast } from './components/Toast';
import { analyzeCv } from './utils/cvValidation';

export type Language = 'en' | 'tr';

function App() {
  const {
    cvData,
    setCvData,
    profiles,
    activeProfileId,
    setActiveProfileId,
    addProfile,
    renameProfile,
    removeProfile,
    theme,
    setTheme,
    previewMargin,
    setPreviewMargin,
  } = useCvAppState();

  const [language, setLanguage] = useState<Language>('tr');
  const [toast, setToast] = useState<string | null>(null);

  const hints = useMemo(() => analyzeCv(cvData, language), [cvData, language]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language === 'tr' ? 'tr' : 'en';
  }, [theme, language]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        showToast(
          language === 'tr'
            ? 'Değişiklikler bu tarayıcıda otomatik kaydediliyor.'
            : 'Changes are saved automatically in this browser.'
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [language, showToast]);

  const isTr = language === 'tr';

  return (
    <>
      <a href="#main-content" className="skip-link">
        {isTr ? 'İçeriğe atla' : 'Skip to content'}
      </a>
      <Toast message={toast} onDismiss={() => setToast(null)} />
      <div className="app-shell">
        <header className="app-header" role="banner">
          <div className="app-header__brand">
            <span className="app-header__title">CV Generator</span>
            <span className="app-header__kbd-hint" title="Ctrl+S / ⌘S">
              {isTr ? 'Kayıt: otomatik · Ctrl+S bilgi' : 'Saves automatically · Ctrl+S for hint'}
            </span>
          </div>
          <div className="app-header__controls">
            <ProfileBar
              profiles={profiles}
              activeProfileId={activeProfileId}
              onSelect={setActiveProfileId}
              onAdd={() => addProfile()}
              onRename={renameProfile}
              onRemove={removeProfile}
              language={language}
            />
            <ThemeMarginControls
              theme={theme}
              onTheme={setTheme}
              previewMargin={previewMargin}
              onPreviewMargin={setPreviewMargin}
              language={language}
            />
            <div className="lang-switch" role="group" aria-label={isTr ? 'Dil' : 'Language'}>
              <button
                type="button"
                className={`lang-btn ${language === 'tr' ? 'lang-btn--active' : ''}`}
                onClick={() => setLanguage('tr')}
                aria-pressed={language === 'tr'}
              >
                Türkçe
              </button>
              <button
                type="button"
                className={`lang-btn ${language === 'en' ? 'lang-btn--active' : ''}`}
                onClick={() => setLanguage('en')}
                aria-pressed={language === 'en'}
              >
                English
              </button>
            </div>
          </div>
        </header>
        <main id="main-content" className="app-layout" role="main">
          <EditForm data={cvData} onChange={setCvData} language={language} hints={hints} />
          <CVPreview data={cvData} language={language} previewMargin={previewMargin} />
        </main>
      </div>
    </>
  );
}

export default App;
