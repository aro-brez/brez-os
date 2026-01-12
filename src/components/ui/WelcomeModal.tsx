"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  Target,
  CheckSquare,
  TrendingUp,
  Command,
  Zap,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui";

const WELCOME_KEY = "brez-ai-welcome-seen";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "AI-Powered Priorities",
    description: "See your most important tasks automatically ranked",
    color: "#e3f98a",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Team Channels",
    description: "Communicate across departments with threads & reactions",
    color: "#65cdd8",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Goals & Tasks",
    description: "Track objectives and link tasks to outcomes",
    color: "#8533fc",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Growth Simulation",
    description: "Model your 52-week financial trajectory",
    color: "#6BCB77",
  },
];

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen welcome
    const hasSeenWelcome = localStorage.getItem(WELCOME_KEY);
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(WELCOME_KEY, "true");
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(WELCOME_KEY, "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#242445] to-[#1a1a3e] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative px-8 pt-8 pb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e3f98a]/10 via-transparent to-[#65cdd8]/10" />
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e3f98a] to-[#65cdd8] flex items-center justify-center shadow-lg shadow-[#e3f98a]/20">
                <Sparkles className="w-8 h-8 text-[#0D0D2A]" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white text-center">
              Welcome to <span className="text-[#e3f98a]">BRĒZ AI</span>
            </h1>
            <p className="text-[#a8a8a8] text-center mt-2">
              Your team&apos;s command center for growth operations
            </p>
          </div>
        </div>

        {/* Steps */}
        {currentStep === 0 && (
          <div className="px-8 pb-8">
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-xs text-[#676986]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="px-8 pb-8">
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#e3f98a]/10 to-transparent border border-[#e3f98a]/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#e3f98a]/20 flex items-center justify-center flex-shrink-0">
                    <Command className="w-6 h-6 text-[#e3f98a]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Quick Access with ⌘K</h3>
                    <p className="text-sm text-[#a8a8a8]">
                      Press <kbd className="px-2 py-1 rounded bg-white/10 text-[#e3f98a] font-mono text-xs">⌘K</kbd> anytime to search commands, navigate, or create new items.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#8533fc]/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-[#8533fc]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">DEV MODE Active</h3>
                    <p className="text-sm text-[#a8a8a8]">
                      All your data is stored locally in your browser. No accounts or API keys needed to get started!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#65cdd8]/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-[#65cdd8]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Demo Data Included</h3>
                    <p className="text-sm text-[#a8a8a8]">
                      We&apos;ve added sample channels, tasks, and goals so you can explore right away. Reset anytime in Settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-4 bg-[#0D0D2A]/50 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-[#676986] hover:text-white transition-colors"
          >
            Skip intro
          </button>

          <div className="flex items-center gap-4">
            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {[0, 1].map((step) => (
                <div
                  key={step}
                  className={clsx(
                    "w-2 h-2 rounded-full transition-all",
                    step === currentStep ? "bg-[#e3f98a] w-6" : "bg-white/20"
                  )}
                />
              ))}
            </div>

            {currentStep === 0 ? (
              <Button onClick={() => setCurrentStep(1)}>
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                Get Started
                <Sparkles className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Function to reset welcome for testing
export function resetWelcome() {
  localStorage.removeItem(WELCOME_KEY);
}
