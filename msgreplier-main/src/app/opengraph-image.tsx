import { ImageResponse } from "next/og";

// Running on default Node.js runtime for OpenNext compatibility


export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
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
        <div style={{ display: "flex", fontSize: 72, fontWeight: 800, letterSpacing: "-0.04em" }}>
          MsgReplier
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 34,
            fontWeight: 600,
            color: "#f43f5e",
          }}
        >
          Private Love Space • Wishes Website • Interactive Surprises
        </div>
      </div>
    ),
    size
  );
}

