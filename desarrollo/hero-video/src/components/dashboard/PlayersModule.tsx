import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { Users } from "lucide-react";
import { COLORS } from "../../colors";
import { CountUp } from "../ui/CountUp";
import { fontFamily } from "../../fonts";

const PLAYER_CARDS = [
  { name: "Carlos Martínez", category: "Sub-15", avatar: COLORS.primary },
  { name: "María López", category: "Sub-12", avatar: COLORS.primaryLight },
  { name: "Juan Pérez", category: "Sub-15", avatar: COLORS.primaryDark },
];

export const PlayersModule: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Module entrance
  const moduleEntry = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  return (
    <div
      style={{
        fontFamily,
        background: COLORS.bgCardHover,
        border: `1px solid ${COLORS.borderSubtle}`,
        borderRadius: 16,
        padding: 20,
        transform: `scale(${interpolate(moduleEntry, [0, 1], [0.8, 1])})`,
        opacity: moduleEntry,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `rgba(22, 163, 74, 0.15)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Users size={22} color={COLORS.primary} />
        </div>
        <div>
          <div style={{ fontSize: 13, color: COLORS.textSubtle, fontWeight: 500 }}>Jugadores</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.textWhite }}>
            <CountUp from={0} to={47} durationFrames={fps * 1.5} />
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            background: `rgba(22, 163, 74, 0.15)`,
            color: COLORS.primary,
            padding: "6px 12px",
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          +3 este mes
        </div>
      </div>

      {/* Player Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PLAYER_CARDS.map((player, index) => {
          const cardDelay = 0.3 + index * 0.15;
          const cardEntry = spring({
            frame: frame - cardDelay * fps,
            fps,
            config: { damping: 12, stiffness: 100 },
          });

          const cardX = interpolate(cardEntry, [0, 1], [-50, 0]);

          // Online dot pulse
          const pulseScale = interpolate(
            Math.sin((frame - index * 5) * 0.2),
            [-1, 1],
            [0.8, 1.2]
          );

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.borderSubtle}`,
                borderRadius: 12,
                transform: `translateX(${cardX}px)`,
                opacity: cardEntry,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${player.avatar} 0%, ${COLORS.primaryLight} 100%)`,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.textWhite,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {player.name.charAt(0)}
                {/* Online indicator */}
                <div
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: COLORS.primaryLight,
                    border: `2px solid ${COLORS.bgCard}`,
                    transform: `scale(${pulseScale})`,
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textWhite }}>
                  {player.name}
                </div>
                <div style={{ fontSize: 12, color: COLORS.textSubtle }}>
                  {player.category}
                </div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: COLORS.textSubtle,
                  background: COLORS.bgDark,
                  padding: "4px 8px",
                  borderRadius: 6,
                }}
              >
                Al día ✓
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
