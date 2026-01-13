"use client";

import { signIn, getProviders } from "next-auth/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { BrezLogo } from "@/components/ui/BrezLogo";
import { Sparkles, Zap, ArrowRight } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasGoogleProvider, setHasGoogleProvider] = useState(false);

  useEffect(() => {
    getProviders().then((providers) => {
      setHasGoogleProvider(!!providers?.google);
    });
  }, []);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  const handleDemoSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email.endsWith("@drinkbrez.com") && email !== "demo@brez.com") {
      setError("Please use your @drinkbrez.com email");
      setIsLoading(false);
      return;
    }

    const result = await signIn("demo", {
      email,
      callbackUrl: "/",
      redirect: false,
    });

    if (result?.error) {
      setError("Sign in failed. Please try again.");
      setIsLoading(false);
    } else if (result?.ok) {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D2A] flex items-center justify-center relative overflow-hidden">
      {/* Enhanced Aurora Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary glow - lime */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#e3f98a]/15 rounded-full blur-[150px]"
          style={{
            animation: "aurora-drift-1 25s ease-in-out infinite"
          }}
        />
        {/* Secondary glow - teal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.3 }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#65cdd8]/12 rounded-full blur-[130px]"
          style={{
            animation: "aurora-drift-2 30s ease-in-out infinite"
          }}
        />
        {/* Accent glow - purple */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.6 }}
          className="absolute top-1/2 left-1/2 w-[350px] h-[350px] bg-[#8533fc]/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"
          style={{
            animation: "aurora-drift-3 35s ease-in-out infinite"
          }}
        />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Main Card */}
        <div className="bg-gradient-to-br from-[#1a1a3e]/95 to-[#242445]/95 rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Card glow effect */}
          <div className="absolute inset-0 opacity-50 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#e3f98a]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#65cdd8]/10 rounded-full blur-3xl" />
          </div>

          {/* Logo Section - Enhanced */}
          <div className="text-center mb-8 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex flex-col items-center justify-center"
            >
              {/* BREZ Logo with Glow */}
              <div className="relative mb-4">
                <BrezLogo variant="wordmark-glow" size="xl" animated />
              </div>

              {/* Supermind Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#e3f98a]/10 to-[#65cdd8]/10 border border-[#e3f98a]/20">
                  <Sparkles className="w-3.5 h-3.5 text-[#65cdd8]" />
                  <span className="text-sm font-medium text-[#e3f98a]">Supermind</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-[#a8a8a8] text-sm">
                Your AI co-pilot for building a <span className="text-[#e3f98a] font-semibold">$200B</span> company
              </p>
            </motion.div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#1a1a3e] text-[#676986] flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-[#65cdd8]" />
                Team Login
              </span>
            </div>
          </div>

          {/* Google Sign In Button - only show if configured */}
          {hasGoogleProvider && (
            <>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#e3f98a] hover:bg-[#DFF59A] text-[#0D0D2A] font-semibold rounded-xl transition-all duration-300 btn-satisfying hover:shadow-[0_0_30px_rgba(227,249,138,0.3)] group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Sign in with Google</span>
                <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
              </motion.button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-[#1a1a3e] text-[#676986]">or continue with email</span>
                </div>
              </div>
            </>
          )}

          {/* Email Sign In */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: hasGoogleProvider ? 0.6 : 0.5 }}
            onSubmit={handleDemoSignIn}
            className="space-y-4"
          >
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@drinkbrez.com"
                className="w-full px-4 py-4 bg-[#0D0D2A]/50 border border-white/10 rounded-xl text-white placeholder-[#676986] focus:outline-none focus:border-[#e3f98a]/50 focus:ring-2 focus:ring-[#e3f98a]/20 focus:shadow-[0_0_20px_rgba(227,249,138,0.1)] transition-all duration-300"
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#ff6b6b] text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading || !hasGoogleProvider}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#1a1a3e] to-[#242445] hover:from-[#242445] hover:to-[#2d2d5a] text-white font-semibold rounded-xl border border-white/10 hover:border-[#e3f98a]/30 transition-all duration-300 btn-satisfying disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continue with Email</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                </>
              )}
            </button>
          </motion.form>

          {/* Info */}
          <p className="text-center text-xs text-[#676986] mt-6">
            Use your <span className="text-[#e3f98a]">@drinkbrez.com</span> email
          </p>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-6"
        >
          <p className="text-xs text-[#676986]/60">
            Protected by BREZ Supermind &middot; v1.0
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
