import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Img,
} from "remotion";
import { COLORS } from "../../colors";
import { fontFamily } from "../../fonts";
import { Instagram, Globe, Sparkles, Star } from "lucide-react";

export const Scene4LoopIG: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoEntry = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const titleEntry = spring({
    frame: frame - 0.2 * fps,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  const taglineEntry = spring({
    frame: frame - 0.5 * fps,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  const socialEntry = spring({
    frame: frame - 0.9 * fps,
    fps,
    config: { damping: 15, stiffness: 60 },
  });

  const pulse = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.92, 1.08]);
  const rotation = interpolate(frame, [0, fps * 20], [0, 360]);
  const starRotation = interpolate(frame, [0, fps * 10], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(165deg, #021a0a 0%, #032d12 30%, #064e23 70%, #0a6b30 100%)",
      }}
    >
      {/* Massive central glow */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${pulse})`,
          width: 1000,
          height: 1000,
          background: `radial-gradient(circle, ${COLORS.primary}60 0%, ${COLORS.primary}25 40%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(80px)",
        }}
      />

      {/* Rotating decorative rings */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          width: 600,
          height: 600,
          borderRadius: "50%",
          border: `2px solid ${COLORS.primary}25`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${-rotation * 0.7}deg)`,
          width: 500,
          height: 500,
          borderRadius: "50%",
          border: `1px solid ${COLORS.primary}15`,
        }}
      />

      {/* Floating stars decoration */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + starRotation * (Math.PI / 180);
        const radius = 350;
        const x = 50 + Math.cos(angle) * (radius / 10.8);
        const y = 40 + Math.sin(angle) * (radius / 19.2);

        return (
          <Star
            key={i}
            size={16}
            color={COLORS.primary}
            fill={COLORS.primary}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              opacity: 0.6,
              transform: `rotate(${starRotation + i * 60}deg)`,
            }}
          />
        );
      })}

      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
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
          fontFamily,
          padding: "50px 40px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoEntry * pulse})`,
            opacity: logoEntry,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: `linear-gradient(145deg, ${COLORS.primary} 0%, #0f9d4a 50%, #0d7a3a 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `
                0 30px 100px ${COLORS.primary}70,
                0 0 150px ${COLORS.primary}50,
                inset 0 -5px 20px rgba(0,0,0,0.3),
                inset 0 5px 20px rgba(255,255,255,0.2)
              `,
            }}
          >
            <Img
              src={staticFile("widdo-logo.svg")}
              style={{ width: 120, height: 120 }}
            />
          </div>
        </div>

        {/* Badge */}
        <div
          style={{
            transform: `scale(${logoEntry})`,
            opacity: logoEntry,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
              border: `1px solid ${COLORS.primary}50`,
              borderRadius: 40,
              padding: "12px 28px",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Sparkles size={16} color={COLORS.primary} />
            <span style={{ fontSize: 16, color: COLORS.primary, fontWeight: 700 }}>
              Plataforma #1 para Clubes
            </span>
          </div>
        </div>

        {/* Somos WIDDO */}
        <div
          style={{
            transform: `translateY(${interpolate(titleEntry, [0, 1], [30, 0])}px)`,
            opacity: titleEntry,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
            Somos
          </div>
          <div
            style={{
              fontSize: 100,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              textShadow: `0 4px 40px rgba(0,0,0,0.4), 0 0 100px ${COLORS.primary}30`,
            }}
          >
            WIDDO
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            transform: `translateY(${interpolate(taglineEntry, [0, 1], [30, 0])}px)`,
            opacity: taglineEntry,
            textAlign: "center",
            marginTop: 24,
          }}
        >
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.85)", lineHeight: 1.3, fontWeight: 500 }}>
            Transformamos el{" "}
            <span
              style={{
                color: "#fff",
                fontWeight: 900,
                textShadow: `0 0 30px ${COLORS.primary}70`,
              }}
            >
              MUNDO
            </span>
          </div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.85)", lineHeight: 1.3, fontWeight: 500 }}>
            por medio del{" "}
            <span
              style={{
                color: "#fff",
                fontWeight: 900,
                textShadow: `0 0 30px ${COLORS.primary}70`,
              }}
            >
              DEPORTE
            </span>
          </div>
        </div>

        {/* Social links */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            marginTop: 50,
            transform: `translateY(${interpolate(socialEntry, [0, 1], [30, 0])}px)`,
            opacity: socialEntry,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "linear-gradient(145deg, rgba(225, 48, 108, 0.2) 0%, rgba(225, 48, 108, 0.08) 100%)",
              border: "1px solid rgba(225, 48, 108, 0.4)",
              borderRadius: 20,
              padding: "18px 36px",
              backdropFilter: "blur(10px)",
              boxShadow: "0 15px 40px rgba(225, 48, 108, 0.2)",
            }}
          >
            <Instagram size={28} color="#E1306C" />
            <span style={{ fontSize: 24, color: "#fff", fontWeight: 700 }}>
              @heywiddo
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: `linear-gradient(145deg, ${COLORS.primary}25 0%, ${COLORS.primary}10 100%)`,
              border: `1px solid ${COLORS.primary}50`,
              borderRadius: 20,
              padding: "18px 36px",
              backdropFilter: "blur(10px)",
              boxShadow: `0 15px 40px ${COLORS.primary}25`,
            }}
          >
            <Globe size={28} color={COLORS.primary} />
            <span style={{ fontSize: 24, color: "#fff", fontWeight: 700 }}>
              www.widdo.co
            </span>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "15%",
          background: "linear-gradient(to top, rgba(2, 26, 10, 0.6) 0%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
