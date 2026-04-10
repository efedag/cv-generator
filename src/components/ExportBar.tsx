import { useState } from 'react';
import type { CVData } from '../types/cv.types';
import type { Language } from '../App';
import { buildCvJsonExport } from '../utils/cvJsonFile';
import { cvToMarkdown } from '../utils/exportMarkdown';
import { cvToPlainText } from '../utils/exportPlainText';
import { cvToDocxBlob } from '../utils/exportDocx';
import { downloadBlob, downloadTextFile } from '../utils/downloadBlob';
import { cvBaseFilename } from '../utils/cvFilename';

interface ExportBarProps {
  data: CVData;
  language: Language;
}

export function ExportBar({ data, language }: ExportBarProps) {
  const isTr = language === 'tr';
  const base = cvBaseFilename(data.personalInfo.fullName);
  const [docxBusy, setDocxBusy] = useState(false);

  const label = isTr ? 'Diğer formatlar' : 'Other formats';

  const handleDocx = async () => {
    setDocxBusy(true);
    try {
      const blob = await cvToDocxBlob(data, language);
      downloadBlob(blob, `${base}.docx`);
    } catch (e) {
      console.error(e);
    } finally {
      setDocxBusy(false);
    }
  };

  return (
    <div className="export-bar" role="group" aria-label={label}>
      <span className="export-bar__label">{label}</span>
      <div className="export-bar__buttons">
        <button
          type="button"
          className="export-bar__btn"
          onClick={() =>
            downloadTextFile(buildCvJsonExport(data), `${base}.json`, 'application/json;charset=utf-8')
          }
        >
          JSON
        </button>
        <button
          type="button"
          className="export-bar__btn"
          onClick={() => downloadTextFile(cvToMarkdown(data, language), `${base}.md`, 'text/markdown;charset=utf-8')}
        >
          Markdown
        </button>
        <button
          type="button"
          className="export-bar__btn"
          onClick={() =>
            downloadTextFile(cvToPlainText(data, language), `${base}.txt`, 'text/plain;charset=utf-8')
          }
        >
          {isTr ? 'Düz metin' : 'Plain text'}
        </button>
        <button type="button" className="export-bar__btn" disabled={docxBusy} onClick={() => void handleDocx()}>
          {docxBusy ? '…' : 'Word (.docx)'}
        </button>
      </div>
    </div>
  );
}
