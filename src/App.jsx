import React, { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster, toast } from "sonner";
import { Leaf } from "lucide-react";

import { useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import AuthShell from "./components/auth/AuthShell";
import WelcomeScreen from "./components/auth/WelcomeScreen";
import SignUpScreen from "./components/auth/SignUpScreen";
import LoginScreen from "./components/auth/LoginScreen";
import PersonalizeScreen from "./components/auth/PersonalizeScreen";
import ForgotPasswordScreen from "./components/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "./components/auth/ResetPasswordScreen";
import OnboardingFlow from "./components/auth/OnboardingFlow";

import TopBar from "./components/TopBar";
import BottomNav from "./components/BottomNav";
import Dashboard from "./components/Dashboard";
import WaterLab from "./components/WaterLab";
import TowerControl from "./components/TowerControl";
import DrAI from "./components/DrAI";
import Rewards from "./components/Rewards";
import RecipeView from "./components/RecipeView";
import NotificationCenter from "./components/NotificationCenter";
import WelcomeConfetti from "./components/WelcomeConfetti";

import {
  generateEmptySlots,
  generateEmptyRewardStats,
} from "./data/shared";

// ── Initial State ─────────────────────────────────────────────────
const initialSlots = generateEmptySlots(40);
const initialLabData = { ph: [], ec: [], temp: [] };
const initialRewardStats = generateEmptyRewardStats();

export default function App() {
  const { user, profile, loading, needsOnboarding, passwordRecovery } = useAuth();

  // ── Feature onboarding (shown once per user after first sign-up) ─
  // Use a per-user key so new accounts always see onboarding,
  // regardless of what was stored from previous sessions.
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingWelcome, setPendingWelcome] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;
    const key = `pp_onboarding_${user.id}`;
    if (!localStorage.getItem(key)) {
      setShowOnboarding(true);
    }
  }, [user?.id, profile]);

  // Fire heartfelt welcome toast once the main app is mounted
  useEffect(() => {
    if (!pendingWelcome || !profile) return;
    setPendingWelcome(false);
    const name = profile.display_name || "Grower";
    setTimeout(() => {
      toast(`Hey ${name}, welcome to Power Plant! 🌱`, {
        description:
          "Your tower is set up and ready. We're so glad you're here — let's grow something amazing together 🌿",
        duration: 4000,
      });
    }, 600);
  }, [pendingWelcome, profile]);

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingSlotId, setPendingSlotId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // ── Setup Checklist Progress (per-user, persisted) ────────────
  const [setupProgress, setSetupProgress] = useState(null);

  useEffect(() => {
    if (!user || !profile) return;
    const key = `pp_setup_${user.id}`;
    const saved = localStorage.getItem(key);
    const initial = saved
      ? JSON.parse(saved)
      : { towerNamed: !!profile.tower_name, waterLogged: false, plantAdded: false, plantScanned: false };
    setSetupProgress(initial);
  }, [user?.id, profile]);

  const completeSetupStep = useCallback((stepId, xp) => {
    if (!user) return;
    setSetupProgress((prev) => {
      if (!prev || prev[stepId]) return prev; // already done
      const next = { ...prev, [stepId]: true };
      localStorage.setItem(`pp_setup_${user.id}`, JSON.stringify(next));
      return next;
    });
    if (xp) {
      setRewardStats((prev) => ({ ...prev, bonusXp: (prev.bonusXp || 0) + xp }));
    }
  }, [user]);

  const handleSetupXpEarned = useCallback((bonusXp) => {
    setRewardStats((prev) => ({ ...prev, bonusXp: (prev.bonusXp || 0) + bonusXp }));
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  }, []);

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
    if (crop !== null) completeSetupStep("plantAdded", 75);
  }, [completeSetupStep]);

  const updateSlot = useCallback((index, partial) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, ...partial } : slot))
    );
    // Detect a new scan being added
    if (partial.scanHistory) {
      completeSetupStep("plantScanned", 100);
    }
  }, [completeSetupStep]);

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
    completeSetupStep("waterLogged", 50);
  }, [completeSetupStep]);

  const handleActivity = useCallback((type) => {
    setRewardStats((prev) => ({
      ...prev,
      waterLogs: type === "water" ? prev.waterLogs + 1 : prev.waterLogs,
      nutrientLogs: type === "nutrient" ? prev.nutrientLogs + 1 : prev.nutrientLogs,
      weeklyActivities: prev.weeklyActivities + 1,
    }));
  }, []);

  const executeNotificationAction = useCallback((action) => {
    setShowNotifications(false);
    if (action.tab) setActiveTab(action.tab);
    if (action.slotId !== undefined) setPendingSlotId(action.slotId);
    if (action.openRewards) setShowRewards(true);
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
            setupProgress={setupProgress}
            onNavigateTab={setActiveTab}
            onSetupXpEarned={handleSetupXpEarned}
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
            pendingSlotId={pendingSlotId}
            onPendingSlotHandled={() => setPendingSlotId(null)}
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
          {authScreen === "forgot-password" && (
            <ForgotPasswordScreen key="forgot-password" onNavigate={setAuthScreen} />
          )}
        </AnimatePresence>
      </AuthShell>
    );
  }

  // ── Password Recovery (user clicked reset link in email) ────────
  if (passwordRecovery) {
    return (
      <AuthShell>
        <ResetPasswordScreen />
      </AuthShell>
    );
  }

  // ── Personalize (user exists but no profile yet) ───────────────
  if (needsOnboarding) {
    return (
      <AuthShell>
        <PersonalizeScreen />
      </AuthShell>
    );
  }

  // ── Feature onboarding (first time after sign-up + personalize) ─
  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={(data) => {
          localStorage.setItem(`pp_onboarding_${user.id}`, "1");
          if (data?.capacity) setPlantCapacity(data.capacity);
          setShowOnboarding(false);
          setPendingWelcome(true);
        }}
      />
    );
  }

  // ── Main App ────────────────────────────────────────────────────
  return (
    <NotificationProvider
      slots={slots}
      rewardStats={rewardStats}
      labData={labData}
      onAction={executeNotificationAction}
    >
      {/* Phone Frame — hidden when tower immersive is open */}
      <div
        className="min-h-screen bg-gray-200/60 flex items-center justify-center"
        style={{ display: towerImmersive ? "none" : undefined }}
      >
        <div className="w-full max-w-[430px] h-screen max-h-[932px] bg-background rounded-none sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative">
          <TopBar
            onAvatarClick={() => setShowRewards(true)}
            onBellClick={() => setShowNotifications(true)}
          />

          <main className="flex-1 overflow-y-auto">{renderContent()}</main>

          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Overlays (rendered outside the phone frame) */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationCenter
            key="notifications"
            onClose={() => setShowNotifications(false)}
          />
        )}
      </AnimatePresence>

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

      {/* Welcome confetti (fires when setup completes) */}
      {showConfetti && <WelcomeConfetti />}

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
    </NotificationProvider>
  );
}
