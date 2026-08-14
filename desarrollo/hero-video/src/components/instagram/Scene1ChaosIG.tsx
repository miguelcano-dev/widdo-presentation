import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS } from "../../colors";
import { fontFamily } from "../../fonts";
import {
  Table2,
  MessageCircle,
  FileText,
  Phone,
  Coins,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";

// Modern floating card with Lucide icons
const FloatingCard: React.FC<{
  Icon: React.ElementType;
  label: string;
  color: string;
  x: number;
  y: number;
  delay: number;
  rotation: number;
  size?: number;
}> = ({ Icon, label, color, x, y, delay, rotation, size = 200 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entry = spring({
    frame: frame - delay * fps,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const float = Math.sin(frame * 0.04 + delay * 5) * 15;
  const wobble = Math.sin(frame * 0.02 + delay * 3) * 4;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) translateY(${float}px) rotate(${rotation + wobble}deg) scale(${entry})`,
        opacity: entry,
        fontFamily,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 32,
          background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`,
          border: `1px solid rgba(255,255,255,0.12)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          backdropFilter: "blur(12px)",
          boxShadow: `0 15px 40px rgba(0,0,0,0.3)`,
          padding: 20,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: `linear-gradient(135deg, ${color}30 0%, ${color}15 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={32} color={color} strokeWidth={2} />
        </div>
        <span
          style={{
            fontSize: 18,
            color: "#fff",
            fontWeight: 600,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

const CHAOS_APPS = [
  { Icon: Table2, label: "Excel", color: "#22c55e", x: 22, y: 14, rotation: -5 },
  { Icon: MessageCircle, label: "WhatsApp", color: "#25D366", x: 78, y: 12, rotation: 6 },
  { Icon: FileText, label: "Papel", color: "#f59e0b", x: 15, y: 40, rotation: -8 },
  { Icon: Phone, label: "Llamadas", color: "#3b82f6", x: 85, y: 38, rotation: 5 },
  { Icon: Coins, label: "Cobros", color: "#a855f7", x: 20, y: 72, rotation: -4 },
  { Icon: CalendarDays, label: "Agenda", color: "#ec4899", x: 80, y: 70, rotation: 7 },
];

export const Scene1ChaosIG: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const iconEntry = spring({
    frame: frame - 0.4 * fps,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const titleEntry = spring({
    frame: frame - 0.7 * fps,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  const pulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.95, 1.05]);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0a6b30 0%, #064e23 25%, #032d12 60%, #021a0a 100%)",
      }}
    >
      {/* Subtle glow */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${COLORS.primary}20 0%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(100px)",
        }}
      />

      {/* Subtle grid */}
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

      {/* Floating chaos cards */}
      {CHAOS_APPS.map((item, i) => (
        <FloatingCard key={i} {...item} delay={i * 0.1} size={160} />
      ))}

      {/* Center content */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          zIndex: 10,
        }}
      >
        {/* Warning icon - simple */}
        <div
          style={{
            transform: `scale(${iconEntry * pulse})`,
            opacity: iconEntry,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)",
              border: "1px solid rgba(251, 191, 36, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={48} color="#fbbf24" strokeWidth={2} />
          </div>
        </div>

        {/* Main text */}
        <div
          style={{
            transform: `translateY(${interpolate(titleEntry, [0, 1], [40, 0])}px)`,
            opacity: titleEntry,
            textAlign: "center",
            fontFamily,
            padding: "0 30px",
          }}
        >
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.01em",
              lineHeight: 1.25,
            }}
          >
            ¿Todavía gestionas
            <br />
            tu Club con
            <br />
            <span style={{ color: "#fbbf24" }}>
              herramientas dispersas
            </span>
            ?
          </div>
        </div>

        {/* Bottom badge */}
        <div
          style={{
            transform: `translateY(${interpolate(titleEntry, [0, 1], [20, 0])}px)`,
            opacity: titleEntry,
            marginTop: 20,
            fontFamily,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 24,
              padding: "12px 24px",
            }}
          >
            <span style={{ fontSize: 17, color: "#fff", fontWeight: 500 }}>
              Hay una <span style={{ color: COLORS.primary, fontWeight: 600 }}>mejor forma</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "15%",
          background: "linear-gradient(to top, rgba(2, 26, 10, 0.7) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
