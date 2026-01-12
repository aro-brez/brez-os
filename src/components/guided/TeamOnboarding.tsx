"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  OnboardingQuestion,
  Department,
  DEPARTMENT_NAMES,
  DEPARTMENT_COLORS,
} from "@/lib/onboarding/types";
import {
  ONBOARDING_QUESTIONS,
  DEPARTMENT_QUESTIONS,
  processOnboardingAnswers,
} from "@/lib/onboarding/questions";

interface TeamOnboardingProps {
  userName?: string;
  onComplete: (answers: Record<string, string | string[]>) => void;
  onSkip?: () => void;
}

export function TeamOnboarding({
  userName = "there",
  onComplete,
  onSkip,
}: TeamOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Get questions based on selected department
  const getQuestions = (): OnboardingQuestion[] => {
    const baseQuestions = ONBOARDING_QUESTIONS;
    if (selectedDepartment && DEPARTMENT_QUESTIONS[selectedDepartment]) {
      return [...baseQuestions, ...DEPARTMENT_QUESTIONS[selectedDepartment]!];
    }
    return baseQuestions;
  };

  const questions = getQuestions();
  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const progress = ((currentStep + 1) / questions.length) * 100;

  // Update department when answered
  useEffect(() => {
    if (answers.department && answers.department !== selectedDepartment) {
      setSelectedDepartment(answers.department as Department);
    }
  }, [answers.department, selectedDepartment]);

  const handleAnswer = (value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setIsComplete(true);
      setTimeout(() => {
        onComplete(answers);
      }, 3000);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canProceed = () => {
    const answer = answers[currentQuestion?.id];
    if (!currentQuestion?.required) return true;
    if (Array.isArray(answer)) return answer.length > 0;
    return !!answer;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canProceed()) {
        handleNext();
      } else if (e.key === "Escape" && onSkip) {
        onSkip();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, answers]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-[#0a0a1a]/95 backdrop-blur-xl"
      />

      <AnimatePresence mode="wait">
        {isComplete ? (
          <CompletionScreen userName={userName} department={selectedDepartment} />
        ) : (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="relative z-10 w-full max-w-2xl mx-4"
          >
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#676986]">Setting up your experience</span>
                <span className="text-sm text-[#676986]">
                  {currentStep + 1} of {questions.length}
                </span>
              </div>
              <div className="h-2 bg-[#1a1a3e] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-[#e3f98a] to-[#65cdd8] rounded-full"
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Card */}
            <div className="bg-gradient-to-br from-[#1a1a3e]/90 to-[#242445]/90 rounded-2xl border border-white/10 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion?.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8"
                >
                  {/* Welcome header on first question */}
                  {currentStep === 0 && (
                    <div className="mb-8 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-5xl mb-4"
                      >
                        👋
                      </motion.div>
                      <h1 className="text-2xl font-bold text-white mb-2">
                        Welcome to the Supermind, {userName}!
                      </h1>
                      <p className="text-[#a8a8a8]">
                        Let&apos;s personalize your experience in just a few questions.
                      </p>
                    </div>
                  )}

                  {/* Question */}
                  <QuestionRenderer
                    question={currentQuestion}
                    value={answers[currentQuestion?.id]}
                    onChange={handleAnswer}
                  />

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/5">
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
                          Skip for now
                        </button>
                      )}
                      <button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                          canProceed()
                            ? "bg-gradient-to-r from-[#e3f98a] to-[#c5e066] text-[#0a0a1a] btn-satisfying hover:shadow-[0_0_30px_rgba(227,249,138,0.4)]"
                            : "bg-[#1a1a3e] text-[#676986] cursor-not-allowed"
                        }`}
                      >
                        {isLastQuestion ? "Complete Setup ✨" : "Continue"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Question Renderer Component
function QuestionRenderer({
  question,
  value,
  onChange,
}: {
  question: OnboardingQuestion;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}) {
  if (!question) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">{question.question}</h2>

      {question.type === "single" && question.options && (
        <div className="grid gap-3">
          {question.options.map((option, i) => {
            const isSelected = value === option.value;
            const color =
              question.id === "department"
                ? DEPARTMENT_COLORS[option.value as Department]
                : "#e3f98a";

            return (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onChange(option.value)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-[#e3f98a]/50 bg-[#e3f98a]/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
                style={{
                  borderColor: isSelected ? color : undefined,
                  backgroundColor: isSelected ? `${color}15` : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? "border-[#e3f98a]" : "border-white/30"
                    }`}
                    style={{ borderColor: isSelected ? color : undefined }}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 rounded-full bg-[#e3f98a]"
                        style={{ backgroundColor: color }}
                      />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-[#a8a8a8]">{option.description}</div>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {question.type === "multiple" && question.options && (
        <div className="space-y-2">
          <p className="text-sm text-[#676986]">Select all that apply</p>
          <div className="grid gap-2">
            {question.options.map((option, i) => {
              const selectedValues = Array.isArray(value) ? value : [];
              const isSelected = selectedValues.includes(option.value);

              return (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => {
                    if (isSelected) {
                      onChange(selectedValues.filter((v) => v !== option.value));
                    } else {
                      onChange([...selectedValues, option.value]);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-[#e3f98a]/50 bg-[#e3f98a]/10"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-[#e3f98a] border-[#e3f98a]"
                          : "border-2 border-white/30"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#0a0a1a"
                          strokeWidth="3"
                        >
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-[#a8a8a8]">{option.description}</div>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {question.type === "text" && (
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="w-full p-4 rounded-xl bg-[#1a1a3e] border-2 border-white/10 text-white placeholder-[#676986] focus:border-[#e3f98a] focus:outline-none transition-all"
        />
      )}

      {question.type === "scale" && (
        <div className="flex items-center gap-2 justify-center">
          {Array.from(
            { length: (question.maxScale || 10) - (question.minScale || 1) + 1 },
            (_, i) => i + (question.minScale || 1)
          ).map((num) => (
            <button
              key={num}
              onClick={() => onChange(String(num))}
              className={`w-10 h-10 rounded-lg font-medium transition-all ${
                value === String(num)
                  ? "bg-[#e3f98a] text-[#0a0a1a]"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Completion Screen Component
function CompletionScreen({
  userName,
  department,
}: {
  userName: string;
  department: Department | null;
}) {
  return (
    <motion.div
      key="complete"
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
              backgroundColor: ["#e3f98a", "#6BCB77", "#65cdd8", "#8533fc", "#ffce33"][
                i % 5
              ],
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
        🚀
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-4xl font-bold text-white mb-3"
      >
        You&apos;re all set, {userName}!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-lg text-[#65cdd8] mb-4"
      >
        Your personalized Supermind is ready
      </motion.p>

      {department && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
          style={{
            backgroundColor: `${DEPARTMENT_COLORS[department]}20`,
            borderColor: `${DEPARTMENT_COLORS[department]}40`,
          }}
        >
          <span className="text-sm font-medium" style={{ color: DEPARTMENT_COLORS[department] }}>
            {DEPARTMENT_NAMES[department]} Dashboard Loading...
          </span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 flex justify-center gap-4"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#e3f98a]/20 rounded-full border border-[#e3f98a]/30">
          <span className="text-[#e3f98a]">🔓</span>
          <span className="text-xs font-medium text-[#e3f98a]">+25 XP</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#8533fc]/20 rounded-full border border-[#8533fc]/30">
          <span className="text-[#8533fc]">🎭</span>
          <span className="text-xs font-medium text-[#8533fc]">Identity Established</span>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="text-sm text-[#676986] mt-8"
      >
        Generating your personalized quests...
      </motion.p>
    </motion.div>
  );
}

// Hook for managing team onboarding state
export function useTeamOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    // Check localStorage for profile completion
    const savedProfile = localStorage.getItem("brez-user-profile");
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    } else {
      // Show onboarding after a brief delay
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = (answers: Record<string, string | string[]>) => {
    const profile = processOnboardingAnswers(answers);
    const fullProfile = {
      ...profile,
      xp: 25, // Starting XP bonus
      level: 1,
      achievements: ["profile_complete"],
      questsCompleted: 1,
      currentStreak: 1,
      longestStreak: 1,
      dataContributions: 0,
      totalSessions: 1,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("brez-user-profile", JSON.stringify(fullProfile));
    setUserProfile(fullProfile);
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    // Save minimal profile
    const minimalProfile = {
      onboardingCompleted: false,
      department: "executive",
      xp: 0,
      level: 1,
      achievements: [],
      questsCompleted: 0,
      currentStreak: 0,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("brez-user-profile", JSON.stringify(minimalProfile));
    setUserProfile(minimalProfile);
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem("brez-user-profile");
    setUserProfile(null);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    userProfile,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}
