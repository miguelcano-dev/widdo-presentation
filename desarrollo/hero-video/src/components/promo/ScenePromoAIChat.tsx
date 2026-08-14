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
  Bot,
  User,
  Sparkles,
  Send,
  AlertCircle,
  DollarSign,
  Users,
} from "lucide-react";

export const ScenePromoAIChat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeEntry = spring({ frame, fps, config: { damping: 200, stiffness: 80 } });
  const titleEntry = spring({ frame, fps, delay: 5, config: { damping: 200, stiffness: 80 } });
  const chatEntry = spring({ frame, fps, delay: 12, config: { damping: 200, stiffness: 60 } });
  const userBubbleEntry = spring({ frame, fps, delay: 22, config: { damping: 200, stiffness: 100 } });
  const typingEntry = spring({ frame, fps, delay: 38, config: { damping: 200, stiffness: 100 } });
  const aiBubbleEntry = spring({ frame, fps, delay: 50, config: { damping: 200, stiffness: 80 } });
  const dataCardsEntry = spring({ frame, fps, delay: 62, config: { damping: 200, stiffness: 100 } });

  const glowOpacity = interpolate(frame, [0, fps * 2.5, fps * 5], [0.06, 0.14, 0.06], { extrapolateRight: "clamp" });

  // Typing dots animation
  const typingOpacity = interpolate(frame, [38, 44, 48, 50], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Pulsing FAB
  const fabScale = interpolate(frame, [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150], [1, 1.08, 1, 1.08, 1, 1.08, 1, 1.08, 1, 1.08, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: PROMO.bg }}>
      {/* Green glow centered */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 1000, height: 700, background: `radial-gradient(ellipse, rgba(0, 200, 83, ${glowOpacity}) 0%, transparent 70%)`, filter: "blur(100px)" }} />

      {/* Badge */}
      <div style={{
        position: "absolute", top: 80, left: "50%",
        transform: `translateX(-50%) translateY(${Math.round((1 - badgeEntry) * 16)}px)`,
        opacity: badgeEntry,
        display: "flex", alignItems: "center", gap: 10,
        background: PROMO.greenGlow, border: `1px solid ${PROMO.greenBorder}`, borderRadius: 9999, padding: "8px 22px",
      }}>
        <Sparkles size={14} color={PROMO.green} />
        <span style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 600, color: PROMO.green, letterSpacing: "0.08em" }}>
          ASISTENTE IA
        </span>
      </div>

      {/* Title */}
      <div style={{
        position: "absolute", top: 135, left: "50%",
        transform: `translateX(-50%) translateY(${Math.round((1 - titleEntry) * 12)}px)`,
        opacity: titleEntry,
        fontFamily: interFont, fontSize: 42, fontWeight: 900, color: PROMO.text,
        letterSpacing: "-0.02em", textAlign: "center",
      }}>
        Preguntale a{" "}
        <span style={{ color: PROMO.green }}>Widdo AI</span>
      </div>

      <div style={{
        position: "absolute", top: 195, left: "50%",
        transform: `translateX(-50%)`,
        opacity: titleEntry,
        fontFamily: interFont, fontSize: 18, color: PROMO.textSecondary, textAlign: "center",
      }}>
        Tu asistente inteligente que conoce todos los datos de tu club
      </div>

      {/* Chat window */}
      <div style={{
        position: "absolute",
        top: 260, left: "50%",
        transform: `translateX(-50%) translateY(${Math.round((1 - chatEntry) * 20)}px)`,
        opacity: chatEntry,
        width: 700,
        background: PROMO.bgCard,
        border: `1px solid ${PROMO.border}`,
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5)",
      }}>
        {/* Chat header */}
        <div style={{
          padding: "16px 24px",
          borderBottom: `1px solid ${PROMO.border}`,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #00C853 0%, #00E676 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${fabScale})`,
          }}>
            <Bot size={20} color="#FFFFFF" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontFamily: interFont, fontSize: 14, fontWeight: 700, color: PROMO.text }}>Widdo AI</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: PROMO.green }} />
              <span style={{ fontFamily: interFont, fontSize: 10, color: PROMO.green }}>En linea</span>
            </div>
          </div>
        </div>

        {/* Chat messages */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, minHeight: 300 }}>
          {/* User message */}
          <div style={{
            alignSelf: "flex-end",
            opacity: userBubbleEntry,
            transform: `translateY(${Math.round((1 - userBubbleEntry) * 12)}px)`,
            display: "flex", alignItems: "flex-end", gap: 10, flexDirection: "row-reverse",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", background: "#3B82F620",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <User size={14} color="#3B82F6" />
            </div>
            <div style={{
              background: "#3B82F6", borderRadius: "16px 16px 4px 16px",
              padding: "12px 18px", maxWidth: 420,
            }}>
              <span style={{ fontFamily: interFont, fontSize: 14, color: "#FFFFFF", lineHeight: "1.4" }}>
                ¿Cuantos jugadores tienen pagos pendientes?
              </span>
            </div>
          </div>

          {/* Typing indicator */}
          <div style={{
            alignSelf: "flex-start",
            opacity: typingOpacity,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg, #00C85330, #00E67630)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bot size={14} color={PROMO.green} />
            </div>
            <div style={{ background: PROMO.bgElevated, borderRadius: "16px 16px 16px 4px", padding: "12px 18px", display: "flex", gap: 4 }}>
              {[0, 1, 2].map((dot) => {
                const dotPhase = ((frame - 38) * 0.15 + dot * 0.8) % 2;
                const dotOpacity = interpolate(dotPhase, [0, 1, 2], [0.3, 1, 0.3]);
                return <div key={dot} style={{ width: 6, height: 6, borderRadius: "50%", background: PROMO.textSecondary, opacity: dotOpacity }} />;
              })}
            </div>
          </div>

          {/* AI response */}
          <div style={{
            alignSelf: "flex-start",
            opacity: aiBubbleEntry,
            transform: `translateY(${Math.round((1 - aiBubbleEntry) * 12)}px)`,
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg, #00C85330, #00E67630)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Bot size={14} color={PROMO.green} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{
                background: PROMO.bgElevated, borderRadius: "16px 16px 16px 4px",
                padding: "14px 18px", maxWidth: 480, border: `1px solid ${PROMO.border}`,
              }}>
                <span style={{ fontFamily: interFont, fontSize: 14, color: PROMO.text, lineHeight: "1.5" }}>
                  Hay <span style={{ fontWeight: 700, color: PROMO.green }}>10 jugadores</span> con pagos pendientes por un total de{" "}
                  <span style={{ fontWeight: 700, color: PROMO.green, fontFamily: monoFont }}>$3.220.000</span>
                </span>
              </div>

              {/* Data cards */}
              <div style={{
                display: "flex", gap: 8,
                opacity: dataCardsEntry,
                transform: `translateY(${Math.round((1 - dataCardsEntry) * 8)}px)`,
              }}>
                <div style={{
                  background: PROMO.bgElevated, border: `1px solid ${PROMO.border}`,
                  borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${PROMO.red}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AlertCircle size={14} color={PROMO.red} />
                  </div>
                  <div>
                    <div style={{ fontFamily: interFont, fontSize: 9, color: PROMO.textMuted }}>Deuda mayor</div>
                    <div style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 700, color: PROMO.text }}>$640.000</div>
                  </div>
                </div>
                <div style={{
                  background: PROMO.bgElevated, border: `1px solid ${PROMO.border}`,
                  borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${PROMO.orange}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <DollarSign size={14} color={PROMO.orange} />
                  </div>
                  <div>
                    <div style={{ fontFamily: interFont, fontSize: 9, color: PROMO.textMuted }}>Promedio</div>
                    <div style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 700, color: PROMO.text }}>$322.000</div>
                  </div>
                </div>
                <div style={{
                  background: PROMO.bgElevated, border: `1px solid ${PROMO.border}`,
                  borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8,
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${PROMO.blue}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Users size={14} color={PROMO.blue} />
                  </div>
                  <div>
                    <div style={{ fontFamily: interFont, fontSize: 9, color: PROMO.textMuted }}>Jugadores</div>
                    <div style={{ fontFamily: monoFont, fontSize: 13, fontWeight: 700, color: PROMO.text }}>10 / 109</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat input */}
        <div style={{ padding: "12px 24px", borderTop: `1px solid ${PROMO.border}` }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: PROMO.bgElevated, border: `1px solid ${PROMO.border}`,
            borderRadius: 12, padding: "10px 16px",
          }}>
            <span style={{ fontFamily: interFont, fontSize: 13, color: PROMO.textMuted, flex: 1 }}>Escribe tu pregunta...</span>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: PROMO.green,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Send size={14} color="#FFFFFF" />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
