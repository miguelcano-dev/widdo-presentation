// Sizing constants for different video formats

export const SIZING = {
  // Instagram 9:16 format (primary)
  ig: {
    width: 1080,
    height: 1920,
    // Browser frame inside the IG video
    browserFrame: {
      width: 980,
      height: 680,
      sidebarWidth: 200,
    },
    // Phone frame for enrollment scene
    phoneFrame: {
      width: 380,
      height: 760,
    },
    // Minimum text sizes for legibility on mobile
    text: {
      heroTitle: 72,
      sectionTitle: 48,
      heading: 36,
      body: 24,
      caption: 20,
      badge: 16,
      tableCell: 14,
    },
  },
  // Web 16:9 format
  web: {
    width: 1920,
    height: 1080,
    browserFrame: {
      width: 1600,
      height: 900,
      sidebarWidth: 220,
    },
    phoneFrame: {
      width: 340,
      height: 680,
    },
    text: {
      heroTitle: 72,
      sectionTitle: 48,
      heading: 36,
      body: 20,
      caption: 16,
      badge: 14,
      tableCell: 13,
    },
  },
};

// Helper to get scale factor between formats
export const getScale = (from: "ig" | "web", to: "ig" | "web") => {
  return SIZING[to].width / SIZING[from].width;
};
