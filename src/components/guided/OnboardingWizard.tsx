"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to Your Secret Weapon",
    subtitle: "The future of growth planning",
    icon: "🚀",
    content: "You've just unlocked BREZ's most powerful tool for strategic growth. This isn't just a spreadsheet—it's your AI-powered command center for making smarter decisions, faster.",
    features: [
      { icon: "🎯", text: "Real-time financial simulations" },
      { icon: "🤖", text: "AI growth strategist at your fingertips" },
      { icon: "📊", text: "Automatic insights & recommendations" },
      { icon: "👥", text: "Team collaboration & task management" },
    ],
  },
  {
    id: "simulation",
    title: "Master Your Simulations",
    subtitle: "Actuals vs. Scenarios",
    icon: "📈",
    content: "Toggle between your real business data (Actuals) and explore what-if scenarios. Watch your 52-week projections update instantly as you adjust inputs.",
    tips: [
      "Actuals tab reflects your current business trajectory",
      "Scenario tab lets you experiment without affecting real data",
      "Compare both to find the path to profitability",
    ],
  },
  {
    id: "insights",
    title: "AI-Powered Insights",
    subtitle: "Your strategic advantage",
    icon: "💡",
    content: "Every time you open the app, you'll see fresh insights about your business. CAC trending down? We'll tell you to scale spend. Cash runway tight? We'll flag it before it's a crisis.",
    examples: [
      { severity: "success", text: "CAC beating target by $12—opportunity to scale" },
      { severity: "warning", text: "Retail velocity down 15%—investigate" },
      { severity: "critical", text: "Cash runway hits floor in Week 8" },
    ],
  },
  {
    id: "assistant",
    title: "Meet Your AI Strategist",
    subtitle: "Ask anything about growth",
    icon: "🤖",
    content: "Click the glowing chat button to talk with your AI growth expert. It knows beverage, DTC, hemp/cannabis, and financial modeling inside-out. Ask it anything.",
    prompts: [
      "What's driving my CAC increase?",
      "How should I allocate marketing spend?",
      "What retail velocity do I need for profitability?",
      "Analyze my subscription churn rate",
    ],
  },
  {
    id: "team",
    title: "Collaborate With Your Team",
    subtitle: "Stay aligned, move fast",
    icon: "👥",
    content: "Leave tasks for teammates, track who's done what, and keep everyone on the same page. When you log in, you'll see any pending tasks waiting for you.",
    comingSoon: true,
    preview: "Team features require Google login—coming in your next update!",
  },
];

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRevealing, setIsRevealing] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    // Initial reveal animation
    const timer = setTimeout(() => setIsRevealing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      // Trigger completion celebration
      setIsCompleting(true);
      setTimeout(() => {
        onComplete();
      }, 2500);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, onComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isRevealing || isCompleting) return;
      if (e.key === "ArrowRight" || e.key === "Enter") {
        handleNext();
      } else if (e.key === "ArrowLeft" && currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
      } else if (e.key === "Escape") {
        onSkip?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, isRevealing, isCompleting, handleNext, onSkip]);

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with aurora effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#0a0a1a]/95 backdrop-blur-xl"
      />

      {/* Secret Weapon Reveal Animation */}
      <AnimatePresence mode="wait">
        {isCompleting ? (
          <motion.div
            key="completing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 text-center"
          >
            {/* Confetti */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: "50vw",
                    y: "50vh",
                    scale: 0,
                    rotate: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100}vh`,
                    scale: [0, 1, 1, 0],
                    rotate: Math.random() * 720 - 360,
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: ["#e3f98a", "#6BCB77", "#65cdd8", "#8533fc", "#ffce33"][i % 5],
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: [0, 1.3, 1], rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="text-8xl mb-6"
            >
              🎉
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-white mb-3"
            >
              You&apos;re Ready!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-[#65cdd8] mb-4"
            >
              Your secret weapon is now activated
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#e3f98a]/20 rounded-full border border-[#e3f98a]/30"
            >
              <span className="text-[#e3f98a]">🔓</span>
              <span className="text-sm font-medium text-[#e3f98a]">Achievement Unlocked: Growth Master</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-sm text-[#676986] mt-8"
            >
              Loading your command center...
            </motion.p>
          </motion.div>
        ) : isRevealing ? (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 1, times: [0, 0.7, 1] }}
              className="text-8xl mb-6"
            >
              🔐
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-bold text-white mb-2"
            >
              Unlocking...
            </motion.h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="h-1 bg-gradient-to-r from-[#e3f98a] via-[#65cdd8] to-[#8533fc] rounded-full max-w-xs mx-auto"
            />
          </motion.div>
        ) : (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="relative z-10 w-full max-w-2xl mx-4"
          >
            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-6">
              {STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    index <= currentStep
                      ? "bg-gradient-to-r from-[#e3f98a] to-[#65cdd8]"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>

            {/* Card */}
            <div className="onboarding-card bg-gradient-to-br from-[#1a1a3e]/90 to-[#242445]/90 rounded-2xl border border-white/10 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8"
                >
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e3f98a]/20 to-[#65cdd8]/20 flex items-center justify-center flex-shrink-0"
                    >
                      <span className="text-3xl">{step.icon}</span>
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {step.title}
                      </h2>
                      <p className="text-[#65cdd8] text-sm font-medium">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-[#a8a8a8] leading-relaxed mb-6">
                    {step.content}
                  </p>

                  {/* Step-specific content */}
                  {step.features && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {step.features.map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.1 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                        >
                          <span className="text-xl">{feature.icon}</span>
                          <span className="text-sm text-white">{feature.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {step.tips && (
                    <div className="space-y-2 mb-6">
                      {step.tips.map((tip, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-5 h-5 rounded-full bg-[#e3f98a]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e3f98a" strokeWidth="3">
                              <path d="M5 12l5 5L20 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-[#a8a8a8]">{tip}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {step.examples && (
                    <div className="space-y-2 mb-6">
                      {step.examples.map((example, i) => {
                        const colors = {
                          success: "border-l-[#6BCB77] bg-[#6BCB77]/5",
                          warning: "border-l-[#ffce33] bg-[#ffce33]/5",
                          critical: "border-l-[#ff6b6b] bg-[#ff6b6b]/5",
                        };
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.1 }}
                            className={`p-3 rounded-lg border-l-[3px] ${colors[example.severity as keyof typeof colors]}`}
                          >
                            <span className="text-sm text-white">{example.text}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {step.prompts && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {step.prompts.map((prompt, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 + i * 0.1 }}
                          className="px-3 py-2 rounded-full bg-[#242445] border border-white/10 text-xs text-[#65cdd8]"
                        >
                          &ldquo;{prompt}&rdquo;
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {step.comingSoon && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-xl bg-[#8533fc]/10 border border-[#8533fc]/20 mb-6"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">✨</span>
                        <span className="text-sm font-semibold text-[#8533fc]">Coming Soon</span>
                      </div>
                      <p className="text-sm text-[#a8a8a8]">{step.preview}</p>
                    </motion.div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <button
                      onClick={handleBack}
                      disabled={currentStep === 0}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentStep === 0
                          ? "text-[#676986] cursor-not-allowed"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      Back
                    </button>

                    <div className="flex items-center gap-3">
                      {onSkip && (
                        <button
                          onClick={onSkip}
                          className="px-4 py-2 rounded-lg text-sm font-medium text-[#676986] hover:text-white transition-colors"
                        >
                          Skip tour
                        </button>
                      )}
                      <button
                        onClick={handleNext}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#e3f98a] to-[#c5e066] text-[#0a0a1a] font-semibold text-sm btn-satisfying hover:shadow-[0_0_30px_rgba(227,249,138,0.4)] transition-all"
                      >
                        {isLastStep ? "Let's Go! 🚀" : "Next"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Step indicator */}
            <p className="text-center text-[#676986] text-sm mt-4">
              Step {currentStep + 1} of {STEPS.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Hook to manage onboarding state
 */
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(true); // Default to true to not show

  useEffect(() => {
    // Check localStorage for onboarding completion
    const completed = localStorage.getItem("brez-onboarding-completed");
    if (!completed) {
      setHasCompleted(false);
      // Small delay before showing to let the app load
      const timer = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem("brez-onboarding-completed", "true");
    setHasCompleted(true);
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem("brez-onboarding-completed", "true");
    setHasCompleted(true);
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem("brez-onboarding-completed");
    setHasCompleted(false);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    hasCompleted,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}
