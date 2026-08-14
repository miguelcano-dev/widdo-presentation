import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { PROMO } from "../../promoColors";
import { interFont, monoFont } from "../../promoFonts";
import {
  Users,
  CreditCard,
  Calendar,
  Bell,
  ClipboardCheck,
  BarChart3,
  MessageSquare,
  Shield,
  Bot,
} from "lucide-react";

const MODULES = [
  { icon: Users, title: "Jugadores", sub: "Fichas, documentos, historial completo", color: "#00C853", size: "large" as const },
  { icon: CreditCard, title: "Pagos", sub: "Cobros automaticos, Wompi, MercadoPago", color: "#4DABF7", size: "medium" as const },
  { icon: Calendar, title: "Calendario", sub: "Entrenos, partidos, eventos", color: "#FF922B", size: "medium" as const },
  { icon: ClipboardCheck, title: "Asistencia", sub: "Un toque, estadisticas en vivo", color: "#22D3EE", size: "medium" as const },
  { icon: Bot, title: "Asistente IA", sub: "Pregunta lo que necesites", color: "#00C853", size: "medium" as const },
  { icon: Shield, title: "Multi-Rol", sub: "5 roles, acceso controlado", color: "#FFBE0B", size: "large" as const },
  { icon: Bell, title: "Notificaciones", sub: "Push, email, in-app", color: "#A78BFA", size: "compact" as const },
  { icon: BarChart3, title: "Reportes", sub: "Metricas en vivo", color: "#EC4899", size: "compact" as const },
  { icon: MessageSquare, title: "Chat", sub: "Comunicacion directa", color: "#10B981", size: "compact" as const },
];

const BentoCard: React.FC<{
  mod: (typeof MODULES)[0];
  delay: number;
  style?: React.CSSProperties;
}> = ({ mod, delay, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entry = spring({ frame, fps, delay, config: { damping: 200, stiffness: 100 } });
  const Icon = mod.icon;
  const isLarge = mod.size === "large";
  const isCompact = mod.size === "compact";

  return (
    <div
      style={{
        background: `linear-gradient(145deg, ${mod.color}14 0%, ${PROMO.bgCard} 60%)`,
        border: `1px solid ${mod.color}28`,
        borderRadius: 18,
        padding: isCompact ? "20px 24px" : isLarge ? "28px 32px" : "22px 28px",
        display: "flex",
        flexDirection: isCompact ? "row" as const : "column" as const,
        gap: isCompact ? 16 : 0,
        alignItems: isCompact ? "center" : "flex-start",
        opacity: entry,
        transform: `translateY(${Math.round((1 - entry) * 14)}px)`,
        overflow: "hidden",
        position: "relative" as const,
        ...style,
      }}
    >
      {/* Background glow */}
      {!isCompact && (
        <div
          style={{
            position: "absolute",
            bottom: isLarge ? -40 : -30,
            right: isLarge ? -40 : -30,
            width: isLarge ? 180 : 120,
            height: isLarge ? 180 : 120,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${mod.color}18 0%, transparent 70%)`,
            filter: "blur(30px)",
          }}
        />
      )}

      {/* Icon */}
      <div
        style={{
          width: isLarge ? 60 : isCompact ? 40 : 48,
          height: isLarge ? 60 : isCompact ? 40 : 48,
          borderRadius: isLarge ? 18 : isCompact ? 10 : 14,
          background: `${mod.color}18`,
          border: `1px solid ${mod.color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginBottom: isCompact ? 0 : isLarge ? 16 : 12,
        }}
      >
        <Icon
          size={isLarge ? 30 : isCompact ? 20 : 24}
          color={mod.color}
          strokeWidth={1.8}
        />
      </div>

      {/* Text */}
      <div>
        <div
          style={{
            fontFamily: interFont,
            fontSize: isLarge ? 24 : isCompact ? 17 : 20,
            fontWeight: 800,
            color: PROMO.text,
            letterSpacing: "-0.01em",
            marginBottom: isCompact ? 2 : 6,
          }}
        >
          {mod.title}
        </div>
        <div
          style={{
            fontFamily: interFont,
            fontSize: isLarge ? 15 : isCompact ? 12 : 13,
            color: PROMO.textSecondary,
            lineHeight: 1.4,
          }}
        >
          {mod.sub}
        </div>
      </div>

      {/* Accent line for large cards */}
      {isLarge && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 32,
            right: 32,
            height: 3,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${mod.color}60, ${mod.color}10)`,
          }}
        />
      )}
    </div>
  );
};

export const ScenePromoFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEntry = spring({ frame, fps, config: { damping: 200, stiffness: 80 } });
  const glowOpacity = interpolate(frame, [0, fps * 4, fps * 8], [0.05, 0.1, 0.05], { extrapolateRight: "extend" });

  return (
    <AbsoluteFill style={{ background: PROMO.bg }}>
      {/* Glows */}
      <div style={{ position: "absolute", top: "20%", left: "5%", width: 500, height: 500, background: `radial-gradient(circle, rgba(0,200,83,${glowOpacity}) 0%, transparent 70%)`, filter: "blur(100px)" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 400, height: 400, background: `radial-gradient(circle, rgba(77,171,247,${glowOpacity * 0.6}) 0%, transparent 70%)`, filter: "blur(100px)" }} />

      {/* Content — centered vertically */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 80px",
        }}
      >
        {/* Title */}
        <div
          style={{
            transform: `translateY(${Math.round((1 - titleEntry) * 12)}px)`,
            opacity: titleEntry,
            textAlign: "center",
            marginBottom: 36,
            fontFamily: interFont,
            flexShrink: 0,
          }}
        >
          <div style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 600, color: PROMO.green, letterSpacing: "0.15em", marginBottom: 12 }}>
            TODO LO QUE NECESITAS
          </div>
          <div style={{ fontSize: 46, fontWeight: 900, color: PROMO.text, letterSpacing: "-0.02em" }}>
            <span style={{ color: PROMO.green }}>9</span> modulos.{" "}
            <span style={{ color: PROMO.green }}>1</span> plataforma.
          </div>
        </div>

        {/* Bento grid — auto height, not stretched */}
        <div style={{ width: "100%", maxWidth: 1760, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Row 1: large left + 2 stacked right */}
          <div style={{ display: "flex", gap: 14, height: 200 }}>
            <div style={{ flex: 1.1 }}>
              <BentoCard mod={MODULES[0]} delay={6} style={{ height: "100%" }} />
            </div>
            <div style={{ flex: 0.9, display: "flex", flexDirection: "column", gap: 14 }}>
              <BentoCard mod={MODULES[1]} delay={9} style={{ flex: 1 }} />
              <BentoCard mod={MODULES[2]} delay={12} style={{ flex: 1 }} />
            </div>
          </div>

          {/* Row 2: 2 stacked left + large right */}
          <div style={{ display: "flex", gap: 14, height: 200 }}>
            <div style={{ flex: 0.9, display: "flex", flexDirection: "column", gap: 14 }}>
              <BentoCard mod={MODULES[3]} delay={15} style={{ flex: 1 }} />
              <BentoCard mod={MODULES[4]} delay={18} style={{ flex: 1 }} />
            </div>
            <div style={{ flex: 1.1 }}>
              <BentoCard mod={MODULES[5]} delay={21} style={{ height: "100%" }} />
            </div>
          </div>

          {/* Row 3: 3 compact */}
          <div style={{ display: "flex", gap: 14 }}>
            <BentoCard mod={MODULES[6]} delay={24} style={{ flex: 1 }} />
            <BentoCard mod={MODULES[7]} delay={26} style={{ flex: 1 }} />
            <BentoCard mod={MODULES[8]} delay={28} style={{ flex: 1 }} />
          </div>
        </div>
      </div>

      {/* Vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 85% at center, transparent 55%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
