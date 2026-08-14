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

// Timeline (50 seconds @ 30fps = 1500 frames)
const FPS = 30;
const SCENES = {
  intro: { from: 0, duration: 3 * FPS }, // 0-90
  dashboard: { from: 3 * FPS, duration: 10 * FPS }, // 90-390
  players: { from: 13 * FPS, duration: 7 * FPS }, // 390-600
  payments: { from: 20 * FPS, duration: 7 * FPS }, // 600-810
  calendar: { from: 27 * FPS, duration: 5 * FPS }, // 810-960
  enrollment: { from: 32 * FPS, duration: 8 * FPS }, // 960-1200
  multiRole: { from: 40 * FPS, duration: 5 * FPS }, // 1200-1350
  cta: { from: 45 * FPS, duration: 5 * FPS }, // 1350-1500
};

export const DemoVideo: React.FC = () => {
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
