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
  Users,
  CreditCard,
  Calendar,
  TrendingUp,
  Bell,
  ClipboardCheck,
} from "lucide-react";

// Glassmorphism stat card
const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  delay: number;
  size?: "large" | "small";
}> = ({ icon: Icon, label, value, color, delay, size = "small" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entry = spring({
    frame: frame - delay * fps,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const float = Math.sin(frame * 0.03 + delay * 3) * 5;

  return (
    <div
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: size === "large" ? 28 : 22,
        padding: size === "large" ? "28px 24px" : "20px 18px",
        display: "flex",
        alignItems: size === "large" ? "center" : "flex-start",
        gap: size === "large" ? 20 : 14,
        transform: `translateY(${interpolate(entry, [0, 1], [50, float])}px)`,
        opacity: entry,
        backdropFilter: "blur(20px)",
        boxShadow: `0 20px 50px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
        flexDirection: size === "large" ? "row" : "column",
      }}
    >
      <div
        style={{
          width: size === "large" ? 60 : 48,
          height: size === "large" ? 60 : 48,
          borderRadius: size === "large" ? 18 : 14,
          background: `linear-gradient(145deg, ${color}40 0%, ${color}20 100%)`,
          border: `1px solid ${color}50`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={size === "large" ? 30 : 24} color={color} />
      </div>
      <div>
        <div
          style={{
            fontSize: size === "large" ? 14 : 11,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 4,
            fontWeight: 500,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: size === "large" ? 38 : 28,
            fontWeight: 800,
            color: "#fff",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
};

export const Scene3DashboardIG: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEntry = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(165deg, #021a0a 0%, #032d12 30%, #064e23 70%, #0a6b30 100%)",
      }}
    >
      {/* Glowing orbs */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${COLORS.primary}40 0%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          right: "-10%",
          width: 400,
          height: 400,
          background: `radial-gradient(circle, #3b82f630 0%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(60px)",
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

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "50px 40px",
          fontFamily,
        }}
      >
        {/* Title */}
        <div
          style={{
            transform: `translateY(${interpolate(titleEntry, [0, 1], [-40, 0])}px)`,
            opacity: titleEntry,
            textAlign: "center",
            marginBottom: 40,
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
            Una plataforma
          </div>
          <div
            style={{
              fontSize: 60,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.02em",
              textShadow: "0 4px 30px rgba(0,0,0,0.4)",
            }}
          >
            Control Total
          </div>
        </div>

        {/* Stats Grid - 2 large + 4 small */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Large stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <StatCard
              icon={Users}
              label="Jugadores activos"
              value="127"
              color={COLORS.primary}
              delay={0.3}
              size="large"
            />
            <StatCard
              icon={CreditCard}
              label="Cobros del mes"
              value="$4.2M"
              color="#3b82f6"
              delay={0.4}
              size="large"
            />
          </div>

          {/* Small stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            <StatCard
              icon={Calendar}
              label="Eventos"
              value="12"
              color="#f97316"
              delay={0.5}
            />
            <StatCard
              icon={TrendingUp}
              label="Asistencia"
              value="94%"
              color="#8b5cf6"
              delay={0.55}
            />
            <StatCard
              icon={Bell}
              label="Notificaciones"
              value="1.2K"
              color="#ec4899"
              delay={0.6}
            />
            <StatCard
              icon={ClipboardCheck}
              label="Entrenos"
              value="48"
              color="#06b6d4"
              delay={0.65}
            />
          </div>
        </div>

        {/* Bottom badge */}
        <div
          style={{
            marginTop: 36,
            transform: `translateY(${interpolate(titleEntry, [0, 1], [20, 0])}px)`,
            opacity: titleEntry,
          }}
        >
          <div
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 40,
              padding: "14px 28px",
              backdropFilter: "blur(10px)",
            }}
          >
            <span style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
              Todo en{" "}
              <span style={{ color: COLORS.primary, fontWeight: 700 }}>tiempo real</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "15%",
          background: "linear-gradient(to top, rgba(2, 26, 10, 0.6) 0%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
