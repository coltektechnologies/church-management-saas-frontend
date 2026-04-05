/**
 * Marketing /developers page — replace with your real team (photos, bios, links).
 * Photos: Unsplash portraits (license: https://unsplash.com/license).
 */

export type DeveloperProfile = {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  imageAlt: string;
  website?: string;
  linkedin?: string;
  github?: string;
  x?: string;
};

export const DEVELOPERS: DeveloperProfile[] = [
  {
    id: '1',
    name: 'Alex Mensah',
    role: 'Lead Full-Stack Engineer',
    bio: 'Architects core platform services and API design. Focused on reliability, security, and a smooth experience for churches of every size.',
    imageUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=85',
    imageAlt: 'Professional portrait',
    website: 'https://github.com/coltektechnologies',
    linkedin: 'https://www.linkedin.com/company/coltek-technologies',
    github: 'https://github.com/coltektechnologies',
    x: 'https://x.com/coltekdev',
  },
  {
    id: '2',
    name: 'Sarah Osei',
    role: 'Senior Frontend Developer',
    bio: 'Builds responsive dashboards and accessibility-first UI. Passionate about design systems that match brand voice across marketing and product.',
    imageUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=85',
    imageAlt: 'Professional portrait',
    website: 'https://github.com/coltektechnologies',
    linkedin: 'https://www.linkedin.com/company/coltek-technologies',
    github: 'https://github.com/coltektechnologies',
  },
  {
    id: '3',
    name: 'James Koomson',
    role: 'Senior Backend Developer',
    bio: 'Owns data models, integrations, and background workflows—from payments to notifications—so admins can trust every report and alert.',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=85',
    imageAlt: 'Professional portrait',
    website: 'https://github.com/coltektechnologies',
    github: 'https://github.com/coltektechnologies',
    linkedin: 'https://www.linkedin.com/company/coltek-technologies',
  },
  {
    id: '4',
    name: 'Ama Boateng',
    role: 'Product and UX Lead',
    bio: 'Turns church leadership feedback into flows that feel familiar. Bridges research, copy, and engineering so features ship with clarity.',
    imageUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=85',
    imageAlt: 'Professional portrait',
    website: 'https://github.com/coltektechnologies',
    linkedin: 'https://www.linkedin.com/company/coltek-technologies',
    x: 'https://x.com/coltekdev',
  },
];
