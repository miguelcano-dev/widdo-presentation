import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { PROMO } from "../../promoColors";
import { interFont, monoFont } from "../../promoFonts";
import { TrendingUp, Users, UserCheck, Shield, Layers, Database, Code2, DollarSign, Zap } from "lucide-react";

const BIG_METRICS = [
  { value: 14, suffix: "", label: "Clubes Activos", sublabel: "Creciendo cada mes en Colombia", icon: Layers, color: PROMO.green },
  { value: 774, suffix: "", label: "Usuarios Totales", sublabel: "100% organico, $0 CAC", icon: Users, color: PROMO.blue },
  { value: 399, suffix: "", label: "Jugadores", sublabel: "Registrados y activos", icon: UserCheck, color: PROMO.purple },
  { value: 0, suffix: "%", label: "Churn Rate", sublabel: "Ningun club se ha ido", icon: Shield, color: PROMO.green },
];

const TECH_STATS = [
  { label: "Modelos en DB", value: "107", icon: Database },
  { label: "Tablas", value: "80+", icon: Layers },
  { label: "Controllers", value: "55+", icon: Code2 },
  { label: "CAC", value: "$0", icon: DollarSign },
  { label: "Crecimiento", value: "Organico", icon: Zap },
];

export const ScenePromoMetrics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEntry = spring({ frame, fps, config: { damping: 200, stiffness: 80 } });
  const glowOpacity = interpolate(frame, [0, fps * 3, fps * 6], [0.08, 0.18, 0.08], { extrapolateRight: "extend" });
  const countDuration = 50;

  return (
    <AbsoluteFill style={{ background: PROMO.bg }}>
      {/* Green glow */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 1400, height: 1000, background: `radial-gradient(ellipse, rgba(0, 200, 83, ${glowOpacity}) 0%, transparent 65%)`, filter: "blur(120px)" }} />

      {/* Grid */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: `linear-gradient(${PROMO.textMuted}25 1px, transparent 1px), linear-gradient(90deg, ${PROMO.textMuted}25 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: "44px 64px 40px",
        }}
      >
        {/* Title */}
        <div
          style={{
            transform: `translateY(${Math.round((1 - titleEntry) * 16)}px)`,
            opacity: titleEntry,
            textAlign: "center",
            marginBottom: 44,
            fontFamily: interFont,
            flexShrink: 0,
          }}
        >
          <div style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 600, color: PROMO.green, letterSpacing: "0.15em", marginBottom: 12 }}>
            RESULTADOS REALES
          </div>
          <div style={{ fontSize: 48, fontWeight: 900, color: PROMO.text, letterSpacing: "-0.02em" }}>
            Traccion <span style={{ color: PROMO.green }}>100% organica</span>
          </div>
        </div>

        {/* Big metrics — bento layout: 2 large top, 2 medium bottom-left + tech bar bottom-right */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Top row: 4 metric cards */}
          <div style={{ display: "flex", gap: 16, flex: 1 }}>
            {BIG_METRICS.map((metric, i) => {
              const delay = 10 + i * 5;
              const cardEntry = spring({ frame, fps, delay, config: { damping: 200, stiffness: 80 } });
              const countValue = Math.round(
                interpolate(Math.max(0, frame - (delay + 10)), [0, countDuration], [0, metric.value], {
                  extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
                })
              );
              const Icon = metric.icon;
              const isChurn = i === 3;

              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    background: `linear-gradient(160deg, ${metric.color}0A 0%, ${PROMO.bgCard} 50%)`,
                    border: `1px solid ${metric.color}22`,
                    borderRadius: 18,
                    padding: "36px 32px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    opacity: cardEntry,
                    transform: `translateY(${Math.round((1 - cardEntry) * 16)}px)`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Background glow */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: -50,
                      right: -50,
                      width: 180,
                      height: 180,
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${metric.color}15 0%, transparent 70%)`,
                      filter: "blur(30px)",
                    }}
                  />

                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: `${metric.color}10`,
                      border: `1px solid ${metric.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 24,
                    }}
                  >
                    <Icon size={28} color={metric.color} strokeWidth={1.8} />
                  </div>

                  <div
                    style={{
                      fontFamily: monoFont,
                      fontSize: 68,
                      fontWeight: 700,
                      color: PROMO.text,
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}
                  >
                    {countValue}{metric.suffix}
                  </div>

                  <div style={{ fontFamily: interFont, fontSize: 18, fontWeight: 700, color: PROMO.textSecondary, marginTop: 16 }}>
                    {metric.label}
                  </div>
                  <div style={{ fontFamily: interFont, fontSize: 13, color: PROMO.textMuted, marginTop: 6 }}>
                    {metric.sublabel}
                  </div>

                  {/* Accent line */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 32,
                      right: 32,
                      height: 3,
                      borderRadius: 2,
                      background: `linear-gradient(90deg, ${metric.color}50, ${metric.color}08)`,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Bottom: tech stats bar */}
          {(() => {
            const barEntry = spring({ frame, fps, delay: Math.round(2 * fps), config: { damping: 200, stiffness: 100 } });
            return (
              <div
                style={{
                  display: "flex",
                  gap: 0,
                  padding: "22px 0",
                  background: `linear-gradient(135deg, ${PROMO.bgCard} 0%, ${PROMO.bgElevated} 100%)`,
                  border: `1px solid ${PROMO.border}`,
                  borderRadius: 16,
                  opacity: barEntry,
                  transform: `translateY(${Math.round((1 - barEntry) * 10)}px)`,
                  flexShrink: 0,
                }}
              >
                {TECH_STATS.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 14,
                        borderRight: i < TECH_STATS.length - 1 ? `1px solid ${PROMO.border}` : "none",
                        padding: "6px 0",
                      }}
                    >
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${PROMO.green}08`, border: `1px solid ${PROMO.green}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={18} color={PROMO.textMuted} strokeWidth={2} />
                      </div>
                      <div>
                        <div style={{ fontFamily: monoFont, fontSize: 22, fontWeight: 700, color: PROMO.green }}>
                          {stat.value}
                        </div>
                        <div style={{ fontFamily: interFont, fontSize: 12, color: PROMO.textMuted }}>
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 80% at center, transparent 55%, rgba(0,0,0,0.35) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
