import { defaultCV } from '../data/defaultCV';
import type { AppPersistedStateV1, CvProfile } from '../types/appState.types';
import { normalizeCvData } from '../utils/cvDataNormalize';

const STORAGE_KEY = 'cv-generator-app-v1';
const LEGACY_CV_KEY = 'cv-generator-cv-data';

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDefaultPersistedState(): AppPersistedStateV1 {
  const id = newId();
  return {
    version: 1,
    profiles: [
      {
        id,
        name: 'CV 1',
        data: normalizeCvData(structuredClone(defaultCV)),
      },
    ],
    activeProfileId: id,
    ui: { theme: 'light', previewMargin: 'normal' },
  };
}

function parseStored(raw: string | null): AppPersistedStateV1 | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== 'object') return null;
    const v = o as Record<string, unknown>;
    if (v.version !== 1) return null;
    if (!Array.isArray(v.profiles) || v.profiles.length === 0) return null;
    if (typeof v.activeProfileId !== 'string') return null;
    const profiles: CvProfile[] = v.profiles
      .filter((p): p is CvProfile => {
        return (
          !!p &&
          typeof p === 'object' &&
          typeof (p as CvProfile).id === 'string' &&
          typeof (p as CvProfile).name === 'string' &&
          typeof (p as CvProfile).data === 'object'
        );
      })
      .map((p) => ({
        ...p,
        data: normalizeCvData(p.data as import('../types/cv.types').CVData),
      }));
    if (!profiles.length) return null;
    const ui = v.ui as AppPersistedStateV1['ui'] | undefined;
    return {
      version: 1,
      profiles,
      activeProfileId: profiles.some((p) => p.id === v.activeProfileId)
        ? (v.activeProfileId as string)
        : profiles[0].id,
      ui: {
        theme: ui?.theme === 'dark' ? 'dark' : 'light',
        previewMargin:
          ui?.previewMargin === 'compact' || ui?.previewMargin === 'spacious'
            ? ui.previewMargin
            : 'normal',
      },
    };
  } catch {
    return null;
  }
}

/** Eski tek-CV anahtarından tek profillik state üret */
function migrateLegacyCv(): AppPersistedStateV1 | null {
  try {
    const raw = localStorage.getItem(LEGACY_CV_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as import('../types/cv.types').CVData;
    if (!data?.personalInfo) return null;
    const id = newId();
    const state: AppPersistedStateV1 = {
      version: 1,
      profiles: [{ id, name: 'CV 1', data: normalizeCvData(data) }],
      activeProfileId: id,
      ui: { theme: 'light', previewMargin: 'normal' },
    };
    localStorage.removeItem(LEGACY_CV_KEY);
    return state;
  } catch {
    return null;
  }
}

export function loadPersistedState(): AppPersistedStateV1 {
  const parsed = parseStored(localStorage.getItem(STORAGE_KEY));
  if (parsed) return parsed;
  const migrated = migrateLegacyCv();
  if (migrated) {
    savePersistedState(migrated);
    return migrated;
  }
  const fresh = createDefaultPersistedState();
  savePersistedState(fresh);
  return fresh;
}

export function savePersistedState(state: AppPersistedStateV1): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}
