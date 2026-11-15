import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { Checkmark } from "../components/Checkmark";
import { Phone } from "../components/Phone";
import { PersonIcon } from "../components/PersonIcon";
import { FloatingParticles } from "../components/FloatingParticles";

export const ProductFlowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ========================================================
  // SUB-ACTION 1: GREEN CHECKMARK (Frames 0 to 60)
  // ========================================================
  const checkmarkExit = interpolate(frame, [48, 60], [0, -450], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const checkmarkOpacity = interpolate(frame, [48, 60], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ========================================================
  // SUB-ACTION 2: ISOMETRIC PHONE (Frames 52 to 125)
  // ========================================================
  const phone1Frame = Math.max(0, frame - 52);
  const phone1Spring = spring({
    frame: phone1Frame,
    fps,
    config: { damping: 13, stiffness: 85, mass: 0.9 },
  });
  const phone1EnterX = interpolate(phone1Spring, [0, 1], [400, 0]);
  const phone1EnterY = interpolate(phone1Spring, [0, 1], [250, 0]);
  const phone1Rotate = interpolate(phone1Spring, [0, 1], [-18, -8]);
  const phone1ExitY = interpolate(frame, [112, 125], [0, -500], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phone1Opacity = interpolate(frame, [52, 60, 115, 125], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ========================================================
  // SUB-ACTION 3: BLACK CARD UI (Frames 118 to 185)
  // ========================================================
  const cardFrame = Math.max(0, frame - 118);
  const cardSpring = spring({
    frame: cardFrame,
    fps,
    config: { damping: 13, stiffness: 85, mass: 0.9 },
  });
  const cardEnterX = interpolate(cardSpring, [0, 1], [400, 0]);
  const cardEnterY = interpolate(cardSpring, [0, 1], [200, 0]);
  const cardExitX = interpolate(frame, [172, 185], [0, -500], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardOpacity = interpolate(frame, [118, 126, 175, 185], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ========================================================
  // SUB-ACTION 4: PROFILE PHONE & GOLD SPARKLES (Frames 178 to 245)
  // ========================================================
  const phone2Frame = Math.max(0, frame - 178);
  const phone2Spring = spring({
    frame: phone2Frame,
    fps,
    config: { damping: 13, stiffness: 85, mass: 0.9 },
  });
  const phone2EnterY = interpolate(phone2Spring, [0, 1], [350, 0]);
  const phone2ExitX = interpolate(frame, [232, 245], [0, -450], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phone2Opacity = interpolate(frame, [178, 186, 235, 245], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gold sparkle particles around profile phone
  const goldSparkles = [
    { x: 740, y: 320, size: 28, color: "#F59E0B", shape: "star" as const, delay: 0 },
    { x: 1140, y: 340, size: 24, color: "#FFD028", shape: "star" as const, delay: 5 },
    { x: 720, y: 520, size: 20, color: "#F59E0B", shape: "star" as const, delay: 10 },
    { x: 1160, y: 580, size: 26, color: "#FFD028", shape: "star" as const, delay: 15 },
    { x: 960, y: 220, size: 30, color: "#CCFF00", shape: "star" as const, delay: 8 },
  ];

  // ========================================================
  // SUB-ACTION 5: GREEN CUSTOMER FIGURE (Frames 238 to 293)
  // ========================================================
  const figureFrame = Math.max(0, frame - 238);
  const figureSpring = spring({
    frame: figureFrame,
    fps,
    config: { damping: 13, stiffness: 90, mass: 0.9 },
  });
  const figureEnterY = interpolate(figureSpring, [0, 1], [350, 0]);
  const figureExitY = interpolate(frame, [280, 293], [0, -400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const figureOpacity = interpolate(frame, [238, 246, 285, 293], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Transition into Scene 5 Dark Background at the very end
  const darkTransition = interpolate(frame, [284, 293], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 1. LARGE GREEN CHECKMARK */}
      {frame < 60 && (
        <div
          style={{
            position: "absolute",
            transform: `translateX(${checkmarkExit}px)`,
            opacity: checkmarkOpacity,
          }}
        >
          <Checkmark frame={frame} fps={fps} size={220} />
        </div>
      )}

      {/* 2. ISOMETRIC SMARTPHONE */}
      {phone1Opacity > 0 && (
        <div
          style={{
            position: "absolute",
            transform: `translate(${phone1EnterX}px, ${phone1EnterY + phone1ExitY}px) rotate(${phone1Rotate}deg)`,
            opacity: phone1Opacity,
          }}
        >
          <Phone variant="isometric" frame={phone1Frame} fps={fps} />
        </div>
      )}

      {/* 3. MATTE BLACK TITANIUM CARD UI */}
      {cardOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            transform: `translate(${cardEnterX + cardExitX}px, ${cardEnterY}px) rotate(-4deg)`,
            opacity: cardOpacity,
          }}
        >
          <Phone variant="blackCard" frame={cardFrame} fps={fps} />
        </div>
      )}

      {/* 4. VERTICAL GREEN PROFILE PHONE WITH GOLD SPARKLES */}
      {phone2Opacity > 0 && (
        <div
          style={{
            position: "absolute",
            transform: `translate(${phone2ExitX}px, ${phone2EnterY}px)`,
            opacity: phone2Opacity,
          }}
        >
          <FloatingParticles particles={goldSparkles} frame={phone2Frame} baseOpacity={0.95} />
          <Phone variant="profile" frame={phone2Frame} fps={fps} />
        </div>
      )}

      {/* 5. GEOMETRIC GREEN FIGURE ON CIRCULAR PLATFORM */}
      {figureOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            transform: `translate(0px, ${figureEnterY + figureExitY}px) scale(1.45)`,
            opacity: figureOpacity,
          }}
        >
          <PersonIcon variant="greenFigure" size={240} />
        </div>
      )}

      {/* Dark Transition into Scene 5 */}
      {darkTransition > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#07080A",
            opacity: darkTransition,
            pointerEvents: "none",
            zIndex: 100,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
