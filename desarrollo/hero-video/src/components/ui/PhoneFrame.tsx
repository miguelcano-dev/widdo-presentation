import React from "react";
import { fontFamily } from "../../fonts";

type PhoneFrameProps = {
  children: React.ReactNode;
  width?: number;
  height?: number;
  opacity?: number;
  scale?: number;
};

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  width = 380,
  height = 760,
  opacity = 1,
  scale = 1,
}) => {
  const bezelRadius = 40;
  const notchWidth = 140;
  const notchHeight = 28;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: bezelRadius,
        background: "#1a1a1a",
        padding: 8,
        boxShadow:
          "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
        opacity,
        transform: `scale(${scale})`,
        fontFamily,
        position: "relative",
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: "50%",
          transform: "translateX(-50%)",
          width: notchWidth,
          height: notchHeight,
          background: "#1a1a1a",
          borderRadius: "0 0 16px 16px",
          zIndex: 10,
        }}
      />

      {/* Screen */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: bezelRadius - 6,
          overflow: "hidden",
          background: "#ffffff",
          position: "relative",
        }}
      >
        {/* Status bar */}
        <div
          style={{
            height: 36,
            background: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
            fontSize: 12,
            fontWeight: 600,
            color: "#000",
          }}
        >
          <span>9:41</span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {/* Signal bars */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="#000">
              <rect x="0" y="8" width="3" height="4" rx="0.5" />
              <rect x="4" y="5" width="3" height="7" rx="0.5" />
              <rect x="8" y="2" width="3" height="10" rx="0.5" />
              <rect x="12" y="0" width="3" height="12" rx="0.5" />
            </svg>
            {/* Battery */}
            <svg width="22" height="12" viewBox="0 0 22 12" fill="#000">
              <rect
                x="0.5"
                y="0.5"
                width="19"
                height="11"
                rx="2"
                fill="none"
                stroke="#000"
                strokeWidth="1"
              />
              <rect x="2" y="2" width="16" height="8" rx="1" />
              <rect x="20" y="3.5" width="2" height="5" rx="1" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
