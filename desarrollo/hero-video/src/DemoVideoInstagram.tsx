import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { SceneIntro } from "./components/demo/SceneIntro";
import { SceneDashboard } from "./components/demo/SceneDashboard";
import { ScenePlayers } from "./components/demo/ScenePlayers";
import { ScenePayments } from "./components/demo/ScenePayments";
import { SceneCalendar } from "./components/demo/SceneCalendar";
import { SceneEnrollment } from "./components/demo/SceneEnrollment";
import { SceneMultiRole } from "./components/demo/SceneMultiRole";
import { SceneCTA } from "./components/demo/SceneCTA";

// Same timeline as DemoVideo, same components
// The scenes use AbsoluteFill and adapt to the container
const FPS = 30;
const SCENES = {
  intro: { from: 0, duration: 3 * FPS },
  dashboard: { from: 3 * FPS, duration: 10 * FPS },
  players: { from: 13 * FPS, duration: 7 * FPS },
  payments: { from: 20 * FPS, duration: 7 * FPS },
  calendar: { from: 27 * FPS, duration: 5 * FPS },
  enrollment: { from: 32 * FPS, duration: 8 * FPS },
  multiRole: { from: 40 * FPS, duration: 5 * FPS },
  cta: { from: 45 * FPS, duration: 5 * FPS },
};

export const DemoVideoInstagram: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0a0a0a" }}>
      <Sequence
        from={SCENES.intro.from}
        durationInFrames={SCENES.intro.duration}
      >
        <SceneIntro />
      </Sequence>

      <Sequence
        from={SCENES.dashboard.from}
        durationInFrames={SCENES.dashboard.duration}
      >
        <SceneDashboard />
      </Sequence>

      <Sequence
        from={SCENES.players.from}
        durationInFrames={SCENES.players.duration}
      >
        <ScenePlayers />
      </Sequence>

      <Sequence
        from={SCENES.payments.from}
        durationInFrames={SCENES.payments.duration}
      >
        <ScenePayments />
      </Sequence>

      <Sequence
        from={SCENES.calendar.from}
        durationInFrames={SCENES.calendar.duration}
      >
        <SceneCalendar />
      </Sequence>

      <Sequence
        from={SCENES.enrollment.from}
        durationInFrames={SCENES.enrollment.duration}
      >
        <SceneEnrollment />
      </Sequence>

      <Sequence
        from={SCENES.multiRole.from}
        durationInFrames={SCENES.multiRole.duration}
      >
        <SceneMultiRole />
      </Sequence>

      <Sequence
        from={SCENES.cta.from}
        durationInFrames={SCENES.cta.duration}
      >
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
