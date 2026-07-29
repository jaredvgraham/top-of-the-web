import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Bsites — AI website builder and designer for US businesses. Free demo from your Facebook page.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #1A1433 0%, #241a45 55%, #3a2168 100%)",
          padding: "64px 72px",
          color: "#F5F5FB",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", fontSize: 38, fontWeight: 700 }}>
            Bsites
            <span style={{ color: "#B79BF7" }}>.io</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "rgba(245,245,251,0.6)",
            }}
          >
            Free Facebook demo
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#B79BF7",
              marginBottom: 24,
            }}
          >
            AI website builder · Website designer
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 78,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: -2,
              maxWidth: 900,
            }}
          >
            Your business, designed like it matters.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
            borderTop: "1px solid rgba(245,245,251,0.2)",
            paddingTop: 28,
            fontSize: 26,
          }}
        >
          <div style={{ display: "flex", color: "#F5F5FB" }}>$0 build</div>
          <div style={{ display: "flex", color: "rgba(245,245,251,0.35)" }}>
            /
          </div>
          <div style={{ display: "flex", color: "#F5F5FB" }}>
            $84/mo hosting + care
          </div>
          <div style={{ display: "flex", color: "rgba(245,245,251,0.35)" }}>
            /
          </div>
          <div style={{ display: "flex", color: "#F5F5FB" }}>US-wide</div>
        </div>
      </div>
    ),
    size
  );
}
