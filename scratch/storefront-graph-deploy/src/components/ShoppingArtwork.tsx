import React, { useId } from 'react';

// Original vector artwork; decorative, with no product or savings claims.
export function ShoppingArtwork({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return <svg className={`shopping-artwork ${className}`} width="160" height="132" viewBox="0 0 160 132" fill="none" aria-hidden="true">
    <defs><linearGradient id={`${id}bag`} x1="30" y1="30" x2="110" y2="120" gradientUnits="userSpaceOnUse"><stop stopColor="#719be6" /><stop offset="1" stopColor="#234678" /></linearGradient><linearGradient id={`${id}paper`} x1="100" y1="26" x2="134" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#f3f7ff" /><stop offset="1" stopColor="#afc5e8" /></linearGradient><linearGradient id={`${id}gold`} x1="38" y1="36" x2="63" y2="63" gradientUnits="userSpaceOnUse"><stop stopColor="#eaca95" /><stop offset="1" stopColor="#bd8d48" /></linearGradient></defs>
    <ellipse cx="83" cy="117" rx="61" ry="8" fill="currentColor" opacity=".07" />
    <path d="M38 47L91 37L110 47L104 108L49 117L28 105L38 47Z" fill={`url(#${id}bag)`} />
    <path d="M91 37L110 47L104 108L89 100L91 37Z" fill="#294f84" />
    <path d="M38 47L91 37L90 99L49 110L38 47Z" fill="#6d96d4" opacity=".24" />
    <path d="M53 53V37C53 18 81 14 81 35V49" stroke="#2b4c78" strokeWidth="7" strokeLinecap="round" />
    <path d="M53 51V36C53 19 80 15 80 35" stroke="#a0b8dc" strokeWidth="3" strokeLinecap="round" />
    <rect x="87" y="40" width="55" height="65" rx="9" transform="rotate(8 87 40)" fill="#0c2548" opacity=".16" />
    <rect x="85" y="32" width="55" height="65" rx="9" transform="rotate(8 85 32)" fill={`url(#${id}paper)`} stroke="#f2f6fc" strokeWidth="1.5" />
    <path d="M92 49L127 54M91 58L110 61" stroke="#7b9ac1" strokeWidth="3" strokeLinecap="round" opacity=".5" />
    <path d="M92 81L102 72L112 77L125 65" stroke="#355f96" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><path d="M117 65H125V73" stroke="#355f96" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="43" cy="90" r="19" fill={`url(#${id}gold)`} stroke="#e3c394" strokeWidth="2" />
    <path d="M39 99L47 81" stroke="#fff7e7" strokeWidth="2.5" strokeLinecap="round" /><circle cx="37" cy="85" r="2" stroke="#fff7e7" strokeWidth="2" /><circle cx="49" cy="95" r="2" stroke="#fff7e7" strokeWidth="2" />
    <path d="M127 20V28M123 24H131M21 57V63M18 60H24" stroke="#adc0da" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}
