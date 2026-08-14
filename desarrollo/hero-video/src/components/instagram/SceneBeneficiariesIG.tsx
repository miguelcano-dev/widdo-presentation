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
import { ArrowRight } from "lucide-react";

const BENEFICIARIES = [
  { emoji: "👔", title: "Dueños", color: "#f97316" },
  { emoji: "🏃", title: "Entrenadores", color: "#3b82f6" },
  { emoji: "👨‍👩‍👧", title: "Padres", color: "#8b5cf6" },
  { emoji: "⚽", title: "Jugadores", color: "#10b981" },
];

// Flowing particle
const FlowingParticle: React.FC<{
  startX: number;
  startY: number;
  delay: number;
  color: string;
}> = ({ startX, startY, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cycleDuration = fps * 2;
  const cycleFrame = (frame - delay * fps) % cycleDuration;

  const progress = interpolate(
    cycleFrame,
    [0, cycleDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = interpolate(
    progress,
    [0, 0.1, 0.9, 1],
    [0, 1, 1, 0]
  );

  // Path from start position to center (540, 960)
  const x = startX + (540 - startX) * progress;
  const y = startY + (960 - startY) * progress;

  if (frame < delay * fps) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 20px ${color}, 0 0 40px ${color}80`,
        opacity,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
};

// Beneficiary card
const BeneficiaryCard: React.FC<{
  beneficiary: (typeof BENEFICIARIES)[0];
  index: number;
  position: { x: number; y: number };
}> = ({ beneficiary, index, position }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = 0.2 + index * 0.12;
  const cardEntry = spring({
    frame: frame - delay * fps,
    fps,
    config: { damping: 12, stiffness: 70 },
  });

  const float = Math.sin(frame * 0.03 + index * 1.5) * 6;

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) translateY(${float}px) scale(${cardEntry})`,
        opacity: cardEntry,
        fontFamily,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 130,
          height: 130,
          borderRadius: 32,
          background: "linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
          border: `2px solid ${beneficiary.color}60`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(20px)",
          boxShadow: `0 20px 50px rgba(0,0,0,0.3), 0 0 40px ${beneficiary.color}30`,
        }}
      >
        <span style={{ fontSize: 56 }}>{beneficiary.emoji}</span>
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 18,
          fontWeight: 700,
          color: "#fff",
          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
        }}
      >
        {beneficiary.title}
      </div>
      {/* Arrow pointing to center */}
      <div
        style={{
          marginTop: 8,
          opacity: 0.7,
        }}
      >
        <ArrowRight
          size={20}
          color={beneficiary.color}
          style={{
            transform: `rotate(${position.x < 50 ? 45 : position.x > 50 ? 135 : 90}deg)`,
          }}
        />
      </div>
    </div>
  );
};

export const SceneBeneficiariesIG: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoEntry = spring({
    frame: frame - 0.1 * fps,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const titleEntry = spring({
    frame: frame - 0.5 * fps,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  const glowPulse = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.7, 1]);
  const rotation = interpolate(frame, [0, fps * 25], [0, 360]);

  const nodePositions = [
    { x: 22, y: 22 },
    { x: 78, y: 25 },
    { x: 20, y: 72 },
    { x: 80, y: 75 },
  ];

  // Particle starting positions (in pixels for 1080x1920)
  const particleStarts = [
    { x: 238, y: 422 },   // Top left
    { x: 842, y: 480 },   // Top right
    { x: 216, y: 1382 },  // Bottom left
    { x: 864, y: 1440 },  // Bottom right
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(165deg, #021a0a 0%, #032d12 30%, #064e23 70%, #0a6b30 100%)",
      }}
    >
      {/* Central mega glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${glowPulse})`,
          width: 800,
          height: 800,
          background: `radial-gradient(circle, ${COLORS.primary}50 0%, ${COLORS.primary}20 50%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(80px)",
        }}
      />

      {/* Colored glows for each corner */}
      {BENEFICIARIES.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${nodePositions[i].x}%`,
            top: `${nodePositions[i].y}%`,
            transform: "translate(-50%, -50%)",
            width: 300,
            height: 300,
            background: `radial-gradient(circle, ${b.color}30 0%, transparent 70%)`,
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        />
      ))}

      {/* Rotating rings */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: `2px solid ${COLORS.primary}30`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${-rotation * 0.6}deg)`,
          width: 320,
          height: 320,
          borderRadius: "50%",
          border: `1px solid ${COLORS.primary}20`,
        }}
      />

      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Flowing particles */}
      {BENEFICIARIES.map((b, i) => (
        [...Array(5)].map((_, j) => (
          <FlowingParticle
            key={`${i}-${j}`}
            startX={particleStarts[i].x}
            startY={particleStarts[i].y}
            delay={0.3 + i * 0.15 + j * 0.4}
            color={b.color}
          />
        ))
      ))}

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: "50%",
          transform: `translateX(-50%) translateY(${interpolate(titleEntry, [0, 1], [-30, 0])}px)`,
          opacity: titleEntry,
          textAlign: "center",
          fontFamily,
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: COLORS.primary,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginBottom: 12,
            textShadow: `0 0 30px ${COLORS.primary}60`,
          }}
        >
          Todos conectados
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "-0.02em",
            textShadow: "0 4px 30px rgba(0,0,0,0.5)",
          }}
        >
          Un Ecosistema
        </div>
      </div>

      {/* Central Widdo Logo */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${logoEntry})`,
          opacity: logoEntry,
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: `linear-gradient(145deg, ${COLORS.primary} 0%, #0f9d4a 50%, #0d7a3a 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `
              0 30px 80px ${COLORS.primary}60,
              0 0 120px ${COLORS.primary}40,
              inset 0 -4px 15px rgba(0,0,0,0.3),
              inset 0 4px 15px rgba(255,255,255,0.2)
            `,
          }}
        >
          <Img
            src={staticFile("widdo-logo.svg")}
            style={{ width: 100, height: 100 }}
          />
        </div>
      </div>

      {/* Beneficiary Cards */}
      {BENEFICIARIES.map((beneficiary, index) => (
        <BeneficiaryCard
          key={index}
          beneficiary={beneficiary}
          index={index}
          position={nodePositions[index]}
        />
      ))}

      {/* Bottom text */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: "50%",
          transform: `translateX(-50%)`,
          opacity: titleEntry,
          fontFamily,
        }}
      >
        <div
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 30,
            padding: "14px 28px",
            backdropFilter: "blur(10px)",
          }}
        >
          <span style={{ fontSize: 18, color: "#fff", fontWeight: 600 }}>
            Para tu <span style={{ color: COLORS.primary }}>Club</span>
          </span>
        </div>
      </div>

      {/* Bottom gradient */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "10%",
          background: "linear-gradient(to top, rgba(2, 26, 10, 0.6) 0%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
