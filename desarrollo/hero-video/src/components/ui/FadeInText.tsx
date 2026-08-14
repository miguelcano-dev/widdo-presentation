import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { fontFamily } from "../../fonts";

type FadeInTextProps = {
  text: string;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  wordByWord?: boolean;
};

export const FadeInText: React.FC<FadeInTextProps> = ({
  text,
  fontSize = 48,
  color = "#ffffff",
  fontWeight = 600,
  wordByWord = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!wordByWord) {
    const opacity = spring({
      frame,
      fps,
      config: { damping: 20 },
    });

    const blur = interpolate(opacity, [0, 1], [10, 0]);

    return (
      <div
        style={{
          fontFamily,
          fontSize,
          fontWeight,
          color,
          opacity,
          filter: `blur(${blur}px)`,
        }}
      >
        {text}
      </div>
    );
  }

  // Word by word animation
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        gap: fontSize * 0.25,
        fontFamily,
        fontSize,
        fontWeight,
        color,
      }}
    >
      {words.map((word, index) => {
        const wordDelay = index * 0.12 * fps;
        const wordProgress = spring({
          frame: frame - wordDelay,
          fps,
          config: { damping: 15, stiffness: 100 },
        });

        const blur = interpolate(wordProgress, [0, 1], [8, 0]);
        const y = interpolate(wordProgress, [0, 1], [20, 0]);

        return (
          <span
            key={index}
            style={{
              opacity: wordProgress,
              filter: `blur(${blur}px)`,
              transform: `translateY(${y}px)`,
              display: "inline-block",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
