import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { CreditCard, Check } from "lucide-react";
import { COLORS } from "../../colors";
import { CountUp } from "../ui/CountUp";
import { fontFamily } from "../../fonts";

const PAYMENT_ROWS = [
  { name: "Mensualidad - Carlos M.", amount: 89000 },
  { name: "Mensualidad - María L.", amount: 89000 },
  { name: "Uniforme - Juan P.", amount: 150000 },
];

export const PaymentsModule: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
          <CreditCard size={22} color={COLORS.primary} />
        </div>
        <div>
          <div style={{ fontSize: 13, color: COLORS.textSubtle, fontWeight: 500 }}>Recaudado</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.textWhite }}>
            $<CountUp from={0} to={2450} durationFrames={fps * 1.5} suffix="K" />
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
          92% cobrado
        </div>
      </div>

      {/* Payment Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PAYMENT_ROWS.map((payment, index) => {
          const rowDelay = 0.3 + index * 0.25;
          const rowEntry = spring({
            frame: frame - rowDelay * fps,
            fps,
            config: { damping: 12, stiffness: 100 },
          });

          const statusProgress = interpolate(
            frame - (rowDelay + 0.4) * fps,
            [0, fps * 0.25, fps * 0.5],
            [0, 0.5, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const isPaid = statusProgress >= 1;
          const isProcessing = statusProgress > 0 && statusProgress < 1;

          const checkScale = interpolate(
            statusProgress,
            [0.7, 1],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 12,
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.borderSubtle}`,
                borderRadius: 12,
                transform: `translateY(${interpolate(rowEntry, [0, 1], [-20, 0])}px)`,
                opacity: rowEntry,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textWhite }}>
                  {payment.name}
                </div>
                <div style={{ fontSize: 12, color: COLORS.textSubtle }}>
                  ${payment.amount.toLocaleString()} COP
                </div>
              </div>

              {/* Status Badge */}
              <div
                style={{
                  padding: "5px 12px",
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 600,
                  background: isPaid
                    ? `rgba(22, 163, 74, 0.15)`
                    : isProcessing
                    ? `rgba(249, 115, 22, 0.15)`
                    : `rgba(239, 68, 68, 0.15)`,
                  color: isPaid
                    ? COLORS.primary
                    : isProcessing
                    ? COLORS.chaosOrange
                    : COLORS.chaosRed,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {isPaid && (
                  <Check
                    size={12}
                    style={{
                      transform: `scale(${checkScale})`,
                    }}
                  />
                )}
                {isPaid ? "Pagado" : isProcessing ? "Procesando..." : "Pendiente"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
