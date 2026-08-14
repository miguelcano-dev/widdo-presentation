import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS } from "../colors";
import { fontFamily } from "../fonts";
import {
  Users,
  CreditCard,
  Calendar,
  Bell,
  ClipboardCheck,
  BarChart3,
  MessageSquare,
  Shield,
} from "lucide-react";

const MODULES = [
  {
    icon: Users,
    title: "Gestión de Jugadores",
    description: "Fichas completas y seguimiento",
    color: "#16a34a",
  },
  {
    icon: CreditCard,
    title: "Control de Pagos",
    description: "Cobros y facturación automática",
    color: "#3b82f6",
  },
  {
    icon: Calendar,
    title: "Calendario Inteligente",
    description: "Entrenos, partidos y eventos",
    color: "#f97316",
  },
  {
    icon: Bell,
    title: "Notificaciones",
    description: "Recordatorios automáticos",
    color: "#8b5cf6",
  },
  {
    icon: ClipboardCheck,
    title: "Control de Asistencia",
    description: "Registro con un solo toque",
    color: "#06b6d4",
  },
  {
    icon: BarChart3,
    title: "Reportes y Estadísticas",
    description: "Métricas en tiempo real",
    color: "#ec4899",
  },
  {
    icon: MessageSquare,
    title: "Comunicación Directa",
    description: "Chat con padres y jugadores",
    color: "#10b981",
  },
  {
    icon: Shield,
    title: "Permisos por Rol",
    description: "Control de acceso seguro",
    color: "#f59e0b",
  },
];

const ModuleCard: React.FC<{
  module: (typeof MODULES)[0];
  index: number;
  totalModules: number;
}> = ({ module, index, totalModules }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = 0.15 + index * 0.08;
  const cardEntry = spring({
    frame: frame - delay * fps,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  // Subtle float animation
  const float = Math.sin(frame * 0.03 + index * 2) * 3;

  // Calculate grid position for staggered entry
  const row = Math.floor(index / 4);
  const col = index % 4;
  const xOffset = interpolate(cardEntry, [0, 1], [col < 2 ? -60 : 60, 0]);
  const yOffset = interpolate(cardEntry, [0, 1], [row === 0 ? -40 : 40, 0]);

  const Icon = module.icon;

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${module.color}15 0%, ${module.color}08 100%)`,
        border: `1px solid ${module.color}40`,
        borderRadius: 20,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        transform: `translateX(${xOffset}px) translateY(${yOffset + float}px) scale(${interpolate(cardEntry, [0, 1], [0.8, 1])})`,
        opacity: cardEntry,
        backdropFilter: "blur(10px)",
        boxShadow: `0 8px 32px ${module.color}20`,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: `${module.color}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={28} color={module.color} strokeWidth={2} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: COLORS.textWhite,
            marginBottom: 4,
          }}
        >
          {module.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: COLORS.textSubtle,
            lineHeight: 1.3,
          }}
        >
          {module.description}
        </div>
      </div>
    </div>
  );
};

export const SceneModules: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleEntry = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  // Background pulse
  const bgPulse = interpolate(
    Math.sin(frame * 0.02),
    [-1, 1],
    [0.8, 1.2]
  );

  return (
    <AbsoluteFill style={{ background: COLORS.bgDark }}>
      {/* Animated gradient orbs */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: 400,
          height: 400,
          background: `radial-gradient(circle, ${COLORS.primary}20 0%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(60px)",
          transform: `scale(${bgPulse})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "15%",
          width: 350,
          height: 350,
          background: `radial-gradient(circle, #8b5cf620 0%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(60px)",
          transform: `scale(${1.4 - bgPulse * 0.4})`,
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
          backgroundSize: "50px 50px",
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
          padding: 60,
          fontFamily,
        }}
      >
        {/* Title */}
        <div
          style={{
            transform: `translateY(${interpolate(titleEntry, [0, 1], [-30, 0])}px)`,
            opacity: titleEntry,
            textAlign: "center",
            marginBottom: 50,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: COLORS.primary,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Todo lo que necesitas
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: COLORS.textWhite,
              letterSpacing: "-0.02em",
            }}
          >
            Módulos Principales
          </div>
        </div>

        {/* Module Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 240px)",
            gridTemplateRows: "repeat(2, auto)",
            gap: 24,
          }}
        >
          {MODULES.map((module, index) => (
            <ModuleCard
              key={index}
              module={module}
              index={index}
              totalModules={MODULES.length}
            />
          ))}
        </div>
      </div>

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
