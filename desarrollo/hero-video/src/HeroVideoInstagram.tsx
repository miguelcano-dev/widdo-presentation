import { AbsoluteFill, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene1ChaosIG } from "./components/instagram/Scene1ChaosIG";
import { Scene2TransformationIG } from "./components/instagram/Scene2TransformationIG";
import { Scene3DashboardIG } from "./components/instagram/Scene3DashboardIG";
import { SceneModulesIG } from "./components/instagram/SceneModulesIG";
import { SceneBeneficiariesIG } from "./components/instagram/SceneBeneficiariesIG";
import { Scene4LoopIG } from "./components/instagram/Scene4LoopIG";
import { COLORS } from "./colors";

export const HeroVideoInstagram: React.FC = () => {
  const { fps } = useVideoConfig();

  // Scene durations in frames (same timing as main video)
  const scene1Duration = 5 * fps;
  const scene2Duration = 3.5 * fps;
  const scene3Duration = 10 * fps;
  const sceneModulesDuration = 5 * fps;
  const sceneBeneficiariesDuration = 5 * fps;
  const scene4Duration = 4 * fps;

  const transitionDuration = Math.round(0.5 * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgDark }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={scene1Duration}>
          <Scene1ChaosIG />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        <TransitionSeries.Sequence durationInFrames={scene2Duration}>
          <Scene2TransformationIG />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        <TransitionSeries.Sequence durationInFrames={scene3Duration}>
          <Scene3DashboardIG />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        <TransitionSeries.Sequence durationInFrames={sceneModulesDuration}>
          <SceneModulesIG />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        <TransitionSeries.Sequence durationInFrames={sceneBeneficiariesDuration}>
          <SceneBeneficiariesIG />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionDuration })}
        />

        <TransitionSeries.Sequence durationInFrames={scene4Duration}>
          <Scene4LoopIG />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
