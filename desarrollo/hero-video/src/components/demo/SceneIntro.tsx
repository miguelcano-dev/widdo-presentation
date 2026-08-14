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

export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const logoProgress = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const textDelay = 12;
  const textProgress = spring({
    frame: Math.max(0, frame - textDelay),
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const subtitleDelay = 22;
  const subtitleProgress = spring({
    frame: Math.max(0, frame - subtitleDelay),
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const exitOpacity = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowIntensity = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.15, 0.3],
  );

  const logoSize = isVertical ? 160 : 120;
  const titleSize = isVertical ? 44 : 36;
  const brandSize = isVertical ? 96 : 80;
  const subSize = isVertical ? 24 : 20;

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgDark,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: exitOpacity,
      }}
    >
      {/* Green glow */}
      <div
        style={{
          position: "absolute",
          width: isVertical ? 800 : 600,
          height: isVertical ? 800 : 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(22, 163, 74, ${glowIntensity}) 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoProgress})`,
          opacity: logoProgress,
          marginBottom: isVertical ? 48 : 32,
        }}
      >
        <Img
          src={staticFile("widdo-logo.svg")}
          style={{
            width: logoSize,
            height: logoSize,
            filter: "drop-shadow(0 8px 30px rgba(22, 163, 74, 0.5))",
          }}
        />
      </div>

      {/* "Asi funciona" */}
      <div
        style={{
          opacity: textProgress,
          transform: `translateY(${(1 - textProgress) * 20}px)`,
          fontSize: titleSize,
          fontWeight: 500,
          color: COLORS.textWhite,
          letterSpacing: "-0.01em",
        }}
      >
        Asi funciona
      </div>

      {/* "Widdo" */}
      <div
        style={{
          opacity: textProgress,
          transform: `translateY(${(1 - textProgress) * 20}px) scale(${textProgress})`,
          fontSize: brandSize,
          fontWeight: 900,
          color: COLORS.primary,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          marginTop: 4,
        }}
      >
        Widdo
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleProgress,
          transform: `translateY(${(1 - subtitleProgress) * 15}px)`,
          fontSize: subSize,
          fontWeight: 400,
          color: COLORS.textSubtle,
          marginTop: isVertical ? 28 : 20,
          textAlign: "center",
          maxWidth: isVertical ? 700 : 500,
          padding: "0 40px",
        }}
      >
        La plataforma para gestionar tu club deportivo
      </div>
    </AbsoluteFill>
  );
};
