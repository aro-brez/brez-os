"use client";

import { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

// ============ BUTTON ============

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D0D2A] disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-[#e3f98a] text-[#0D0D2A] hover:bg-[#d4ea7b] focus:ring-[#e3f98a] shadow-lg shadow-[#e3f98a]/20",
      secondary: "bg-[#242445] text-white border border-white/10 hover:bg-[#2d2d55] focus:ring-white/20",
      ghost: "text-[#a8a8a8] hover:text-white hover:bg-white/5 focus:ring-white/10",
      danger: "bg-[#ff6b6b] text-white hover:bg-[#ff5252] focus:ring-[#ff6b6b]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2",
    };

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// ============ INPUT ============

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#a8a8a8] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#676986]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              "w-full bg-[#1a1a3e] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-[#676986] focus:outline-none focus:ring-2 focus:ring-[#e3f98a]/50 focus:border-transparent transition-all",
              icon && "pl-10",
              error && "border-[#ff6b6b] focus:ring-[#ff6b6b]/50",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-[#ff6b6b]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// ============ TEXTAREA ============

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#a8a8a8] mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            "w-full bg-[#1a1a3e] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-[#676986] focus:outline-none focus:ring-2 focus:ring-[#e3f98a]/50 focus:border-transparent transition-all resize-none",
            error && "border-[#ff6b6b] focus:ring-[#ff6b6b]/50",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[#ff6b6b]">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// ============ SELECT ============

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#a8a8a8] mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={clsx(
            "w-full bg-[#1a1a3e] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#e3f98a]/50 focus:border-transparent transition-all appearance-none cursor-pointer",
            error && "border-[#ff6b6b] focus:ring-[#ff6b6b]/50",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1a1a3e]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-[#ff6b6b]">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

// ============ CARD ============

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className, padding = "md", hover = false, onClick, style }: CardProps) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={clsx(
        "bg-gradient-to-br from-[#242445] to-[#1a1a3e] rounded-2xl border border-white/5",
        paddings[padding],
        hover && "hover:border-[#e3f98a]/30 cursor-pointer transition-all",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}

// ============ BADGE ============

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ children, variant = "default", size = "sm", className, style }: BadgeProps) {
  const variants = {
    default: "bg-white/10 text-[#a8a8a8]",
    success: "bg-[#6BCB77]/20 text-[#6BCB77]",
    warning: "bg-[#ffce33]/20 text-[#ffce33]",
    danger: "bg-[#ff6b6b]/20 text-[#ff6b6b]",
    info: "bg-[#65cdd8]/20 text-[#65cdd8]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span className={clsx("rounded-full font-medium border", variants[variant], sizes[size], className)} style={style}>
      {children}
    </span>
  );
}

// ============ TABS ============

interface TabsProps {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={clsx("flex bg-[#1a1a3e] rounded-xl p-1 gap-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            "flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2",
            activeTab === tab.id
              ? "bg-[#e3f98a] text-[#0D0D2A] shadow-lg"
              : "text-[#a8a8a8] hover:text-white hover:bg-white/5"
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ============ AVATAR ============

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizes = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx("rounded-full object-cover", sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={clsx(
        "rounded-full bg-gradient-to-br from-[#e3f98a] to-[#65cdd8] flex items-center justify-center font-semibold text-[#0D0D2A]",
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}

// ============ MODAL ============

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={clsx(
          "relative bg-[#1a1a3e] rounded-2xl border border-white/10 shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col",
          sizes[size]
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 text-[#676986] hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ============ EMPTY STATE ============

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#242445] flex items-center justify-center text-3xl mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#676986] max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

// ============ LOADING ============

export function Loading({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div className={clsx("animate-spin rounded-full border-2 border-[#e3f98a] border-t-transparent", sizes[size])} />
    </div>
  );
}

// ============ PROGRESS BAR ============

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, max = 100, variant = "default", size = "md", showLabel = false, className }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const variants = {
    default: "bg-[#e3f98a]",
    success: "bg-[#6BCB77]",
    warning: "bg-[#ffce33]",
    danger: "bg-[#ff6b6b]",
  };

  const sizes = {
    sm: "h-1",
    md: "h-2",
  };

  return (
    <div className={clsx("w-full", className)}>
      <div className={clsx("w-full bg-white/10 rounded-full overflow-hidden", sizes[size])}>
        <div
          className={clsx("h-full rounded-full transition-all", variants[variant])}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-[#676986] mt-1">{percent.toFixed(0)}%</p>
      )}
    </div>
  );
}

// ============ TOOLTIP ============

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#0D0D2A] border border-white/10 rounded-lg text-xs text-white whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0D0D2A]" />
      </div>
    </div>
  );
}
