import { loadFont } from "@remotion/google-fonts/RedHatDisplay";

export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});
