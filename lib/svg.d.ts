// lib/svg.d.ts
declare module '*.svg' {
  import React from 'react';
  const content: React.FC<React.SVGProps<SVGSVGElement>> | string;
  export default content;
}

declare module '*.svg?url' {
  const content: string;
  export default content;
}
