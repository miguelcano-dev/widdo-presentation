import React from "react";
import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "../../fonts";
import { COLORS } from "../../colors";
import { BrowserFrame } from "../ui/BrowserFrame";
import { MockSidebar } from "../ui/MockSidebar";
import { Callout } from "../ui/Callout";

// 5 seconds = 150 frames

type CalendarEvent = {
  day: number;
  label: string;
  color: string;
};

const events: CalendarEvent[] = [
  { day: 3, label: "Sesion", color: "#0d9488" },
  { day: 5, label: "Sesion", color: "#0d9488" },
  { day: 7, label: "Partido", color: "#2563eb" },
  { day: 10, label: "Sesion", color: "#0d9488" },
  { day: 12, label: "Sesion", color: "#0d9488" },
  { day: 14, label: "Torneo", color: "#0891b2" },
  { day: 15, label: "Torneo", color: "#0891b2" },
  { day: 17, label: "Sesion", color: "#0d9488" },
  { day: 19, label: "Sesion", color: "#0d9488" },
  { day: 21, label: "Partido", color: "#2563eb" },
  { day: 24, label: "Sesion", color: "#0d9488" },
  { day: 26, label: "Reunion", color: "#d97706" },
  { day: 28, label: "Partido", color: "#2563eb" },
];

const legend = [
  { label: "Sesion", color: "#0d9488" },
  { label: "Partido", color: "#2563eb" },
  { label: "Torneo", color: "#0891b2" },
  { label: "Reunion", color: "#d97706" },
  { label: "Pago Pendiente", color: "#ef4444" },
];

const DAYS_OF_WEEK = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

export const SceneCalendar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const frameW = isVertical ? Math.round(width * 0.94) : 960;
  const frameH = isVertical ? Math.round(height * 0.58) : 620;
  const sidebarW = isVertical ? 170 : 190;

  const entryProgress = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });

  // Feb 2026 starts on Sunday (index 6)
  const startDayOffset = 6;
  const daysInMonth = 28;

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < startDayOffset; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < calendarCells.length; i += 7) rows.push(calendarCells.slice(i, i + 7));

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

      <Sequence from={25} layout="none">
        <Callout
          text="Organiza todos los eventos"
          position="top-center"
          variant="default"
          fontSize={isVertical ? 26 : 22}
        />
      </Sequence>

      <div
        style={{
          transform: `scale(${entryProgress})`,
          opacity: entryProgress,
          marginTop: isVertical ? 40 : 0,
        }}
      >
        <BrowserFrame width={frameW} height={frameH}>
          <div style={{ display: "flex", height: "100%" }}>
            <MockSidebar activeKey="calendar" width={sidebarW} />

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
              {/* Header */}
              <div
                style={{
                  background: "linear-gradient(135deg, #0f172a, #1e293b)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Calendario de Eventos</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>Gestion de Eventos</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Febrero 2026</div>
              </div>

              <div style={{ display: "flex", gap: 12, flex: 1 }}>
                {/* Calendar grid */}
                <div
                  style={{
                    flex: 1,
                    background: "#fff",
                    border: `1px solid ${COLORS.gray200}`,
                    borderRadius: 10,
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
                    {DAYS_OF_WEEK.map((d) => (
                      <div key={d} style={{ textAlign: "center", fontSize: 8, fontWeight: 600, color: COLORS.gray500, padding: "3px 0", textTransform: "uppercase" }}>
                        {d}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                    {rows.map((row, ri) => (
                      <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, flex: 1 }}>
                        {row.map((day, ci) => {
                          const event = day ? events.find((e) => e.day === day) : null;
                          const isToday = day === 8;
                          const eventIndex = event ? events.indexOf(event) : -1;
                          const eventDelay = 15 + eventIndex * 4;
                          const eventFrame = Math.max(0, frame - eventDelay);
                          const eventProgress = eventIndex >= 0
                            ? spring({ frame: eventFrame, fps, config: { damping: 12, stiffness: 130 } })
                            : 0;

                          return (
                            <div
                              key={ci}
                              style={{
                                borderRadius: 5,
                                padding: "2px 3px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 2,
                                background: isToday ? `${COLORS.primary}12` : "transparent",
                                border: isToday ? `1px solid ${COLORS.primary}40` : "1px solid transparent",
                                minHeight: 44,
                              }}
                            >
                              {day && (
                                <>
                                  <span style={{ fontSize: 9, fontWeight: isToday ? 700 : 400, color: isToday ? COLORS.primary : COLORS.gray700 }}>
                                    {day}
                                  </span>
                                  {event && (
                                    <div
                                      style={{
                                        width: "100%",
                                        borderRadius: 3,
                                        padding: "1px 3px",
                                        background: `${event.color}18`,
                                        borderLeft: `2px solid ${event.color}`,
                                        fontSize: 7,
                                        fontWeight: 600,
                                        color: event.color,
                                        opacity: eventProgress,
                                        transform: `scale(${eventProgress})`,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                      }}
                                    >
                                      {event.label}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend sidebar */}
                <div
                  style={{
                    width: 130,
                    background: "#fff",
                    border: `1px solid ${COLORS.gray200}`,
                    borderRadius: 10,
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.gray900, marginBottom: 2 }}>Tipos de evento</div>
                  {legend.map((l) => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                      <span style={{ fontSize: 9, color: COLORS.gray600 }}>{l.label}</span>
                    </div>
                  ))}

                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${COLORS.gray200}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.gray900, marginBottom: 4 }}>Estados</div>
                    {[
                      { label: "Confirmado", color: COLORS.success },
                      { label: "Pendiente", color: COLORS.warning },
                      { label: "Rechazado", color: COLORS.danger },
                    ].map((s) => (
                      <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
                        <span style={{ fontSize: 8, color: COLORS.gray600 }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BrowserFrame>
      </div>
    </AbsoluteFill>
  );
};
