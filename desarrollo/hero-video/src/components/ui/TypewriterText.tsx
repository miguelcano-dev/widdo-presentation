import { useCurrentFrame, interpolate } from "remotion";
import { fontFamily } from "../../fonts";

type TypewriterTextProps = {
  text: string;
  fontSize?: number;
  color?: string;
  charFrames?: number;
  showCursor?: boolean;
  fontWeight?: number;
};

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  fontSize = 48,
  color = "#ffffff",
  charFrames = 2,
  showCursor = true,
  fontWeight = 700,
}) => {
  const frame = useCurrentFrame();

  const typedChars = Math.min(text.length, Math.floor(frame / charFrames));
  const typedText = text.slice(0, typedChars);

  // Cursor blink
  const cursorOpacity = interpolate(
    frame % 16,
    [0, 8, 16],
    [1, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Only show cursor while typing or blinking after
  const isTyping = typedChars < text.length;

  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        color,
        display: "flex",
        alignItems: "center",
      }}
    >
      <span>{typedText}</span>
      {showCursor && (
        <span
          style={{
            opacity: isTyping ? 1 : cursorOpacity,
            marginLeft: 2,
            color: "#16a34a",
          }}
        >
          |
        </span>
      )}
    </div>
  );
};
