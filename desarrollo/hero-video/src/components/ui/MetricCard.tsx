import React from "react";
import {
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { fontFamily } from "../../fonts";
import { COLORS } from "../../colors";
import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  icon: LucideIcon;
  iconColor: string;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  sublabel?: string;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
  width?: number;
  decimals?: number;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  iconColor,
  value,
  prefix = "",
  suffix = "",
  label,
  sublabel,
  trend,
  trendUp = true,
  delay = 0,
  width = 200,
  decimals = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delayedFrame = Math.max(0, frame - delay);
  const entryProgress = spring({
    frame: delayedFrame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // CountUp animation
  const countDuration = 30; // frames
  const countValue = interpolate(
    delayedFrame,
    [8, 8 + countDuration],
    [0, value],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    },
  );

  const displayValue =
    decimals > 0 ? countValue.toFixed(decimals) : Math.round(countValue);

  return (
    <div
      style={{
        width,
        background: COLORS.surfaceWhite,
        border: `1px solid ${COLORS.gray200}`,
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        opacity: entryProgress,
        transform: `translateY(${(1 - entryProgress) * 20}px)`,
        fontFamily,
      }}
    >
      {/* Icon + trend row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${iconColor}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} color={iconColor} strokeWidth={2} />
        </div>
        {trend && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: trendUp ? COLORS.success : COLORS.danger,
            }}
          >
            {trendUp ? "+" : ""}
            {trend}
          </span>
        )}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: COLORS.gray900,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {prefix}
        {displayValue}
        {suffix}
      </div>

      {/* Labels */}
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: COLORS.gray600,
            lineHeight: 1.2,
          }}
        >
          {label}
        </div>
        {sublabel && (
          <div
            style={{
              fontSize: 10,
              color: COLORS.gray500,
              marginTop: 2,
            }}
          >
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
};
