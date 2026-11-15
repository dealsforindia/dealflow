import React from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { ArrowPattern } from "../components/ArrowPattern";

export const ArrowTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <ArrowPattern frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};
