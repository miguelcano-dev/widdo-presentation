import { Composition } from "remotion";
import { HeroVideo } from "./HeroVideo";
import { HeroVideoInstagram } from "./HeroVideoInstagram";
import { HeroVideoShort } from "./HeroVideoShort";
import { DemoVideo } from "./DemoVideo";
import { DemoVideoInstagram } from "./DemoVideoInstagram";
import { SaasPromo } from "./SaasPromo";

// Escenas individuales para preview (Hero)
import { Scene1ChaosIG } from "./components/instagram/Scene1ChaosIG";
import { Scene2TransformationIG } from "./components/instagram/Scene2TransformationIG";
import { Scene3DashboardIG } from "./components/instagram/Scene3DashboardIG";
import { SceneModulesIG } from "./components/instagram/SceneModulesIG";
import { SceneBeneficiariesIG } from "./components/instagram/SceneBeneficiariesIG";
import { Scene4LoopIG } from "./components/instagram/Scene4LoopIG";

// Escenas individuales para preview (Demo)
import { SceneIntro } from "./components/demo/SceneIntro";
import { SceneDashboard } from "./components/demo/SceneDashboard";
import { ScenePlayers } from "./components/demo/ScenePlayers";
import { ScenePayments } from "./components/demo/ScenePayments";
import { SceneCalendar } from "./components/demo/SceneCalendar";
import { SceneEnrollment } from "./components/demo/SceneEnrollment";
import { SceneMultiRole } from "./components/demo/SceneMultiRole";
import { SceneCTA } from "./components/demo/SceneCTA";

// Promo scene imports
import { ScenePromoHero } from "./components/promo/ScenePromoHero";
import { ScenePromoProblem } from "./components/promo/ScenePromoProblem";
import { ScenePromoSolution } from "./components/promo/ScenePromoSolution";
import { ScenePromoFeatures } from "./components/promo/ScenePromoFeatures";
import { ScenePromoEcosystem } from "./components/promo/ScenePromoEcosystem";
import { ScenePromoMetrics } from "./components/promo/ScenePromoMetrics";
import { ScenePromoCTA } from "./components/promo/ScenePromoCTA";
import { ScenePromoAIChat } from "./components/promo/ScenePromoAIChat";

// Video specs
const FPS = 30;
const DURATION_SECONDS = 32.5;
const DURATION_SHORT = 12;
const DEMO_DURATION = 50; // 50 seconds
const PROMO_DURATION = 55; // 55 seconds (5+6+14+7+7+6+5+5)
const SCENE_DURATION = 5 * FPS; // 5 segundos por escena individual

// Dimensions
const WIDTH_HD = 1920;
const HEIGHT_HD = 1080;
const WIDTH_IG = 1080;
const HEIGHT_IG = 1920;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ========== HERO VIDEOS ========== */}

      {/* Main 1920x1080 horizontal video */}
      <Composition
        id="HeroVideo"
        component={HeroVideo}
        durationInFrames={Math.ceil(DURATION_SECONDS * FPS)}
        fps={FPS}
        width={WIDTH_HD}
        height={HEIGHT_HD}
        defaultProps={{}}
      />
      {/* Instagram Reels/Stories 1080x1920 vertical video */}
      <Composition
        id="HeroVideoInstagram"
        component={HeroVideoInstagram}
        durationInFrames={Math.ceil(DURATION_SECONDS * FPS)}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
        defaultProps={{}}
      />
      {/* Video corto - Solo flujo + CTA */}
      <Composition
        id="HeroVideoShort"
        component={HeroVideoShort}
        durationInFrames={Math.ceil(DURATION_SHORT * FPS)}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
        defaultProps={{}}
      />

      {/* ========== DEMO VIDEOS ========== */}

      {/* Demo video 1920x1080 horizontal */}
      <Composition
        id="DemoVideo"
        component={DemoVideo}
        durationInFrames={Math.ceil(DEMO_DURATION * FPS)}
        fps={FPS}
        width={WIDTH_HD}
        height={HEIGHT_HD}
        defaultProps={{}}
      />
      {/* Demo video 1080x1920 Instagram vertical */}
      <Composition
        id="DemoVideoInstagram"
        component={DemoVideoInstagram}
        durationInFrames={Math.ceil(DEMO_DURATION * FPS)}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
        defaultProps={{}}
      />

      {/* ========== SAAS PROMO VIDEO ========== */}

      {/* SaaS Promo 1920x1080 horizontal */}
      <Composition
        id="SaasPromo"
        component={SaasPromo}
        durationInFrames={Math.ceil(PROMO_DURATION * FPS)}
        fps={FPS}
        width={WIDTH_HD}
        height={HEIGHT_HD}
        defaultProps={{}}
      />

      {/* ========== PROMO ESCENAS INDIVIDUALES PARA PREVIEW ========== */}

      <Composition
        id="Promo-1-Hero"
        component={ScenePromoHero}
        durationInFrames={5 * FPS}
        fps={FPS}
        width={WIDTH_HD}
        height={HEIGHT_HD}
      />
      <Composition
        id="Promo-2-Problem"
        component={ScenePromoProblem}
        durationInFrames={6 * FPS}
        fps={FPS}
        width={WIDTH_HD}
        height={HEIGHT_HD}
      />
      <Composition
        id="Promo-3-Solution"
        component={ScenePromoSolution}
        durationInFrames={14 * FPS}
        fps={FPS}
        width={WIDTH_HD}
        height={HEIGHT_HD}
      />
      <Composition
        id="Promo-4-Features"
        component={ScenePromoFeatures}
        durationInFrames={7 * FPS}
        fps={FPS}
        width={WIDTH_HD}
        height={HEIGHT_HD}
      />
      <Composition
        id="Promo-5-Ecosystem"
        component={ScenePromoEcosystem}
        durationInFrames={7 * FPS}
        fps={FPS}
        width={WIDTH_HD}
        height={HEIGHT_HD}
      />
      <Composition
        id="Promo-6-Metrics"
        component={ScenePromoMetrics}
        durationInFrames={6 * FPS}
        fps={FPS}
        width={WIDTH_HD}
        height={HEIGHT_HD}
      />
      <Composition
        id="Promo-7-AIChat"
        component={ScenePromoAIChat}
        durationInFrames={5 * FPS}
        fps={FPS}
        width={WIDTH_HD}
        height={HEIGHT_HD}
      />
      <Composition
        id="Promo-8-CTA"
        component={ScenePromoCTA}
        durationInFrames={5 * FPS}
        fps={FPS}
        width={WIDTH_HD}
        height={HEIGHT_HD}
      />

      {/* ========== HERO ESCENAS INDIVIDUALES PARA PREVIEW ========== */}

      {/* 1. Caos - El problema */}
      <Composition
        id="Preview-1-Caos"
        component={Scene1ChaosIG}
        durationInFrames={SCENE_DURATION}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
      />

      {/* 2. Transformación - Logo WIDDO */}
      <Composition
        id="Preview-2-Transformacion"
        component={Scene2TransformationIG}
        durationInFrames={SCENE_DURATION}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
      />

      {/* 3. Dashboard - Control Total */}
      <Composition
        id="Preview-3-Dashboard"
        component={Scene3DashboardIG}
        durationInFrames={SCENE_DURATION}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
      />

      {/* 4. Módulos - Features */}
      <Composition
        id="Preview-4-Modulos"
        component={SceneModulesIG}
        durationInFrames={SCENE_DURATION}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
      />

      {/* 5. Beneficiarios - Flujo hacia Widdo */}
      <Composition
        id="Preview-5-Flujo"
        component={SceneBeneficiariesIG}
        durationInFrames={SCENE_DURATION}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
      />

      {/* 6. CTA Final - Somos WIDDO */}
      <Composition
        id="Preview-6-CTA"
        component={Scene4LoopIG}
        durationInFrames={7 * FPS}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
      />

      {/* ========== DEMO ESCENAS INDIVIDUALES PARA PREVIEW ========== */}

      <Composition
        id="Demo-1-Intro"
        component={SceneIntro}
        durationInFrames={3 * FPS}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
      />
      <Composition
        id="Demo-2-Dashboard"
        component={SceneDashboard}
        durationInFrames={10 * FPS}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
      />
      <Composition
        id="Demo-3-Players"
        component={ScenePlayers}
        durationInFrames={7 * FPS}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
      />
      <Composition
        id="Demo-4-Payments"
        component={ScenePayments}
        durationInFrames={7 * FPS}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
      />
      <Composition
        id="Demo-5-Calendar"
        component={SceneCalendar}
        durationInFrames={5 * FPS}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
      />
      <Composition
        id="Demo-6-Enrollment"
        component={SceneEnrollment}
        durationInFrames={8 * FPS}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
      />
      <Composition
        id="Demo-7-MultiRole"
        component={SceneMultiRole}
        durationInFrames={5 * FPS}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
      />
      <Composition
        id="Demo-8-CTA"
        component={SceneCTA}
        durationInFrames={5 * FPS}
        fps={FPS}
        width={WIDTH_IG}
        height={HEIGHT_IG}
      />
    </>
  );
};
