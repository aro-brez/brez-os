import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { OwlProvider } from "@/components/owl/OwlProvider";
import { OwlPopup } from "@/components/owl/OwlPopup";

export const metadata: Metadata = {
  title: "BRĒZ AI",
  description: "Your AI-powered growth command center",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BRĒZ AI",
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
        <ServiceWorkerRegistration />
        <AuthProvider>
          <OwlProvider>
            <AppShell>{children}</AppShell>
            <OwlPopup />
          </OwlProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
