import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from "remotion";
import { COLORS } from "../colors";
import { fontFamily } from "../fonts";
import { Instagram, Globe } from "lucide-react";

// Features list
const FEATURES = ["JUGADORES", "PAGOS", "ASISTENCIA", "CALENDARIO"];

export const Scene4Loop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance
  const logoEntry = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // Badge entrance
  const badgeEntry = spring({
    frame: frame - 0.2 * fps,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Title entrance
  const titleEntry = spring({
    frame: frame - 0.4 * fps,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // Tagline entrance
  const taglineEntry = spring({
    frame: frame - 0.6 * fps,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // Features entrance
  const featuresEntry = spring({
    frame: frame - 0.8 * fps,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Social links entrance
  const socialEntry = spring({
    frame: frame - 1 * fps,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Background glow animation
  const glowPulse = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [0.18, 0.28]
  );

  return (
    <AbsoluteFill style={{ background: COLORS.bgDark }}>
      {/* Animated background glow */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -200,
          width: 600,
          height: 600,
          background: `rgba(22, 163, 74, ${glowPulse})`,
          borderRadius: "50%",
          filter: "blur(150px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: -100,
          width: 400,
          height: 400,
          background: `rgba(22, 163, 74, ${glowPulse * 0.6})`,
          borderRadius: "50%",
          filter: "blur(120px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: "25%",
          width: 350,
          height: 350,
          background: `rgba(34, 197, 94, ${glowPulse * 0.4})`,
          borderRadius: "50%",
          filter: "blur(100px)",
        }}
      />

      {/* Subtle grid */}
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

      {/* Central content */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          fontFamily,
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoEntry})`,
            opacity: logoEntry,
          }}
        >
          <Img
            src={staticFile("widdo-logo.svg")}
            style={{
              width: 120,
              height: 120,
              filter: "drop-shadow(0 8px 32px rgba(22, 163, 74, 0.5))",
            }}
          />
        </div>

        {/* Badge */}
        <div
          style={{
            transform: `scale(${badgeEntry})`,
            opacity: badgeEntry,
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${COLORS.borderSubtle}`,
            borderRadius: 9999,
            padding: "10px 24px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              background: COLORS.primary,
              borderRadius: "50%",
            }}
          />
          <span style={{ fontSize: 15, color: COLORS.textMuted }}>
            Plataforma #1 para clubes deportivos
          </span>
        </div>

        {/* Somos WIDDO */}
        <div
          style={{
            transform: `translateY(${interpolate(titleEntry, [0, 1], [20, 0])}px)`,
            opacity: titleEntry,
            fontSize: 28,
            color: COLORS.textMuted,
          }}
        >
          Somos{" "}
          <span style={{ color: COLORS.primary, fontWeight: 800 }}>WIDDO</span>
        </div>

        {/* Tagline - Transformamos el MUNDO */}
        <div
          style={{
            transform: `translateY(${interpolate(taglineEntry, [0, 1], [20, 0])}px)`,
            opacity: taglineEntry,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: COLORS.textWhite,
              lineHeight: 1.2,
            }}
          >
            Trasformamos el{" "}
            <span
              style={{
                display: "inline-block",
                border: `2px solid ${COLORS.primary}`,
                borderRadius: 8,
                padding: "2px 16px",
                color: COLORS.primary,
              }}
            >
              MUNDO
            </span>
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: COLORS.textWhite,
              lineHeight: 1.2,
              marginTop: 4,
            }}
          >
            por medio del{" "}
            <span
              style={{
                display: "inline-block",
                border: `2px solid ${COLORS.primary}`,
                borderRadius: 8,
                padding: "2px 16px",
                color: COLORS.primary,
              }}
            >
              DEPORTE
            </span>
          </div>
        </div>

        {/* Features list */}
        <div
          style={{
            transform: `translateY(${interpolate(featuresEntry, [0, 1], [15, 0])}px)`,
            opacity: featuresEntry,
            display: "flex",
            gap: 24,
            marginTop: 16,
          }}
        >
          {FEATURES.map((feature, index) => (
            <div key={feature} style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 2,
                  color: COLORS.textSubtle,
                }}
              >
                {feature}
              </span>
              {index < FEATURES.length - 1 && (
                <span style={{ color: COLORS.textSubtle }}>|</span>
              )}
            </div>
          ))}
        </div>

        {/* Social links */}
        <div
          style={{
            transform: `translateY(${interpolate(socialEntry, [0, 1], [15, 0])}px)`,
            opacity: socialEntry,
            display: "flex",
            gap: 20,
            marginTop: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 255, 255, 0.05)",
              border: `1px solid ${COLORS.borderSubtle}`,
              borderRadius: 9999,
              padding: "10px 20px",
            }}
          >
            <Instagram size={16} color={COLORS.textMuted} />
            <span style={{ fontSize: 14, color: COLORS.textMuted }}>@heywiddo</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 255, 255, 0.05)",
              border: `1px solid ${COLORS.borderSubtle}`,
              borderRadius: 9999,
              padding: "10px 20px",
            }}
          >
            <Globe size={16} color={COLORS.textMuted} />
            <span style={{ fontSize: 14, color: COLORS.textMuted }}>www.widdo.co</span>
          </div>
        </div>
      </div>

      {/* Subtle vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, transparent 45%, rgba(0,0,0,0.3) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
