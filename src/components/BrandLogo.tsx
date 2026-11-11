import React from 'react';
const logo = new URL('../assets/images/gradia-brand.png', import.meta.url).href;
/** Display crops preserve the supplied artwork; the original asset stays intact. */
export function BrandLogo({ variant = 'mark' }: { variant?: 'mark' | 'wordmark' | 'artwork' }) {
  return <span className={`gradia-brand gradia-brand-${variant}`}><img src={logo} alt="Gradia — AI Academic OS" draggable={false}/></span>;
}
