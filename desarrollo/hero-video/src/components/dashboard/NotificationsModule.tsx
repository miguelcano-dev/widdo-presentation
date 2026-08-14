import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { Bell, Send } from "lucide-react";
import { COLORS } from "../../colors";
import { fontFamily } from "../../fonts";

const NOTIFICATIONS = [
  { text: "Recordatorio de entreno enviado", time: "Ahora" },
  { text: "Pago recibido de Carlos M.", time: "Hace 2 min" },
  { text: "Nuevo jugador registrado: Ana G.", time: "Hace 5 min" },
];

export const NotificationsModule: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const moduleEntry = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const bellWobble = interpolate(
    Math.sin(frame * 0.3),
    [-1, 1],
    [-8, 8]
  );

  return (
    <div
      style={{
        fontFamily,
        background: COLORS.bgCardHover,
        border: `1px solid ${COLORS.borderSubtle}`,
        borderRadius: 18,
        padding: 20,
        transform: `scale(${interpolate(moduleEntry, [0, 1], [0.85, 1])})`,
        opacity: moduleEntry,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `rgba(139, 92, 246, 0.15)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <Bell
            size={22}
            color="#8B5CF6"
            style={{
              transform: `rotate(${bellWobble}deg)`,
              transformOrigin: "top center",
            }}
          />
          {/* Notification badge */}
          <div
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: COLORS.chaosRed,
              color: COLORS.textWhite,
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            3
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.textWhite }}>
            Notificaciones
          </div>
          <div style={{ fontSize: 12, color: COLORS.textSubtle }}>
            Todos los mensajes enviados
          </div>
        </div>
      </div>

      {/* Notification Cards - No disappearing animation */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 0 }}>
        {NOTIFICATIONS.map((notification, index) => {
          const cardDelay = 0.2 + index * 0.2;
          const cardEntry = spring({
            frame: frame - cardDelay * fps,
            fps,
            config: { damping: 14, stiffness: 80 },
          });

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 14,
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.borderSubtle}`,
                borderRadius: 12,
                transform: `translateX(${interpolate(cardEntry, [0, 1], [-30, 0])}px)`,
                opacity: cardEntry,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `rgba(22, 163, 74, 0.15)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Send size={14} color={COLORS.primary} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textWhite }}>
                  {notification.text}
                </div>
                <div style={{ fontSize: 11, color: COLORS.textSubtle }}>
                  {notification.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
