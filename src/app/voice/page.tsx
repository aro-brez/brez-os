"use client";

import { useState, useEffect } from "react";
import { VoiceChat } from "@/components/ai/VoiceChat";

export default function VoicePage() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth animation
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D2A]">
      <VoiceChat
        isOpen={isReady}
        onClose={() => {
          // Navigate back to home
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }}
        context={{}}
      />
    </div>
  );
}
