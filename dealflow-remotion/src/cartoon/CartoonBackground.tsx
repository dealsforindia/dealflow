import React from 'react';

interface BackgroundProps {
  frame: number;
  isAlarmActive?: boolean;
}

export const CartoonBackground: React.FC<BackgroundProps> = ({
  frame,
  isAlarmActive = false,
}) => {
  // Flickering neon sign
  const neonFlicker = Math.sin(frame / 2) > 0.8 ? 0.4 : 1;
  const alarmFlash = isAlarmActive && Math.sin(frame / 3) > 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: alarmFlash ? '#3B0715' : '#0F172A',
        overflow: 'hidden',
        transition: 'background-color 0.15s ease',
      }}
    >
      {/* Wall Gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '75%',
          background: alarmFlash
            ? 'linear-gradient(180deg, #7F1D1D 0%, #450A0A 100%)'
            : 'linear-gradient(180deg, #1E1B4B 0%, #0F172A 70%, #1E293B 100%)',
        }}
      />

      {/* Ceiling Hanging Wires */}
      <svg
        width="1920"
        height="200"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <path d="M 0 0 Q 300 120 600 0" stroke="#38BDF8" strokeWidth="4" fill="none" opacity="0.6" />
        <path d="M 400 0 Q 750 140 1100 0" stroke="#F43F5E" strokeWidth="4" fill="none" opacity="0.6" />
        <path d="M 900 0 Q 1350 130 1800 0" stroke="#10B981" strokeWidth="4" fill="none" opacity="0.6" />
        <path d="M 1400 0 Q 1660 110 1920 0" stroke="#FBBF24" strokeWidth="4" fill="none" opacity="0.6" />
      </svg>

      {/* --- NEON SIGNBOARD (AI ADDA) --- */}
      <div
        style={{
          position: 'absolute',
          top: '35px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#090D16',
          border: '4px solid #F43F5E',
          borderRadius: '24px',
          padding: '12px 42px',
          boxShadow: isAlarmActive
            ? '0 0 50px #EF4444, inset 0 0 20px #DC2626'
            : `0 0 ${40 * neonFlicker}px #F43F5E, inset 0 0 15px #BE185D`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: '32px',
            fontWeight: 900,
            letterSpacing: '3px',
            color: '#FFF1F2',
            textShadow: '0 0 20px #FB7185, 0 0 40px #E11D48',
            fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive, sans-serif',
          }}
        >
          ☕ AI ADDA ⚡
        </div>
        <div
          style={{
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: '#38BDF8',
            textShadow: '0 0 10px #38BDF8',
          }}
        >
          24/7 UNLIMITED CHAI & TOKENS
        </div>
      </div>

      {/* --- SERVER RACKS (Left & Right) --- */}
      {/* Left Server Stack */}
      <div
        style={{
          position: 'absolute',
          left: '50px',
          top: '160px',
          width: '200px',
          height: '620px',
          backgroundColor: '#090D16',
          border: '4px solid #334155',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '10px 10px 30px rgba(0,0,0,0.6)',
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#1E293B',
              borderRadius: '8px',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #475569',
            }}
          >
            <div style={{ display: 'flex', gap: '6px' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor:
                    (frame + i * 15) % 30 > 15 ? '#10B981' : '#064E3B',
                  boxShadow: (frame + i * 15) % 30 > 15 ? '0 0 8px #10B981' : 'none',
                }}
              />
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor:
                    (frame + i * 22) % 40 > 20 ? '#38BDF8' : '#0369A1',
                  boxShadow: (frame + i * 22) % 40 > 20 ? '0 0 8px #38BDF8' : 'none',
                }}
              />
            </div>
            <div style={{ height: '4px', width: '70px', backgroundColor: '#334155', borderRadius: '2px' }} />
          </div>
        ))}
      </div>

      {/* Right Server Stack */}
      <div
        style={{
          position: 'absolute',
          right: '50px',
          top: '160px',
          width: '200px',
          height: '620px',
          backgroundColor: '#090D16',
          border: '4px solid #334155',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '-10px 10px 30px rgba(0,0,0,0.6)',
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#1E293B',
              borderRadius: '8px',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #475569',
            }}
          >
            <div style={{ height: '4px', width: '70px', backgroundColor: '#334155', borderRadius: '2px' }} />
            <div style={{ display: 'flex', gap: '6px' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor:
                    (frame + i * 18) % 35 > 17 ? '#F59E0B' : '#78350F',
                  boxShadow: (frame + i * 18) % 35 > 17 ? '0 0 8px #F59E0B' : 'none',
                }}
              />
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor:
                    (frame + i * 25) % 45 > 22 ? '#EC4899' : '#831843',
                  boxShadow: (frame + i * 25) % 45 > 22 ? '0 0 8px #EC4899' : 'none',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* --- CARTOON CHECKERBOARD FLOOR --- */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '260px',
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
          borderTop: '6px solid #475569',
          boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.5)',
        }}
      >
        <svg width="100%" height="100%" opacity="0.15">
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="#FFFFFF" />
            <rect x="40" y="40" width="40" height="40" fill="#FFFFFF" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* --- CHAI TAPRI TABLE WITH CHAI & SAMOSA --- */}
      <div
        style={{
          position: 'absolute',
          bottom: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '560px',
          height: '110px',
          backgroundColor: '#451A03',
          borderRadius: '24px 24px 12px 12px',
          border: '5px solid #78350F',
          boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 30px',
        }}
      >
        {/* Table Legs */}
        <div style={{ position: 'absolute', bottom: '-100px', left: '40px', width: '20px', height: '100px', backgroundColor: '#291002', border: '3px solid #78350F' }} />
        <div style={{ position: 'absolute', bottom: '-100px', right: '40px', width: '20px', height: '100px', backgroundColor: '#291002', border: '3px solid #78350F' }} />

        {/* Chai Glass 1 (Cutting Chai) */}
        <div style={{ position: 'relative', marginTop: '-60px' }}>
          {/* Steam */}
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              left: '12px',
              fontSize: '24px',
              opacity: 0.8,
              transform: `translateY(${Math.sin(frame / 4) * 6}px)`,
            }}
          >
            ♨️
          </div>
          {/* Glass */}
          <div
            style={{
              width: '42px',
              height: '56px',
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              border: '3px solid #E2E8F0',
              borderRadius: '6px 6px 12px 12px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Milk Chai Liquid */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '75%',
                backgroundColor: '#D97706',
                borderTop: '2px solid #FBBF24',
              }}
            />
          </div>
        </div>

        {/* Samosa Plate with Samosas */}
        <div style={{ position: 'relative', marginTop: '-45px' }}>
          {/* Plate */}
          <div
            style={{
              width: '120px',
              height: '32px',
              backgroundColor: '#E2E8F0',
              borderRadius: '50%',
              border: '3px solid #94A3B8',
              boxShadow: '0 6px 15px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {/* Samosa 1 */}
            <div style={{ fontSize: '26px', marginTop: '-12px' }}>🔺</div>
            {/* Samosa 2 */}
            <div style={{ fontSize: '26px', marginTop: '-14px' }}>🔺</div>
            {/* Green Chutney */}
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#16A34A', marginTop: '-4px' }} />
          </div>
        </div>

        {/* Chai Glass 2 (For GPT / Gemini) */}
        <div style={{ position: 'relative', marginTop: '-60px' }}>
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              left: '12px',
              fontSize: '24px',
              opacity: 0.8,
              transform: `translateY(${Math.cos(frame / 4) * 6}px)`,
            }}
          >
            ♨️
          </div>
          <div
            style={{
              width: '42px',
              height: '56px',
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              border: '3px solid #E2E8F0',
              borderRadius: '6px 6px 12px 12px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '80%',
                backgroundColor: '#D97706',
                borderTop: '2px solid #FBBF24',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
