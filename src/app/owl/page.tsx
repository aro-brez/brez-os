"use client";

import { useState, useRef, useEffect } from "react";
import { useOwl, DEFAULT_USERS, User } from "@/components/owl/OwlProvider";

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function OwlPage() {
  const { user, setUser, messages, sendMessage, clearHistory } = useOwl();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [email, setEmail] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        await transcribeAndSend(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Could not access microphone. Check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAndSend = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { text } = await response.json();
        if (text && text.trim()) {
          await sendMessage(text);
        }
      } else {
        console.error("Transcription failed");
      }
    } catch (err) {
      console.error("Transcribe error:", err);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    await sendMessage(input);
    setInput("");
    setIsLoading(false);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const knownUser = DEFAULT_USERS.find((u) => email.toLowerCase().includes(u.name.toLowerCase()));
    if (knownUser) {
      setUser({ ...knownUser, email });
    } else {
      const name = email.split("@")[0].replace(/[^a-zA-Z]/g, "");
      const cap = name.charAt(0).toUpperCase() + name.slice(1);
      setUser({ id: email.toLowerCase(), name: cap || "Friend", email, role: "viewer", owlId: cap.toLowerCase() + "-owl", owlName: cap + "-Owl" });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0D0D2A] via-[#1a1a3e] to-[#0D0D2A] flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
          <div className="text-6xl mb-6">🦉</div>
          <h1 className="text-2xl font-light text-white mb-2">BREZ</h1>
          <p className="text-purple-300/60 mb-8 text-sm">Enter your email to meet your OWL</p>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-white/5 border border-purple-500/30 rounded-2xl px-4 py-3 text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500/60 text-center" autoFocus />
            <button type="submit" disabled={!email.trim()} className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 rounded-2xl text-white transition-colors">Enter</button>
          </form>
          <div className="mt-8 pt-6 border-t border-purple-500/10">
            <p className="text-purple-300/40 text-xs mb-3">Quick access</p>
            <div className="flex justify-center gap-2">
              {DEFAULT_USERS.map((u) => (<button key={u.id} onClick={() => setUser(u)} className="px-3 py-1.5 bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/20 rounded-full text-purple-300/70 text-sm">{u.name}</button>))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0D2A] via-[#1a1a3e] to-[#0D0D2A] flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🦉</div>
          <div>
            <div className="text-white text-sm font-medium">{user.owlName}</div>
            <div className="text-purple-300/50 text-xs">{user.name}</div>
          </div>
        </div>
        <button onClick={() => { if (confirm("Clear chat history?")) clearHistory(); }} className="text-purple-300/40 hover:text-purple-300/70 text-xs">Clear</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🦉</div>
            <p className="text-purple-300/60 text-sm">Hey {user.name}. Hold the mic to talk.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${msg.role === "user" ? "text-right" : "text-left"}`}>
              <div className={`inline-block rounded-2xl px-4 py-2.5 ${msg.role === "user" ? "bg-purple-600 text-white" : "bg-white/5 text-purple-100 border border-purple-500/15"}`}>
                <p className="text-[15px] leading-relaxed">{msg.content}</p>
              </div>
              <div className="text-[10px] text-purple-300/30 mt-1 px-2">{formatTime(new Date(msg.timestamp))}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-purple-500/15 rounded-2xl px-4 py-2.5">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-purple-500/10">
        {isRecording && (
          <div className="text-center text-red-400 text-sm mb-3 animate-pulse">🔴 Recording... release to send</div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <button
            type="button"
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={() => isRecording && stopRecording()}
            disabled={isLoading}
            className={`p-3 rounded-2xl transition-all ${isRecording ? "bg-red-500 text-white scale-110" : "bg-white/5 text-purple-300/60 hover:bg-white/10"} ${isLoading ? "opacity-50" : ""}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Or type here..." disabled={isLoading || isRecording} className="flex-1 bg-white/5 border border-purple-500/15 rounded-2xl px-4 py-3 text-white placeholder-purple-300/30 focus:outline-none focus:border-purple-500/40 text-[15px]" />
          <button type="submit" disabled={isLoading || !input.trim() || isRecording} className="px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/40 rounded-2xl text-white text-lg">↑</button>
        </form>
      </div>
    </div>
  );
}
