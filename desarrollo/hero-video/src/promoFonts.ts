import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";

export const { fontFamily: interFont } = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const { fontFamily: monoFont } = loadJetBrains("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
