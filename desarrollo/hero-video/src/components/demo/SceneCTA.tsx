import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { fontFamily } from "../../fonts";
import { COLORS } from "../../colors";
import { Instagram } from "lucide-react";

// 5 seconds = 150 frames

const features = ["JUGADORES", "PAGOS", "ASISTENCIA", "CALENDARIO"];

export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const logoProgress = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });

  const titleDelay = 10;
  const titleProgress = spring({ frame: Math.max(0, frame - titleDelay), fps, config: { damping: 14, stiffness: 100 } });

  const urlDelay = 20;
  const urlProgress = spring({ frame: Math.max(0, frame - urlDelay), fps, config: { damping: 14, stiffness: 100 } });

  const igDelay = 28;
  const igProgress = spring({ frame: Math.max(0, frame - igDelay), fps, config: { damping: 14, stiffness: 100 } });

  const badgeDelay = 36;
  const badgeProgress = spring({ frame: Math.max(0, frame - badgeDelay), fps, config: { damping: 14, stiffness: 100 } });

  const promoDelay = 50;
  const promoProgress = spring({ frame: Math.max(0, frame - promoDelay), fps, config: { damping: 14, stiffness: 100 } });

  const logoPulse = 1 + interpolate(Math.sin(frame * 0.08), [-1, 1], [0, 0.03]);
  const glowIntensity = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.2, 0.4]);

  const logoSize = isVertical ? 180 : 140;
  const titleSize = isVertical ? 60 : 52;
  const urlSize = isVertical ? 34 : 28;
  const igSize = isVertical ? 26 : 22;
  const featureSize = isVertical ? 15 : 13;
  const promoSize = isVertical ? 18 : 16;

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgDark,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: isVertical ? 28 : 20,
      }}
    >
      {/* Green glow */}
      <div
        style={{
          position: "absolute",
          width: isVertical ? 700 : 500,
          height: isVertical ? 700 : 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(22, 163, 74, ${glowIntensity}) 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Logo */}
      <div style={{ transform: `scale(${logoProgress * logoPulse})`, opacity: logoProgress }}>
        <Img
          src={staticFile("widdo-logo.svg")}
          style={{
            width: logoSize,
            height: logoSize,
            filter: "drop-shadow(0 10px 40px rgba(22, 163, 74, 0.5))",
          }}
        />
      </div>

      {/* "Empieza gratis" */}
      <div
        style={{
          opacity: titleProgress,
          transform: `translateY(${(1 - titleProgress) * 20}px)`,
          fontSize: titleSize,
          fontWeight: 900,
          color: COLORS.textWhite,
          letterSpacing: "-0.03em",
          textAlign: "center",
        }}
      >
        Empieza gratis
      </div>

      {/* URL */}
      <div
        style={{
          opacity: urlProgress,
          transform: `translateY(${(1 - urlProgress) * 15}px)`,
          fontSize: urlSize,
          fontWeight: 700,
          color: COLORS.primary,
          letterSpacing: "-0.01em",
        }}
      >
        www.widdo.co
      </div>

      {/* Instagram */}
      <div
        style={{
          opacity: igProgress,
          transform: `translateY(${(1 - igProgress) * 10}px)`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: igSize,
          fontWeight: 600,
          color: COLORS.textMuted,
        }}
      >
        <Instagram size={igSize} color={COLORS.textMuted} />
        @heywiddo
      </div>

      {/* Feature badges */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: isVertical ? 12 : 10,
          marginTop: 10,
          opacity: badgeProgress,
          transform: `translateY(${(1 - badgeProgress) * 15}px)`,
          maxWidth: isVertical ? 600 : 800,
        }}
      >
        {features.map((f, i) => {
          const featureDelay = badgeDelay + i * 3;
          const featureFrame = Math.max(0, frame - featureDelay);
          const featureProgress = spring({ frame: featureFrame, fps, config: { damping: 12, stiffness: 130 } });

          return (
            <div
              key={f}
              style={{
                padding: isVertical ? "10px 22px" : "8px 18px",
                borderRadius: 20,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: featureSize,
                fontWeight: 700,
                color: COLORS.textMuted,
                letterSpacing: "0.08em",
                opacity: featureProgress,
                transform: `scale(${featureProgress})`,
              }}
            >
              {f}
            </div>
          );
        })}
      </div>

      {/* Promo badge */}
      <div
        style={{
          marginTop: isVertical ? 20 : 16,
          opacity: promoProgress,
          transform: `scale(${promoProgress})`,
          background: `${COLORS.primary}18`,
          border: `1px solid ${COLORS.primary}40`,
          borderRadius: 12,
          padding: isVertical ? "12px 28px" : "10px 24px",
          fontSize: promoSize,
          fontWeight: 600,
          color: COLORS.primaryLight,
          textAlign: "center",
        }}
      >
        30 dias gratis · Sin tarjeta de credito
      </div>
    </AbsoluteFill>
  );
};
