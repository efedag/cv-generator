import type { CVData } from './cv.types';

export type ThemeMode = 'light' | 'dark';
export type PreviewMargin = 'compact' | 'normal' | 'spacious';

export interface CvProfile {
  id: string;
  name: string;
  data: CVData;
}

export interface AppPersistedStateV1 {
  version: 1;
  profiles: CvProfile[];
  activeProfileId: string;
  ui: {
    theme: ThemeMode;
    previewMargin: PreviewMargin;
  };
}
