import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Img,
} from "remotion";
import { COLORS } from "../colors";
import { fontFamily } from "../fonts";

const BENEFICIARIES = [
  {
    emoji: "👔",
    title: "Propietarios",
    subtitle: "Control total del club",
    angle: -135,
    color: "#f97316",
  },
  {
    emoji: "🏃",
    title: "Entrenadores",
    subtitle: "Gestión de equipos",
    angle: -45,
    color: "#3b82f6",
  },
  {
    emoji: "👨‍👩‍👧",
    title: "Padres",
    subtitle: "Seguimiento de hijos",
    angle: 135,
    color: "#8b5cf6",
  },
  {
    emoji: "⚽",
    title: "Jugadores",
    subtitle: "Su información siempre",
    angle: 45,
    color: "#10b981",
  },
];

// Animated connecting line
const ConnectingLine: React.FC<{
  angle: number;
  delay: number;
  color: string;
}> = ({ angle, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineProgress = interpolate(
    frame - delay * fps,
    [0, fps * 0.6],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Pulse animation along the line
  const pulsePosition = interpolate(
    (frame - delay * fps) % (fps * 1.5),
    [0, fps * 1.5],
    [0, 1]
  );

  const radians = (angle * Math.PI) / 180;
  const lineLength = 280;
  const startX = Math.cos(radians) * 100;
  const startY = Math.sin(radians) * 100;
  const endX = Math.cos(radians) * lineLength;
  const endY = Math.sin(radians) * lineLength;

  // Calculate current line end based on progress
  const currentEndX = startX + (endX - startX) * lineProgress;
  const currentEndY = startY + (endY - startY) * lineProgress;

  // Pulse dot position
  const pulseX = startX + (endX - startX) * pulsePosition * lineProgress;
  const pulseY = startY + (endY - startY) * pulsePosition * lineProgress;

  return (
    <g>
      {/* Main line */}
      <line
        x1={960 + startX}
        y1={540 + startY}
        x2={960 + currentEndX}
        y2={540 + currentEndY}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.6}
      />
      {/* Glowing line */}
      <line
        x1={960 + startX}
        y1={540 + startY}
        x2={960 + currentEndX}
        y2={540 + currentEndY}
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        opacity={0.15}
        filter="blur(4px)"
      />
      {/* Pulse dot traveling along line */}
      {lineProgress > 0.1 && (
        <circle
          cx={960 + pulseX}
          cy={540 + pulseY}
          r={6}
          fill={color}
          opacity={0.9}
        >
          <animate
            attributeName="r"
            values="4;8;4"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
};

// Beneficiary node
const BeneficiaryNode: React.FC<{
  beneficiary: (typeof BENEFICIARIES)[0];
  index: number;
}> = ({ beneficiary, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = 0.4 + index * 0.15;
  const nodeEntry = spring({
    frame: frame - delay * fps,
    fps,
    config: { damping: 12, stiffness: 70 },
  });

  // Float animation
  const float = Math.sin(frame * 0.03 + index * 1.5) * 5;

  // Position based on angle
  const radians = (beneficiary.angle * Math.PI) / 180;
  const distance = 320;
  const x = 50 + (Math.cos(radians) * distance) / 19.2; // Convert to percentage
  const y = 50 + (Math.sin(radians) * distance) / 10.8;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) translateY(${float}px) scale(${nodeEntry})`,
        opacity: nodeEntry,
        fontFamily,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 30,
          background: `linear-gradient(135deg, ${beneficiary.color}25 0%, ${beneficiary.color}10 100%)`,
          border: `2px solid ${beneficiary.color}60`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          boxShadow: `0 10px 40px ${beneficiary.color}30`,
          backdropFilter: "blur(10px)",
        }}
      >
        <span style={{ fontSize: 44 }}>{beneficiary.emoji}</span>
      </div>
      <div
        style={{
          marginTop: 16,
          fontSize: 20,
          fontWeight: 700,
          color: COLORS.textWhite,
        }}
      >
        {beneficiary.title}
      </div>
      <div
        style={{
          fontSize: 14,
          color: COLORS.textSubtle,
          marginTop: 4,
        }}
      >
        {beneficiary.subtitle}
      </div>
    </div>
  );
};

export const SceneBeneficiaries: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Center logo animation
  const logoEntry = spring({
    frame: frame - 0.1 * fps,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  // Pulsing glow
  const glowPulse = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0.7, 1]
  );

  // Title animation
  const titleEntry = spring({
    frame: frame - 0.8 * fps,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  // Rotation for central glow
  const rotation = interpolate(frame, [0, fps * 20], [0, 360]);

  return (
    <AbsoluteFill style={{ background: COLORS.bgDark }}>
      {/* Matrix-like grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage: `
            linear-gradient(${COLORS.primary}40 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.primary}40 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Central rotating glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          width: 600,
          height: 600,
          background: `conic-gradient(from 0deg, ${COLORS.primary}30, transparent, ${COLORS.primary}30, transparent, ${COLORS.primary}30)`,
          borderRadius: "50%",
          filter: "blur(50px)",
          opacity: glowPulse,
        }}
      />

      {/* Connecting lines SVG */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {BENEFICIARIES.map((b, i) => (
          <ConnectingLine
            key={i}
            angle={b.angle}
            delay={0.2 + i * 0.1}
            color={b.color}
          />
        ))}
      </svg>

      {/* Central Widdo Logo */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${logoEntry})`,
          opacity: logoEntry,
        }}
      >
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${COLORS.primary}30 0%, ${COLORS.primary}10 100%)`,
            border: `3px solid ${COLORS.primary}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 60px ${COLORS.primary}50, inset 0 0 30px ${COLORS.primary}20`,
          }}
        >
          <Img
            src={staticFile("widdo-logo.svg")}
            style={{
              width: 100,
              height: 100,
            }}
          />
        </div>
      </div>

      {/* Beneficiary Nodes */}
      {BENEFICIARIES.map((beneficiary, index) => (
        <BeneficiaryNode key={index} beneficiary={beneficiary} index={index} />
      ))}

      {/* Title at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: `translateX(-50%) translateY(${interpolate(titleEntry, [0, 1], [30, 0])}px)`,
          opacity: titleEntry,
          textAlign: "center",
          fontFamily,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: COLORS.primary,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Todos conectados
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: COLORS.textWhite,
            letterSpacing: "-0.02em",
          }}
        >
          Un ecosistema para tu club
        </div>
      </div>

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
