# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-10

### Added

- Multiple CV profiles with versioned persistence via `localStorage` (`useCvAppState`, `storage/cvAppStorage`)
- Starter templates (blank + sample CVs) and **Reset** flow
- **JSON** import/export (wrapped payload + parsing helpers)
- **Word (.docx)**, **Markdown**, and **plain text** export
- Configurable **preview margins** and **dark theme** for the editor (preview “paper” stays light)
- **Section order** controls; order is reflected in preview and exports (`normalizeCvData`, `CvSectionId`)
- Soft **validation** and summary word-count hints (`cvValidation`)
- **Ctrl/Cmd+S** shortcut with a short “saved” toast
- **PWA**: `manifest.webmanifest`, production **service worker** (`public/sw.js`) with network-first caching
- **Vitest** unit tests for normalization, JSON helpers, and PDF embed roundtrip
- **Vercel** deployment config: SPA rewrite, cache headers for `sw.js`, manifest `Content-Type`
- Accessibility: skip link, labels/`htmlFor` on main fields, screen-reader helpers where needed
- New UI pieces: profile bar, theme/margin controls, export bar, validation panel, section reorder, toast

### Changed

- App shell and form/preview wiring updated for profiles, exports, theme, and hints
- PDF-related utilities reorganized (embed/parse helpers, text/OCR extract paths) alongside existing `html2pdf` flow

### Removed

- `useLocalStorage` hook (replaced by `useCvAppState` + versioned storage)

**Full Changelog**: https://github.com/efedag/cv-generator/compare/e171825...v1.0.0
