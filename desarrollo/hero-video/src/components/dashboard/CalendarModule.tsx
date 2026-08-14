import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { Calendar } from "lucide-react";
import { COLORS } from "../../colors";
import { fontFamily } from "../../fonts";

const EVENTS = [
  { day: 5, type: "training", color: COLORS.primary },
  { day: 8, type: "game", color: COLORS.chaosOrange },
  { day: 12, type: "training", color: COLORS.primary },
  { day: 15, type: "tournament", color: "#8B5CF6" },
  { day: 19, type: "training", color: COLORS.primary },
  { day: 22, type: "game", color: COLORS.chaosOrange },
];

const DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

export const CalendarModule: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const moduleEntry = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const gridProgress = interpolate(
    frame,
    [0, fps * 0.4],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        fontFamily,
        background: COLORS.bgCardHover,
        border: `1px solid ${COLORS.borderSubtle}`,
        borderRadius: 18,
        padding: 20,
        transform: `scale(${interpolate(moduleEntry, [0, 1], [0.85, 1])})`,
        opacity: moduleEntry,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `rgba(249, 115, 22, 0.15)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Calendar size={22} color={COLORS.chaosOrange} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.textWhite }}>
            Enero 2026
          </div>
          <div style={{ fontSize: 12, color: COLORS.textSubtle }}>
            6 eventos este mes
          </div>
        </div>
      </div>

      {/* Calendar Grid - Fixed size */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 42px)",
          gridTemplateRows: "repeat(6, 38px)",
          gap: 5,
          opacity: gridProgress,
          justifyContent: "center",
        }}
      >
        {/* Day headers */}
        {["D", "L", "M", "M", "J", "V", "S"].map((day, i) => (
          <div
            key={`header-${i}`}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: COLORS.textSubtle,
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {day}
          </div>
        ))}

        {/* Empty cells for offset (January 2026 starts on Thursday) */}
        {[0, 1, 2, 3].map((i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Days */}
        {DAYS.map((day) => {
          const event = EVENTS.find((e) => e.day === day);
          const eventDelay = event ? 0.5 + EVENTS.indexOf(event) * 0.1 : 0;

          const eventEntry = event
            ? spring({
                frame: frame - eventDelay * fps,
                fps,
                config: { damping: 12, stiffness: 120 },
              })
            : 1;

          return (
            <div
              key={day}
              style={{
                width: 42,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: event ? 700 : 400,
                color: event ? COLORS.textWhite : COLORS.textSubtle,
                background: event ? event.color : "transparent",
                borderRadius: 8,
                transform: `scale(${event ? eventEntry : 1})`,
                opacity: event ? eventEntry : 0.7,
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend - Compact */}
      <div style={{ display: "flex", gap: 16, flexShrink: 0, marginTop: "auto" }}>
        {[
          { label: "Entreno", color: COLORS.primary },
          { label: "Partido", color: COLORS.chaosOrange },
          { label: "Torneo", color: "#8B5CF6" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: item.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 11, color: COLORS.textSubtle }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
