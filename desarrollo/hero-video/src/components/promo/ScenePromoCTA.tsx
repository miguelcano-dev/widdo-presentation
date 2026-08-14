import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from "remotion";
import { PROMO } from "../../promoColors";
import { interFont, monoFont } from "../../promoFonts";
import { Instagram, Globe, ArrowRight } from "lucide-react";

export const ScenePromoCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoEntry = spring({ frame, fps, config: { damping: 200, stiffness: 60 } });
  const textEntry = spring({ frame, fps, delay: 10, config: { damping: 200, stiffness: 70 } });
  const taglineEntry = spring({ frame, fps, delay: 18, config: { damping: 200, stiffness: 70 } });
  const btnEntry = spring({ frame, fps, delay: 26, config: { damping: 200, stiffness: 80 } });
  const socialEntry = spring({ frame, fps, delay: 34, config: { damping: 200, stiffness: 100 } });

  const glowOpacity = interpolate(frame, [0, fps * 2.5, fps * 5], [0.15, 0.3, 0.15], { extrapolateRight: "extend" });

  // Ring pulse — slow, smooth
  const ringScale = interpolate(frame, [0, fps * 3, fps * 6], [0.95, 1.05, 0.95], { extrapolateRight: "extend" });

  return (
    <AbsoluteFill style={{ background: PROMO.bg }}>
      {/* Main green glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1000,
          height: 1000,
          background: `radial-gradient(circle, rgba(0, 200, 83, ${glowOpacity}) 0%, transparent 60%)`,
          filter: "blur(120px)",
        }}
      />

      {/* Corner glows */}
      <div style={{ position: "absolute", top: -150, left: -150, width: 500, height: 500, background: "radial-gradient(circle, rgba(0, 200, 83, 0.08) 0%, transparent 70%)", filter: "blur(100px)" }} />
      <div style={{ position: "absolute", bottom: -100, right: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(0, 200, 83, 0.06) 0%, transparent 70%)", filter: "blur(100px)" }} />

      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.02,
          backgroundImage: `linear-gradient(${PROMO.green}30 1px, transparent 1px), linear-gradient(90deg, ${PROMO.green}30 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Decorative ring behind logo */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -65%) scale(${ringScale})`,
          width: 280,
          height: 280,
          borderRadius: "50%",
          border: `1px solid ${PROMO.green}15`,
          opacity: logoEntry * 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -65%) scale(${ringScale * 1.4})`,
          width: 280,
          height: 280,
          borderRadius: "50%",
          border: `1px solid ${PROMO.green}08`,
          opacity: logoEntry * 0.3,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          fontFamily: interFont,
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoEntry})`,
            opacity: logoEntry,
            marginBottom: 24,
          }}
        >
          <Img
            src={staticFile("widdo-logo.svg")}
            style={{
              width: 120,
              height: 120,
              filter: "drop-shadow(0 12px 48px rgba(0, 200, 83, 0.5))",
            }}
          />
        </div>

        {/* "Somos Widdo" */}
        <div
          style={{
            transform: `translateY(${Math.round((1 - textEntry) * 16)}px)`,
            opacity: textEntry,
            fontSize: 28,
            fontWeight: 500,
            color: PROMO.textSecondary,
            marginBottom: 24,
          }}
        >
          Somos{" "}
          <span style={{ color: PROMO.green, fontWeight: 800 }}>WIDDO</span>
        </div>

        {/* Main tagline */}
        <div
          style={{
            transform: `translateY(${Math.round((1 - taglineEntry) * 20)}px)`,
            opacity: taglineEntry,
            textAlign: "center",
            marginBottom: 36,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: PROMO.text,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
            }}
          >
            Transformamos el{" "}
            <span
              style={{
                display: "inline-block",
                border: `2px solid ${PROMO.green}`,
                borderRadius: 10,
                padding: "2px 22px",
                color: PROMO.green,
              }}
            >
              MUNDO
            </span>
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: PROMO.text,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              marginTop: 6,
            }}
          >
            por medio del{" "}
            <span
              style={{
                display: "inline-block",
                border: `2px solid ${PROMO.green}`,
                borderRadius: 10,
                padding: "2px 22px",
                color: PROMO.green,
              }}
            >
              DEPORTE
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div
          style={{
            transform: `translateY(${Math.round((1 - btnEntry) * 12)}px)`,
            opacity: btnEntry,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #00C853 0%, #00E676 100%)",
              borderRadius: 14,
              padding: "18px 52px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 8px 32px rgba(0, 200, 83, 0.35), 0 0 60px rgba(0, 200, 83, 0.15)",
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: PROMO.bg,
                letterSpacing: "-0.01em",
              }}
            >
              Empieza gratis
            </span>
            <ArrowRight size={22} color={PROMO.bg} strokeWidth={2.5} />
          </div>
        </div>

        {/* Social links */}
        <div
          style={{
            transform: `translateY(${Math.round((1 - socialEntry) * 10)}px)`,
            opacity: socialEntry,
            display: "flex",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: PROMO.bgCard,
              border: `1px solid ${PROMO.border}`,
              borderRadius: 9999,
              padding: "12px 24px",
            }}
          >
            <Instagram size={16} color={PROMO.textSecondary} />
            <span style={{ fontFamily: monoFont, fontSize: 14, color: PROMO.textSecondary }}>
              @heywiddo
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: PROMO.bgCard,
              border: `1px solid ${PROMO.border}`,
              borderRadius: 9999,
              padding: "12px 24px",
            }}
          >
            <Globe size={16} color={PROMO.textSecondary} />
            <span style={{ fontFamily: monoFont, fontSize: 14, color: PROMO.textSecondary }}>
              www.widdo.co
            </span>
          </div>
        </div>
      </div>

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.45) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
