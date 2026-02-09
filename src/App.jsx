import React, { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster } from "sonner";
import { Leaf } from "lucide-react";

import { useAuth } from "./contexts/AuthContext";
import AuthShell from "./components/auth/AuthShell";
import WelcomeScreen from "./components/auth/WelcomeScreen";
import SignUpScreen from "./components/auth/SignUpScreen";
import LoginScreen from "./components/auth/LoginScreen";
import PersonalizeScreen from "./components/auth/PersonalizeScreen";

import TopBar from "./components/TopBar";
import BottomNav from "./components/BottomNav";
import Dashboard from "./components/Dashboard";
import WaterLab from "./components/WaterLab";
import TowerControl from "./components/TowerControl";
import DrAI from "./components/DrAI";
import Rewards from "./components/Rewards";
import RecipeView from "./components/RecipeView";

import {
  generateInitialSlots,
  generateInitialLabData,
  generateInitialRewardStats,
} from "./data/shared";

// ── Initial State ─────────────────────────────────────────────────
const initialSlots = generateInitialSlots(40);
const initialLabData = generateInitialLabData();
const initialRewardStats = generateInitialRewardStats();

export default function App() {
  const { user, profile, loading, needsOnboarding } = useAuth();

  // ── Auth Screen State ───────────────────────────────────────────
  const [authScreen, setAuthScreen] = useState("welcome");

  // ── State ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("home");
  const [slots, setSlots] = useState(initialSlots);
  const [plantCapacity, setPlantCapacity] = useState(24);
  const [labData, setLabData] = useState(initialLabData);
  const [rewardStats, setRewardStats] = useState(initialRewardStats);
  const [showRewards, setShowRewards] = useState(false);
  const [recipeCrop, setRecipeCrop] = useState(null);
  const [towerImmersive, setTowerImmersive] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────

  const assignCrop = useCallback((index, crop) => {
    setSlots((prev) =>
      prev.map((slot, i) => {
        if (i !== index) return slot;
        if (crop === null) {
          return { ...slot, crop: null, plantedDate: null, health: 0, scanHistory: [] };
        }
        return {
          ...slot,
          crop,
          plantedDate: new Date().toISOString().split("T")[0],
          health: 95,
          scanHistory: [],
        };
      })
    );
  }, []);

  const updateSlot = useCallback((index, partial) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, ...partial } : slot))
    );
  }, []);

  const logLabData = useCallback((ph, ec, temp) => {
    const date = new Date().toISOString().split("T")[0];
    setLabData((prev) => ({
      ph: [...prev.ph, { date, value: ph }],
      ec: [...prev.ec, { date, value: ec }],
      temp: [...prev.temp, { date, value: temp }],
    }));
    setRewardStats((prev) => ({
      ...prev,
      labLogs: prev.labLogs + 1,
      weeklyActivities: prev.weeklyActivities + 1,
    }));
  }, []);

  const handleActivity = useCallback((type) => {
    setRewardStats((prev) => ({
      ...prev,
      waterLogs: type === "water" ? prev.waterLogs + 1 : prev.waterLogs,
      nutrientLogs: type === "nutrient" ? prev.nutrientLogs + 1 : prev.nutrientLogs,
      weeklyActivities: prev.weeklyActivities + 1,
    }));
  }, []);

  // ── Render ────────────────────────────────────────────────────

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <Dashboard
            slots={slots}
            stats={rewardStats}
            onAssignCrop={assignCrop}
            onActivity={handleActivity}
            onOpenRewards={() => setShowRewards(true)}
            onOpenRecipes={(crop) => setRecipeCrop(crop)}
          />
        );
      case "lab":
        return <WaterLab labData={labData} onLogData={logLabData} />;
      case "tower":
        return (
          <TowerControl
            slots={slots}
            onUpdateSlot={updateSlot}
            onAssignCrop={assignCrop}
            plantCapacity={plantCapacity}
            onCapacityChange={setPlantCapacity}
            immersive={towerImmersive}
            onImmersiveChange={setTowerImmersive}
          />
        );
      case "ai":
        return <DrAI slots={slots} onUpdateSlot={updateSlot} />;
      default:
        return null;
    }
  };

  // ── Loading State ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-200/60 flex items-center justify-center">
        <div className="w-full max-w-[430px] h-screen max-h-[932px] bg-background rounded-none sm:rounded-[2rem] shadow-2xl flex items-center justify-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-3"
          >
            <Leaf className="w-10 h-10 text-forest" strokeWidth={2} />
            <span className="text-[13px] font-[500] text-gray-400">Loading...</span>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Auth Screens ────────────────────────────────────────────────
  if (!user) {
    return (
      <AuthShell>
        <AnimatePresence mode="wait">
          {authScreen === "welcome" && (
            <WelcomeScreen key="welcome" onNavigate={setAuthScreen} />
          )}
          {authScreen === "signup" && (
            <SignUpScreen key="signup" onNavigate={setAuthScreen} />
          )}
          {authScreen === "login" && (
            <LoginScreen key="login" onNavigate={setAuthScreen} />
          )}
        </AnimatePresence>
      </AuthShell>
    );
  }

  // ── Onboarding (user exists but no profile) ────────────────────
  if (needsOnboarding) {
    return (
      <AuthShell>
        <PersonalizeScreen />
      </AuthShell>
    );
  }

  // ── Main App ────────────────────────────────────────────────────
  return (
    <>
      {/* Phone Frame — hidden when tower immersive is open */}
      <div
        className="min-h-screen bg-gray-200/60 flex items-center justify-center"
        style={{ display: towerImmersive ? "none" : undefined }}
      >
        <div className="w-full max-w-[430px] h-screen max-h-[932px] bg-background rounded-none sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative">
          <TopBar onAvatarClick={() => setShowRewards(true)} />

          <main className="flex-1 overflow-y-auto">{renderContent()}</main>

          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Overlays (rendered outside the phone frame) */}
      <AnimatePresence>
        {showRewards && (
          <Rewards
            key="rewards"
            slots={slots}
            stats={rewardStats}
            onClose={() => setShowRewards(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {recipeCrop && (
          <RecipeView
            key="recipes"
            crop={recipeCrop}
            onClose={() => setRecipeCrop(null)}
          />
        )}
      </AnimatePresence>

      {/* Toaster */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "Barlow, sans-serif",
            borderRadius: 12,
          },
        }}
      />
    </>
  );
}
