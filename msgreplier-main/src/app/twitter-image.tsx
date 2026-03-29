import { ImageResponse } from "next/og";


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
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: "-0.04em" }}>
          MsgReplier
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 34,
            fontWeight: 600,
            color: "#2563eb",
          }}
        >
          Shortcut Meanings • Slang Dictionary • Text Repeater
        </div>
      </div>
    ),
    size
  );
}

