import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import { COLORS } from "../colors";
import { PlayersModule } from "./dashboard/PlayersModule";
import { PaymentsModule } from "./dashboard/PaymentsModule";
import { CalendarModule } from "./dashboard/CalendarModule";
import { NotificationsModule } from "./dashboard/NotificationsModule";
import { fontFamily } from "../fonts";

export const Scene3Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dashboard frame entrance
  const dashboardEntry = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const dashboardScale = interpolate(dashboardEntry, [0, 1], [0.94, 1]);
  const dashboardOpacity = interpolate(dashboardEntry, [0, 1], [0, 1]);

  // Text animations
  const titleEntry = spring({
    frame: frame - 0.3 * fps,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bgDark }}>
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -200,
          width: 600,
          height: 600,
          background: COLORS.primary,
          borderRadius: "50%",
          filter: "blur(200px)",
          opacity: 0.12,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -150,
          right: -150,
          width: 500,
          height: 500,
          background: COLORS.primaryLight,
          borderRadius: "50%",
          filter: "blur(180px)",
          opacity: 0.08,
        }}
      />

      {/* Grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.02,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Title at top - closer to dashboard */}
      <Sequence from={0} layout="none">
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: titleEntry,
            transform: `translateY(${interpolate(titleEntry, [0, 1], [-20, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily,
              fontSize: 48,
              fontWeight: 800,
              color: COLORS.textWhite,
              letterSpacing: "-0.02em",
            }}
          >
            Una plataforma.{" "}
            <span style={{ color: COLORS.primary }}>Control total.</span>
          </div>
        </div>
      </Sequence>

      {/* Dashboard Container - positioned higher */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "53%",
          transform: `translate(-50%, -50%) scale(${dashboardScale})`,
          opacity: dashboardOpacity,
          width: 1680,
          height: 820,
          background: "rgba(17, 17, 17, 0.85)",
          border: `1px solid ${COLORS.borderSubtle}`,
          borderRadius: 28,
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 24,
          padding: 28,
        }}
      >
        {/* Module 1: Jugadores */}
        <Sequence from={0} durationInFrames={14 * fps} layout="none">
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
            <PlayersModule />
          </div>
        </Sequence>

        {/* Module 2: Pagos */}
        <Sequence from={Math.floor(1.2 * fps)} durationInFrames={12.8 * fps} layout="none">
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
            <PaymentsModule />
          </div>
        </Sequence>

        {/* Module 3: Calendario */}
        <Sequence from={Math.floor(2.4 * fps)} durationInFrames={11.6 * fps} layout="none">
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
            <CalendarModule />
          </div>
        </Sequence>

        {/* Module 4: Notificaciones */}
        <Sequence from={Math.floor(3.6 * fps)} durationInFrames={10.4 * fps} layout="none">
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
            <NotificationsModule />
          </div>
        </Sequence>
      </div>

      {/* Subtle vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, transparent 55%, rgba(0,0,0,0.2) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
