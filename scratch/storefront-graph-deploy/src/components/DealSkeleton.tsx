import React from 'react';

export const DealSkeleton: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Strict 4:3 Image placeholder matching PublicDealCard */}
      <div
        className="skeleton"
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          borderRadius: '10px',
        }}
      />

      {/* Metadata placeholder */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <div className="skeleton" style={{ width: '56px', height: '14px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '40px', height: '14px', borderRadius: '4px' }} />
      </div>

      {/* Title placeholder */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 4px' }}>
        <div className="skeleton" style={{ width: '95%', height: '15px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '65%', height: '15px', borderRadius: '4px' }} />
      </div>

      {/* Price block placeholder */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px', padding: '0 4px' }}>
        <div className="skeleton" style={{ width: '70px', height: '22px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '45px', height: '14px', borderRadius: '4px' }} />
        <div className="skeleton" style={{ width: '50px', height: '16px', marginLeft: 'auto', borderRadius: '4px' }} />
      </div>

      {/* Action button placeholder */}
      <div className="skeleton" style={{ width: '100%', height: '40px', marginTop: '6px', borderRadius: '10px' }} />
    </div>
  );
};

export const DealSkeletonGrid: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
      style={{ width: '100%' }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <DealSkeleton key={i} />
      ))}
    </div>
  );
};
