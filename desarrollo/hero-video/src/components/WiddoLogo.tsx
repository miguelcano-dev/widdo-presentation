import { Img, staticFile } from "remotion";
import { COLORS } from "../colors";
import { fontFamily } from "../fonts";

type WiddoLogoProps = {
  size?: number;
  showText?: boolean;
};

export const WiddoLogo: React.FC<WiddoLogoProps> = ({ size = 200, showText = true }) => {
  const iconSize = size * 0.55;
  const fontSize = size * 0.18;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: size * 0.08,
      }}
    >
      {/* Actual Widdo Logo SVG */}
      <Img
        src={staticFile("widdo-logo.svg")}
        style={{
          width: iconSize,
          height: iconSize,
          filter: `drop-shadow(0 ${size * 0.03}px ${size * 0.1}px rgba(22, 163, 74, 0.6))`,
        }}
      />

      {/* Logo Text - using Montserrat */}
      {showText && (
        <div
          style={{
            fontFamily,
            fontSize,
            fontWeight: 800,
            color: COLORS.textWhite,
            letterSpacing: "-0.02em",
          }}
        >
          Widdo
        </div>
      )}
    </div>
  );
};
