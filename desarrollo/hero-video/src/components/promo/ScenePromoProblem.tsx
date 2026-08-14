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
import {
  FileSpreadsheet,
  MessageCircle,
  Banknote,
  FolderOpen,
  Phone,
  Clock,
  AlertTriangle,
  X,
} from "lucide-react";

const CHAOS_ITEMS = [
  { icon: FileSpreadsheet, label: "Hojas de calculo", sub: "Datos perdidos, versiones viejas, sin backup", color: PROMO.red },
  { icon: MessageCircle, label: "Grupos WhatsApp", sub: "100+ mensajes diarios, info que se pierde", color: PROMO.yellow },
  { icon: Banknote, label: "Cobros en efectivo", sub: "Sin rastreo, sin comprobante, morosos ocultos", color: PROMO.orange },
  { icon: FolderOpen, label: "Carpetas fisicas", sub: "Documentos extraviados, fichas incompletas", color: PROMO.red },
  { icon: Phone, label: "Llamadas sin fin", sub: "Confirmar asistencia uno por uno", color: PROMO.yellow },
  { icon: Clock, label: "15 horas/semana", sub: "El director pierde haciendo tareas administrativas", color: PROMO.red },
];

export const ScenePromoProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEntry = spring({ frame, fps, config: { damping: 200, stiffness: 80 } });
  const badgeEntry = spring({ frame, fps, delay: 5, config: { damping: 200, stiffness: 100 } });

  // Stats count-up
  const statsDelay = Math.round(1.8 * fps);
  const statEntry = spring({ frame, fps, delay: statsDelay, config: { damping: 200, stiffness: 80 } });
  const statFrame = Math.max(0, frame - statsDelay - 6);
  const count73 = Math.round(interpolate(statFrame, [0, 40], [0, 73], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  const count15 = Math.round(interpolate(statFrame, [0, 40], [0, 15], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));

  // Glow
  const redGlow = interpolate(frame, [0, fps * 4, fps * 8], [0.06, 0.14, 0.06], { extrapolateRight: "extend" });

  return (
    <AbsoluteFill style={{ background: PROMO.bg }}>
      {/* Red glow */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 1200, height: 1000, background: `radial-gradient(ellipse, rgba(255, 71, 87, ${redGlow}) 0%, transparent 65%)`, filter: "blur(120px)" }} />

      {/* Grid */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.02, backgroundImage: `linear-gradient(${PROMO.red}20 1px, transparent 1px), linear-gradient(90deg, ${PROMO.red}20 1px, transparent 1px)`, backgroundSize: "50px 50px" }} />

      {/* LAYOUT: Two columns — left: title + stats, right: cards grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 100px",
          gap: 80,
        }}
      >
        {/* Left column — Title + stats */}
        <div style={{ width: 520, flexShrink: 0 }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255, 71, 87, 0.08)",
              border: "1px solid rgba(255, 71, 87, 0.25)",
              borderRadius: 9999,
              padding: "10px 24px",
              marginBottom: 32,
              opacity: badgeEntry,
              transform: `translateY(${Math.round((1 - badgeEntry) * 10)}px)`,
            }}
          >
            <AlertTriangle size={16} color={PROMO.red} />
            <span style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 600, color: PROMO.red, letterSpacing: "0.1em" }}>
              EL PROBLEMA
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              opacity: titleEntry,
              transform: `translateY(${Math.round((1 - titleEntry) * 20)}px)`,
              fontFamily: interFont,
              marginBottom: 48,
            }}
          >
            <div style={{ fontSize: 60, fontWeight: 900, color: PROMO.text, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Asi gestionan
            </div>
            <div style={{ fontSize: 60, fontWeight: 900, color: PROMO.text, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              hoy <span style={{ color: PROMO.red }}>miles</span>
            </div>
            <div style={{ fontSize: 60, fontWeight: 900, color: PROMO.red, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              de clubes
            </div>
          </div>

          {/* Stats — integrated in left column */}
          <div
            style={{
              opacity: statEntry,
              transform: `translateY(${Math.round((1 - statEntry) * 12)}px)`,
              display: "flex",
              gap: 48,
            }}
          >
            <div>
              <div style={{ fontFamily: monoFont, fontSize: 64, fontWeight: 700, color: PROMO.red, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {count73}%
              </div>
              <div style={{ fontFamily: interFont, fontSize: 15, color: PROMO.textSecondary, marginTop: 8 }}>
                de clubes sin software
              </div>
            </div>
            <div style={{ width: 1, background: PROMO.border, alignSelf: "stretch" }} />
            <div>
              <div style={{ fontFamily: monoFont, fontSize: 64, fontWeight: 700, color: PROMO.yellow, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {count15}h
              </div>
              <div style={{ fontFamily: interFont, fontSize: 15, color: PROMO.textSecondary, marginTop: 8 }}>
                perdidas por semana
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Chaos cards, 2 columns stacked */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          {CHAOS_ITEMS.map((item, index) => {
            const cardEntry = spring({ frame, fps, delay: 10 + index * 4, config: { damping: 200, stiffness: 100 } });
            const Icon = item.icon;

            return (
              <div
                key={index}
                style={{
                  background: PROMO.bgCard,
                  border: `1px solid ${item.color}20`,
                  borderRadius: 14,
                  padding: "22px 28px",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  opacity: cardEntry,
                  transform: `translateX(${Math.round((1 - cardEntry) * 30)}px)`,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: `${item.color}10`,
                    border: `1px solid ${item.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={24} color={item.color} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: interFont, fontSize: 18, fontWeight: 700, color: PROMO.text }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: interFont, fontSize: 14, color: PROMO.textMuted, marginTop: 4, lineHeight: 1.3 }}>
                    {item.sub}
                  </div>
                </div>
                <X size={20} color={`${item.color}60`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 80% at center, transparent 50%, rgba(0,0,0,0.45) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
