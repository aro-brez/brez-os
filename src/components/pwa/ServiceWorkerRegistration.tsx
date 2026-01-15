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
export function useInstallPrompt() {
  useEffect(() => {
    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      // Could trigger UI to show install button
      console.log("[PWA] Install prompt available");
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
