"use client";

import { useState, useRef, useCallback } from "react";

type VoiceState = "idle" | "listening" | "processing" | "speaking";

interface UseVoiceOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  onStateChange?: (state: VoiceState) => void;
}

interface UseVoiceReturn {
  state: VoiceState;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<string | null>;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  transcript: string;
  error: string | null;
}

export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const updateState = useCallback(
    (newState: VoiceState) => {
      setState(newState);
      options.onStateChange?.(newState);
    },
    [options]
  );

  const startListening = useCallback(async () => {
    try {
      setError(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      updateState("listening");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to access microphone";
      setError(message);
      options.onError?.(message);
    }
  }, [options, updateState]);

  const stopListening = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;

      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        streamRef.current?.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        if (audioBlob.size === 0) {
          updateState("idle");
          resolve(null);
          return;
        }

        updateState("processing");

        try {
          const response = await fetch("/api/voice/transcribe", {
            method: "POST",
            body: audioBlob,
          });

          if (!response.ok) {
            throw new Error(`Transcription failed: ${response.status}`);
          }

          const data = await response.json();
          const text = data.transcript || "";

          setTranscript(text);
          options.onTranscript?.(text);
          updateState("idle");
          resolve(text);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Transcription failed";
          setError(message);
          options.onError?.(message);
          updateState("idle");
          resolve(null);
        }
      };

      mediaRecorder.stop();
    });
  }, [options, updateState]);

  const speak = useCallback(
    async (text: string) => {
      if (!text) return;

      updateState("speaking");

      try {
        // Try Cartesia first, fall back to browser TTS
        const response = await fetch("/api/voice/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);

          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            updateState("idle");
          };

          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            // Fall back to browser TTS
            fallbackSpeak(text);
          };

          await audio.play();
        } else {
          // Fall back to browser TTS
          fallbackSpeak(text);
        }
      } catch {
        // Fall back to browser TTS
        fallbackSpeak(text);
      }

      function fallbackSpeak(text: string) {
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.onend = () => updateState("idle");
          utterance.onerror = () => updateState("idle");
          speechSynthesis.speak(utterance);
        } else {
          updateState("idle");
        }
      }
    },
    [updateState]
  );

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
    updateState("idle");
  }, [updateState]);

  return {
    state,
    isListening: state === "listening",
    isProcessing: state === "processing",
    isSpeaking: state === "speaking",
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    transcript,
    error,
  };
}
