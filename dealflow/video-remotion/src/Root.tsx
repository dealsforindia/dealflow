import React from "react";
import { Composition } from "remotion";
import { DealShort } from "./DealShort";
import { DEFAULT_DEAL_PROPS } from "./types";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DealShort"
        component={DealShort}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={DEFAULT_DEAL_PROPS}
      />
    </>
  );
};
