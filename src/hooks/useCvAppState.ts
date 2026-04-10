import { useCallback, useEffect, useState } from 'react';
import type { CVData } from '../types/cv.types';
import type { AppPersistedStateV1, PreviewMargin, ThemeMode } from '../types/appState.types';
import {
  createDefaultPersistedState,
  loadPersistedState,
  savePersistedState,
} from '../storage/cvAppStorage';
import { normalizeCvData } from '../utils/cvDataNormalize';

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useCvAppState() {
  const [state, setState] = useState<AppPersistedStateV1>(() => {
    try {
      return loadPersistedState();
    } catch {
      return createDefaultPersistedState();
    }
  });

  useEffect(() => {
    savePersistedState(state);
  }, [state]);

  const activeProfile =
    state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0];

  const setCvData = useCallback((data: CVData) => {
    const normalized = normalizeCvData(data);
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id === s.activeProfileId ? { ...p, data: normalized } : p
      ),
    }));
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => {
    setState((s) => ({ ...s, ui: { ...s.ui, theme } }));
  }, []);

  const setPreviewMargin = useCallback((previewMargin: PreviewMargin) => {
    setState((s) => ({ ...s, ui: { ...s.ui, previewMargin } }));
  }, []);

  const setActiveProfileId = useCallback((id: string) => {
    setState((s) => (s.profiles.some((p) => p.id === id) ? { ...s, activeProfileId: id } : s));
  }, []);

  const addProfile = useCallback((name?: string) => {
    const id = newId();
    const fresh = createDefaultPersistedState().profiles[0].data;
    setState((s) => ({
      ...s,
      profiles: [
        ...s.profiles,
        {
          id,
          name: name ?? `CV ${s.profiles.length + 1}`,
          data: normalizeCvData(structuredClone(fresh)),
        },
      ],
      activeProfileId: id,
    }));
  }, []);

  const renameProfile = useCallback((id: string, name: string) => {
    const n = name.trim() || 'CV';
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => (p.id === id ? { ...p, name: n } : p)),
    }));
  }, []);

  const removeProfile = useCallback((id: string) => {
    setState((s) => {
      if (s.profiles.length <= 1) return s;
      const nextProfiles = s.profiles.filter((p) => p.id !== id);
      let activeProfileId = s.activeProfileId;
      if (activeProfileId === id) activeProfileId = nextProfiles[0].id;
      return { ...s, profiles: nextProfiles, activeProfileId };
    });
  }, []);

  return {
    cvData: activeProfile.data,
    setCvData,
    profiles: state.profiles,
    activeProfileId: state.activeProfileId,
    setActiveProfileId,
    addProfile,
    renameProfile,
    removeProfile,
    theme: state.ui.theme,
    setTheme,
    previewMargin: state.ui.previewMargin,
    setPreviewMargin,
  };
}
