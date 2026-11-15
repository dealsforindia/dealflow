import './brand.css';

/** A vector mark stays crisp at navbar size and requires no WebGL runtime. */
export function BrandMark({ className = '' }: { className?: string }) {
  return <img className={`idh-brand-mark ${className}`} src="/brand/indiadealhunts-chakra-compact.svg" width="44" height="44" alt="" aria-hidden="true" />;
}
