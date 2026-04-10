import type { CVData } from '../types/cv.types';
import { defaultCV } from './defaultCV';
import { normalizeCvData } from '../utils/cvDataNormalize';

export interface CvTemplateMeta {
  id: string;
  labelTr: string;
  labelEn: string;
  descriptionTr: string;
  descriptionEn: string;
  build: () => CVData;
}

const blank = (): CVData => normalizeCvData(structuredClone(defaultCV));

const developer = (): CVData =>
  normalizeCvData({
    ...structuredClone(defaultCV),
    personalInfo: {
      fullName: 'Alex Morgan',
      title: 'Senior Full Stack Developer',
      phone: '+44 7700 900000',
      email: 'alex.morgan@email.com',
      linkedin: 'https://www.linkedin.com/in/alexmorgan',
      github: 'https://github.com/alexmorgan',
      location: 'London, UK',
    },
    summary:
      'Product-minded engineer with 6+ years shipping web platforms. Focus on TypeScript, React, and reliable APIs. Enjoy mentoring and measurable impact on performance and conversion.',
    skills: {
      general: 'System design, code review, mentoring, agile delivery',
      languages: 'TypeScript, JavaScript, Python',
      frontend: 'React, Vite, Tailwind CSS, accessibility',
      backend: 'Node.js, REST, GraphQL basics',
      databases: 'PostgreSQL, Redis',
      tools: 'Git, Docker, GitHub Actions, observability',
    },
    experience: [
      {
        company: 'Northwind Labs',
        position: 'Senior Software Engineer',
        dateRange: '03/2022 – present',
        location: 'Hybrid',
        responsibilities: [
          'Led migration to a modular React + TypeScript frontend; reduced bundle size by ~35%.',
          'Introduced contract tests between services; cut production incidents related to API drift.',
          'Mentored two junior developers through structured pairing and quarterly goals.',
        ],
        technologies: 'React, TypeScript, Node.js, PostgreSQL, AWS',
      },
      {
        company: 'Blue Harbor Digital',
        position: 'Full Stack Developer',
        dateRange: '06/2019 – 02/2022',
        location: 'Remote',
        responsibilities: [
          'Built customer dashboards with role-based access and exportable reports.',
          'Owned on-call rotation for billing microservice; improved MTTR with runbooks.',
        ],
        technologies: 'Vue, Node.js, MongoDB, Stripe',
      },
    ],
    education: [
      {
        institution: 'University of Bristol',
        degree: 'BSc Computer Science',
        graduationDate: '07/2019',
        gpa: 'First Class Honours',
      },
    ],
    projects: [
      {
        name: 'Open metrics CLI',
        description: 'CLI to aggregate CI timings for small teams; published on npm.',
        technologies: 'TypeScript, Node.js',
        githubUrl: 'https://github.com/example/metrics-cli',
      },
    ],
    certifications: [
      { name: 'AWS Certified Developer – Associate', issuer: 'Amazon Web Services', date: '2024' },
    ],
  });

const contentMediaTr = (): CVData =>
  normalizeCvData({
    ...structuredClone(defaultCV),
    personalInfo: {
      fullName: 'Efe Dağ',
      title: 'İçerik Yöneticisi & Dijital Üretim',
      phone: '+90 5xx xxx xx xx',
      email: 'efe.ornek@email.com',
      linkedin: 'https://www.linkedin.com/in/...',
      github: '',
      location: 'İstanbul, Türkiye',
    },
    summary:
      'Marka sesini güçlendiren, veri ve yaratıcılığı bir arada kullanan içerik profesyoneli. Sosyal medya, video ve kampanya takvimlerinde uçtan uca süreç yönetimi.',
    skills: {
      general: 'Ekip koordinasyonu, analitik düşünme, deadline yönetimi',
      languages: 'Türkçe (ana dil), İngilizce (B2)',
      frontend: '',
      backend: '',
      databases: '',
      tools: 'Photoshop, CapCut, Canva, AI araçları, Meta Business Suite',
    },
    experience: [
      {
        company: 'HULOG Medya',
        position: 'İçerik Yöneticisi',
        dateRange: '01/2023 – devam',
        location: 'İstanbul',
        responsibilities: [
          'Marka hedeflerine uygun içerik takvimleri ve çok kanallı yayın stratejileri oluşturmak.',
          'Video ve görsel üretim süreçlerini koordine ederek kalite ve teslim tarihlerini takip etmek.',
          'Performans raporlarını yorumlayarak içerik optimizasyonu önerileri sunmak.',
        ],
        technologies: 'Sosyal platformlar, analitik paneller',
      },
    ],
    education: [
      {
        institution: 'Örnek Üniversitesi',
        degree: 'İletişim Fakültesi / Halkla İlişkiler',
        graduationDate: '06/2021',
        gpa: '3.45 / 4.00',
      },
    ],
    projects: [
      {
        name: 'Kampanya: Ürün lansmanı',
        description: '30 günlük omnichannel kampanya; organik erişimde %40 artış.',
        technologies: 'Instagram, TikTok, e-posta',
        githubUrl: '',
      },
    ],
    certifications: [],
  });

export const CV_TEMPLATES: CvTemplateMeta[] = [
  {
    id: 'blank',
    labelTr: 'Boş şablon',
    labelEn: 'Blank',
    descriptionTr: 'Tüm alanlar sıfırdan; tek boş deneyim satırı.',
    descriptionEn: 'Empty fields with one experience row to start.',
    build: blank,
  },
  {
    id: 'developer',
    labelTr: 'Yazılım / teknik',
    labelEn: 'Software / technical',
    descriptionTr: 'İngilizce örnek metinlerle dolu teknik CV.',
    descriptionEn: 'English sample CV for engineering roles.',
    build: developer,
  },
  {
    id: 'content-tr',
    labelTr: 'İçerik & medya (TR)',
    labelEn: 'Content & media (TR)',
    descriptionTr: 'Türkçe içerik, sosyal medya ve üretim odaklı örnek.',
    descriptionEn: 'Turkish sample focused on content and social.',
    build: contentMediaTr,
  },
];
