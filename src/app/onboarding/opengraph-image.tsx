import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Bsites site brief onboarding link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OnboardingOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "linear-gradient(145deg, #F5F5FB 0%, #E8E4F5 45%, #DCD4F0 100%)",
          color: "#1A1433",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 28,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#5B2E9E",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
          }}
        >
          Bsites · Onboarding
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              fontWeight: 500,
              maxWidth: 920,
            }}
          >
            Your site brief is ready
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: "rgba(26,20,51,0.62)",
              maxWidth: 820,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Open this private link to tell us about your business so we can
            start building your website.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "system-ui, sans-serif",
            fontSize: 22,
            color: "rgba(26,20,51,0.5)",
          }}
        >
          <span>Private client onboarding</span>
          <span style={{ color: "#5B2E9E", fontWeight: 600 }}>bsites.io</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
