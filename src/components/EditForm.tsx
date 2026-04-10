import { useId, useRef, useState } from 'react';
import type { CVData, ExperienceItem, EducationItem, ProjectItem, CertificationItem } from '../types/cv.types';
import type { Language } from '../App';
import { tryExtractEmbeddedCvFromPdf } from '../utils/pdfCvEmbed';
import { CV_TEMPLATES } from '../data/templates';
import { parseCvJsonText } from '../utils/cvJsonFile';
import { defaultCV } from '../data/defaultCV';
import { normalizeCvData } from '../utils/cvDataNormalize';
import type { CvHint } from '../utils/cvValidation';
import { countSummaryWords } from '../utils/cvValidation';
import { ValidationHints } from './ValidationHints';
import { SectionOrderControls } from './SectionOrderControls';

interface EditFormProps {
  data: CVData;
  onChange: (data: CVData) => void;
  language: Language;
  hints?: CvHint[];
}

function updatePersonalInfo(data: CVData, field: string, value: string): CVData {
  return {
    ...data,
    personalInfo: { ...data.personalInfo, [field]: value },
  };
}

function updateExperience(data: CVData, index: number, item: Partial<ExperienceItem>): CVData {
  const next = [...data.experience];
  next[index] = { ...next[index], ...item };
  return { ...data, experience: next };
}

function updateEducation(data: CVData, index: number, item: Partial<EducationItem>): CVData {
  const next = [...data.education];
  next[index] = { ...next[index], ...item };
  return { ...data, education: next };
}

function updateProject(data: CVData, index: number, item: Partial<ProjectItem>): CVData {
  const next = [...data.projects];
  next[index] = { ...next[index], ...item };
  return { ...data, projects: next };
}

function updateCertification(data: CVData, index: number, item: Partial<CertificationItem>): CVData {
  const next = [...data.certifications];
  next[index] = { ...next[index], ...item };
  return { ...data, certifications: next };
}

const emptyExperience: ExperienceItem = {
  company: '',
  position: '',
  dateRange: '',
  location: '',
  responsibilities: [],
  technologies: '',
};

const emptyEducation: EducationItem = {
  institution: '',
  degree: '',
  graduationDate: '',
  gpa: '',
};

const emptyProject: ProjectItem = {
  name: '',
  description: '',
  technologies: '',
  githubUrl: '',
};

const emptyCertification: CertificationItem = {
  name: '',
  issuer: '',
  date: '',
};

export function EditForm({ data, onChange, language, hints = [] }: EditFormProps) {
  const isTr = language === 'tr';
  const uid = useId().replace(/:/g, '');
  const field = (name: string) => `${uid}-${name}`;
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string | null>(null);
  const [pdfNotice, setPdfNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [templateId, setTemplateId] = useState('');
  const [jsonNotice, setJsonNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  async function handlePdfSelected(file: File | undefined) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setPdfNotice({
        kind: 'err',
        text: isTr ? 'Lütfen bir PDF dosyası seçin.' : 'Please select a PDF file.',
      });
      return;
    }
    setPdfBusy(true);
    setPdfNotice(null);
    setPdfProgress(null);
    try {
      const buffer = await file.arrayBuffer();
      const embedded = tryExtractEmbeddedCvFromPdf(buffer);
      if (embedded) {
        onChange(embedded);
        setPdfNotice({
          kind: 'ok',
          text: isTr
            ? 'CV bu PDF’de gömülü veriden yüklendi (tam doğruluk). Bu siteyle indirilen yeni PDF’lerde geçerlidir.'
            : 'CV loaded from embedded data in this PDF (exact). New PDFs from this app include this payload.',
        });
        return;
      }

      const [{ extractTextFromPdfBuffer }, { parseCvPlainText }] = await Promise.all([
        import('../utils/pdfTextExtract'),
        import('../utils/cvTextParse'),
      ]);
      const text = await extractTextFromPdfBuffer(buffer, {
        locale: language,
        onProgress: (msg) => setPdfProgress(msg),
      });
      if (!text.trim()) {
        setPdfNotice({
          kind: 'err',
          text: isTr
            ? 'Metin çıkarılamadı (OCR da sonuç vermedi). PDF boş, çok düşük çözünürlüklü veya okunaksız olabilir.'
            : 'Could not extract text (OCR returned nothing). The PDF may be empty or too low-resolution.',
        });
        return;
      }
      onChange(parseCvPlainText(text));
      setPdfNotice({
        kind: 'ok',
        text: isTr
          ? 'Metin/OCR ile içe aktarıldı. Eski PDF’lerde hatalar olabilir; tam doğruluk için bu siteden yeni PDF indirin.'
          : 'Imported via text/OCR. Old exports may be imperfect; download a new PDF from this app for exact re-import.',
      });
    } catch (e) {
      console.error(e);
      setPdfNotice({
        kind: 'err',
        text: isTr ? 'PDF okunurken hata oluştu.' : 'Something went wrong while reading the PDF.',
      });
    } finally {
      setPdfBusy(false);
      setPdfProgress(null);
    }
  }

  function handleJsonFile(file: File | undefined) {
    if (!file) return;
    setJsonNotice(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const parsed = parseCvJsonText(text);
      if (!parsed) {
        setJsonNotice({
          kind: 'err',
          text: isTr ? 'JSON dosyası okunamadı veya şema geçersiz.' : 'Could not read JSON or invalid schema.',
        });
        return;
      }
      onChange(parsed);
      setJsonNotice({
        kind: 'ok',
        text: isTr ? 'JSON içe aktarıldı.' : 'JSON imported.',
      });
    };
    reader.readAsText(file, 'utf-8');
  }

  const summaryWords = countSummaryWords(data.summary);

  return (
    <div className="edit-panel">
      <h2>{isTr ? 'CV Düzenle' : 'Edit CV'}</h2>

      <div className="edit-toolbar-block">
        <div className="edit-toolbar-row">
          <label className="toolbar-inline-label" htmlFor={field('template-select')}>
            {isTr ? 'Şablon' : 'Template'}
          </label>
          <select
            id={field('template-select')}
            className="toolbar-select"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
          >
            <option value="">{isTr ? 'Seçin…' : 'Choose…'}</option>
            {CV_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {isTr ? t.labelTr : t.labelEn}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="toolbar-btn"
            disabled={!templateId}
            onClick={() => {
              const t = CV_TEMPLATES.find((x) => x.id === templateId);
              if (t) onChange(t.build());
            }}
          >
            {isTr ? 'Uygula' : 'Apply'}
          </button>
        </div>
        <p className="toolbar-desc">
          {templateId
            ? isTr
              ? CV_TEMPLATES.find((x) => x.id === templateId)?.descriptionTr
              : CV_TEMPLATES.find((x) => x.id === templateId)?.descriptionEn
            : null}
        </p>
        <div className="edit-toolbar-row">
          <input
            ref={jsonInputRef}
            type="file"
            accept="application/json,.json"
            className="pdf-import-input"
            aria-hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              handleJsonFile(f);
            }}
          />
          <button type="button" className="toolbar-btn" onClick={() => jsonInputRef.current?.click()}>
            {isTr ? 'JSON içe aktar' : 'Import JSON'}
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => {
              if (
                window.confirm(
                  isTr
                    ? 'Tüm alanlar boş şablona sıfırlansın mı?'
                    : 'Reset all fields to the blank template?'
                )
              ) {
                onChange(normalizeCvData(structuredClone(defaultCV)));
                setTemplateId('');
              }
            }}
          >
            {isTr ? 'Boş şablona sıfırla' : 'Reset to blank'}
          </button>
        </div>
        {jsonNotice ? (
          <p className={jsonNotice.kind === 'err' ? 'pdf-import-msg pdf-import-msg--err' : 'pdf-import-msg'}>
            {jsonNotice.text}
          </p>
        ) : null}
      </div>

      <ValidationHints hints={hints} language={language} />

      <div className="pdf-import-block">
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          className="pdf-import-input"
          disabled={pdfBusy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            void handlePdfSelected(f);
          }}
        />
        <button
          type="button"
          className="pdf-import-btn"
          disabled={pdfBusy}
          onClick={() => pdfInputRef.current?.click()}
        >
          {pdfBusy ? (isTr ? 'PDF okunuyor…' : 'Reading PDF…') : isTr ? 'PDF’den yükle' : 'Import from PDF'}
        </button>
        <p className="pdf-import-hint">
          {isTr
            ? 'Bu siteden indirilen güncel PDF’lerde CV verisi dosyaya gömülüdür; içe aktarma birebir olur. Eski PDF’lerde yalnızca görüntü/OCR kullanılır — gerekirse bir kez daha “PDF İndir” deyip yeni dosyayı kullanın.'
            : 'Current “Download PDF” files embed your CV data for exact re-import. Older PDFs use image/OCR only — re-download once if you need perfect round-trip.'}
        </p>
        {pdfBusy && pdfProgress ? <p className="pdf-import-progress">{pdfProgress}</p> : null}
        {pdfNotice ? (
          <p className={pdfNotice.kind === 'err' ? 'pdf-import-msg pdf-import-msg--err' : 'pdf-import-msg'}>
            {pdfNotice.text}
          </p>
        ) : null}
      </div>

      <SectionOrderControls data={data} onChange={onChange} language={language} />

      <label htmlFor={field('fullName')}>{isTr ? 'Ad Soyad' : 'Full Name'}</label>
      <input
        id={field('fullName')}
        autoComplete="name"
        value={data.personalInfo.fullName}
        placeholder={isTr ? 'Ad Soyad' : 'Full name'}
        onChange={(e) => onChange(updatePersonalInfo(data, 'fullName', e.target.value))}
      />

      <label htmlFor={field('title')}>{isTr ? 'Pozisyon / Ünvan' : 'Title'}</label>
      <input
        id={field('title')}
        value={data.personalInfo.title}
        placeholder={isTr ? 'Örn. Frontend Developer' : 'e.g. Frontend Developer'}
        onChange={(e) => onChange(updatePersonalInfo(data, 'title', e.target.value))}
      />

      <label htmlFor={field('phone')}>{isTr ? 'Telefon' : 'Phone'}</label>
      <input
        id={field('phone')}
        type="tel"
        autoComplete="tel"
        value={data.personalInfo.phone}
        placeholder={isTr ? 'Örn. +90 5xx xxx xx xx' : 'e.g. +1 (555) 555-5555'}
        onChange={(e) => onChange(updatePersonalInfo(data, 'phone', e.target.value))}
      />

      <label htmlFor={field('email')}>Email</label>
      <input
        id={field('email')}
        type="email"
        autoComplete="email"
        value={data.personalInfo.email}
        placeholder={isTr ? 'ornek@eposta.com' : 'name@example.com'}
        onChange={(e) => onChange(updatePersonalInfo(data, 'email', e.target.value))}
      />

      <label htmlFor={field('linkedin')}>{isTr ? 'LinkedIn (tam URL)' : 'LinkedIn (full URL)'}</label>
      <input
        id={field('linkedin')}
        value={data.personalInfo.linkedin}
        placeholder="https://www.linkedin.com/in/..."
        onChange={(e) => onChange(updatePersonalInfo(data, 'linkedin', e.target.value))}
      />

      <label htmlFor={field('github')}>{isTr ? 'GitHub (tam URL)' : 'GitHub (full URL)'}</label>
      <input
        id={field('github')}
        value={data.personalInfo.github}
        placeholder="https://github.com/..."
        onChange={(e) => onChange(updatePersonalInfo(data, 'github', e.target.value))}
      />

      <label htmlFor={field('location')}>{isTr ? 'Konum' : 'Location'}</label>
      <input
        id={field('location')}
        autoComplete="address-level2"
        value={data.personalInfo.location}
        placeholder={isTr ? 'Örn. İstanbul, Türkiye' : 'e.g. Berlin, Germany'}
        onChange={(e) => onChange(updatePersonalInfo(data, 'location', e.target.value))}
      />

      <label htmlFor={field('summary')}>{isTr ? 'Özet' : 'Summary'}</label>
      <textarea
        id={field('summary')}
        value={data.summary}
        placeholder={
          isTr
            ? 'Kendinizi 2-4 cümleyle özetleyin (uzmanlık, etki, hedef).'
            : 'Summarize yourself in 2–4 sentences (focus, impact, goals).'
        }
        onChange={(e) => onChange({ ...data, summary: e.target.value })}
        rows={4}
        aria-describedby={field('summary-hint')}
      />
      <p id={field('summary-hint')} className="field-hint">
        {isTr
          ? `Yaklaşık ${summaryWords} kelime — çoğu özet 40–120 kelime civarında olur.`
          : `About ${summaryWords} words — many summaries land around 40–120 words.`}
      </p>

      <label>{isTr ? 'Genel Yetenekler (özet)' : 'General Skills (summary)'}</label>
      <textarea
        value={data.skills.general}
        placeholder={isTr ? 'Örn. Problem solving, takım çalışması...' : 'e.g. Problem solving, teamwork...'}
        onChange={(e) => onChange({ ...data, skills: { ...data.skills, general: e.target.value } })}
        rows={2}
      />

      <label>{isTr ? 'Yetenekler - Diller' : 'Skills - Languages'}</label>
      <input
        value={data.skills.languages}
        placeholder={isTr ? 'Örn. TypeScript, JavaScript' : 'e.g. TypeScript, JavaScript'}
        onChange={(e) => onChange({ ...data, skills: { ...data.skills, languages: e.target.value } })}
      />

      <label>{isTr ? 'Yetenekler - Frontend' : 'Skills - Frontend'}</label>
      <input
        value={data.skills.frontend}
        placeholder={isTr ? 'Örn. React, Tailwind, Redux' : 'e.g. React, Tailwind, Redux'}
        onChange={(e) => onChange({ ...data, skills: { ...data.skills, frontend: e.target.value } })}
      />

      <label>{isTr ? 'Yetenekler - Backend' : 'Skills - Backend'}</label>
      <input
        value={data.skills.backend}
        placeholder={isTr ? 'Örn. Node.js, .NET, REST' : 'e.g. Node.js, .NET, REST'}
        onChange={(e) => onChange({ ...data, skills: { ...data.skills, backend: e.target.value } })}
      />

      <label>{isTr ? 'Yetenekler - Veritabanları' : 'Skills - Databases'}</label>
      <input
        value={data.skills.databases}
        placeholder={isTr ? 'Örn. PostgreSQL, MongoDB' : 'e.g. PostgreSQL, MongoDB'}
        onChange={(e) => onChange({ ...data, skills: { ...data.skills, databases: e.target.value } })}
      />

      <label>{isTr ? 'Yetenekler - Araçlar' : 'Skills - Tools'}</label>
      <input
        value={data.skills.tools}
        placeholder={isTr ? 'Örn. Git, Docker, CI/CD' : 'e.g. Git, Docker, CI/CD'}
        onChange={(e) => onChange({ ...data, skills: { ...data.skills, tools: e.target.value } })}
      />

      <h2 style={{ marginTop: 24 }}>{isTr ? 'Deneyim' : 'Experience'}</h2>
      {data.experience.map((exp, index) => (
        <div key={index} style={{ border: '1px solid #666', padding: 12, marginBottom: 12 }}>
          <label>{isTr ? 'Pozisyon' : 'Position'}</label>
          <input
            value={exp.position}
            placeholder={isTr ? 'Örn. Frontend Developer' : 'e.g. Frontend Developer'}
            onChange={(e) => onChange(updateExperience(data, index, { position: e.target.value }))}
          />
          <label>{isTr ? 'Şirket' : 'Company'}</label>
          <input
            value={exp.company}
            placeholder={isTr ? 'Örn. Şirket Adı' : 'e.g. Company name'}
            onChange={(e) => onChange(updateExperience(data, index, { company: e.target.value }))}
          />
          <label>{isTr ? 'Tarih Aralığı' : 'Date Range'}</label>
          <input
            value={exp.dateRange}
            placeholder={isTr ? 'Örn. 01/2022 - 01/2024' : 'e.g. 01/2022 - 01/2024'}
            onChange={(e) => onChange(updateExperience(data, index, { dateRange: e.target.value }))}
          />
          <label>{isTr ? 'Konum' : 'Location'}</label>
          <input
            value={exp.location}
            placeholder={isTr ? 'Örn. İstanbul, Türkiye' : 'e.g. Remote / City, Country'}
            onChange={(e) => onChange(updateExperience(data, index, { location: e.target.value }))}
          />
          <label>{isTr ? 'Sorumluluklar (her satıra bir madde)' : 'Responsibilities (one per line)'}</label>
          <textarea
            value={exp.responsibilities.join('\n')}
            placeholder={
              isTr
                ? 'Örn.\n- Özelliği X geliştirerek dönüşümü %Y artırdım.\n- Sayfa hızını %Z iyileştirdim.'
                : 'e.g.\n- Increased conversion by %Y by shipping feature X.\n- Improved page performance by %Z.'
            }
            onChange={(e) =>
              onChange(
                updateExperience(data, index, {
                  responsibilities: e.target.value.split('\n').filter(Boolean),
                })
              )
            }
            rows={3}
          />
          <label>{isTr ? 'Teknolojiler' : 'Technologies'}</label>
          <input
            value={exp.technologies}
            placeholder={isTr ? 'Örn. React, Node.js, PostgreSQL' : 'e.g. React, Node.js, PostgreSQL'}
            onChange={(e) => onChange(updateExperience(data, index, { technologies: e.target.value }))}
          />
          <button
            type="button"
            onClick={() =>
              onChange({
                ...data,
                experience: data.experience.filter((_, i) => i !== index),
              })
            }
            style={{ marginTop: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Arial', fontSize: 11 }}
          >
            {isTr ? 'Sil' : 'Remove'}
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...data, experience: [...data.experience, emptyExperience] })}
        style={{ marginBottom: 24, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Arial', fontSize: 12 }}
      >
        {isTr ? 'Deneyim Ekle' : 'Add Experience'}
      </button>

      <h2 style={{ marginTop: 24 }}>{isTr ? 'Eğitim' : 'Education'}</h2>
      {data.education.map((edu, index) => (
        <div key={index} style={{ border: '1px solid #666', padding: 12, marginBottom: 12 }}>
          <label>{isTr ? 'Kurum' : 'Institution'}</label>
          <input
            value={edu.institution}
            placeholder={isTr ? 'Örn. Üniversite Adı' : 'e.g. University name'}
            onChange={(e) => onChange(updateEducation(data, index, { institution: e.target.value }))}
          />
          <label>{isTr ? 'Bölüm / Derece' : 'Degree'}</label>
          <input
            value={edu.degree}
            placeholder={isTr ? 'Örn. Bilgisayar Mühendisliği' : 'e.g. Computer Science'}
            onChange={(e) => onChange(updateEducation(data, index, { degree: e.target.value }))}
          />
          <label>{isTr ? 'Mezuniyet Tarihi' : 'Graduation Date'}</label>
          <input
            value={edu.graduationDate}
            placeholder={isTr ? 'Örn. 06/2024' : 'e.g. 06/2024'}
            onChange={(e) => onChange(updateEducation(data, index, { graduationDate: e.target.value }))}
          />
          <label>GPA</label>
          <input
            value={edu.gpa}
            placeholder={isTr ? 'Örn. 3.45/4.00' : 'e.g. 3.45/4.00'}
            onChange={(e) => onChange(updateEducation(data, index, { gpa: e.target.value }))}
          />
          <button
            type="button"
            onClick={() =>
              onChange({
                ...data,
                education: data.education.filter((_, i) => i !== index),
              })
            }
            style={{ marginTop: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Arial', fontSize: 11 }}
          >
            {isTr ? 'Sil' : 'Remove'}
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...data, education: [...data.education, emptyEducation] })}
        style={{ marginBottom: 24, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Arial', fontSize: 12 }}
      >
        {isTr ? 'Eğitim Ekle' : 'Add Education'}
      </button>

      <h2 style={{ marginTop: 24 }}>{isTr ? 'Projeler' : 'Projects'}</h2>
      {data.projects.map((proj, index) => (
        <div key={index} style={{ border: '1px solid #666', padding: 12, marginBottom: 12 }}>
          <label>{isTr ? 'Proje Adı' : 'Name'}</label>
          <input
            value={proj.name}
            placeholder={isTr ? 'Örn. CV Generator' : 'e.g. CV Generator'}
            onChange={(e) => onChange(updateProject(data, index, { name: e.target.value }))}
          />
          <label>{isTr ? 'Açıklama' : 'Description'}</label>
          <textarea
            value={proj.description}
            placeholder={
              isTr
                ? 'Amaç, kapsam ve çıktılardan kısaca bahsedin.'
                : 'Briefly describe purpose, scope, and outcome.'
            }
            onChange={(e) => onChange(updateProject(data, index, { description: e.target.value }))}
            rows={2}
          />
          <label>{isTr ? 'Teknolojiler' : 'Technologies'}</label>
          <input
            value={proj.technologies}
            placeholder={isTr ? 'Örn. React, Vite, Tailwind' : 'e.g. React, Vite, Tailwind'}
            onChange={(e) => onChange(updateProject(data, index, { technologies: e.target.value }))}
          />
          <label>{isTr ? 'GitHub URL (tam URL)' : 'GitHub URL (full URL)'}</label>
          <input
            value={proj.githubUrl}
            placeholder="https://github.com/..."
            onChange={(e) => onChange(updateProject(data, index, { githubUrl: e.target.value }))}
          />
          <button
            type="button"
            onClick={() =>
              onChange({
                ...data,
                projects: data.projects.filter((_, i) => i !== index),
              })
            }
            style={{ marginTop: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Arial', fontSize: 11 }}
          >
            {isTr ? 'Sil' : 'Remove'}
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...data, projects: [...data.projects, emptyProject] })}
        style={{ marginBottom: 24, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Arial', fontSize: 12 }}
      >
        {isTr ? 'Proje Ekle' : 'Add Project'}
      </button>

      <h2 style={{ marginTop: 24 }}>{isTr ? 'Sertifikalar' : 'Certifications'}</h2>
      {data.certifications.map((cert, index) => (
        <div key={index} style={{ border: '1px solid #666', padding: 12, marginBottom: 12 }}>
          <label>{isTr ? 'Sertifika Adı' : 'Name'}</label>
          <input
            value={cert.name}
            placeholder={isTr ? 'Örn. AWS Certified Developer' : 'e.g. AWS Certified Developer'}
            onChange={(e) => onChange(updateCertification(data, index, { name: e.target.value }))}
          />
          <label>{isTr ? 'Kurum' : 'Issuer'}</label>
          <input
            value={cert.issuer}
            placeholder={isTr ? 'Örn. Amazon' : 'e.g. Amazon'}
            onChange={(e) => onChange(updateCertification(data, index, { issuer: e.target.value }))}
          />
          <label>{isTr ? 'Tarih' : 'Date'}</label>
          <input
            value={cert.date}
            placeholder={isTr ? 'Örn. 2025' : 'e.g. 2025'}
            onChange={(e) => onChange(updateCertification(data, index, { date: e.target.value }))}
          />
          <button
            type="button"
            onClick={() =>
              onChange({
                ...data,
                certifications: data.certifications.filter((_, i) => i !== index),
              })
            }
            style={{ marginTop: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Arial', fontSize: 11 }}
          >
            {isTr ? 'Sil' : 'Remove'}
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...data, certifications: [...data.certifications, emptyCertification] })}
        style={{ marginBottom: 24, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Arial', fontSize: 12 }}
      >
        {isTr ? 'Sertifika Ekle' : 'Add Certification'}
      </button>
    </div>
  );
}
