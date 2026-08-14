import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import { COLORS } from "../colors";
import { fontFamily } from "../fonts";

// Animated lines that represent chaos/disconnection
const AnimatedLine: React.FC<{
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
  color: string;
}> = ({ startX, startY, endX, endY, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(
    frame - delay * fps,
    [0, fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const dashOffset = interpolate(frame, [0, fps * 2], [100, 0]);

  return (
    <line
      x1={startX}
      y1={startY}
      x2={startX + (endX - startX) * progress}
      y2={startY + (endY - startY) * progress}
      stroke={color}
      strokeWidth={2}
      strokeDasharray="8 4"
      strokeDashoffset={dashOffset}
      opacity={0.3}
    />
  );
};

// Floating icon that pulses
const FloatingIcon: React.FC<{
  icon: string;
  label: string;
  x: number;
  y: number;
  delay: number;
  color: string;
}> = ({ icon, label, x, y, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entry = spring({
    frame: frame - delay * fps,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const float = Math.sin(frame * 0.04 + delay * 5) * 8;
  const pulse = 1 + Math.sin(frame * 0.08 + delay * 3) * 0.05;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) translateY(${float}px) scale(${entry * pulse})`,
        opacity: entry,
        fontFamily,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
          border: `1px solid ${color}40`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          backdropFilter: "blur(10px)",
        }}
      >
        <span style={{ fontSize: 28 }}>{icon}</span>
        <span style={{ fontSize: 10, color: COLORS.textSubtle, fontWeight: 500 }}>
          {label}
        </span>
      </div>
    </div>
  );
};

const CHAOS_ICONS = [
  { icon: "📊", label: "Excel", x: 15, y: 25, color: "#1d6f42" },
  { icon: "💬", label: "WhatsApp", x: 85, y: 20, color: "#25d366" },
  { icon: "📋", label: "Papel", x: 10, y: 70, color: "#f59e0b" },
  { icon: "📱", label: "Llamadas", x: 88, y: 75, color: "#3b82f6" },
  { icon: "💰", label: "Cobros", x: 25, y: 50, color: "#ef4444" },
  { icon: "📅", label: "Agenda", x: 75, y: 50, color: "#8b5cf6" },
];

export const Scene1Chaos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleEntry = spring({
    frame: frame - 0.8 * fps,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  // Subtitle animation
  const subtitleEntry = spring({
    frame: frame - 1.2 * fps,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  // Background rotation
  const bgRotation = interpolate(frame, [0, fps * 10], [0, 360]);

  return (
    <AbsoluteFill style={{ background: COLORS.bgDark }}>
      {/* Animated gradient background */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${bgRotation}deg)`,
          width: 1600,
          height: 1600,
          background: `conic-gradient(from 0deg, ${COLORS.chaosRed}15, ${COLORS.chaosOrange}10, ${COLORS.chaosRed}15)`,
          borderRadius: "50%",
          filter: "blur(100px)",
        }}
      />

      {/* Grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Animated connecting lines SVG */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <AnimatedLine startX={288} startY={270} endX={480} endY={540} delay={0.2} color={COLORS.chaosRed} />
        <AnimatedLine startX={1632} startY={216} endX={1440} endY={540} delay={0.3} color={COLORS.chaosOrange} />
        <AnimatedLine startX={192} startY={756} endX={480} endY={540} delay={0.4} color="#f59e0b" />
        <AnimatedLine startX={1689} startY={810} endX={1440} endY={540} delay={0.5} color="#3b82f6" />
        <AnimatedLine startX={480} startY={540} endX={960} endY={540} delay={0.6} color={COLORS.chaosRed} />
        <AnimatedLine startX={1440} startY={540} endX={960} endY={540} delay={0.7} color={COLORS.chaosOrange} />
      </svg>

      {/* Floating chaos icons */}
      {CHAOS_ICONS.map((item, i) => (
        <FloatingIcon key={i} {...item} delay={i * 0.1} />
      ))}

      {/* Center content - Question mark morphing */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Glowing question mark */}
        <Sequence from={Math.floor(0.5 * fps)} layout="none">
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              color: COLORS.chaosRed,
              textShadow: `0 0 60px ${COLORS.chaosRed}80`,
              transform: `scale(${titleEntry})`,
              opacity: titleEntry,
              fontFamily,
            }}
          >
            ?
          </div>
        </Sequence>

        {/* Main text */}
        <Sequence from={Math.floor(1 * fps)} layout="none">
          <div
            style={{
              transform: `translateY(${interpolate(subtitleEntry, [0, 1], [30, 0])}px)`,
              opacity: subtitleEntry,
              textAlign: "center",
              fontFamily,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: COLORS.textWhite,
                letterSpacing: "-0.02em",
              }}
            >
              ¿Todavía gestionas tu club
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: COLORS.textWhite,
                letterSpacing: "-0.02em",
                marginTop: 8,
              }}
            >
              con <span style={{ color: COLORS.chaosRed }}>herramientas dispersas</span>?
            </div>
          </div>
        </Sequence>
      </div>

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
