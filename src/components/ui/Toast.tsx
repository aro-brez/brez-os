"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { clsx } from "clsx";
import { CheckCircle, AlertTriangle, Info, X, Sparkles, Target, CheckSquare } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "celebration";
  icon?: ReactNode;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: Toast["type"], icon?: ReactNode) => void;
  celebrate: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: Toast["type"] = "info", icon?: ReactNode) => {
    const id = Math.random().toString(36).slice(2);
    const duration = type === "celebration" ? 4000 : 3000;

    setToasts((prev) => [...prev, { id, message, type, icon, duration }]);

    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const celebrate = useCallback((message: string) => {
    toast(message, "celebration", <Sparkles className="w-5 h-5" />);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, celebrate }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none md:bottom-8 md:right-8">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));

    const timeout = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onRemove, 300);
    }, (toast.duration || 3000) - 300);

    return () => clearTimeout(timeout);
  }, [toast.duration, onRemove]);

  const getIcon = () => {
    if (toast.icon) return toast.icon;
    switch (toast.type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <AlertTriangle className="w-5 h-5" />;
      case "celebration":
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-[#6BCB77]/20 border-[#6BCB77]/40 text-[#6BCB77]";
      case "error":
        return "bg-[#ff6b6b]/20 border-[#ff6b6b]/40 text-[#ff6b6b]";
      case "celebration":
        return "bg-gradient-to-r from-[#e3f98a]/20 to-[#65cdd8]/20 border-[#e3f98a]/40 text-[#e3f98a]";
      default:
        return "bg-[#65cdd8]/20 border-[#65cdd8]/40 text-[#65cdd8]";
    }
  };

  return (
    <div
      className={clsx(
        "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300",
        getStyles(),
        isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      )}
    >
      {getIcon()}
      <span className="text-sm font-medium text-white">{toast.message}</span>
      <button
        onClick={onRemove}
        className="ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors text-[#676986] hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Celebration particles */}
      {toast.type === "celebration" && (
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                backgroundColor: i % 2 === 0 ? "#e3f98a" : "#65cdd8",
                animationDelay: `${i * 100}ms`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
