"use client";

import { useState, useRef, useEffect } from "react";
import { useOwl, DEFAULT_USERS, User } from "@/components/owl/OwlProvider";

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function getSupportedMimeType() {
  const types = ["audio/mp4", "audio/webm", "audio/ogg", "audio/wav"];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export default function OwlPage() {
  const { user, setUser, messages, sendMessage, clearHistory } = useOwl();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startRecording = async () => {
    try {
      setStatus("Getting mic...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mimeTypeRef.current = getSupportedMimeType();
      if (!mimeTypeRef.current) {
        setStatus("No supported audio format");
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: mimeTypeRef.current });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (chunksRef.current.length > 0) {
          const audioBlob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
          await transcribeAndSend(audioBlob);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setStatus("Recording...");
    } catch (err: any) {
      setStatus("Mic error: " + err.message);
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("Transcribing...");
    }
  };

  const transcribeAndSend = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("mimeType", mimeTypeRef.current);

      const response = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await response.json();

      if (response.ok && data.text) {
        setStatus("");
        await sendMessage(data.text);
      } else {
        setStatus("Error: " + (data.error || "Failed"));
        setTimeout(() => setStatus(""), 3000);
      }
    } catch (err: any) {
      setStatus("Error: " + err.message);
      setTimeout(() => setStatus(""), 3000);
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
            <button type="submit" disabled={!email.trim()} className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 rounded-2xl text-white">Enter</button>
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
        <button onClick={() => { if (confirm("Clear?")) clearHistory(); }} className="text-purple-300/40 text-xs">Clear</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🦉</div>
            <p className="text-purple-300/60 text-sm">Hey {user.name}. Hold mic to talk.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%]`}>
              <div className={`inline-block rounded-2xl px-4 py-2.5 ${msg.role === "user" ? "bg-purple-600 text-white" : "bg-white/5 text-purple-100 border border-purple-500/15"}`}>
                <p className="text-[15px] leading-relaxed">{msg.content}</p>
              </div>
              <div className={`text-[10px] text-purple-300/30 mt-1 px-2 ${msg.role === "user" ? "text-right" : ""}`}>{formatTime(new Date(msg.timestamp))}</div>
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
        {status && <div className={`text-center text-sm mb-3 ${isRecording ? "text-red-400 animate-pulse" : "text-purple-300/60"}`}>{status}</div>}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <button
            type="button"
            onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
            onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            disabled={isLoading}
            className={`p-4 rounded-2xl transition-all ${isRecording ? "bg-red-500 text-white scale-110" : "bg-purple-600 text-white"} ${isLoading ? "opacity-50" : ""}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Or type..." disabled={isLoading || isRecording} className="flex-1 bg-white/5 border border-purple-500/15 rounded-2xl px-4 py-3 text-white placeholder-purple-300/30 focus:outline-none text-[15px]" />
          <button type="submit" disabled={isLoading || !input.trim()} className="px-5 py-3 bg-purple-600 disabled:bg-purple-900/40 rounded-2xl text-white text-lg">↑</button>
        </form>
      </div>
    </div>
  );
}
