import type { CVData } from '../types/cv.types';
import { DEFAULT_SECTION_ORDER } from '../types/cv.types';

export const defaultCV: CVData = {
  personalInfo: {
    fullName: '',
    title: '',
    phone: '',
    email: '',
    linkedin: '',
    github: '',
    location: '',
  },
  summary: '',
  skills: {
    general: '',
    languages: '',
    frontend: '',
    backend: '',
    databases: '',
    tools: '',
  },
  experience: [
    {
      company: '',
      position: '',
      dateRange: '',
      location: '',
      responsibilities: [],
      technologies: '',
    },
  ],
  education: [
    {
      institution: '',
      degree: '',
      graduationDate: '',
      gpa: '',
    },
  ],
  projects: [
    {
      name: '',
      description: '',
      technologies: '',
      githubUrl: '',
    },
  ],
  certifications: [],
  sectionOrder: [...DEFAULT_SECTION_ORDER],
};
