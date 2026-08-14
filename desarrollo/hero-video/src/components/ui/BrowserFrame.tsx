import React from "react";
import { fontFamily } from "../../fonts";

type BrowserFrameProps = {
  children: React.ReactNode;
  width?: number;
  height?: number;
  url?: string;
  opacity?: number;
  scale?: number;
};

export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  children,
  width = 980,
  height = 680,
  url = "app.widdo.co",
  opacity = 1,
  scale = 1,
}) => {
  const barHeight = 36;
  const dotSize = 10;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 12,
        overflow: "hidden",
        background: "#1e1e1e",
        boxShadow:
          "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        opacity,
        transform: `scale(${scale})`,
        fontFamily,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: barHeight,
          background: "#2d2d2d",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* Traffic light dots */}
        <div style={{ display: "flex", gap: 6 }}>
          <div
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              background: "#ff5f57",
            }}
          />
          <div
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              background: "#febc2e",
            }}
          />
          <div
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              background: "#28c840",
            }}
          />
        </div>

        {/* URL bar */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#1a1a1a",
              borderRadius: 6,
              padding: "4px 16px",
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {url}
          </div>
        </div>

        {/* Spacer to balance dots */}
        <div style={{ width: 52 }} />
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          background: "#f8fafc",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
};
