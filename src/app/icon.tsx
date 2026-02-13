import { ImageResponse } from "@vercel/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090d",
          borderRadius: 8,
          fontFamily: "sans-serif",
          letterSpacing: "-0.025em",
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 700, color: "#d946a8" }}>
          N
        </span>
      </div>
    ),
    { ...size },
  );
}
