import React from "react";
import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { fontFamily } from "../../fonts";
import { COLORS } from "../../colors";
import { BrowserFrame } from "../ui/BrowserFrame";
import { MockSidebar } from "../ui/MockSidebar";
import { StatusBadge } from "../ui/StatusBadge";
import { Callout } from "../ui/Callout";
import { Check, Clock, Hourglass, AlertTriangle } from "lucide-react";

// 7 seconds = 210 frames

const charges = [
  { name: "Mensualidad Febrero", amount: "$85.000", due: "28 Feb 2026", progress: 0.65, collected: "$2.210.000", total: "$3.400.000" },
  { name: "Uniforme Competencia", amount: "$120.000", due: "15 Mar 2026", progress: 0.3, collected: "$1.080.000", total: "$3.600.000" },
  { name: "Inscripcion Torneo", amount: "$45.000", due: "10 Feb 2026", progress: 0.88, collected: "$1.890.000", total: "$2.150.000" },
];

const paymentStates = [
  { name: "Santiago Lopez", status: "Pagado", icon: Check, variant: "success" as const, detail: "Transferencia · 5 Feb" },
  { name: "Valentina Ruiz", status: "Pendiente", icon: Clock, variant: "warning" as const, detail: "Vence en 20 dias" },
  { name: "Mateo Garcia", status: "Verificando", icon: Hourglass, variant: "info" as const, detail: "Comprobante enviado" },
  { name: "Isabella Torres", status: "Vencido", icon: AlertTriangle, variant: "danger" as const, detail: "Vencio hace 5 dias" },
  { name: "Samuel Herrera", status: "Pagado", icon: Check, variant: "success" as const, detail: "Efectivo · 3 Feb" },
];

export const ScenePayments: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const frameW = isVertical ? Math.round(width * 0.94) : 960;
  const frameH = isVertical ? Math.round(height * 0.58) : 620;
  const sidebarW = isVertical ? 170 : 190;

  const entryProgress = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });

  const zoomToStates = interpolate(frame, [85, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(zoomToStates, [0, 1], [1, isVertical ? 1.5 : 1.8]);
  const translateX = interpolate(zoomToStates, [0, 1], [0, isVertical ? -50 : -100]);
  const translateY = interpolate(zoomToStates, [0, 1], [0, isVertical ? -60 : -90]);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgDark,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: isVertical ? "flex-start" : "center",
        paddingTop: isVertical ? 80 : 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 600, height: 400, borderRadius: "50%",
          background: `radial-gradient(ellipse, ${COLORS.primaryGlowLight} 0%, transparent 70%)`,
          filter: "blur(60px)", top: isVertical ? "25%" : "30%",
        }}
      />

      <Sequence from={15} layout="none">
        <Callout
          text="Crea cobros y recauda automaticamente"
          position="top-center"
          variant="default"
          fontSize={isVertical ? 24 : 22}
        />
      </Sequence>

      <div
        style={{
          transform: `scale(${scale * entryProgress}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: "center center",
          marginTop: isVertical ? 40 : 0,
        }}
      >
        <BrowserFrame width={frameW} height={frameH}>
          <div style={{ display: "flex", height: "100%" }}>
            <MockSidebar activeKey="charges" width={sidebarW} />

            <div
              style={{
                flex: 1,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                overflow: "hidden",
                background: COLORS.gray100,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.gray900 }}>Gestion de Cobros</div>
                  <div style={{ fontSize: 10, color: COLORS.gray500 }}>Controla los cobros y pagos de jugadores</div>
                </div>
                <div
                  style={{
                    background: COLORS.primary,
                    borderRadius: 6,
                    padding: "5px 12px",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  + Nuevo Cobro
                </div>
              </div>

              {/* Charges list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {charges.map((c, i) => {
                  const chargeDelay = 8 + i * 6;
                  const chargeFrame = Math.max(0, frame - chargeDelay);
                  const chargeProgress = spring({ frame: chargeFrame, fps, config: { damping: 14, stiffness: 120 } });
                  const barProgress = interpolate(chargeFrame, [10, 35], [0, c.progress], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

                  return (
                    <div
                      key={i}
                      style={{
                        background: "#fff",
                        border: `1px solid ${COLORS.gray200}`,
                        borderRadius: 10,
                        padding: "10px 14px",
                        opacity: chargeProgress,
                        transform: `translateY(${(1 - chargeProgress) * 15}px)`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray900 }}>{c.name}</div>
                          <div style={{ fontSize: 9, color: COLORS.gray500 }}>{c.amount} por jugador · Vence: {c.due}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.gray900 }}>{c.collected}</div>
                          <div style={{ fontSize: 9, color: COLORS.gray500 }}>de {c.total}</div>
                        </div>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: COLORS.gray100, overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${barProgress * 100}%`,
                            borderRadius: 3,
                            background: c.progress > 0.7 ? COLORS.success : c.progress > 0.4 ? COLORS.warning : COLORS.danger,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 9, color: COLORS.gray500, marginTop: 3, textAlign: "right" }}>
                        {Math.round(barProgress * 100)}% recaudado
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Payment states */}
              <div
                style={{
                  background: "#fff",
                  border: `1px solid ${COLORS.gray200}`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  flex: 1,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.gray900, marginBottom: 6 }}>
                  Mensualidad Febrero - Estados
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {paymentStates.map((ps, i) => {
                    const stateDelay = frame >= 90 ? 95 + i * 5 : 999;
                    const stateFrame = Math.max(0, frame - stateDelay);
                    const stateProgress = spring({ frame: stateFrame, fps, config: { damping: 14, stiffness: 120 } });

                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "5px 8px",
                          borderRadius: 6,
                          background: i % 2 === 0 ? COLORS.gray50 : "transparent",
                          opacity: frame >= 90 ? stateProgress : 0.4,
                          transform: frame >= 90 ? `translateX(${(1 - stateProgress) * 20}px)` : "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 22, height: 22, borderRadius: "50%",
                              background: `${COLORS.primary}18`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 9, fontWeight: 700, color: COLORS.primary,
                            }}
                          >
                            {ps.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 500, color: COLORS.gray900 }}>{ps.name}</div>
                            <div style={{ fontSize: 8, color: COLORS.gray500 }}>{ps.detail}</div>
                          </div>
                        </div>
                        <StatusBadge text={ps.status} variant={ps.variant} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </BrowserFrame>
      </div>

      <Sequence from={100} layout="none">
        <Callout
          text="Seguimiento de cada pago"
          position="bottom-center"
          variant="highlight"
          fontSize={isVertical ? 24 : 20}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
