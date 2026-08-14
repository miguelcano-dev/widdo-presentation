import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Img,
} from "remotion";
import { COLORS } from "../../colors";
import { fontFamily } from "../../fonts";
import { Sparkles } from "lucide-react";

export const Scene2TransformationIG: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const textEntry = spring({
    frame: frame - 0.3 * fps,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  const taglineEntry = spring({
    frame: frame - 0.6 * fps,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  const pulse = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.95, 1.05]);
  const rotation = interpolate(frame, [0, fps * 20], [0, 360]);
  const glowPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.6, 1]);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0a6b30 0%, #064e23 25%, #032d12 60%, #021a0a 100%)",
      }}
    >
      {/* Animated green glow behind - CENTERED */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${pulse})`,
          width: 700,
          height: 700,
          background: `radial-gradient(circle, ${COLORS.primary}60 0%, ${COLORS.primary}20 40%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(60px)",
          opacity: glowPulse,
        }}
      />

      {/* Rotating ring - CENTERED */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          width: 500,
          height: 500,
          borderRadius: "50%",
          border: `2px solid ${COLORS.primary}30`,
          boxShadow: `0 0 60px ${COLORS.primary}20`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${-rotation * 0.7}deg)`,
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: `1px solid ${COLORS.primary}20`,
        }}
      />

      {/* Floating particles - CENTERED */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2 + frame * 0.01;
        const radius = 280 + Math.sin(frame * 0.03 + i) * 30;
        const x = 50 + Math.cos(angle) * (radius / 10.8);
        const y = 50 + Math.sin(angle) * (radius / 19.2);
        const particleEntry = spring({
          frame: frame - i * 0.05 * fps,
          fps,
          config: { damping: 15 },
        });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: COLORS.primary,
              boxShadow: `0 0 20px ${COLORS.primary}`,
              opacity: particleEntry * 0.8,
              transform: `scale(${particleEntry})`,
            }}
          />
        );
      })}

      {/* Content - CENTERED */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily,
        }}
      >
        {/* Logo - SIN círculo verde relleno, solo el SVG */}
        <div
          style={{
            transform: `scale(${logoScale * pulse})`,
            opacity: logoScale,
            marginBottom: 32,
          }}
        >
          <Img
            src={staticFile("widdo-logo.svg")}
            style={{ width: 180, height: 180 }}
          />
        </div>

        {/* WIDDO text */}
        <div
          style={{
            transform: `translateY(${interpolate(textEntry, [0, 1], [30, 0])}px)`,
            opacity: textEntry,
          }}
        >
          <div
            style={{
              fontSize: 110,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.02em",
              textShadow: `0 4px 40px rgba(0,0,0,0.4), 0 0 80px ${COLORS.primary}40`,
            }}
          >
            WIDDO
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            transform: `translateY(${interpolate(taglineEntry, [0, 1], [30, 0])}px)`,
            opacity: taglineEntry,
            marginTop: 24,
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 60,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${COLORS.primary})`,
              }}
            />
            <Sparkles size={20} color={COLORS.primary} />
            <div
              style={{
                width: 60,
                height: 2,
                background: `linear-gradient(90deg, ${COLORS.primary}, transparent)`,
              }}
            />
          </div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1.3,
            }}
          >
            Tu Club sin
            <br />
            <span
              style={{
                color: COLORS.primary,
                fontWeight: 800,
                textShadow: `0 0 30px ${COLORS.primary}60`,
              }}
            >
              Excel ni WhatsApp
            </span>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "20%",
          background: "linear-gradient(to top, rgba(2, 26, 10, 0.6) 0%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
