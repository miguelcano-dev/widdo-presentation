import { AbsoluteFill, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene1Chaos } from "./components/Scene1Chaos";
import { Scene2Transformation } from "./components/Scene2Transformation";
import { Scene3Dashboard } from "./components/Scene3Dashboard";
import { SceneModules } from "./components/SceneModules";
import { SceneBeneficiaries } from "./components/SceneBeneficiaries";
import { Scene4Loop } from "./components/Scene4Loop";
import { COLORS } from "./colors";

export const HeroVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  // Scene durations in frames
  const scene1Duration = 5 * fps; // 5 seconds - Chaos / Problem
  const scene2Duration = 3.5 * fps; // 3.5 seconds - Transformation / Logo reveal
  const scene3Duration = 10 * fps; // 10 seconds - Dashboard showcase (reduced)
  const sceneModulesDuration = 5 * fps; // 5 seconds - Module cards
  const sceneBeneficiariesDuration = 5 * fps; // 5 seconds - Beneficiaries connected
  const scene4Duration = 4 * fps; // 4 seconds - CTA / Final

  const transitionDuration = Math.round(0.5 * fps); // 0.5 second transitions

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgDark }}>
      <TransitionSeries>
        {/* Scene 1: The Chaos - Problem statement */}
        <TransitionSeries.Sequence durationInFrames={scene1Duration}>
          <Scene1Chaos />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 2: The Transformation - Logo reveal */}
        <TransitionSeries.Sequence durationInFrames={scene2Duration}>
          <Scene2Transformation />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 3: The Dashboard Solution */}
        <TransitionSeries.Sequence durationInFrames={scene3Duration}>
          <Scene3Dashboard />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 4: Module Cards */}
        <TransitionSeries.Sequence durationInFrames={sceneModulesDuration}>
          <SceneModules />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 5: Beneficiaries - Connected ecosystem */}
        <TransitionSeries.Sequence durationInFrames={sceneBeneficiariesDuration}>
          <SceneBeneficiaries />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        {/* Scene 6: CTA / Final */}
        <TransitionSeries.Sequence durationInFrames={scene4Duration}>
          <Scene4Loop />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
