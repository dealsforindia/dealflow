import React from "react";
import { Composition } from "remotion";
import { RobinhoodExplainer } from "./RobinhoodExplainer";
import { DealShort } from "./DealShort";
import { SevereTitanDrop } from "./SevereTitanDrop";
import { SatisfyingEgg } from "./SatisfyingEgg";
import { PhonkEggEdit } from "./PhonkEggEdit";
import { DEFAULT_DEAL_PROPS } from "./types";
import { RemotionHeadline } from "./RemotionHeadline";
import { HindiEpisodeHighEnd } from "./cartoon/HindiEpisodeHighEnd";
import { HindiEpisode } from "./cartoon/HindiEpisode";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PhonkEggEdit"
        component={PhonkEggEdit}
        durationInFrames={330}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="SatisfyingEgg"
        component={SatisfyingEgg}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SevereTitanDrop"
        component={SevereTitanDrop as any}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={DEFAULT_DEAL_PROPS}
      />
      <Composition
        id="RobinhoodExplainer"
        component={RobinhoodExplainer}
        durationInFrames={1170}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HindiCartoonEpisodeHighEnd"
        component={HindiEpisodeHighEnd}
        durationInFrames={2700}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HindiCartoonEpisode"
        component={HindiEpisode}
        durationInFrames={2700}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="RemotionHeadline"
        component={RemotionHeadline}
        durationInFrames={230}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DealShort"
        component={DealShort as any}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={DEFAULT_DEAL_PROPS}
      />
    </>
  );
};

