import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { COLORS } from "../colors";
import { WiddoLogo } from "./WiddoLogo";
import { fontFamily } from "../fonts";

// Center point
const CENTER = { x: 960, y: 540 };

// Chaos items that will converge
const CHAOS_ITEMS = [
  { x: 200, y: 200, icon: "📊", label: "Excel" },
  { x: 1600, y: 180, icon: "💬", label: "WhatsApp" },
  { x: 150, y: 650, icon: "📁", label: "Carpetas" },
  { x: 1650, y: 600, icon: "📝", label: "Notas" },
  { x: 500, y: 150, icon: "📞", label: "Llamadas" },
  { x: 1400, y: 700, icon: "💸", label: "Cobros" },
];

export const Scene2Transformation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Items converge (0 - 1.5s)
  const convergeProgress = interpolate(
    frame,
    [0, 1.5 * fps],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    }
  );

  // Phase 2: Orb forms and pulses (1s - 2s)
  const orbProgress = interpolate(
    frame,
    [1 * fps, 1.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Phase 3: Logo reveal (1.5s - 3s)
  const logoProgress = spring({
    frame: frame - 1.5 * fps,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Orb pulse animation
  const orbPulse1 = interpolate(
    frame,
    [1.3 * fps, 1.6 * fps, 1.9 * fps],
    [1, 1.4, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const orbPulse2 = interpolate(
    frame,
    [1.5 * fps, 1.8 * fps, 2.1 * fps],
    [0, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Background gradient transition
  const bgProgress = interpolate(
    frame,
    [0, 2 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Items opacity and scale
  const iconsOpacity = interpolate(
    convergeProgress,
    [0, 0.7, 1],
    [1, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const iconsScale = interpolate(
    convergeProgress,
    [0, 1],
    [1, 0.2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Tagline animation
  const taglineOpacity = interpolate(
    logoProgress,
    [0.5, 1],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const taglineY = interpolate(
    logoProgress,
    [0.5, 1],
    [20, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: COLORS.bgDark }}>
      {/* Background glow - transitions from red/orange to green */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 900,
          background: bgProgress > 0.5 ? COLORS.primary : COLORS.chaosRed,
          borderRadius: "50%",
          filter: "blur(200px)",
          opacity: 0.25,
        }}
      />

      {/* Grid pattern */}
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

      {/* Converging chaos items */}
      {CHAOS_ITEMS.map((item, index) => {
        const currentX = interpolate(convergeProgress, [0, 1], [item.x, CENTER.x]);
        const currentY = interpolate(convergeProgress, [0, 1], [item.y, CENTER.y]);

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: currentX,
              top: currentY,
              transform: `translate(-50%, -50%) scale(${iconsScale})`,
              opacity: iconsOpacity,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                border: `1px solid ${COLORS.borderSubtle}`,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
              }}
            >
              {item.icon}
            </div>
            <span style={{ fontFamily, color: COLORS.textMuted, fontSize: 12, fontWeight: 500 }}>
              {item.label}
            </span>
          </div>
        );
      })}

      {/* Glowing Orb */}
      <div
        style={{
          position: "absolute",
          left: CENTER.x,
          top: CENTER.y,
          transform: `translate(-50%, -50%) scale(${orbProgress * orbPulse1})`,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.textWhite} 0%, ${COLORS.primary} 60%, ${COLORS.primaryDark} 100%)`,
          boxShadow: `0 0 ${80 * orbProgress}px ${40 * orbProgress}px ${COLORS.primaryGlow}`,
          opacity: orbProgress * (1 - logoProgress),
        }}
      />

      {/* Pulse Rings */}
      {[1, 2].map((ring) => (
        <div
          key={ring}
          style={{
            position: "absolute",
            left: CENTER.x,
            top: CENTER.y,
            transform: `translate(-50%, -50%) scale(${1 + orbPulse2 * (1.5 + ring * 0.5)})`,
            width: 150,
            height: 150,
            borderRadius: "50%",
            border: `2px solid ${COLORS.primary}`,
            opacity: orbPulse2 * (1 - ring * 0.3),
          }}
        />
      ))}

      {/* Widdo Logo */}
      <div
        style={{
          position: "absolute",
          left: CENTER.x,
          top: CENTER.y - 30,
          transform: `translate(-50%, -50%) scale(${logoProgress})`,
          opacity: logoProgress,
        }}
      >
        <WiddoLogo size={340} />
      </div>

      {/* Tagline appears with logo */}
      <div
        style={{
          position: "absolute",
          left: CENTER.x,
          top: CENTER.y + 180,
          transform: `translateX(-50%) translateY(${taglineY}px)`,
          opacity: taglineOpacity,
          fontFamily,
          textAlign: "center",
        }}
      >
        <span
          style={{
            color: COLORS.textMuted,
            fontSize: 28,
            fontWeight: 500,
          }}
        >
          Tu club/equipo deportivo sin Excel ni WhatsApp
        </span>
      </div>
    </AbsoluteFill>
  );
};
