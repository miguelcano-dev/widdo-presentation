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
import { MetricCard } from "../ui/MetricCard";
import { StatusBadge } from "../ui/StatusBadge";
import { Callout } from "../ui/Callout";
import {
  Users,
  UserCheck,
  FolderOpen,
  CalendarDays,
  DollarSign,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

// 10 seconds = 300 frames @ 30fps

export const SceneDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  // Sizing based on format
  const frameW = isVertical ? Math.round(width * 0.94) : 960;
  const frameH = isVertical ? Math.round(height * 0.58) : 620;
  const sidebarW = isVertical ? 170 : 190;
  const cardW = isVertical
    ? Math.floor((frameW - sidebarW - 80) / 4)
    : 170;

  const entryProgress = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 80 },
  });

  // Zoom phases
  const zoomToFinancials = interpolate(frame, [80, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const zoomToPayments = interpolate(frame, [175, 195], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  if (frame < 90) {
    scale = 1;
  } else if (frame < 180) {
    scale = interpolate(zoomToFinancials, [0, 1], [1, isVertical ? 1.6 : 1.8]);
    translateX = interpolate(zoomToFinancials, [0, 1], [0, isVertical ? -40 : -80]);
    translateY = interpolate(zoomToFinancials, [0, 1], [0, isVertical ? -120 : -160]);
  } else {
    scale = interpolate(zoomToPayments, [0, 1], [isVertical ? 1.6 : 1.8, isVertical ? 1.7 : 2.0]);
    translateX = interpolate(zoomToPayments, [0, 1], [isVertical ? -40 : -80, isVertical ? -60 : -120]);
    translateY = interpolate(zoomToPayments, [0, 1], [isVertical ? -120 : -160, isVertical ? -200 : -220]);
  }

  const payments = [
    { name: "Santiago Lopez", amount: "$85.000", status: "Pagado" as const, variant: "success" as const },
    { name: "Valentina Ruiz", amount: "$85.000", status: "Pendiente" as const, variant: "warning" as const },
    { name: "Mateo Garcia", amount: "$120.000", status: "Verificando" as const, variant: "info" as const },
    { name: "Isabella Torres", amount: "$85.000", status: "Vencido" as const, variant: "danger" as const },
    { name: "Samuel Herrera", amount: "$85.000", status: "Pagado" as const, variant: "success" as const },
  ];

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
          width: 800,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${COLORS.primaryGlowLight} 0%, transparent 70%)`,
          filter: "blur(60px)",
          top: isVertical ? "25%" : "30%",
        }}
      />

      {/* Callout above frame */}
      <Sequence from={20} layout="none">
        <Callout
          text="Control total de tu club"
          position={isVertical ? "top-center" : "top-left"}
          variant="default"
          fontSize={isVertical ? 28 : 22}
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
            <MockSidebar activeKey="dashboard" width={sidebarW} />

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
              {/* Top bar mockup */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#fff",
                  borderRadius: 8,
                  padding: "8px 14px",
                  border: `1px solid ${COLORS.gray200}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: `${COLORS.primary}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 800,
                      color: COLORS.primary,
                    }}
                  >
                    B
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.gray900 }}>
                      Bogota FC
                    </div>
                    <div style={{ fontSize: 8, color: COLORS.gray500 }}>Propietario</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: COLORS.gray500 }}>8 Feb 2026</div>
              </div>

              {/* Page title */}
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.gray900, padding: "0 2px" }}>
                Panel de Control
              </div>

              {/* Activity metrics */}
              <div style={{ display: "flex", gap: 8 }}>
                <MetricCard icon={Users} iconColor={COLORS.primary} value={47} label="Jugadores activos" trend="12%" trendUp delay={5} width={cardW} />
                <MetricCard icon={UserCheck} iconColor={COLORS.roleTrainer} value={5} label="Entrenadores" delay={10} width={cardW} />
                <MetricCard icon={FolderOpen} iconColor="#7c3aed" value={8} label="Categorias" delay={15} width={cardW} />
                <MetricCard icon={CalendarDays} iconColor="#f59e0b" value={12} label="Sesiones del mes" trend="8%" trendUp delay={20} width={cardW} />
              </div>

              {/* Financial metrics */}
              <div style={{ display: "flex", gap: 8 }}>
                <MetricCard icon={DollarSign} iconColor={COLORS.success} value={2.4} prefix="$" suffix="M" decimals={1} label="Recaudado" sublabel="Este periodo" trend="15%" trendUp delay={25} width={cardW} />
                <MetricCard icon={Clock} iconColor={COLORS.warning} value={850} prefix="$" suffix="K" label="Pendiente" sublabel="Por cobrar" delay={30} width={cardW} />
                <MetricCard icon={AlertCircle} iconColor={COLORS.info} value={120} prefix="$" suffix="K" label="Por verificar" delay={35} width={cardW} />
                <MetricCard icon={TrendingUp} iconColor={COLORS.gray500} value={1.8} prefix="$" suffix="M" decimals={1} label="Mes anterior" delay={40} width={cardW} />
              </div>

              {/* Payments table */}
              <div
                style={{
                  background: "#fff",
                  border: `1px solid ${COLORS.gray200}`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  flex: 1,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.gray900, marginBottom: 8 }}>
                  Ultimos Pagos
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {payments.map((p, i) => {
                    const itemDelay = 45 + i * 4;
                    const itemFrame = Math.max(0, frame - itemDelay);
                    const itemProgress = spring({ frame: itemFrame, fps, config: { damping: 14, stiffness: 120 } });
                    const avatarColors = ["#16a34a", "#0891b2", "#7c3aed", "#db2777", "#f59e0b"];
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
                          opacity: itemProgress,
                          transform: `translateX(${(1 - itemProgress) * 20}px)`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 24, height: 24, borderRadius: "50%",
                              background: `${avatarColors[i]}18`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 10, fontWeight: 700, color: avatarColors[i],
                            }}
                          >
                            {p.name.charAt(0)}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 500, color: COLORS.gray900 }}>{p.name}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.gray700 }}>{p.amount}</span>
                          <StatusBadge text={p.status} variant={p.variant} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </BrowserFrame>
      </div>

      {/* Callouts below frame */}
      <Sequence from={95} layout="none">
        <Callout
          text="Finanzas en tiempo real"
          position="bottom-center"
          variant="highlight"
          fontSize={isVertical ? 26 : 20}
        />
      </Sequence>

      <Sequence from={190} layout="none">
        <Callout
          text="Identifica deudores al instante"
          position="bottom-center"
          variant="dark"
          fontSize={isVertical ? 24 : 20}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
