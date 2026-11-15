import React from "react";
import { interpolate } from "remotion";

export interface ParticleItem {
  x: number;
  y: number;
  size: number;
  color: string;
  speed?: number;
  delay?: number;
  shape?: "circle" | "star" | "coin" | "plus";
}

interface FloatingParticlesProps {
  particles: ParticleItem[];
  frame: number;
  baseOpacity?: number;
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  particles,
  frame,
  baseOpacity = 1,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      {particles.map((p, i) => {
        const delay = p.delay || i * 3;
        const currentFrame = Math.max(0, frame - delay);
        const speed = p.speed || 1;
        
        // Gentle bobbing and floating
        const floatY = Math.sin((currentFrame * 0.08 * speed) + i) * 12;
        const floatX = Math.cos((currentFrame * 0.06 * speed) + i) * 8;
        const rotation = (currentFrame * speed * 2) % 360;

        const popScale = interpolate(currentFrame, [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        const opacity = interpolate(currentFrame, [0, 8], [0, baseOpacity], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              transform: `translate(${floatX}px, ${floatY}px) scale(${popScale}) rotate(${rotation}deg)`,
              opacity,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {p.shape === "star" ? (
              <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill={p.color}>
                <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
              </svg>
            ) : p.shape === "coin" ? (
              <div
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  borderRadius: "50%",
                  backgroundColor: p.color,
                  border: "2px solid #0F172A",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: `${p.size * 0.55}px`,
                  fontWeight: 900,
                  color: "#0F172A",
                }}
              >
                $
              </div>
            ) : p.shape === "plus" ? (
              <svg width={p.size} height={p.size} viewBox="0 0 20 20" stroke={p.color} strokeWidth="3">
                <line x1="10" y1="2" x2="10" y2="18" strokeLinecap="round" />
                <line x1="2" y1="10" x2="18" y2="10" strokeLinecap="round" />
              </svg>
            ) : (
              <div
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  borderRadius: "50%",
                  backgroundColor: p.color,
                  boxShadow: `0 0 ${p.size * 0.8}px ${p.color}`,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
