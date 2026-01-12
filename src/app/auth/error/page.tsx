"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to access this application.",
    Verification: "The verification token has expired or has already been used.",
    Default: "An error occurred during authentication.",
  };

  const message = errorMessages[error || ""] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-[#0D0D2A] flex items-center justify-center">
      <div className="text-center max-w-md mx-4">
        {/* Logo */}
        <div className="mb-6">
          <Image
            src="/images/brez-logo.svg"
            alt="BREZ"
            width={80}
            height={29}
            className="mx-auto opacity-60"
          />
        </div>

        {/* Error Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#ff6b6b]/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>

        {/* Message */}
        <h1 className="text-xl font-bold text-white mb-2">
          Authentication Error
        </h1>
        <p className="text-[#676986] text-sm mb-6">{message}</p>

        {/* Back Button */}
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#e3f98a] text-[#0D0D2A] font-semibold rounded-xl hover:bg-[#c5e066] transition-all btn-satisfying"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Try Again
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0D0D2A] flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
