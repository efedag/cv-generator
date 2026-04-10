/** Önizlemede kişisel bilgiden sonra gelen bölümlerin sırası */
export type CvSectionId =
  | 'summary'
  | 'skills'
  | 'experience'
  | 'education'
  | 'projects'
  | 'certifications';

export const DEFAULT_SECTION_ORDER: CvSectionId[] = [
  'summary',
  'skills',
  'experience',
  'education',
  'projects',
  'certifications',
];

export interface PersonalInfo {
  fullName: string;
  title: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  location: string;
}

export interface Skills {
  general: string;
  languages: string;
  frontend: string;
  backend: string;
  databases: string;
  tools: string;
}

export interface ExperienceItem {
  company: string;
  position: string;
  dateRange: string;
  location: string;
  responsibilities: string[];
  technologies: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  graduationDate: string;
  gpa: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string;
  githubUrl: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  date: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  summary: string;
  skills: Skills;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  /** Yoksa {@link DEFAULT_SECTION_ORDER} kullanılır */
  sectionOrder?: CvSectionId[];
}
