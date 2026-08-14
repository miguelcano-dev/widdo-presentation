import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from "remotion";
import { PROMO } from "../../promoColors";
import { interFont, monoFont } from "../../promoFonts";
import { Building2, Trophy, GraduationCap, Zap, Users, Globe, TrendingUp, DollarSign } from "lucide-react";

const PRODUCTS = [
  {
    icon: Building2,
    name: "Widdo Clubs",
    tagline: "Gestion completa de tu club",
    color: PROMO.green,
    stats: [
      { label: "Clubes", value: "14", icon: Building2 },
      { label: "Usuarios", value: "774", icon: Users },
    ],
    highlights: ["Jugadores", "Pagos", "Asistencia", "Calendario", "Chat", "IA"],
    status: "En produccion",
    statusActive: true,
  },
  {
    icon: Trophy,
    name: "Widdo Tournaments",
    tagline: "Torneos de principio a fin",
    color: PROMO.blue,
    stats: [
      { label: "Deportes", value: "42", icon: Globe },
      { label: "Fases", value: "9", icon: TrendingUp },
    ],
    highlights: ["Brackets", "Scoring", "Rankings", "Inscripciones", "Multi-deporte", "Pagos"],
    status: "En desarrollo",
    statusActive: false,
  },
  {
    icon: GraduationCap,
    name: "Widdo Academy",
    tagline: "Platzi del deporte",
    color: PROMO.purple,
    stats: [
      { label: "Revenue", value: "Indep.", icon: DollarSign },
      { label: "Modelo", value: "B2C", icon: TrendingUp },
    ],
    highlights: ["Cursos", "Coaching", "Nutricion", "Certificados", "Mentoria", "Revenue share"],
    status: "En planeacion",
    statusActive: false,
  },
];

export const ScenePromoEcosystem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEntry = spring({ frame, fps, config: { damping: 200, stiffness: 80 } });
  const glowOpacity = interpolate(frame, [0, fps * 4, fps * 8], [0.06, 0.14, 0.06], { extrapolateRight: "extend" });

  // Center hub
  const hubEntry = spring({ frame, fps, delay: 8, config: { damping: 200, stiffness: 60 } });

  // Connection lines
  const lineProgress = interpolate(frame, [fps * 0.8, fps * 1.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: PROMO.bg }}>
      {/* Conic glow */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: `translate(-50%, -50%) rotate(${Math.round(frame * 0.3)}deg)`, width: 900, height: 900, background: `conic-gradient(from 0deg, ${PROMO.green}14, transparent, ${PROMO.blue}0A, transparent, ${PROMO.purple}0A, transparent)`, borderRadius: "50%", filter: "blur(120px)", opacity: 0.9 }} />

      {/* Grid */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.02, backgroundImage: `linear-gradient(${PROMO.green}15 1px, transparent 1px), linear-gradient(90deg, ${PROMO.green}15 1px, transparent 1px)`, backgroundSize: "50px 50px" }} />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: "40px 56px 36px",
        }}
      >
        {/* Title */}
        <div
          style={{
            transform: `translateY(${Math.round((1 - titleEntry) * 14)}px)`,
            opacity: titleEntry,
            textAlign: "center",
            marginBottom: 28,
            fontFamily: interFont,
            flexShrink: 0,
          }}
        >
          <div style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 600, color: PROMO.green, letterSpacing: "0.15em", marginBottom: 10 }}>
            ECOSISTEMA
          </div>
          <div style={{ fontSize: 46, fontWeight: 900, color: PROMO.text, letterSpacing: "-0.02em" }}>
            3 productos.{" "}
            <span style={{ color: PROMO.green }}>1 ecosistema.</span>
          </div>
        </div>

        {/* Main layout: 3 product cards with center hub */}
        <div style={{ flex: 1, display: "flex", gap: 0, position: "relative" }}>
          {/* Center hub — Widdo logo connecting everything */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${hubEntry})`,
              opacity: hubEntry,
              zIndex: 10,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${PROMO.bgElevated} 40%, ${PROMO.bgCard} 100%)`,
              border: `2px solid ${PROMO.green}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 60px ${PROMO.green}20, 0 0 120px ${PROMO.green}10`,
            }}
          >
            <Img src={staticFile("widdo-logo.svg")} style={{ width: 52, height: 52, filter: `drop-shadow(0 4px 20px ${PROMO.green}60)` }} />
          </div>

          {/* Connection lines from center to each card */}
          <svg
            style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none" }}
            viewBox="0 0 1808 600"
            preserveAspectRatio="none"
          >
            {/* Left line */}
            <line
              x1="904" y1="300"
              x2="460" y2="300"
              stroke={PROMO.green}
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity={lineProgress * 0.4}
            />
            {/* Right line */}
            <line
              x1="904" y1="300"
              x2="1348" y2="300"
              stroke={PROMO.purple}
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity={lineProgress * 0.4}
            />
          </svg>

          {/* 3 Product cards */}
          {PRODUCTS.map((product, index) => {
            const cardEntry = spring({ frame, fps, delay: 12 + index * 7, config: { damping: 200, stiffness: 80 } });
            const Icon = product.icon;

            return (
              <div
                key={index}
                style={{
                  flex: 1,
                  margin: index === 1 ? "0 120px" : 0,
                  display: "flex",
                  flexDirection: "column",
                  opacity: cardEntry,
                  transform: `translateY(${Math.round((1 - cardEntry) * 20)}px)`,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: `linear-gradient(160deg, ${product.color}0A 0%, ${PROMO.bgCard} 40%)`,
                    border: `1px solid ${product.color}25`,
                    borderRadius: 18,
                    padding: "32px 28px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Background glow */}
                  <div
                    style={{
                      position: "absolute",
                      top: -60,
                      right: -60,
                      width: 220,
                      height: 220,
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${product.color}12 0%, transparent 70%)`,
                      filter: "blur(40px)",
                    }}
                  />

                  {/* Icon + Name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6, position: "relative" }}>
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 18,
                        background: `${product.color}12`,
                        border: `1px solid ${product.color}25`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={30} color={product.color} strokeWidth={1.8} />
                    </div>
                    <div>
                      <div style={{ fontFamily: interFont, fontSize: 24, fontWeight: 800, color: PROMO.text, letterSpacing: "-0.01em" }}>
                        {product.name}
                      </div>
                      <div style={{ fontFamily: interFont, fontSize: 14, color: PROMO.textMuted, marginTop: 3 }}>
                        {product.tagline}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: `${product.color}15`, margin: "18px 0" }} />

                  {/* Highlight chips — 2 columns */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      flex: 1,
                      alignContent: "start",
                    }}
                  >
                    {product.highlights.map((h, j) => (
                      <div
                        key={j}
                        style={{
                          background: `${product.color}08`,
                          border: `1px solid ${product.color}15`,
                          borderRadius: 10,
                          padding: "10px 14px",
                          fontFamily: interFont,
                          fontSize: 13,
                          fontWeight: 600,
                          color: PROMO.textSecondary,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: product.color, flexShrink: 0 }} />
                        {h}
                      </div>
                    ))}
                  </div>

                  {/* Stats row */}
                  <div style={{ display: "flex", gap: 12, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${product.color}12` }}>
                    {product.stats.map((s, j) => {
                      const SIcon = s.icon;
                      return (
                        <div key={j} style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: `${product.color}08`, borderRadius: 10, padding: "10px 14px" }}>
                          <SIcon size={16} color={product.color} strokeWidth={2} />
                          <div>
                            <div style={{ fontFamily: monoFont, fontSize: 18, fontWeight: 700, color: PROMO.text }}>{s.value}</div>
                            <div style={{ fontFamily: interFont, fontSize: 11, color: PROMO.textMuted }}>{s.label}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Status */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: product.statusActive ? PROMO.green : PROMO.textMuted, boxShadow: product.statusActive ? `0 0 6px ${PROMO.green}` : "none" }} />
                    <span style={{ fontFamily: monoFont, fontSize: 12, color: product.statusActive ? PROMO.green : PROMO.textMuted }}>
                      {product.status}
                    </span>
                  </div>

                  {/* Accent line at bottom */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 28,
                      right: 28,
                      height: 3,
                      borderRadius: 2,
                      background: `linear-gradient(90deg, ${product.color}50, ${product.color}08)`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom bar — flywheel explanation */}
        {(() => {
          const barEntry = spring({ frame, fps, delay: Math.round(2.2 * fps), config: { damping: 200, stiffness: 100 } });
          return (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 32,
                padding: "16px 0",
                opacity: barEntry,
                transform: `translateY(${Math.round((1 - barEntry) * 8)}px)`,
                flexShrink: 0,
              }}
            >
              {[
                { text: "Club opera", color: PROMO.green },
                { text: "Inscribe equipos en torneos", color: PROMO.blue },
                { text: "Staff se capacita", color: PROMO.purple },
              ].map((step, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Zap size={16} color={PROMO.green} />
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: PROMO.bgCard, border: `1px solid ${step.color}20`, borderRadius: 10, padding: "10px 20px" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: step.color }} />
                    <span style={{ fontFamily: interFont, fontSize: 14, fontWeight: 600, color: PROMO.textSecondary }}>
                      {step.text}
                    </span>
                  </div>
                </React.Fragment>
              ))}
              <div style={{ display: "flex", alignItems: "center" }}>
                <Zap size={16} color={PROMO.green} />
              </div>
              <div style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 700, color: PROMO.green, background: PROMO.greenGlow, border: `1px solid ${PROMO.greenBorder}`, borderRadius: 10, padding: "10px 20px" }}>
                EFECTO DE RED
              </div>
            </div>
          );
        })()}
      </div>

      {/* Vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 80% at center, transparent 55%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
