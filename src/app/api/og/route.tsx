import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0D0D2A",
          backgroundImage: "radial-gradient(circle at 20% 20%, #8533fc20 0%, transparent 50%), radial-gradient(circle at 80% 80%, #65cdd820 0%, transparent 50%)",
        }}
      >
        {/* Logo Area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              background: "linear-gradient(135deg, #e3f98a 0%, #65cdd8 100%)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            BRĒZ
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Growth Generator
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#a8a8a8",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          AI-powered financial simulation for your business
        </div>

        {/* 5 Steps Indicator */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 50,
          }}
        >
          {[
            { label: "Survive", color: "#ff6b6b" },
            { label: "Stabilize", color: "#ffce33" },
            { label: "Thrive", color: "#6BCB77" },
            { label: "Scale", color: "#8533fc" },
          ].map((step) => (
            <div
              key={step.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                backgroundColor: `${step.color}20`,
                borderRadius: 12,
                border: `2px solid ${step.color}50`,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: step.color,
                }}
              />
              <span style={{ color: step.color, fontSize: 18, fontWeight: 600 }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
