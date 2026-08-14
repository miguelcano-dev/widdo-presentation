import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { ScenePromoHero } from "./components/promo/ScenePromoHero";
import { ScenePromoProblem } from "./components/promo/ScenePromoProblem";
import { ScenePromoSolution } from "./components/promo/ScenePromoSolution";
import { ScenePromoFeatures } from "./components/promo/ScenePromoFeatures";
import { ScenePromoEcosystem } from "./components/promo/ScenePromoEcosystem";
import { ScenePromoMetrics } from "./components/promo/ScenePromoMetrics";
import { ScenePromoCTA } from "./components/promo/ScenePromoCTA";
import { ScenePromoAIChat } from "./components/promo/ScenePromoAIChat";
import { PROMO } from "./promoColors";

export const SaasPromo: React.FC = () => {
  const { fps } = useVideoConfig();

  // Scene durations in frames
  const heroFrames = 5 * fps; // 5s - Logo + headline
  const problemFrames = 6 * fps; // 6s - The chaos problem
  const solutionFrames = 14 * fps; // 14s - Product showcase (dashboard → players → detail → payment modal)
  const featuresFrames = 7 * fps; // 7s - 9 module cards
  const ecosystemFrames = 7 * fps; // 7s - 3 verticals
  const metricsFrames = 6 * fps; // 6s - Social proof numbers
  const aiChatFrames = 5 * fps; // 5s - AI assistant demo
  const ctaFrames = 5 * fps; // 5s - Final CTA

  const transitionFrames = Math.round(0.6 * fps); // 0.6s transitions

  return (
    <AbsoluteFill style={{ backgroundColor: PROMO.bg }}>
      <TransitionSeries>
        {/* 1. Hero - Logo, headline, tags */}
        <TransitionSeries.Sequence durationInFrames={heroFrames}>
          <ScenePromoHero />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionFrames })}
        />

        {/* 2. Problem - Chaos, Excel, WhatsApp */}
        <TransitionSeries.Sequence durationInFrames={problemFrames}>
          <ScenePromoProblem />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionFrames })}
        />

        {/* 3. Solution - Dashboard mockup */}
        <TransitionSeries.Sequence durationInFrames={solutionFrames}>
          <ScenePromoSolution />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionFrames })}
        />

        {/* 4. Features - 9 module cards */}
        <TransitionSeries.Sequence durationInFrames={featuresFrames}>
          <ScenePromoFeatures />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionFrames })}
        />

        {/* 5. Ecosystem - Clubs + Tournaments + Academy */}
        <TransitionSeries.Sequence durationInFrames={ecosystemFrames}>
          <ScenePromoEcosystem />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionFrames })}
        />

        {/* 6. Metrics - Social proof */}
        <TransitionSeries.Sequence durationInFrames={metricsFrames}>
          <ScenePromoMetrics />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionFrames })}
        />

        {/* 7. AI Chat - Assistant demo */}
        <TransitionSeries.Sequence durationInFrames={aiChatFrames}>
          <ScenePromoAIChat />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: transitionFrames })}
        />

        {/* 8. CTA - Final call to action */}
        <TransitionSeries.Sequence durationInFrames={ctaFrames}>
          <ScenePromoCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
