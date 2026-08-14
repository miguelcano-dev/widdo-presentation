import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../../fonts";
import { COLORS } from "../../colors";

type CalloutVariant = "default" | "highlight" | "dark";

type CalloutPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "custom";

type CalloutProps = {
  text: string;
  position?: CalloutPosition;
  x?: number;
  y?: number;
  delay?: number;
  variant?: CalloutVariant;
  fontSize?: number;
};

const variantStyles: Record<
  CalloutVariant,
  { bg: string; color: string; border: string; shadow: string }
> = {
  default: {
    bg: COLORS.primary,
    color: "#ffffff",
    border: "rgba(255,255,255,0.2)",
    shadow: "0 4px 20px rgba(22, 163, 74, 0.4)",
  },
  highlight: {
    bg: "#ffffff",
    color: COLORS.gray900,
    border: COLORS.primary,
    shadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
  },
  dark: {
    bg: COLORS.gray900,
    color: "#ffffff",
    border: "rgba(255,255,255,0.15)",
    shadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  },
};

const positionStyles: Record<
  Exclude<CalloutPosition, "custom">,
  React.CSSProperties
> = {
  "top-left": { top: 40, left: 40 },
  "top-center": { top: 40, left: "50%", transform: "translateX(-50%)" },
  "top-right": { top: 40, right: 40 },
  "bottom-left": { bottom: 40, left: 40 },
  "bottom-center": { bottom: 40, left: "50%", transform: "translateX(-50%)" },
  "bottom-right": { bottom: 40, right: 40 },
};

export const Callout: React.FC<CalloutProps> = ({
  text,
  position = "custom",
  x,
  y,
  delay = 0,
  variant = "default",
  fontSize = 24,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delayedFrame = Math.max(0, frame - delay);
  const progress = spring({
    frame: delayedFrame,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const style = variantStyles[variant];

  const posStyle =
    position === "custom"
      ? { left: x, top: y }
      : positionStyles[position];

  const baseTransform =
    position === "top-center" || position === "bottom-center"
      ? "translateX(-50%)"
      : "";

  return (
    <div
      style={{
        position: "absolute",
        ...posStyle,
        transform: `${baseTransform} scale(${progress}) translateY(${(1 - progress) * 10}px)`,
        opacity: progress,
        background: style.bg,
        color: style.color,
        border: `2px solid ${style.border}`,
        borderRadius: 12,
        padding: "10px 24px",
        fontFamily,
        fontSize,
        fontWeight: 700,
        whiteSpace: "nowrap",
        boxShadow: style.shadow,
        zIndex: 100,
        letterSpacing: "-0.01em",
      }}
    >
      {text}
    </div>
  );
};
