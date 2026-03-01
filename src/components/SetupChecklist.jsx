import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronRight } from "lucide-react";

const STEPS = [
  {
    id: "towerNamed",
    label: "Name your tower",
    desc: "Tower identity confirmed",
    icon: "🏗️",
    xp: 25,
    auto: true,
  },
  {
    id: "waterLogged",
    label: "Log baseline water",
    desc: "Check pH, EC & temp before planting",
    icon: "💧",
    xp: 50,
    tab: "lab",
    ctaLabel: "Go to Lab",
  },
  {
    id: "plantAdded",
    label: "Plant your first crop",
    desc: "Assign a crop to a tower slot",
    icon: "🌱",
    xp: 75,
    tab: "tower",
    ctaLabel: "Go to Tower",
  },
  {
    id: "plantScanned",
    label: "Scan a plant",
    desc: "Get an AI health baseline",
    icon: "📱",
    xp: 100,
    tab: "ai",
    ctaLabel: "Open Dr. AI",
  },
];

const BONUS_XP = 150;

export default function SetupChecklist({ progress, onNavigate, onXpEarned }) {
  const [xpBadges, setXpBadges] = useState([]);   // floating "+XP" pops
  const [justDone, setJustDone]   = useState(null); // step id that just completed
  const [hidden, setHidden]       = useState(false); // after all complete
  const prevProgress              = useRef(null);

  // Detect newly completed steps
  useEffect(() => {
    if (!progress) return;

    // First render — initialise reference without animating
    if (!prevProgress.current) {
      prevProgress.current = progress;
      return;
    }

    let newlyCompleted = null;
    for (const step of STEPS) {
      if (!prevProgress.current[step.id] && progress[step.id]) {
        newlyCompleted = step;
        break;
      }
    }

    if (newlyCompleted) {
      setJustDone(newlyCompleted.id);
      setTimeout(() => setJustDone(null), 900);

      // Floating XP badge
      const key = `${newlyCompleted.id}-${Date.now()}`;
      setXpBadges((prev) => [...prev, { id: newlyCompleted.id, xp: newlyCompleted.xp, key }]);
      setTimeout(() => setXpBadges((prev) => prev.filter((b) => b.key !== key)), 1600);

      // Check if this was the last step
      const allDone = STEPS.every((s) => progress[s.id]);
      if (allDone) {
        setTimeout(() => {
          onXpEarned?.(BONUS_XP); // award bonus XP
          setTimeout(() => setHidden(true), 1800); // let user see all ticks then hide
        }, 500);
      }
    }

    prevProgress.current = progress;
  }, [progress, onXpEarned]);

  if (!progress || hidden) return null;

  const completedCount = STEPS.filter((s) => progress[s.id]).length;
  const progressPct    = (completedCount / STEPS.length) * 100;
  const allDone        = completedCount === STEPS.length;

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="mx-4 mb-4 rounded-[20px] bg-white overflow-hidden relative"
          style={{
            boxShadow: allDone
              ? "0 4px 24px rgba(74,222,128,0.25)"
              : "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* Pulsing border ring while incomplete */}
          {!allDone && (
            <motion.div
              className="absolute inset-0 rounded-[20px] pointer-events-none"
              animate={{
                boxShadow: [
                  "0 0 0 1.5px rgba(74,222,128,0.25)",
                  "0 0 0 3px rgba(74,222,128,0.55)",
                  "0 0 0 1.5px rgba(74,222,128,0.25)",
                ],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Header */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[15px] font-[700] text-gray-900 leading-tight">
                  Set up your tower
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Complete each step to earn XP
                </p>
              </div>

              {/* Animated step counter pill */}
              <div className="flex items-center gap-0.5 bg-forest/10 rounded-full px-3 py-1.5">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={completedCount}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0,   opacity: 1 }}
                    exit={{    y:  10, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="text-[14px] font-[800] text-forest leading-none tabular-nums"
                  >
                    {completedCount}
                  </motion.span>
                </AnimatePresence>
                <span className="text-[13px] font-[600] text-forest/50 leading-none">
                  /{STEPS.length}
                </span>
              </div>
            </div>

            {/* Animated progress bar */}
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #4ADE80 0%, #22C55E 100%)",
                  boxShadow: "0 0 8px rgba(74,222,128,0.6)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ type: "spring", stiffness: 55, damping: 14 }}
              />
            </div>

            {/* XP total hint */}
            <p className="text-[10px] text-gray-400 mt-1.5 text-right">
              {progressPct < 100
                ? `${400 - STEPS.filter((s) => progress[s.id]).reduce((a, s) => a + s.xp, 0) + (allDone ? 0 : BONUS_XP)} XP remaining`
                : "🏆 +150 bonus XP earned!"}
            </p>
          </div>

          {/* Steps */}
          <div className="px-4 pb-4 space-y-2">
            {STEPS.map((step) => {
              const done      = !!progress[step.id];
              const isJustDone = justDone === step.id;
              const badge     = xpBadges.find((b) => b.id === step.id);

              return (
                <div key={step.id} className="relative">
                  <motion.div
                    animate={isJustDone ? { x: [0, 4, -4, 2, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className={`flex items-center gap-3 p-3 rounded-[14px] transition-colors duration-300 ${
                      done ? "bg-forest/5" : "bg-gray-50"
                    }`}
                  >
                    {/* Check circle */}
                    <motion.div
                      animate={
                        isJustDone
                          ? { scale: [1, 1.35, 0.9, 1.1, 1] }
                          : { scale: 1 }
                      }
                      transition={{ duration: 0.55, type: "spring" }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        done
                          ? "bg-forest shadow-sm"
                          : "bg-white border-2 border-gray-200"
                      }`}
                    >
                      {done ? (
                        <Check size={13} color="white" strokeWidth={3} />
                      ) : (
                        <span className="text-[15px] leading-none">{step.icon}</span>
                      )}
                    </motion.div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[13px] font-[600] leading-tight ${
                          done ? "text-forest" : "text-gray-800"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
                        {step.desc}
                      </p>
                    </div>

                    {/* Right side: earned XP badge or CTA button */}
                    {done ? (
                      <motion.span
                        initial={isJustDone ? { scale: 0, opacity: 0 } : false}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="text-[11px] font-[700] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0"
                      >
                        +{step.xp} XP
                      </motion.span>
                    ) : !step.auto && step.tab ? (
                      <button
                        onClick={() => onNavigate(step.tab)}
                        className="flex items-center gap-0.5 text-[11px] font-[700] text-forest bg-forest/10 px-2.5 py-1.5 rounded-full flex-shrink-0 active:scale-90 transition-transform"
                      >
                        {step.ctaLabel}
                        <ChevronRight size={11} strokeWidth={2.5} />
                      </button>
                    ) : null}
                  </motion.div>

                  {/* Floating +XP pop */}
                  <AnimatePresence>
                    {badge && (
                      <motion.div
                        key={badge.key}
                        initial={{ y: 0, opacity: 1, scale: 0.7 }}
                        animate={{ y: -44, opacity: 0, scale: 1.15 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.3, ease: "easeOut" }}
                        className="absolute right-4 top-2 pointer-events-none z-20"
                      >
                        <span className="text-[13px] font-[800] text-amber-600 bg-white shadow-lg border border-amber-200 px-2.5 py-1 rounded-full">
                          +{badge.xp} XP ✨
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Completion banner */}
          <AnimatePresence>
            {allDone && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-forest px-4 py-3 flex items-center justify-center gap-2"
              >
                <span className="text-[13px] font-[700] text-white">
                  🏆 Tower ready! +{BONUS_XP} bonus XP earned
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
