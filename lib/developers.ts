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
    name: 'Boansi Kyeremateng Collins',
    role: 'Lead Backend Engineer',
    bio: 'Architects core platform services and API design. Focused on reliability, security, and a smooth experience for churches of every size.',
    imageUrl: '/team/ceo.jpg',
    imageAlt: 'Professional portrait',
    website: 'https://collins-site.onrender.com',
    linkedin: 'https://www.linkedin.com/in/boansi-kyeremateng-collins',
    github: 'https://github.com/profe-ssor',
    x: 'https://x.com/Profs123456',
  },
  {
    id: '2',
    name: 'Owusu Bonsu Frederick',
    role: 'Lead Frontend Engineer',
    bio: 'Builds responsive dashboards and accessibility-first UI. Passionate about design systems that match brand voice across marketing and product.',
    imageUrl: '/team/CTO.jpg',
    imageAlt: 'Professional portrait',
    website: 'https://dev-calling-card.netlify.app/',
    linkedin: 'https://www.linkedin.com/company/coltek-technologies',
    github: 'https://github.com/Owusu-Bonsu-Frederick',
    x: 'https://x.com/Profs123456',
  },
  {
    id: '3',
    name: 'Ampaabeng Kyeremeh Nancy',
    role: 'Frontend Developer',
    bio: 'Designs and builds modern, responsive and user-friendly interfaces focused on performance, accessibility, and smooth user experience.',
    imageUrl: '/team/nancy.png',
    imageAlt: 'Professional portrait',
    website: 'https://github.com/coltektechnologies',
    github: 'https://github.com/coltektechnologies',
    linkedin: 'https://www.linkedin.com/company/coltek-technologies',
  },
  {
    id: '4',
    name: 'Owusu Williams',
    role: 'UX Lead',
    bio: 'Turns church leadership feedback into flows that feel familiar. Bridges research, copy, and engineering so features ship with clarity.',
    imageUrl: '/team/william.jpg',
    imageAlt: 'Professional portrait',
    website: 'https://github.com/coltektechnologies',
    linkedin: 'https://www.linkedin.com/company/coltek-technologies',
    x: 'https://x.com/coltekdev',
  },
  {
    id: '5',
    name: 'Ernest Frimpong Opoku',
    role: 'Frontend Developer',
    bio: 'Designs and builds modern, responsive and user-friendly interfaces focused on performance, accessibility, and smooth user experience.',
    imageUrl: '/team/ernest.png',
    imageAlt: 'Professional portrait',
    github: 'https://github.com/oldcode-dev',
    linkedin: 'https://www.linkedin.com/in/ernest-opoku-3444b3206',
    x: 'https://x.com/Good_by_Grace',
  },
  {
    id: '6',
    name: 'Dominic Oppong',
    role: 'Lead Graphic Designer',
    bio: 'Creates engaging visual designs and brand assets that deliver clear, creative, and impactful user experiences.',
    imageUrl: '/team/nancy.png',
    imageAlt: 'Professional portrait',
    website: 'https://github.com/coltektechnologies',
    github: 'https://github.com/coltektechnologies',
    linkedin: 'https://www.linkedin.com/company/coltek-technologies',
  },
  {
    id: '7',
    name: 'Pius Donkor',
    role: 'Frontend Developer',
    bio: 'Designs and builds modern, responsive and user-friendly interfaces focused on performance, accessibility, and smooth user experience.',
    imageUrl: '/team/nancy.png',
    imageAlt: 'Professional portrait',
    github: 'https://github.com/oldcode-dev',
    linkedin: 'https://www.linkedin.com/in/ernest-opoku-3444b3206',
    x: 'https://x.com/Good_by_Grace',
  },
];
