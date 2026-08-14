import React from "react";
import { fontFamily } from "../../fonts";
import { COLORS } from "../../colors";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

type StatusBadgeProps = {
  text: string;
  variant?: BadgeVariant;
  fontSize?: number;
};

const variantConfig: Record<
  BadgeVariant,
  { bg: string; color: string; dot: string }
> = {
  success: {
    bg: "rgba(34, 197, 94, 0.12)",
    color: "#15803d",
    dot: COLORS.success,
  },
  warning: {
    bg: "rgba(245, 158, 11, 0.12)",
    color: "#92400e",
    dot: COLORS.warning,
  },
  danger: {
    bg: "rgba(239, 68, 68, 0.12)",
    color: "#991b1b",
    dot: COLORS.danger,
  },
  info: {
    bg: "rgba(59, 130, 246, 0.12)",
    color: "#1e40af",
    dot: COLORS.info,
  },
  neutral: {
    bg: "rgba(107, 114, 128, 0.12)",
    color: COLORS.gray600,
    dot: COLORS.gray500,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  text,
  variant = "neutral",
  fontSize = 10,
}) => {
  const config = variantConfig[variant];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: config.bg,
        borderRadius: 20,
        padding: "3px 10px",
        fontFamily,
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: config.dot,
        }}
      />
      <span
        style={{
          fontSize,
          fontWeight: 600,
          color: config.color,
        }}
      >
        {text}
      </span>
    </div>
  );
};
