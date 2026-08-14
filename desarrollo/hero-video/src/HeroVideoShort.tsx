import { Composition } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { SceneBeneficiariesIG } from "./components/instagram/SceneBeneficiariesIG";
import { Scene4LoopIG } from "./components/instagram/Scene4LoopIG";

const TRANSITION_DURATION = 15;

export const HeroVideoShort: React.FC = () => {
  return (
    <TransitionSeries>
      {/* Escena 1: Flujo hacia Widdo - Ecosistema */}
      <TransitionSeries.Sequence durationInFrames={5 * 30}>
        <SceneBeneficiariesIG />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />

      {/* Escena 2: CTA Final */}
      <TransitionSeries.Sequence durationInFrames={7 * 30}>
        <Scene4LoopIG />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
