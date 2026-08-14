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
import { Search, FileText, Shield, UserPlus } from "lucide-react";

// 7 seconds = 210 frames

const players = [
  { name: "Santiago Lopez", initials: "SL", category: "Sub-13", age: 12, status: "Activo", statusVariant: "success" as const, payment: "Al dia", paymentVariant: "success" as const, profile: 95 },
  { name: "Valentina Ruiz", initials: "VR", category: "Sub-11", age: 10, status: "Activo", statusVariant: "success" as const, payment: "Pendiente", paymentVariant: "warning" as const, profile: 80 },
  { name: "Mateo Garcia", initials: "MG", category: "Sub-15", age: 14, status: "Activo", statusVariant: "success" as const, payment: "Al dia", paymentVariant: "success" as const, profile: 100 },
  { name: "Isabella Torres", initials: "IT", category: "Sub-13", age: 12, status: "Lesionado", statusVariant: "danger" as const, payment: "Al dia", paymentVariant: "success" as const, profile: 70 },
  { name: "Samuel Herrera", initials: "SH", category: "Sub-17", age: 16, status: "Activo", statusVariant: "success" as const, payment: "Vencido", paymentVariant: "danger" as const, profile: 85 },
  { name: "Camila Diaz", initials: "CD", category: "Sub-11", age: 10, status: "Activo", statusVariant: "success" as const, payment: "Al dia", paymentVariant: "success" as const, profile: 90 },
];

export const ScenePlayers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const frameW = isVertical ? Math.round(width * 0.94) : 960;
  const frameH = isVertical ? Math.round(height * 0.58) : 620;
  const sidebarW = isVertical ? 170 : 190;

  const entryProgress = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });

  // Zoom to detail
  const zoomToDetail = interpolate(frame, [85, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(zoomToDetail, [0, 1], [1, isVertical ? 1.5 : 1.9]);
  const translateX = interpolate(zoomToDetail, [0, 1], [0, isVertical ? -30 : -60]);
  const translateY = interpolate(zoomToDetail, [0, 1], [0, isVertical ? -60 : -100]);

  const showDetail = frame >= 100;
  const detailProgress = showDetail
    ? spring({ frame: frame - 100, fps, config: { damping: 12, stiffness: 120 } })
    : 0;

  const avatarColors = ["#16a34a", "#0891b2", "#7c3aed", "#db2777", "#f59e0b", "#3b82f6"];

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

      {/* Callout above */}
      <Sequence from={15} layout="none">
        <Callout
          text="Todos tus jugadores organizados"
          position="top-center"
          variant="default"
          fontSize={isVertical ? 26 : 22}
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
            <MockSidebar activeKey="players" width={sidebarW} />

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
              {/* Header with actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.gray900 }}>
                    Gestion de Jugadores
                  </div>
                  <div style={{ fontSize: 10, color: COLORS.gray500 }}>
                    Administra los jugadores registrados
                  </div>
                </div>
                <div
                  style={{
                    background: COLORS.primary,
                    borderRadius: 6,
                    padding: "5px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  <UserPlus size={12} color="#fff" />
                  Crear Jugador
                </div>
              </div>

              {/* Search bar */}
              <div
                style={{
                  background: COLORS.gray50,
                  borderRadius: 8,
                  padding: "6px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Search size={12} color={COLORS.gray500} />
                <span style={{ fontSize: 10, color: COLORS.gray500 }}>Buscar jugador...</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <div style={{ fontSize: 9, color: COLORS.gray500, background: "#fff", border: `1px solid ${COLORS.gray200}`, borderRadius: 4, padding: "2px 8px" }}>
                    Categoria
                  </div>
                  <div style={{ fontSize: 9, color: COLORS.primary, background: `${COLORS.primary}10`, borderRadius: 10, padding: "2px 8px", fontWeight: 600 }}>
                    47 jugadores
                  </div>
                </div>
              </div>

              {/* Table */}
              <div
                style={{
                  background: "#fff",
                  border: `1px solid ${COLORS.gray200}`,
                  borderRadius: 10,
                  overflow: "hidden",
                  flex: 1,
                }}
              >
                {/* Table header */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 0.7fr 1fr 1fr 0.6fr",
                    padding: "8px 14px",
                    background: COLORS.gray50,
                    borderBottom: `1px solid ${COLORS.gray200}`,
                    fontSize: 9,
                    fontWeight: 600,
                    color: COLORS.gray500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <div>Jugador</div>
                  <div>Categoria</div>
                  <div>Edad</div>
                  <div>Estado</div>
                  <div>Pago</div>
                  <div>Perfil</div>
                </div>

                {/* Rows */}
                {players.map((p, i) => {
                  const rowDelay = 8 + i * 4;
                  const rowFrame = Math.max(0, frame - rowDelay);
                  const rowProgress = spring({ frame: rowFrame, fps, config: { damping: 14, stiffness: 120 } });

                  return (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 0.7fr 1fr 1fr 0.6fr",
                        padding: "6px 14px",
                        alignItems: "center",
                        borderBottom: `1px solid ${COLORS.gray100}`,
                        opacity: rowProgress,
                        transform: `translateX(${(1 - rowProgress) * 15}px)`,
                        background: i === 0 && showDetail ? `${COLORS.primary}06` : "transparent",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 26, height: 26, borderRadius: "50%",
                            background: `${avatarColors[i]}18`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, fontWeight: 700, color: avatarColors[i],
                          }}
                        >
                          {p.initials}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 500, color: COLORS.gray900 }}>{p.name}</span>
                      </div>
                      <span style={{ fontSize: 10, color: COLORS.gray600 }}>{p.category}</span>
                      <span style={{ fontSize: 10, color: COLORS.gray600 }}>{p.age}</span>
                      <StatusBadge text={p.status} variant={p.statusVariant} />
                      <StatusBadge text={p.payment} variant={p.paymentVariant} />
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 32, height: 4, borderRadius: 2, background: COLORS.gray200, overflow: "hidden" }}>
                          <div style={{ width: `${p.profile}%`, height: "100%", borderRadius: 2, background: p.profile === 100 ? COLORS.success : p.profile >= 80 ? COLORS.warning : COLORS.danger }} />
                        </div>
                        <span style={{ fontSize: 8, color: COLORS.gray500 }}>{p.profile}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detail card - positioned relative to content area */}
              {showDetail && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: 30,
                    transform: `translateY(-50%) scale(${detailProgress})`,
                    width: 220,
                    background: "#fff",
                    border: `1px solid ${COLORS.gray200}`,
                    borderRadius: 12,
                    padding: 14,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                    opacity: detailProgress,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: `${COLORS.primary}18`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: COLORS.primary,
                      }}
                    >
                      SL
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.gray900 }}>Santiago Lopez</div>
                      <div style={{ fontSize: 9, color: COLORS.gray500 }}>Sub-13 · 12 anos</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "6px 0", borderTop: `1px solid ${COLORS.gray100}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <FileText size={10} color={COLORS.gray500} />
                      <span style={{ fontSize: 9, color: COLORS.gray600 }}>Documentos</span>
                      <StatusBadge text="Completo" variant="success" fontSize={8} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Shield size={10} color={COLORS.gray500} />
                      <span style={{ fontSize: 9, color: COLORS.gray600 }}>EPS: Sura</span>
                    </div>
                  </div>
                  <div
                    style={{
                      background: `${COLORS.success}10`,
                      borderRadius: 8,
                      padding: "6px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.gray700 }}>Pago</span>
                    <StatusBadge text="Al dia" variant="success" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </BrowserFrame>
      </div>

      {/* Callout below */}
      <Sequence from={110} layout="none">
        <Callout
          text="Perfil completo con documentos"
          position="bottom-center"
          variant="highlight"
          fontSize={isVertical ? 24 : 20}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
