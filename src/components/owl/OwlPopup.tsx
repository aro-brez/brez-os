"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useOwl, DEFAULT_USERS, User } from "./OwlProvider";
import { useVoice } from "@/lib/hooks/useVoice";

export function OwlPopup() {
  const [mounted, setMounted] = useState(false);
  const {
    user,
    setUser,
    messages,
    sendMessage,
    isPopupOpen,
    setPopupOpen,
    pendingAction,
    executeAction,
    clearAction,
  } = useOwl();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAwakening, setIsAwakening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true); // Auto-speak OWL responses
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Voice hook - Deepgram STT + Cartesia TTS
  const voice = useVoice({
    onTranscript: (text) => {
      if (text.trim()) {
        setInput(text);
      }
    },
    onError: (error) => {
      console.error("Voice error:", error);
    },
  });

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-speak new OWL messages
  useEffect(() => {
    if (!autoSpeak || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage.role === "owl" &&
      lastMessage.id !== lastMessageIdRef.current &&
      lastMessage.content !== "*wakes you*"
    ) {
      lastMessageIdRef.current = lastMessage.id;
      voice.speak(lastMessage.content);
    }
  }, [messages, autoSpeak, voice]);

  // Don't render until mounted (fixes hydration)
  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Stop any current speech
    voice.stopSpeaking();

    setIsLoading(true);
    await sendMessage(input.trim());
    setInput("");
    setIsLoading(false);
  };

  const handleSelectUser = async (selectedUser: User) => {
    setUser(selectedUser);
    setIsAwakening(true);

    // Give the OWL a moment to "wake up", then trigger introduction
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Send a greeting to trigger the OWL's introduction
    await sendMessage("*wakes you*");
    setIsAwakening(false);
  };

  const handleExpand = () => {
    setPopupOpen(false);
    window.location.href = "/owl";
  };

  const toggleVoice = async () => {
    if (voice.isListening) {
      // Stop listening and send the transcript
      const transcript = await voice.stopListening();
      if (transcript && transcript.trim()) {
        setIsLoading(true);
        await sendMessage(transcript.trim());
        setInput("");
        setIsLoading(false);
      }
    } else {
      // Stop any current speech and start listening
      voice.stopSpeaking();
      setInput("");
      await voice.startListening();
    }
  };

  // Get voice state indicator
  const getVoiceButtonContent = () => {
    if (voice.isListening) return { icon: "🔴", title: "Listening... (click to send)" };
    if (voice.isProcessing) return { icon: "⏳", title: "Processing..." };
    if (voice.isSpeaking) return { icon: "🔊", title: "Speaking... (click to stop)" };
    return { icon: "🎤", title: "Speak to your owl" };
  };

  const voiceButton = getVoiceButtonContent();

  return (
    <>
      {/* Floating Owl Button */}
      {!isPopupOpen && (
        <button
          onClick={() => setPopupOpen(true)}
          className="fixed bottom-24 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center text-3xl z-[9999]"
          title={user ? `Talk to ${user.owlName}` : "Wake your OWL"}
        >
          <span role="img" aria-label="owl">&#x1F989;</span>
        </button>
      )}

      {/* Popup Chat Window */}
      {isPopupOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-500/30 flex flex-col z-[9999] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-500/20 bg-purple-900/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">&#x1F989;</span>
              <div>
                <div className="font-semibold text-white">
                  {user ? user.owlName : "OWL"}
                </div>
                <div className="text-xs text-purple-300">
                  {user ? "Your mirror" : "Select identity"}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {/* Auto-speak toggle */}
              {user && (
                <button
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className={`p-2 rounded-lg transition-colors ${
                    autoSpeak
                      ? "bg-purple-500/30 text-purple-200"
                      : "hover:bg-purple-500/20 text-purple-400"
                  }`}
                  title={autoSpeak ? "Voice on (click to mute)" : "Voice off (click to enable)"}
                >
                  {autoSpeak ? "🔊" : "🔇"}
                </button>
              )}
              {user && (
                <button
                  onClick={handleExpand}
                  className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors text-purple-300 hover:text-white"
                  title="Expand to full view"
                >
                  &#x2B1C;
                </button>
              )}
              <button
                onClick={() => setPopupOpen(false)}
                className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors text-purple-300 hover:text-white"
                title="Minimize"
              >
                &#x2715;
              </button>
            </div>
          </div>

          {/* User Selection or Chat */}
          {!user ? (
            // User Selection
            <div className="flex-1 p-6 flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">&#x1F989;</div>
              <div className="text-xl text-white mb-2">Who is here?</div>
              <div className="text-gray-400 text-sm mb-6">Select your identity to wake your owl.</div>

              <div className="w-full space-y-3">
                {DEFAULT_USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className="w-full p-4 bg-gray-800/50 hover:bg-purple-900/30 border border-purple-500/20 hover:border-purple-500/50 rounded-xl transition-all duration-300 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-lg">
                        &#x1F989;
                      </div>
                      <div>
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-sm text-purple-300">{u.owlName} awaits</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Chat Interface
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Awakening State */}
                {isAwakening && messages.length === 0 && (
                  <div className="text-center py-12 animate-pulse">
                    <div className="text-5xl mb-4">&#x1F989;</div>
                    <div className="text-purple-300">{user.owlName} is awakening...</div>
                  </div>
                )}

                {/* Voice Hint for first conversation */}
                {!isAwakening && messages.length === 1 && messages[0].role === "owl" && (
                  <div className="text-center text-purple-400/60 text-xs mb-2">
                    Tap the microphone to speak • Click 🔊 to toggle voice
                  </div>
                )}
                {messages
                  .filter((msg) => msg.content !== "*wakes you*")
                  .map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800 text-gray-100 border border-purple-500/20"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Voice state indicator */}
                {(voice.isListening || voice.isProcessing) && (
                  <div className="flex justify-end">
                    <div className="bg-purple-600/50 text-white rounded-2xl px-4 py-2 animate-pulse">
                      {voice.isListening ? "🎤 Listening..." : "⏳ Processing..."}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Pending Action */}
              {pendingAction && pendingAction.type === "navigate" && (
                <div className="mx-4 mb-2 p-3 bg-purple-900/40 rounded-xl border border-purple-500/30 flex items-center justify-between">
                  <span className="text-sm text-purple-200">
                    Navigate to {pendingAction.path}?
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={executeAction}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
                    >
                      Go
                    </button>
                    <button
                      onClick={clearAction}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-purple-500/20">
                <div className="flex gap-2">
                  {/* Voice Input Button */}
                  <button
                    type="button"
                    onClick={voice.isSpeaking ? voice.stopSpeaking : toggleVoice}
                    disabled={isLoading || voice.isProcessing}
                    className={`px-3 py-2 rounded-xl font-medium transition-all ${
                      voice.isListening
                        ? "bg-red-500 hover:bg-red-400 animate-pulse"
                        : voice.isSpeaking
                        ? "bg-green-500 hover:bg-green-400"
                        : "bg-gray-700 hover:bg-gray-600"
                    } disabled:opacity-50`}
                    title={voiceButton.title}
                  >
                    <span role="img" aria-label="voice">{voiceButton.icon}</span>
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      voice.isListening
                        ? "Listening..."
                        : voice.isProcessing
                        ? "Processing..."
                        : "Ask your owl..."
                    }
                    disabled={isLoading || voice.isListening || voice.isProcessing}
                    className="flex-1 bg-gray-800 border border-purple-500/30 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim() || voice.isListening}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:opacity-50 rounded-xl font-medium transition-colors"
                  >
                    {isLoading ? "..." : "Send"}
                  </button>
                </div>
              </form>

              {/* Switch Identity Button */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => setUser(null)}
                  className="w-full text-sm text-gray-500 hover:text-purple-300 transition-colors"
                >
                  Switch Identity
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
