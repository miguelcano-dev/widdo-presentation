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
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Calendar,
} from "lucide-react";

// 5 seconds = 150 frames

export const SceneMultiRole: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const frameW = isVertical ? Math.round(width * 0.9) : 900;
  const frameH = isVertical ? Math.round(height * 0.5) : 520;
  const sidebarW = isVertical ? 160 : 170;
  const cardW = isVertical ? Math.floor((frameW - sidebarW - 70) / 3) : 145;

  const trainerProgress = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const trainerExit = interpolate(frame, [65, 80], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const parentDelay = 75;
  const parentProgress = spring({ frame: Math.max(0, frame - parentDelay), fps, config: { damping: 14, stiffness: 100 } });

  const showTrainer = frame < 85;
  const showParent = frame >= 70;

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgDark,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: isVertical ? "flex-start" : "center",
        paddingTop: isVertical ? 100 : 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 600, height: 400, borderRadius: "50%",
          background: `radial-gradient(ellipse, ${COLORS.primaryGlowLight} 0%, transparent 70%)`,
          filter: "blur(60px)", top: isVertical ? "30%" : "30%",
        }}
      />

      {/* Trainer callout */}
      {showTrainer && (
        <Sequence from={10} layout="none">
          <Callout
            text="Vista del Entrenador"
            position="top-center"
            variant="dark"
            fontSize={isVertical ? 28 : 22}
          />
        </Sequence>
      )}

      {/* Parent callout */}
      {showParent && (
        <Sequence from={80} layout="none">
          <Callout
            text="Vista del Padre"
            position="top-center"
            variant="default"
            fontSize={isVertical ? 28 : 22}
          />
        </Sequence>
      )}

      {/* Trainer Dashboard */}
      {showTrainer && (
        <div
          style={{
            position: "absolute",
            top: isVertical ? 160 : "50%",
            left: "50%",
            transform: `translate(-50%, ${isVertical ? "0" : "-50%"}) scale(${trainerProgress * 0.95 + 0.05})`,
            opacity: trainerExit * trainerProgress,
          }}
        >
          <BrowserFrame width={frameW} height={frameH}>
            <div style={{ display: "flex", height: "100%" }}>
              <MockSidebar activeKey="dashboard" width={sidebarW} accentColor={COLORS.roleTrainer} />
              <div
                style={{
                  flex: 1, padding: "12px 14px",
                  display: "flex", flexDirection: "column", gap: 8,
                  background: COLORS.gray100,
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(135deg, #164e63, #155e75)",
                    borderRadius: 8,
                    padding: "10px 14px",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Panel del Entrenador</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>Diego Sanchez · Sub-13</div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <MetricCard icon={Users} iconColor={COLORS.roleTrainer} value={18} label="Mis jugadores" delay={5} width={cardW} />
                  <MetricCard icon={CalendarDays} iconColor="#f59e0b" value={4} label="Sesiones semana" delay={10} width={cardW} />
                  <MetricCard icon={ClipboardCheck} iconColor={COLORS.success} value={89} suffix="%" label="Asistencia" delay={15} width={cardW} />
                </div>

                <div
                  style={{
                    background: "#fff",
                    border: `1px solid ${COLORS.gray200}`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    flex: 1,
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.gray900, marginBottom: 4 }}>Proximas sesiones</div>
                  {[
                    { time: "Hoy 4:00 PM", title: "Entrenamiento tecnico", players: "16/18" },
                    { time: "Mie 4:00 PM", title: "Preparacion fisica", players: "18/18" },
                    { time: "Vie 3:00 PM", title: "Partido amistoso", players: "15/18" },
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: i < 2 ? `1px solid ${COLORS.gray100}` : "none" }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.gray900 }}>{s.title}</div>
                        <div style={{ fontSize: 8, color: COLORS.gray500 }}>{s.time}</div>
                      </div>
                      <span style={{ fontSize: 9, color: COLORS.gray600 }}>{s.players}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </BrowserFrame>
        </div>
      )}

      {/* Parent Dashboard */}
      {showParent && (
        <div
          style={{
            position: "absolute",
            top: isVertical ? 160 : "50%",
            left: "50%",
            transform: `translate(-50%, ${isVertical ? "0" : "-50%"}) scale(${parentProgress * 0.95 + 0.05})`,
            opacity: parentProgress,
          }}
        >
          <BrowserFrame width={frameW} height={frameH}>
            <div style={{ display: "flex", height: "100%" }}>
              <MockSidebar activeKey="dashboard" width={sidebarW} accentColor={COLORS.roleParent} />
              <div
                style={{
                  flex: 1, padding: "12px 14px",
                  display: "flex", flexDirection: "column", gap: 8,
                  background: COLORS.gray100,
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(135deg, #831843, #9d174d)",
                    borderRadius: 8,
                    padding: "10px 14px",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Mi Familia</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>Maria Rivera · 2 hijos inscritos</div>
                </div>

                {/* Children cards */}
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { name: "Santiago", cat: "Sub-13", payment: "Al dia" },
                    { name: "Camila", cat: "Sub-11", payment: "Pendiente" },
                  ].map((child, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1, background: "#fff",
                        border: `1px solid ${COLORS.gray200}`,
                        borderRadius: 8, padding: 10,
                        display: "flex", flexDirection: "column", gap: 5,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div
                          style={{
                            width: 26, height: 26, borderRadius: "50%",
                            background: `${COLORS.roleParent}18`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 700, color: COLORS.roleParent,
                          }}
                        >
                          {child.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.gray900 }}>{child.name}</div>
                          <div style={{ fontSize: 8, color: COLORS.gray500 }}>{child.cat}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <StatusBadge text="Activo" variant="success" />
                        <StatusBadge text={child.payment} variant={child.payment === "Al dia" ? "success" : "warning"} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payments & Calendar */}
                <div style={{ display: "flex", gap: 8, flex: 1 }}>
                  <div style={{ flex: 1, background: "#fff", border: `1px solid ${COLORS.gray200}`, borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                      <CreditCard size={10} color={COLORS.gray500} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.gray900 }}>Pagos pendientes</span>
                    </div>
                    {[
                      { label: "Mensualidad Feb - Camila", amount: "$85.000" },
                      { label: "Uniforme - Santiago", amount: "$120.000" },
                    ].map((p, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: i < 1 ? `1px solid ${COLORS.gray100}` : "none" }}>
                        <div style={{ fontSize: 9, fontWeight: 500, color: COLORS.gray900 }}>{p.label}</div>
                        <span style={{ fontSize: 9, fontWeight: 600, color: COLORS.gray700 }}>{p.amount}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ flex: 1, background: "#fff", border: `1px solid ${COLORS.gray200}`, borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                      <Calendar size={10} color={COLORS.gray500} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.gray900 }}>Proximas sesiones</span>
                    </div>
                    {[
                      { time: "Hoy 4PM", title: "Entrenamiento - Santiago" },
                      { time: "Mar 5PM", title: "Entrenamiento - Camila" },
                      { time: "Vie 3PM", title: "Partido - Santiago" },
                    ].map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 0", borderBottom: i < 2 ? `1px solid ${COLORS.gray100}` : "none" }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.primary }} />
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 500, color: COLORS.gray900 }}>{s.title}</div>
                          <div style={{ fontSize: 7, color: COLORS.gray500 }}>{s.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </BrowserFrame>
        </div>
      )}
    </AbsoluteFill>
  );
};
