"use client";

import Image from "next/image";
import { clsx } from "clsx";

interface BrezLogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function BrezLogo({ variant = "full", size = "md", className }: BrezLogoProps) {
  const sizes = {
    sm: variant === "full" ? { width: 80, height: 28 } : { width: 24, height: 24 },
    md: variant === "full" ? { width: 120, height: 42 } : { width: 32, height: 32 },
    lg: variant === "full" ? { width: 160, height: 56 } : { width: 40, height: 40 },
    xl: variant === "full" ? { width: 180, height: 64 } : { width: 48, height: 48 },
  };

  const { width, height } = sizes[size];

  if (variant === "icon") {
    // Icon variant - just the stylized "B" from the logo
    return (
      <div
        className={clsx(
          "rounded-xl bg-gradient-to-br from-[#e3f98a] to-[#65cdd8] flex items-center justify-center overflow-hidden",
          className
        )}
        style={{ width, height }}
      >
        <svg
          viewBox="0 0 42 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-2/3 h-2/3"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 5.93289V6.49846C4.85893 6.49846 5.19792 10.514 5.19792 21.6557V46.7669C5.19792 57.9086 4.85893 61.9242 0 61.9242V62.4897H6.7799C9.8461 62.4897 12.376 62.765 14.9394 63.044C17.5719 63.3305 20.2397 63.6209 23.5601 63.6209C35.5945 63.6209 42.3179 57.0603 42.3179 47.2759C42.3179 38.6793 35.2555 33.1367 26.6111 33.1367C23.3465 33.1367 20.6141 34.3865 18.4385 35.3817C16.9994 36.0399 15.804 36.5867 14.8593 36.5867C14.1813 36.5867 13.2208 36.417 13.2208 35.1162C13.2208 32.6382 17.1998 31.3146 22.0165 29.7122C29.4025 27.2552 38.7584 24.1429 38.7584 15.2082C38.7584 7.29026 31.47 4.80176 23.5037 4.80176C21.0177 4.80176 18.0232 5.08454 15.0288 5.36732C12.0343 5.65011 9.03986 5.93289 6.5539 5.93289H0ZM10.0002 7.17734C13.2772 6.15931 16.5541 5.59374 20.2266 5.59374C27.1195 5.59374 33.8994 8.30847 33.8994 15.3215C33.8994 21.6498 27.3812 24.8024 21.5659 27.615C16.8829 29.8801 12.6557 31.9246 12.6557 35.2295C12.6557 36.5869 13.6162 37.1525 14.6332 37.1525C16.1531 37.1525 17.7787 36.447 19.5475 35.6794C21.6581 34.7635 23.9725 33.759 26.5545 33.759C33.6169 33.759 37.4588 40.8852 37.4588 47.672C37.4588 57.0605 30.8484 62.8293 20.3396 62.8293C16.1586 62.8293 13.4467 62.2637 10.0002 61.0194V7.17734Z"
            fill="#0D0D2A"
          />
        </svg>
      </div>
    );
  }

  // Full logo variant
  return (
    <Image
      src="/images/brez-logo.svg"
      alt="BREZ"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}

// Wordmark with AI suffix for the app
export function BrezAILogo({
  size = "md",
  showVersion = false,
  className
}: {
  size?: "sm" | "md" | "lg";
  showVersion?: boolean;
  className?: string;
}) {
  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  const subSizes = {
    sm: "text-[8px]",
    md: "text-[10px]",
    lg: "text-xs",
  };

  return (
    <div className={clsx("flex flex-col", className)}>
      <h1 className={clsx("font-bold text-white tracking-tight", textSizes[size])}>
        BRĒZ <span className="text-[#e3f98a]">AI</span>
      </h1>
      {showVersion && (
        <p className={clsx("text-[#676986] -mt-0.5", subSizes[size])}>
          Supermind • DEV MODE
        </p>
      )}
    </div>
  );
}
