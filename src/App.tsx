import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { EditForm } from './components/EditForm';
import { CVPreview } from './components/CVPreview';

export type Language = 'en' | 'tr';

function App() {
  const [data, setData] = useLocalStorage();
  const [language, setLanguage] = useState<Language>('tr');

  return (
    <div className="app-layout">
      <div className="app-header">
        <div style={{ fontFamily: 'Arial', fontSize: 13, fontWeight: 600 }}>CV Generator</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setLanguage('tr')}
            style={{
              padding: '3px 8px',
              fontSize: 11,
              cursor: 'pointer',
              borderRadius: 4,
              border: language === 'tr' ? '1px solid #000' : '1px solid #ccc',
              backgroundColor: language === 'tr' ? '#000' : '#f5f5f5',
              color: language === 'tr' ? '#fff' : '#000',
            }}
          >
            Türkçe
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            style={{
              padding: '3px 8px',
              fontSize: 11,
              cursor: 'pointer',
              borderRadius: 4,
              border: language === 'en' ? '1px solid #000' : '1px solid #ccc',
              backgroundColor: language === 'en' ? '#000' : '#f5f5f5',
              color: language === 'en' ? '#fff' : '#000',
            }}
          >
            English
          </button>
        </div>
      </div>
      <EditForm data={data} onChange={setData} language={language} />
      <CVPreview data={data} language={language} />
    </div>
  );
}

export default App;
