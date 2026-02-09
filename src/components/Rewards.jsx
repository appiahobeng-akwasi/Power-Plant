import React from "react";
import { motion } from "motion/react";
import { X, Flame, Trophy, LogOut } from "lucide-react";
import {
  deriveXp,
  getLevel,
  getLevelProgress,
  deriveAchievements,
  derivePersonalRecords,
} from "../data/shared";
import { useAuth } from "../contexts/AuthContext";

function GoalRing({ current, target }) {
  const progress = Math.min(1, current / target);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#2C5530"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[18px] font-[700] text-forest">{current}</span>
        <span className="text-[9px] text-gray-400 uppercase tracking-wider">
          / {target}
        </span>
      </div>
    </div>
  );
}

function Badge({ achievement }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center"
    >
      <div className="relative mb-1.5">
        <span className="text-[28px]">{achievement.icon}</span>
        {achievement.earned && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-[8px] text-white">✓</span>
          </div>
        )}
      </div>
      <span
        className={`text-[10px] font-[600] ${
          achievement.earned ? "text-forest" : "text-gray-400"
        }`}
      >
        {achievement.name}
      </span>
      {!achievement.earned && (
        <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
          <div
            className="h-full bg-sage rounded-full"
            style={{
              width: `${Math.min(100, (achievement.current / achievement.target) * 100)}%`,
            }}
          />
        </div>
      )}
    </motion.div>
  );
}

export default function Rewards({ slots, stats, onClose }) {
  const { profile, signOut } = useAuth();
  const xp = deriveXp(slots, stats);
  const level = getLevel(xp);
  const progress = getLevelProgress(xp);
  const achievements = deriveAchievements(slots, stats);
  const records = derivePersonalRecords(slots, stats);
  const earned = achievements.filter((a) => a.earned).length;

  const categories = ["harvest", "care", "science", "streak"];
  const categoryLabels = {
    harvest: "🌾 Harvest",
    care: "💧 Care",
    science: "🔬 Science",
    streak: "🔥 Streak",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 sticky top-0 bg-background z-10">
        <h1 className="text-[18px] font-[700] text-forest">Your Progress</h1>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="max-w-[430px] mx-auto px-5 pb-10">
        {/* Profile Card */}
        <div
          className="rounded-[20px] p-5 text-white mb-4"
          style={{
            background: "linear-gradient(135deg, #2C5530, #3E7042)",
            boxShadow: "0 8px 15px rgba(44,85,48,0.3)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center">
              <span className="text-[20px]">{profile?.avatar || "🌱"}</span>
            </div>
            <div>
              <h2 className="text-[16px] font-[600]">{profile?.display_name || "Grower"}</h2>
              <p className="text-[12px] text-white/70">
                {level.icon} Level {level.level} · {level.name}
              </p>
              {profile?.tower_name && (
                <p className="text-[11px] text-white/50">
                  🗼 {profile.tower_name}
                </p>
              )}
            </div>
          </div>
          <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/80 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-[11px] text-white/50 mt-1.5">
            {xp} / {level.maxXp} XP
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div
            className="bg-white rounded-[16px] p-3 text-center"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <Flame size={18} className="mx-auto text-orange-500 mb-1" />
            <p className="text-[18px] font-[700] text-forest">{stats.streak}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wider">
              Day Streak
            </p>
          </div>
          <div
            className="bg-white rounded-[16px] p-3 text-center"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <Trophy size={18} className="mx-auto text-amber-500 mb-1" />
            <p className="text-[18px] font-[700] text-forest">{earned}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wider">
              Badges
            </p>
          </div>
          <div
            className="bg-white rounded-[16px] p-3 text-center"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <span className="text-[18px] block mb-1">⚡</span>
            <p className="text-[18px] font-[700] text-forest">{xp}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wider">
              Total XP
            </p>
          </div>
        </div>

        {/* Weekly Goal */}
        <div
          className="bg-white rounded-[20px] p-5 mb-5 flex items-center gap-5"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <GoalRing current={stats.weeklyActivities} target={7} />
          <div>
            <h3 className="text-[14px] font-[600] text-forest mb-1">
              Weekly Goal
            </h3>
            <p className="text-[12px] text-gray-500 leading-relaxed">
              {stats.weeklyActivities >= 7
                ? "🎉 Goal reached! Amazing work this week!"
                : "Complete 7 care activities this week."}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
              {stats.weeklyActivities}/7 THIS WEEK
            </p>
          </div>
        </div>

        {/* Achievements */}
        <h3 className="text-[12px] font-[700] text-gray-400 uppercase tracking-[1.2px] mb-3">
          Achievements
        </h3>
        {categories.map((cat) => (
          <div key={cat} className="mb-4">
            <p className="text-[11px] font-[600] text-gray-500 mb-2">
              {categoryLabels[cat]}
            </p>
            <div className="grid grid-cols-3 gap-4">
              {achievements
                .filter((a) => a.category === cat)
                .map((a, i) => (
                  <Badge key={a.id} achievement={a} />
                ))}
            </div>
          </div>
        ))}

        {/* Personal Records */}
        <h3 className="text-[12px] font-[700] text-gray-400 uppercase tracking-[1.2px] mb-3 mt-6">
          Personal Records
        </h3>
        <div className="space-y-2">
          {records.map((r) => (
            <div
              key={r.label}
              className="bg-white rounded-[12px] p-3 flex items-center gap-3"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
            >
              <span className="text-[20px]">{r.icon}</span>
              <div className="flex-1">
                <p className="text-[12px] text-gray-500">{r.label}</p>
              </div>
              <p className="text-[14px] font-[700] text-forest">{r.value}</p>
            </div>
          ))}
        </div>

        {/* Sign Out */}
        <button
          onClick={async () => {
            try {
              onClose();
              await signOut();
            } catch (err) {
              console.error("Sign out error:", err);
              // Force clear state even if Supabase call fails
              window.location.reload();
            }
          }}
          className="w-full mt-8 py-3 rounded-full border border-gray-200 text-gray-400 text-[13px] font-[500] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform hover:border-gray-300 hover:text-gray-500"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </motion.div>
  );
}
