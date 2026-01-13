import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://brez-growth-generator.vercel.app"),
  title: "BRĒZ Growth Generator | AI-Powered Financial Simulation",
  description: "Your team's AI-powered operating system for growth. Simulate what-if scenarios, track cash flow, and make data-driven decisions with the 5-step Growth Generator.",
  manifest: "/manifest.json",
  keywords: ["growth", "financial simulation", "cash flow", "AI", "business planning", "BREZ"],
  authors: [{ name: "BRĒZ Team" }],
  creator: "BRĒZ",
  publisher: "BRĒZ",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BRĒZ Growth Generator",
    title: "BRĒZ Growth Generator | AI-Powered Financial Simulation",
    description: "Your team's AI-powered operating system for growth. 5-step sequence to move from Survive → Stabilize → Thrive → Scale.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "BRĒZ Growth Generator - AI-Powered Financial Simulation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BRĒZ Growth Generator",
    description: "AI-powered operating system for growth. Simulate scenarios and make data-driven decisions.",
    images: ["/api/og"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BRĒZ AI",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0D0D2A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
