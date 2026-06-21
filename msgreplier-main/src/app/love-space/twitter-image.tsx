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
          background: "linear-gradient(to bottom right, #fdf2f8, #fce7f3)",
          color: "#9d174d",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements */}
        <div style={{ display: "flex", position: "absolute", top: -50, right: -50, width: 300, height: 300, background: "rgba(236, 72, 153, 0.05)", borderRadius: "50%" }}></div>
        <div style={{ display: "flex", position: "absolute", bottom: -100, left: -100, width: 400, height: 400, background: "rgba(236, 72, 153, 0.05)", borderRadius: "50%" }}></div>
        
        <div style={{ display: "flex", position: "absolute", top: 60, left: 60, fontSize: 60, opacity: 0.2 }}>❤️</div>
        <div style={{ display: "flex", position: "absolute", bottom: 60, right: 60, fontSize: 60, opacity: 0.2 }}>💬</div>
        <div style={{ display: "flex", position: "absolute", top: 120, right: 120, fontSize: 40, opacity: 0.1 }}>🎮</div>
        <div style={{ display: "flex", position: "absolute", bottom: 120, left: 120, fontSize: 40, opacity: 0.1 }}>🔒</div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "50px 80px",
            background: "rgba(255, 255, 255, 0.7)",
            borderRadius: "50px",
            boxShadow: "0 25px 60px rgba(157, 23, 77, 0.1)",
            border: "1px solid rgba(157, 23, 77, 0.1)",
          }}
        >
          <div style={{ display: "flex", fontSize: 90, marginBottom: 20 }}>💖</div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Welcome to <br />
            Your Love Space
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 30,
              fontWeight: 600,
              color: "#db2777",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
            }}
          >
            Private Chat • Couple Games • Secure
          </div>
        </div>
        
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 40,
            fontSize: 26,
            fontWeight: 700,
            color: "#9d174d",
            opacity: 0.7,
          }}
        >
          msgreplier.com/love-space
        </div>
      </div>
    ),
    size
  );
}
