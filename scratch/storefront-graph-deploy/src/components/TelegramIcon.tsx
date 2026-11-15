import type { SVGProps } from 'react';

/** The paper plane is legible even at small sizes; its container supplies the blue. */
export function TelegramIcon(props: SVGProps<SVGSVGElement>) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M21.44 3.1c.82-.3 1.54.2 1.27 1.46l-3.24 15.27c-.24 1.08-.88 1.34-1.78.83l-4.94-3.65-2.38 2.29c-.26.26-.48.48-.98.48l.35-5.03L18.9 6.5c.4-.35-.09-.55-.62-.2L6.93 13.45l-4.89-1.53c-1.06-.33-1.08-1.06.22-1.57Z" />
  </svg>;
}
