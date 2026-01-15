"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  captured?: CapturedItem;
}

interface CapturedItem {
  type: "task" | "idea" | "insight" | "goal";
  content: string;
  priority: "L" | "N" | "O";
  connections?: string[];
}

interface Thread {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastMessage?: Date;
}

interface VoiceChatProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    inputs?: unknown;
    outputs?: unknown;
    csvData?: unknown;
  };
}

// Speech Recognition types
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Capture detection patterns
const CAPTURE_PATTERNS = [
  { regex: /^capture:?\s*(.+)/i, type: "task" as const },
  { regex: /^task:?\s*(.+)/i, type: "task" as const },
  { regex: /^to-?do:?\s*(.+)/i, type: "task" as const },
  { regex: /^idea:?\s*(.+)/i, type: "idea" as const },
  { regex: /^insight:?\s*(.+)/i, type: "insight" as const },
  { regex: /^goal:?\s*(.+)/i, type: "goal" as const },
  { regex: /^remember:?\s*(.+)/i, type: "insight" as const },
  { regex: /^yo,?\s*capture:?\s*(.+)/i, type: "task" as const },
  { regex: /^add to (?:my )?list:?\s*(.+)/i, type: "task" as const },
];

function detectCapture(text: string): CapturedItem | null {
  for (const pattern of CAPTURE_PATTERNS) {
    const match = text.match(pattern.regex);
    if (match && match[1]) {
      return {
        type: pattern.type,
        content: match[1].trim(),
        priority: "N", // Will be assessed by AI
      };
    }
  }
  return null;
}

// Thread storage
function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("brez-threads");
  if (stored) {
    const threads = JSON.parse(stored);
    return threads.map((t: Thread) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      lastMessage: t.lastMessage ? new Date(t.lastMessage) : undefined,
      messages: t.messages.map((m: ChatMessage) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }));
  }
  return [];
}

function saveThreads(threads: Thread[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("brez-threads", JSON.stringify(threads));
}

export function VoiceChat({ isOpen, onClose, context }: VoiceChatProps) {
  // Thread state
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [showThreadList, setShowThreadList] = useState(false);

  // Message state
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "checking">("checking");
  const [isOffline, setIsOffline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize threads from storage
  useEffect(() => {
    const stored = loadThreads();
    if (stored.length > 0) {
      setThreads(stored);
      setActiveThreadId(stored[0].id);
    } else {
      createNewThread();
    }
  }, []);

  // Save threads on change
  useEffect(() => {
    if (threads.length > 0) {
      saveThreads(threads);
    }
  }, [threads]);

  // Get active thread
  const activeThread = threads.find((t) => t.id === activeThreadId);
  const messages = activeThread?.messages || [];

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Check microphone permission
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.permissions) {
      navigator.permissions.query({ name: "microphone" as PermissionName })
        .then((result) => {
          setMicPermission(result.state as "granted" | "denied" | "prompt");
          result.onchange = () => {
            setMicPermission(result.state as "granted" | "denied" | "prompt");
          };
        })
        .catch(() => {
          setMicPermission("prompt"); // Assume prompt if we can't check
        });
    } else {
      setMicPermission("prompt");
    }
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let interim = "";
          let final = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript;
            } else {
              interim += transcript;
            }
          }

          setInterimTranscript(interim);
          if (final) {
            setInput((prev) => prev + final);
            setInterimTranscript("");
          }
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  // Request microphone permission
  const requestMicPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Release the stream
      setMicPermission("granted");
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setMicPermission("denied");
      return false;
    }
  }, []);

  // Toggle voice listening
  const toggleListening = useCallback(async () => {
    if (!recognitionRef.current) {
      alert("Voice recognition not supported in this browser. Try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Check permission first
      if (micPermission === "denied") {
        alert("Microphone access was denied. Please enable it in your browser settings.");
        return;
      }

      if (micPermission === "prompt") {
        const granted = await requestMicPermission();
        if (!granted) {
          alert("Microphone access is required for voice input. Please allow access and try again.");
          return;
        }
      }

      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        // Try requesting permission again
        await requestMicPermission();
      }
    }
  }, [isListening, micPermission, requestMicPermission]);

  // Speak text
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === "undefined") return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  // Create new thread
  const createNewThread = useCallback(() => {
    const newThread: Thread = {
      id: Date.now().toString(),
      name: `Thread ${threads.length + 1}`,
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hey! I'm your BREZ Supermind. Speak or type naturally.\n\nTry: \"Capture: Follow up with retail team\" or just ask me anything about the business.",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    setShowThreadList(false);
  }, [threads.length]);

  // Send message with retry logic
  const sendWithRetry = useCallback(async (
    userText: string,
    captured: CapturedItem | null,
    attempt: number = 0
  ): Promise<string> => {
    const MAX_RETRIES = 3;
    const BASE_DELAY = 1000;

    // Check offline status
    if (isOffline) {
      throw new Error("offline");
    }

    const enhancedContext = {
      ...context,
      captured,
      threadId: activeThreadId,
      isVoice: true,
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          context: enhancedContext,
          history: messages.slice(-15),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.offline) {
        throw new Error("offline");
      }

      setRetryCount(0);
      return data.message || "I couldn't process that request.";
    } catch (error) {
      if (attempt < MAX_RETRIES && !isOffline) {
        setRetryCount(attempt + 1);
        const delay = BASE_DELAY * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        return sendWithRetry(userText, captured, attempt + 1);
      }
      throw error;
    }
  }, [context, activeThreadId, messages, isOffline]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || isLoading || !activeThreadId) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userText = input.trim();

    // Check for capture command
    const captured = detectCapture(userText);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date(),
      captured: captured ?? undefined,
    };

    // Update thread with user message
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              messages: [...t.messages, userMessage],
              lastMessage: new Date(),
            }
          : t
      )
    );

    setInput("");
    setIsLoading(true);

    try {
      const responseText = await sendWithRetry(userText, captured);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      // Update thread with assistant message
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? {
                ...t,
                messages: [...t.messages, assistantMessage],
                lastMessage: new Date(),
              }
            : t
        )
      );

      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speak(responseText);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const isOfflineError = error instanceof Error && error.message === "offline";

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: isOfflineError
          ? "You're offline. Your message has been saved and will be sent when you're back online."
          : `Sorry, I couldn't connect after ${retryCount + 1} attempts. Please check your connection and try again.`,
        timestamp: new Date(),
      };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? { ...t, messages: [...t.messages, errorMessage] }
            : t
        )
      );
    } finally {
      setIsLoading(false);
      setRetryCount(0);
    }
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Delete thread
  const deleteThread = (threadId: string) => {
    setThreads((prev) => {
      const filtered = prev.filter((t) => t.id !== threadId);
      if (activeThreadId === threadId && filtered.length > 0) {
        setActiveThreadId(filtered[0].id);
      } else if (filtered.length === 0) {
        createNewThread();
      }
      return filtered;
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] bg-[#0D0D2A] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0D0D2A] safe-area-top">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowThreadList(!showThreadList)}
            className="p-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {activeThread?.name || "BREZ Supermind"}
            </h3>
            <p className={`text-xs ${isOffline ? "text-amber-400" : "text-[#6BCB77]"}`}>
              {isOffline
                ? "Offline"
                : isListening
                  ? "Listening..."
                  : isSpeaking
                    ? "Speaking..."
                    : isLoading && retryCount > 0
                      ? `Retrying (${retryCount}/3)...`
                      : "Ready"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              voiceEnabled
                ? "bg-[#e3f98a]/20 text-[#e3f98a]"
                : "text-white/40 hover:text-white"
            }`}
            aria-label="Toggle voice output"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {voiceEnabled ? (
                <>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </>
              ) : (
                <>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </>
              )}
            </svg>
          </button>
          <button
            onClick={createNewThread}
            className="p-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white"
            aria-label="New thread"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white"
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500/20 border-b border-amber-500/30 overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2 px-4 py-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.58 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
              </svg>
              <span className="text-sm text-amber-200">You&apos;re offline. Messages will send when reconnected.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thread List Sidebar - Desktop: slide from left, Mobile: bottom sheet */}
      <AnimatePresence>
        {showThreadList && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-10 md:hidden"
              onClick={() => setShowThreadList(false)}
            />
            {/* Desktop sidebar */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="hidden md:block absolute top-14 left-0 bottom-0 w-72 bg-[#1a1a3e] border-r border-white/10 z-10 overflow-y-auto"
            >
              <div className="p-4 border-b border-white/10">
                <h4 className="text-sm font-semibold text-white">Threads</h4>
              </div>
              <div className="p-2">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      activeThreadId === thread.id
                        ? "bg-[#e3f98a]/10 border border-[#e3f98a]/30"
                        : "hover:bg-white/5"
                    }`}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      setShowThreadList(false);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{thread.name}</p>
                      <p className="text-xs text-white/40">
                        {thread.messages.length} messages
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteThread(thread.id);
                      }}
                      className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-red-400"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
            {/* Mobile bottom sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a3e] rounded-t-2xl z-20 max-h-[70vh] overflow-hidden flex flex-col safe-area-bottom"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <h4 className="text-sm font-semibold text-white">Threads</h4>
                <button
                  onClick={() => setShowThreadList(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Thread list */}
              <div className="flex-1 overflow-y-auto p-2">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      activeThreadId === thread.id
                        ? "bg-[#e3f98a]/10 border border-[#e3f98a]/30"
                        : "hover:bg-white/5"
                    }`}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      setShowThreadList(false);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{thread.name}</p>
                      <p className="text-xs text-white/40">
                        {thread.messages.length} messages
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteThread(thread.id);
                      }}
                      className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-red-400"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-[#e3f98a] text-[#0D0D2A]"
                  : "bg-[#242445] text-white border border-white/5"
              }`}
            >
              {message.captured && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-current/20">
                  <span className="text-xs font-medium uppercase tracking-wide opacity-70">
                    {message.captured.type} captured
                  </span>
                  <span className="text-xs bg-current/10 px-2 py-0.5 rounded">
                    {message.captured.priority}
                  </span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-[#242445] rounded-2xl px-4 py-3 border border-white/5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#e3f98a] rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-[#e3f98a] rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <span
                    className="w-2 h-2 bg-[#e3f98a] rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
                {retryCount > 0 && (
                  <span className="text-xs text-amber-400">
                    Retrying... ({retryCount}/3)
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-[#0D0D2A] safe-area-bottom">
        {/* Interim transcript */}
        {interimTranscript && (
          <div className="mb-2 px-3 py-2 bg-[#242445]/50 rounded-lg">
            <p className="text-sm text-white/50 italic">{interimTranscript}</p>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Voice button with waveform */}
          <div className="relative shrink-0">
            <button
              onClick={toggleListening}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isListening
                  ? "bg-red-500 text-white voice-recording"
                  : "bg-[#242445] text-white/70 hover:text-white hover:bg-[#2d2d55]"
              }`}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? (
                /* Waveform when listening */
                <div className="flex items-center justify-center gap-[2px] h-6">
                  <span className="voice-wave-bar" />
                  <span className="voice-wave-bar" />
                  <span className="voice-wave-bar" />
                  <span className="voice-wave-bar" />
                  <span className="voice-wave-bar" />
                </div>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>
          </div>

          {/* Text input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Speak or type... Try 'Capture: [task]'"
            className="flex-1 bg-[#242445] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#676986] focus:outline-none focus:border-[#e3f98a]/50 resize-none min-h-[48px] max-h-32"
            rows={1}
            disabled={isLoading}
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-12 h-12 rounded-xl bg-[#e3f98a] text-[#0D0D2A] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <button
            onClick={() => setInput("Capture: ")}
            className="text-xs text-[#676986] hover:text-[#e3f98a] transition-colors"
          >
            Capture task
          </button>
          <span className="text-white/20">|</span>
          <button
            onClick={() => setInput("What's my priority? ")}
            className="text-xs text-[#676986] hover:text-[#e3f98a] transition-colors"
          >
            Check priority
          </button>
          <span className="text-white/20">|</span>
          <button
            onClick={() => setInput("Show me the queue ")}
            className="text-xs text-[#676986] hover:text-[#e3f98a] transition-colors"
          >
            View queue
          </button>
        </div>
      </div>
    </motion.div>
  );
}
