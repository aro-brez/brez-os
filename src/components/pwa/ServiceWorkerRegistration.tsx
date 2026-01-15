"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered:", registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error);
        });

      // Handle online/offline status
      const updateOnlineStatus = () => {
        const isOnline = navigator.onLine;
        document.body.classList.toggle("offline", !isOnline);

        if (isOnline) {
          // Trigger sync when back online
          navigator.serviceWorker.ready.then((registration) => {
            if ("sync" in registration) {
              (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } })
                .sync.register("sync-messages");
            }
          });
        }
      };

      window.addEventListener("online", updateOnlineStatus);
      window.addEventListener("offline", updateOnlineStatus);
      updateOnlineStatus();

      return () => {
        window.removeEventListener("online", updateOnlineStatus);
        window.removeEventListener("offline", updateOnlineStatus);
      };
    }
  }, []);

  return null;
}

// Hook for PWA install prompt
// Returns install function when prompt is available
export function useInstallPrompt() {
  useEffect(() => {
    // Store prompt event for deferred installation
    // Currently logs availability - UI install button can call window.__pwaInstallPrompt?.prompt()
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Store on window for manual trigger if needed
      (window as Window & { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt = e as BeforeInstallPromptEvent;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
