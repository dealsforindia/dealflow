import React, { lazy, Suspense, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RecoveryBoundary } from './RecoveryBoundary';
import { useModalSurface } from '../utils/useModalSurface';

const Tools = lazy(() => import('./tools/ToolsHubModal').then(module => ({ default: module.ToolsHubModal })));
type Props = React.ComponentProps<(typeof import('./tools/ToolsHubModal'))['ToolsHubModal']>;

function LoadingTools({ onClose }: { onClose: () => void }) {
  const surface = useModalSurface(true, onClose);
  return createPortal(<div className="commerce-sheet-backdrop" onClick={onClose}>
    <div ref={surface} className="commerce-product-sheet" role="dialog" aria-modal="true" aria-label="Loading shopping tools" onClick={event => event.stopPropagation()}>
      <header><div><small>YOUR SHOPPING TOOLS</small><h2 role="status">Opening your workspace…</h2></div><button type="button" aria-label="Close shopping tools" onClick={onClose}>✕</button></header>
      <p>Calculators and saved planning preferences will appear here.</p>
    </div>
  </div>, document.body);
}

/** Download the calculators on first use, then retain their state between opens. */
export function DeferredToolsHub(props: Props) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { if (props.isOpen) setLoaded(true); }, [props.isOpen]);
  if (!loaded && !props.isOpen) return null;
  return <RecoveryBoundary compact onRecover={props.onClose} resetKey={String(props.isOpen)}>
    <Suspense fallback={props.isOpen ? <LoadingTools onClose={props.onClose} /> : null}><Tools {...props} /></Suspense>
  </RecoveryBoundary>;
}
