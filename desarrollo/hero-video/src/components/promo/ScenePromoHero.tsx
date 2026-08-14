import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
  Easing,
} from "remotion";
import { PROMO } from "../../promoColors";
import { interFont, monoFont } from "../../promoFonts";

export const ScenePromoHero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth springs — damping 200 = no bounce, pure ease
  const logoEntry = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 100, mass: 0.8 },
  });

  const badgeEntry = spring({
    frame,
    fps,
    delay: 10,
    config: { damping: 200, stiffness: 100 },
  });

  const titleEntry = spring({
    frame,
    fps,
    delay: 18,
    config: { damping: 200, stiffness: 80 },
  });

  const subEntry = spring({
    frame,
    fps,
    delay: 30,
    config: { damping: 200, stiffness: 80 },
  });

  const featEntry = spring({
    frame,
    fps,
    delay: 42,
    config: { damping: 200, stiffness: 100 },
  });

  // Pulse dot — very slow, smooth, no jitter
  const dotOpacity = interpolate(frame, [0, 30, 60, 90, 120], [0.3, 1, 0.3, 1, 0.3], {
    extrapolateRight: "extend",
  });

  // Glow — very slow breathing, imperceptible shake
  const glowOpacity = interpolate(
    frame,
    [0, fps * 3, fps * 6],
    [0.12, 0.22, 0.12],
    { extrapolateRight: "extend" }
  );

  // Slow grid drift — barely perceptible
  const gridX = Math.round(interpolate(frame, [0, fps * 30], [0, 30]));

  return (
    <AbsoluteFill style={{ background: PROMO.bg }}>
      {/* Subtle grid pattern — slow drift */}
      <div
        style={{
          position: "absolute",
          inset: -60,
          opacity: 0.035,
          backgroundImage: `
            linear-gradient(${PROMO.textMuted}30 1px, transparent 1px),
            linear-gradient(90deg, ${PROMO.textMuted}30 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          backgroundPosition: `${gridX}px ${Math.round(gridX * 0.5)}px`,
        }}
      />

      {/* Radial green glow — center, breathing */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1000,
          height: 1000,
          background: `radial-gradient(circle, rgba(0, 200, 83, ${glowOpacity}) 0%, transparent 65%)`,
          filter: "blur(100px)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoEntry})`,
            opacity: logoEntry,
            marginBottom: 28,
          }}
        >
          <Img
            src={staticFile("widdo-logo.svg")}
            style={{
              width: 100,
              height: 100,
              filter: "drop-shadow(0 8px 40px rgba(0, 200, 83, 0.5))",
            }}
          />
        </div>

        {/* Badge with pulse dot */}
        <div
          style={{
            transform: `translateY(${Math.round((1 - badgeEntry) * 16)}px)`,
            opacity: badgeEntry,
            background: PROMO.bgCard,
            border: `1px solid ${PROMO.border}`,
            borderRadius: 9999,
            padding: "12px 28px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
          }}
        >
          {/* Pulse dot — smooth opacity only, no scale */}
          <div
            style={{
              width: 10,
              height: 10,
              background: PROMO.green,
              borderRadius: "50%",
              opacity: dotOpacity,
              boxShadow: `0 0 8px ${PROMO.green}`,
            }}
          />
          <span
            style={{
              fontFamily: monoFont,
              fontSize: 14,
              fontWeight: 500,
              color: PROMO.textSecondary,
              letterSpacing: "0.06em",
            }}
          >
            PLATAFORMA ACTIVA
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            transform: `translateY(${Math.round((1 - titleEntry) * 24)}px)`,
            opacity: titleEntry,
            textAlign: "center",
            fontFamily: interFont,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 900,
              color: PROMO.text,
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
            }}
          >
            Gestiona tu club
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
              marginTop: 2,
            }}
          >
            <span style={{ color: PROMO.text }}>deportivo con </span>
            <span
              style={{
                color: PROMO.green,
                textShadow: "0 0 40px rgba(0, 200, 83, 0.3)",
              }}
            >
              Widdo
            </span>
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            transform: `translateY(${Math.round((1 - subEntry) * 16)}px)`,
            opacity: subEntry,
            fontFamily: interFont,
            fontSize: 26,
            fontWeight: 400,
            color: PROMO.textSecondary,
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.5,
            marginBottom: 36,
          }}
        >
          Sin Excel. Sin WhatsApp. Sin caos.
          <br />
          Todo en una sola plataforma.
        </div>

        {/* Feature tags */}
        <div
          style={{
            transform: `translateY(${Math.round((1 - featEntry) * 12)}px)`,
            opacity: featEntry,
            display: "flex",
            gap: 14,
          }}
        >
          {["Jugadores", "Pagos", "Asistencia", "Calendario", "IA"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  fontFamily: monoFont,
                  fontSize: 13,
                  fontWeight: 500,
                  color: PROMO.green,
                  background: PROMO.greenGlow,
                  border: `1px solid ${PROMO.greenBorder}`,
                  borderRadius: 8,
                  padding: "8px 20px",
                  letterSpacing: "0.08em",
                }}
              >
                {tag.toUpperCase()}
              </div>
            )
          )}
        </div>
      </div>

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 70% at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
