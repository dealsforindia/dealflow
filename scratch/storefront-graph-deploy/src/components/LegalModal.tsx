import { useModalSurface } from '../utils/useModalSurface';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconClose, IconShieldCheck, IconCheck, IconDocument, IconInfo, IconExternalLink } from './Icons';

export type LegalDocType = 'disclosure' | 'verify' | 'terms' | 'privacy' | null;

interface LegalModalProps {
  type: LegalDocType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const modalSurface = useModalSurface(!!type, onClose);

  if (!type) return null;

  return createPortal(
    <div ref={modalSurface}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '640px',
          maxHeight: 'min(88vh, calc(100dvh - 2rem))',
          overscrollBehavior: 'contain',
          backgroundColor: 'var(--bg-surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          textAlign: 'left',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconShieldCheck size={16} color="#2563EB" />
            <h2
              id="legal-modal-title"
              style={{
                fontSize: '15px',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {type === 'disclosure' && 'Affiliate Disclosure'}
              {type === 'verify' && 'How Deals Are Verified'}
              {type === 'terms' && 'Terms of Service'}
              {type === 'privacy' && 'Privacy Policy'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              padding: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'none',
            }}
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
          }}
        >
          {/* AFFILIATE DISCLOSURE */}
          {type === 'disclosure' && (
            <>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-raised)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '2px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                }}
              >
                IndiaDealHunts operates on complete transparency. Our service is free to use and sustained through retail partner commissions.
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Amazon Associates Program
                </h4>
                <p>
                  IndiaDealHunts is a participant in the Amazon Associates Program. As an Amazon Associate, we earn from qualifying purchases. When you click an Amazon link on our site and make a purchase, we may receive a commission at zero additional cost to you. The price you pay is completely unchanged.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Flipkart and EarnKaro Affiliate Networks
                </h4>
                <p>
                  We participate in the Flipkart Affiliate Program and partner networks including EarnKaro. When you purchase items on Flipkart, Myntra, Ajio, Swiggy, or Croma through our links, we may receive referral compensation.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Editorial Independence
                </h4>
                <p>
                  Affiliate conversion may be applied to outbound links. The directory, reference prices and historical evidence are separate signals; an affiliate link does not prove a discount or product authenticity.
                </p>
              </div>
            </>
          )}

          {/* VERIFY METHODOLOGY */}
          {type === 'verify' && (
            <>
              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  1. Multi-Channel Signal Verification
                </h4>
                <p>
                  Directory offers come from the deal feed. Where multiple sources report an offer, a consensus count may be shown. Repeated reports do not independently prove a price or purchase.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  2. Inflation Filter
                </h4>
                <p>
                  MRP discounts are reference comparisons, not price-history verdicts. The product inspector shows supplied historical observations and their dates where available. Without enough observations, it asks you to verify first.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  3. Direct Merchant Landing
                </h4>
                <p>
                  Offer links open a merchant or an affiliate redirect. Directory redirects are resolved through the public storefront; if a usable destination cannot be retrieved, an unavailable-offer page is shown. Confirm the destination, final price and availability before purchasing.
                </p>
              </div>
            </>
          )}

          {/* TERMS OF SERVICE */}
          {type === 'terms' && (
            <>
              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  1. Service Nature
                </h4>
                <p>
                  IndiaDealHunts is an automated deal aggregator and price comparison discovery tool. We do not sell products directly. All transactions occur on third-party merchant sites (Amazon, Flipkart, etc.).
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  2. Pricing and Stock Availability
                </h4>
                <p>
                  Prices and stock availability can change. Directory and search listings are source-reported observations, not a guarantee of the current checkout price. A current-price check is shown only when dated merchant product-page evidence is available. Confirm the final price, seller, variant and availability at the merchant.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  3. Limitation of Liability
                </h4>
                <p>
                  IndiaDealHunts is not responsible for product warranties, fulfillment, shipping delays, or refund disputes. All customer support requests regarding orders must be directed to the respective retail merchant.
                </p>
              </div>
            </>
          )}

          {/* PRIVACY POLICY */}
          {type === 'privacy' && (
            <>
              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  1. Browsing and Optional Submissions
                </h4>
                <p>
                  You can browse and search without an account. If you choose to send a message, submit a deal, share a shopper report or register an alert, the information you enter is sent to the service handling that request. Shopper reports may appear publicly; include only information you want to share.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  2. Local Storage and Preferences
                </h4>
                <p>
                  Theme preferences, saved offers and other shopping preferences are stored in your browser. Search queries and product links are sent to the lookup service when you use those features. You can remove locally saved preferences by clearing this site's browser storage.
                </p>
              </div>

              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  3. Outbound Links and Third-Party Cookies
                </h4>
                <p>
                  When navigating to external retailer websites via deal links, third-party affiliate networks may set tracking cookies according to their respective privacy policies to credit referral commissions.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 18px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#FFFFFF',
              backgroundColor: '#0F172A',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
