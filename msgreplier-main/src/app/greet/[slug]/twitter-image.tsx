import { ImageResponse } from "next/og";

export const dynamic = "force-dynamic";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(to bottom right, #fff1f2, #ffe4e6)",
          color: "#be123c",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative hearts background */}
        <div style={{ display: "flex", position: "absolute", top: 40, left: 40, fontSize: 80, opacity: 0.1 }}>💝</div>
        <div style={{ display: "flex", position: "absolute", bottom: 40, right: 40, fontSize: 80, opacity: 0.1 }}>🎁</div>
        <div style={{ display: "flex", position: "absolute", top: 100, right: 100, fontSize: 60, opacity: 0.05 }}>✨</div>
        <div style={{ display: "flex", position: "absolute", bottom: 100, left: 100, fontSize: 60, opacity: 0.05 }}>💖</div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px 60px",
            background: "rgba(255, 255, 255, 0.6)",
            borderRadius: "40px",
            boxShadow: "0 20px 50px rgba(225, 29, 72, 0.1)",
            border: "1px solid rgba(225, 29, 72, 0.1)",
          }}
        >
          <div style={{ display: "flex", fontSize: 80, marginBottom: 20 }}>🎁</div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            A Digital Surprise <br />
            Is Waiting For You!
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 28,
              fontWeight: 600,
              color: "#fb7185",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}
          >
            Interactive • Animated • Personalized
          </div>
        </div>
        
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 40,
            fontSize: 24,
            fontWeight: 700,
            color: "#e11d48",
            opacity: 0.6,
          }}
        >
          built with love on msgreplier.com
        </div>
      </div>
    ),
    size
  );
}
