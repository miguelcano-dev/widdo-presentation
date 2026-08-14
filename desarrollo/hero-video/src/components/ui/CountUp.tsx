import { useCurrentFrame, interpolate, Easing } from "remotion";

type CountUpProps = {
  from: number;
  to: number;
  durationFrames: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

export const CountUp: React.FC<CountUpProps> = ({
  from,
  to,
  durationFrames,
  prefix = "",
  suffix = "",
  decimals = 0,
}) => {
  const frame = useCurrentFrame();

  const value = interpolate(
    frame,
    [0, durationFrames],
    [from, to],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  const displayValue = decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toString();

  return (
    <span>
      {prefix}{displayValue}{suffix}
    </span>
  );
};
