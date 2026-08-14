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
  Bell,
  ClipboardCheck,
  BarChart3,
  MessageSquare,
  Shield,
  Zap,
} from "lucide-react";

const MODULES = [
  { icon: Users, title: "Jugadores", color: "#16a34a" },
  { icon: CreditCard, title: "Pagos", color: "#3b82f6" },
  { icon: Calendar, title: "Calendario", color: "#f97316" },
  { icon: Bell, title: "Alertas", color: "#8b5cf6" },
  { icon: ClipboardCheck, title: "Asistencia", color: "#06b6d4" },
  { icon: BarChart3, title: "Reportes", color: "#ec4899" },
  { icon: MessageSquare, title: "Chat", color: "#10b981" },
  { icon: Shield, title: "Roles", color: "#f59e0b" },
];

const ModuleCard: React.FC<{
  module: (typeof MODULES)[0];
  index: number;
}> = ({ module, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = 0.12 + index * 0.06;
  const cardEntry = spring({
    frame: frame - delay * fps,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const float = Math.sin(frame * 0.025 + index * 1.5) * 4;
  const Icon = module.icon;

  return (
    <div
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 22,
        padding: "22px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        transform: `translateY(${float}px) scale(${interpolate(cardEntry, [0, 1], [0.7, 1])})`,
        opacity: cardEntry,
        backdropFilter: "blur(20px)",
        boxShadow: `0 15px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)`,
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 16,
          background: `linear-gradient(145deg, ${module.color}45 0%, ${module.color}20 100%)`,
          border: `1px solid ${module.color}60`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 8px 25px ${module.color}40`,
        }}
      >
        <Icon size={28} color="#fff" strokeWidth={2.2} />
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#fff",
          textAlign: "center",
        }}
      >
        {module.title}
      </div>
    </div>
  );
};

export const SceneModulesIG: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEntry = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  const rotation = interpolate(frame, [0, fps * 25], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(165deg, #021a0a 0%, #032d12 30%, #064e23 70%, #0a6b30 100%)",
      }}
    >
      {/* Large central glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 900,
          background: `radial-gradient(circle, ${COLORS.primary}35 0%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(100px)",
        }}
      />

      {/* Colored accent glows */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "0%",
          width: 350,
          height: 350,
          background: `radial-gradient(circle, #3b82f625 0%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "-5%",
          width: 300,
          height: 300,
          background: `radial-gradient(circle, #8b5cf625 0%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(50px)",
        }}
      />

      {/* Rotating subtle ring */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          width: 700,
          height: 700,
          borderRadius: "50%",
          border: `1px solid ${COLORS.primary}15`,
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
          padding: "50px 35px",
          fontFamily,
        }}
      >
        {/* Title */}
        <div
          style={{
            transform: `translateY(${interpolate(titleEntry, [0, 1], [-30, 0])}px)`,
            opacity: titleEntry,
            textAlign: "center",
            marginBottom: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <Zap size={18} color={COLORS.primary} fill={COLORS.primary} />
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: COLORS.primary,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                textShadow: `0 0 20px ${COLORS.primary}50`,
              }}
            >
              Todo lo que necesitas
            </span>
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.02em",
              textShadow: "0 4px 30px rgba(0,0,0,0.4)",
            }}
          >
            Módulos
          </div>
        </div>

        {/* Module Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 14,
            width: "100%",
          }}
        >
          {MODULES.map((module, index) => (
            <ModuleCard key={index} module={module} index={index} />
          ))}
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            marginTop: 32,
            opacity: titleEntry,
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 30,
              padding: "12px 24px",
              backdropFilter: "blur(10px)",
            }}
          >
            <span style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
              Y mucho más en{" "}
              <span style={{ color: COLORS.primary, fontWeight: 700 }}>una sola app</span>
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
