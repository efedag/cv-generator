# 📄 CV Generator

A modern, **ATS-friendly** CV/resume builder built with **React** and **TypeScript**. Everything runs in the browser: live preview, **Turkish / English** UI, structured sections, **multiple profiles** with **local persistence**, rich **export** options, and optional **PWA** install on supported browsers.

[![GitHub](https://img.shields.io/badge/GitHub-repo-181717?logo=github)](https://github.com/efedag/cv-generator)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

🔗 **Live demo:** https://cvgenetor.vercel.app/

📋 **Changelog:** [CHANGELOG.md](./CHANGELOG.md) · **Releases:** [GitHub Releases](https://github.com/efedag/cv-generator/releases)

---

## 🚀 Features

### Editing & content

- 📝 **Live preview** — the CV updates as you type
- 🌐 **Bilingual UI** — Turkish and English labels, placeholders, and section titles
- 👤 **Multiple profiles** — several named CVs; switch from the header bar
- 💾 **Auto-save** — versioned state in `localStorage` (per browser); **Ctrl+S / ⌘S** shows a short confirmation toast
- 📋 **Templates** — blank + sample CVs; apply from the form toolbar
- 🔁 **Section order** — reorder sections (summary, skills, experience, etc.); order is reflected in preview and exports
- ✅ **Soft validation** — hints for empty fields, email shape, and summary length

### Import

- 📥 **JSON** — import/export structured CV data
- 📄 **PDF** — **embedded payload** round-trip for PDFs downloaded from this app; older or external PDFs fall back to **text extraction** and **OCR** (Tesseract) when needed

### Export

- 📄 **PDF** — raster export via **html2pdf.js** (html2canvas + jsPDF); **print** path for searchable text
- 📝 **Word (.docx)** — via the `docx` library
- 📑 **Markdown** and **plain text**
- 🔤 **Smart filenames** — derived from the full name with Turkish character normalization (e.g. `Ömer Çelik` → `omer_celik.pdf`)

### Experience

- 🌓 **Dark theme** — editor chrome; preview “paper” stays light for readability
- 📐 **Preview margins** — compact / normal / spacious
- 📱 **Responsive** — two-column desktop layout; stacked layout on small screens
- ♿ **Accessibility** — skip link, associated labels on main controls, screen-reader-oriented copy where relevant
- 📲 **PWA** — web manifest + service worker in production builds (offline-friendly caching of same-origin assets)

---

## 🖼️ Screenshots

_Regenerate after UI changes: `npm run screenshots` (one-time: `npx playwright install chromium`)._

### Full overview — edit form & live preview

![Full overview](screenshots/full-overview.png)

### CV preview

![CV preview](screenshots/cv-preview.png)

### Edit form

![Edit form](screenshots/edit-form.png)

### Mobile view

![Mobile view](screenshots/mobile-view.png)

---

## 📦 Installation

```bash
git clone https://github.com/efedag/cv-generator.git
cd cv-generator
npm install
```

---

## ▶️ Usage

| Command | Description |
| --------| ------------|
| `npm run dev` | Dev server (default [http://localhost:5173](http://localhost:5173)) |
| `npm run build` | Typecheck + production bundle to `dist/` |
| `npm run preview` | Serve `dist/` locally (useful before deploy) |
| `npm run test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run screenshots` | Regenerate `screenshots/*.png` (Playwright) |

---

## 🔒 Data & privacy

- **No backend** — no account server; CV data stays in **this browser** unless you export files.
- Clearing site data or using another browser/device does **not** sync profiles; use **JSON export** as a backup.

---

## 🚢 Deployment (Vercel)

The repo includes [`vercel.json`](./vercel.json): Vite build output (`dist`), SPA fallback rewrite, and headers for `sw.js` / `manifest.webmanifest`. Connect the GitHub repository in the Vercel dashboard and deploy; production builds register the service worker automatically.

---

## 🧩 Project layout

```
cv-generator/
├── CHANGELOG.md
├── LICENSE
├── index.html
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── vercel.json
├── scripts/
│   └── capture-readme-screenshots.mjs   # Playwright → screenshots/*.png
├── public/
│   ├── icons.svg
│   ├── manifest.webmanifest
│   └── sw.js                            # Service worker (production)
├── screenshots/                         # README images
└── src/
    ├── main.tsx                         # Entry; SW registration in production
    ├── App.tsx
    ├── index.css
    ├── components/                      # EditForm, CVPreview, ExportBar, ProfileBar,
    │                                    # ThemeMarginControls, Toast, ValidationHints,
    │                                    # SectionOrderControls, PersonalInfo, Summary,
    │                                    # Skills, Experience, Education, Projects, Certifications
    ├── data/                            # defaultCV.ts, templates.ts
    ├── hooks/                           # useCvAppState.ts
    ├── i18n/                            # Section labels for reorder UI
    ├── storage/                         # cvAppStorage.ts (versioned localStorage)
    ├── types/                           # cv.types.ts, appState.types.ts
    └── utils/                           # PDF, DOCX, MD, JSON, validation, normalize, tests…
```

For a full file list, browse [`src/`](./src/) on GitHub.

---

## ⚙️ How it works

### Layout

CSS **Grid**: **left** — full edit form; **right** — live CV preview. On narrow viewports the layout stacks.

### CV sections

| Section | Description |
| --------| ------------|
| **Personal info** | Name, title, phone, email, LinkedIn, GitHub, location |
| **Summary** | Free-text professional summary |
| **Technical skills** | General + categorized lines (languages, frontend, backend, databases, tools) |
| **Experience** | Company, role, dates, location, bullets, technologies |
| **Education** | Institution, degree, dates, GPA |
| **Projects** | Name, description, stack, links |
| **Certifications** | Name, issuer, date |

### PDF export

**Download PDF** uses **html2pdf.js** to capture the `#cv-content` region as an A4 PDF. **Print** uses the browser print pipeline for text-friendly output. PDFs produced here can embed structured CV data for **accurate re-import**; other PDFs may use text/OCR heuristics.

### Language

UI strings switch between **Turkish** and **English** from the header; `document.documentElement.lang` is updated for accessibility.

---

## 🛠️ Tech stack

| Area | Technology |
| ---- | ----------|
| UI | React 19, TypeScript |
| Build | Vite 8 |
| PDF (raster) | html2pdf.js (html2canvas, jsPDF) |
| PDF (embed / parse) | pdf-lib |
| PDF text | pdf.js |
| OCR | Tesseract.js |
| Word | docx |
| Tests | Vitest |
| Screenshot automation | Playwright (dev) |
| Lint | ESLint 9, typescript-eslint |
| Deploy | Vercel (example) |

`tailwindcss` is listed in `package.json` but the UI is primarily **hand-written CSS** in `src/index.css`.

---

## 👨‍💻 Author

**Efe Dag**

---

## 📌 Notes

- Client-side only — suitable for static hosting.
- Designed for a **clean, single-column** CV preview suitable for many ATS parsers; always verify against the target job portal.

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE).

---

⭐ If you find this useful, consider starring the repository.
