import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CityScene } from "./scenes/CityScene";
import { FinanceIconsScene } from "./scenes/FinanceIconsScene";
import { AgreementCardsScene } from "./scenes/AgreementCardsScene";
import { ProductFlowScene } from "./scenes/ProductFlowScene";
import { TradingScene } from "./scenes/TradingScene";
import { VerificationScene } from "./scenes/VerificationScene";
import { HourglassScene } from "./scenes/HourglassScene";
import { ArrowTransition } from "./scenes/ArrowTransition";
import { EndCard } from "./scenes/EndCard";

/**
 * RobinhoodExplainer
 * High-fidelity 1920x1080 30fps 39s (1170 frames) programmatic Remotion video composition.
 */
export const RobinhoodExplainer: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* SCENE 1 — FUTURISTIC GREEN CITY (0:00 – 0:04) */}
      <Sequence from={0} durationInFrames={120} name="Scene 1 - City">
        <CityScene />
      </Sequence>

      {/* SCENE 2 — DARK FINANCE ICON MONTAGE (0:04 – 0:09.2) */}
      <Sequence from={120} durationInFrames={156} name="Scene 2 - Finance Icons">
        <FinanceIconsScene />
      </Sequence>

      {/* SCENE 3 — NEON LIME UI CARDS (0:09.2 – 0:13.2) */}
      <Sequence from={276} durationInFrames={121} name="Scene 3 - Agreement Cards">
        <AgreementCardsScene />
      </Sequence>

      {/* SCENE 4 — WHITE PRODUCT / APPROVAL FLOW (0:13.2 – 0:22.9) */}
      <Sequence from={397} durationInFrames={293} name="Scene 4 - Product Flow">
        <ProductFlowScene />
      </Sequence>

      {/* SCENE 5 — DARK TRADING / FINANCE VISUALIZATION (0:22.9 – 0:27.9) */}
      <Sequence from={690} durationInFrames={146} name="Scene 5 - Trading & Wallet">
        <TradingScene />
      </Sequence>

      {/* SCENE 6 — IDENTITY / VERIFICATION FLOW (0:27.9 – 0:31.0) */}
      <Sequence from={836} durationInFrames={94} name="Scene 6 - Verification Flow">
        <VerificationScene />
      </Sequence>

      {/* SCENE 7 — HOURGLASS / PROCESSING (0:31.0 – 0:35.7) */}
      <Sequence from={930} durationInFrames={141} name="Scene 7 - Hourglass">
        <HourglassScene />
      </Sequence>

      {/* SCENE 8 — ARROW PATTERN TRANSITION (0:35.7 – 0:36.1) */}
      <Sequence from={1071} durationInFrames={12} name="Scene 8 - Arrow Wipe">
        <ArrowTransition />
      </Sequence>

      {/* SCENE 9 — END CARD (0:36.1 – 0:39.0) */}
      <Sequence from={1083} durationInFrames={87} name="Scene 9 - End Card">
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};
