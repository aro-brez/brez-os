"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Quest,
  QuestCategory,
  QuestPriority,
  Achievement,
  calculateLevel,
  xpToNextLevel,
} from "@/lib/onboarding/types";
import { generateQuestsForUser, ACHIEVEMENTS } from "@/lib/onboarding/quests";

interface QuestPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: Record<string, unknown> | null;
  onQuestComplete?: (quest: Quest, xpEarned: number) => void;
}

const CATEGORY_ICONS: Record<QuestCategory, string> = {
  data_upload: "📤",
  integration_connect: "🔌",
  profile_complete: "👤",
  insight_action: "💡",
  team_collaboration: "👥",
  learning: "📚",
  contribution: "🎁",
};

const PRIORITY_COLORS: Record<QuestPriority, string> = {
  critical: "#ff6b6b",
  high: "#ffce33",
  medium: "#65cdd8",
  low: "#676986",
};

export function QuestPanel({
  isOpen,
  onClose,
  userProfile,
  onQuestComplete,
}: QuestPanelProps) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);

  // Generate quests based on user profile
  useEffect(() => {
    if (userProfile) {
      const completedQuestIds = (userProfile.completedQuests as string[]) || [];
      const connectedIntegrations = (userProfile.connectedIntegrations as string[]) || [];
      const generatedQuests = generateQuestsForUser(
        userProfile as Partial<import('@/lib/onboarding/types').UserProfile>,
        completedQuestIds,
        connectedIntegrations
      );
      setQuests(generatedQuests);
    }
  }, [userProfile]);

  const xp = (userProfile?.xp as number) || 0;
  const level = calculateLevel(xp);
  const levelProgress = xpToNextLevel(xp);
  const questsCompleted = (userProfile?.questsCompleted as number) || 0;
  const currentStreak = (userProfile?.currentStreak as number) || 0;
  const achievements = (userProfile?.achievements as string[]) || [];

  const handleStartQuest = (quest: Quest) => {
    setActiveQuest(quest);
  };

  const handleCompleteQuest = (quest: Quest) => {
    // In a real app, this would validate completion and update the database
    const newXp = xp + quest.xpReward;
    onQuestComplete?.(quest, quest.xpReward);

    // Check for achievement unlock
    if (quest.achievementUnlock) {
      const achievement = ACHIEVEMENTS.find((a) => a.id === quest.achievementUnlock);
      if (achievement && !achievements.includes(achievement.id)) {
        setTimeout(() => setShowAchievement(achievement), 500);
      }
    }

    // Remove from available quests
    setQuests((prev) => prev.filter((q) => q.id !== quest.id));
    setActiveQuest(null);
  };

  // Group quests by priority
  const criticalQuests = quests.filter((q) => q.priority === "critical");
  const otherQuests = quests.filter((q) => q.priority !== "critical");

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-gradient-to-b from-[#1a1a3e] to-[#0D0D2A] border-l border-white/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">🎯</span> Your Quests
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-white/60"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <div className="text-2xl font-bold text-[#e3f98a]">{level}</div>
                  <div className="text-xs text-[#676986]">Level</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <div className="text-2xl font-bold text-[#65cdd8]">{questsCompleted}</div>
                  <div className="text-xs text-[#676986]">Completed</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-center">
                  <div className="text-2xl font-bold text-[#ffce33]">{currentStreak}</div>
                  <div className="text-xs text-[#676986]">Day Streak</div>
                </div>
              </div>

              {/* XP Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#676986]">XP Progress</span>
                  <span className="text-[#e3f98a]">
                    {levelProgress.current} / {levelProgress.needed}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress.progress}%` }}
                    className="h-full bg-gradient-to-r from-[#e3f98a] to-[#65cdd8] rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Quest list */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Critical quests */}
              {criticalQuests.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#ff6b6b] animate-pulse" />
                    <span className="text-sm font-medium text-[#ff6b6b]">
                      Priority Quests
                    </span>
                  </div>
                  <div className="space-y-3">
                    {criticalQuests.map((quest) => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        onStart={() => handleStartQuest(quest)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Other quests */}
              {otherQuests.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-[#a8a8a8]">
                      Available Quests
                    </span>
                    <span className="text-xs text-[#676986]">
                      ({otherQuests.length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {otherQuests.map((quest) => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        onStart={() => handleStartQuest(quest)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {quests.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    All caught up!
                  </h3>
                  <p className="text-sm text-[#676986]">
                    Check back later for new quests
                  </p>
                </div>
              )}
            </div>

            {/* Achievements section */}
            <div className="p-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">Achievements</span>
                <span className="text-xs text-[#676986]">
                  {achievements.length} / {ACHIEVEMENTS.length}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {ACHIEVEMENTS.slice(0, 8).map((achievement) => {
                  const unlocked = achievements.includes(achievement.id);
                  return (
                    <div
                      key={achievement.id}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                        unlocked
                          ? "bg-[#e3f98a]/20 border border-[#e3f98a]/30"
                          : "bg-white/5 grayscale opacity-30"
                      }`}
                      title={unlocked ? achievement.name : "???"}
                    >
                      {achievement.icon}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active quest modal */}
      <AnimatePresence>
        {activeQuest && (
          <QuestModal
            quest={activeQuest}
            onClose={() => setActiveQuest(null)}
            onComplete={() => handleCompleteQuest(activeQuest)}
          />
        )}
      </AnimatePresence>

      {/* Achievement unlock celebration */}
      <AnimatePresence>
        {showAchievement && (
          <AchievementCelebration
            achievement={showAchievement}
            onClose={() => setShowAchievement(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Quest Card Component
function QuestCard({
  quest,
  onStart,
}: {
  quest: Quest;
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#e3f98a]/30 transition-all cursor-pointer group"
      onClick={onStart}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
          {CATEGORY_ICONS[quest.category]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-white text-sm truncate">{quest.title}</h3>
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: PRIORITY_COLORS[quest.priority] }}
            />
          </div>
          <p className="text-xs text-[#a8a8a8] line-clamp-2">{quest.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-[#e3f98a] font-medium">
              +{quest.xpReward} XP
            </span>
            {quest.achievementUnlock && (
              <span className="text-xs text-[#8533fc]">🏆 Achievement</span>
            )}
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-[#676986] group-hover:text-[#e3f98a] transition-colors flex-shrink-0"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </motion.div>
  );
}

// Quest Modal Component
function QuestModal({
  quest,
  onClose,
  onComplete,
}: {
  quest: Quest;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = () => {
    setIsCompleting(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-gradient-to-br from-[#1a1a3e] to-[#242445] rounded-2xl border border-white/10 p-6 max-w-md w-full"
      >
        {isCompleting ? (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              className="text-6xl mb-4"
            >
              ✅
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">Quest Complete!</h3>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[#e3f98a] font-bold">+{quest.xpReward} XP</span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-[#e3f98a]/20 flex items-center justify-center text-3xl flex-shrink-0">
                {CATEGORY_ICONS[quest.category]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{quest.title}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${PRIORITY_COLORS[quest.priority]}20`,
                      color: PRIORITY_COLORS[quest.priority],
                    }}
                  >
                    {quest.priority}
                  </span>
                  <span className="text-xs text-[#e3f98a]">+{quest.xpReward} XP</span>
                </div>
              </div>
            </div>

            <p className="text-[#a8a8a8] mb-6">{quest.description}</p>

            {quest.impactDescription && (
              <div className="p-3 rounded-lg bg-[#e3f98a]/10 border border-[#e3f98a]/20 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#e3f98a]">💡</span>
                  <span className="text-[#e3f98a]">Impact:</span>
                  <span className="text-white">{quest.impactDescription}</span>
                </div>
              </div>
            )}

            {/* Action area based on quest type */}
            <div className="space-y-4">
              {quest.actionType === "connect" && (
                <button
                  onClick={handleComplete}
                  className="w-full py-3 rounded-xl bg-[#e3f98a] text-[#0a0a1a] font-semibold btn-satisfying"
                >
                  Connect {(quest.actionConfig.integration as string)?.replace("_", " ")}
                </button>
              )}

              {quest.actionType === "upload" && (
                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-2">📁</div>
                  <p className="text-sm text-[#a8a8a8] mb-3">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-xs text-[#676986]">
                    Accepts: {(quest.actionConfig.fileTypes as string[])?.join(", ")}
                  </p>
                  <button
                    onClick={handleComplete}
                    className="mt-4 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                  >
                    Select File
                  </button>
                </div>
              )}

              {(quest.actionType === "learn" || quest.actionType === "review") && (
                <button
                  onClick={handleComplete}
                  className="w-full py-3 rounded-xl bg-[#e3f98a] text-[#0a0a1a] font-semibold btn-satisfying"
                >
                  Mark as Complete
                </button>
              )}

              {quest.actionType === "answer" && (
                <button
                  onClick={handleComplete}
                  className="w-full py-3 rounded-xl bg-[#e3f98a] text-[#0a0a1a] font-semibold btn-satisfying"
                >
                  Start Answering
                </button>
              )}

              {quest.actionType === "action" && (
                <button
                  onClick={handleComplete}
                  className="w-full py-3 rounded-xl bg-[#e3f98a] text-[#0a0a1a] font-semibold btn-satisfying"
                >
                  Take Action
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-3 py-2 rounded-lg text-[#676986] hover:text-white transition-colors text-sm"
            >
              Do this later
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// Achievement Celebration Component
function AchievementCelebration({
  achievement,
  onClose,
}: {
  achievement: Achievement;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const rarityColors = {
    common: "#65cdd8",
    rare: "#8533fc",
    epic: "#EC4899",
    legendary: "#ffce33",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80" />

      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: "50vw", y: "50vh", scale: 0 }}
            animate={{
              x: `${Math.random() * 100}vw`,
              y: `${Math.random() * 100}vh`,
              scale: [0, 1, 0],
              rotate: Math.random() * 720,
            }}
            transition={{ duration: 2, delay: Math.random() * 0.5 }}
            className="absolute w-2 h-2 rounded-full"
            style={{ backgroundColor: rarityColors[achievement.rarity] }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className="relative text-center"
      >
        <motion.div
          animate={{
            boxShadow: [
              `0 0 20px ${rarityColors[achievement.rarity]}40`,
              `0 0 60px ${rarityColors[achievement.rarity]}60`,
              `0 0 20px ${rarityColors[achievement.rarity]}40`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-5xl mb-6"
          style={{ backgroundColor: `${rarityColors[achievement.rarity]}20` }}
        >
          {achievement.icon}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p
            className="text-sm font-medium uppercase tracking-wider mb-2"
            style={{ color: rarityColors[achievement.rarity] }}
          >
            {achievement.rarity} Achievement Unlocked
          </p>
          <h2 className="text-2xl font-bold text-white mb-2">{achievement.name}</h2>
          <p className="text-[#a8a8a8] mb-4">{achievement.description}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#e3f98a]/20 rounded-full">
            <span className="text-[#e3f98a] text-sm font-medium">
              +{achievement.xpBonus} Bonus XP
            </span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Export the hook for the quest button
export function useQuestPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
