import {
  getDaysUntilHarvest,
  getDaysSincePlanting,
  getLastScanDate,
  daysSinceDate,
  deriveAchievements,
  deriveXp,
  getLevel,
} from "./shared";

// ── Constants ────────────────────────────────────────────────────

const MAX_NOTIFICATIONS = 10;

const PRIORITY = { urgent: 1, celebration: 2, reminder: 3, social: 4, tip: 5 };

const SOCIAL_TEMPLATES = [
  { title: "Your neighborhood is growing!", body: "{n} growers in your area planted new crops this week." },
  { title: "You're not alone!", body: "{n} hydro enthusiasts logged water chemistry today." },
  { title: "Community milestone!", body: "Local growers harvested {n} crops this month." },
  { title: "Growing trend!", body: "{n} growers achieved new streak records this week." },
  { title: "Hydro community buzz!", body: "{n} towers were scanned with Dr. AI today." },
];

const MORNING_TIPS = [
  { icon: "☀️", body: "Morning light is ideal for photosynthesis. Check your light setup!", action: { tab: "tower" } },
  { icon: "💧", body: "Morning is the best time to check pH levels. Quick lab log?", action: { tab: "lab" } },
  { icon: "🌡️", body: "Water temperature is most stable in the morning. Great time to measure!", action: { tab: "lab" } },
];

const AFTERNOON_TIPS = [
  { icon: "🧪", body: "EC levels fluctuate during peak growth hours. Good time to check!", action: { tab: "lab" } },
  { icon: "🌡️", body: "Afternoon heat can stress plants. Monitor your tower temperature.", action: { tab: "tower" } },
  { icon: "📸", body: "Plants are most photogenic in natural light. Scan one with Dr. AI!", action: { tab: "ai" } },
];

const EVENING_TIPS = [
  { icon: "📊", body: "End of day is perfect for reviewing your plants' progress.", action: { tab: "home", openRewards: true } },
  { icon: "🔥", body: "Don't forget to log an activity to keep your streak alive!", action: { tab: "home" } },
  { icon: "🌿", body: "Plants grow while you sleep! Make sure nutrients are topped up.", action: { tab: "home" } },
];

// ── Helpers ──────────────────────────────────────────────────────

function makeNotification(type, { icon, title, body, ctaLabel, action, sourceKey, expiresInHours }) {
  return {
    id: `${sourceKey}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    icon,
    title,
    body,
    ctaLabel,
    action,
    priority: PRIORITY[type],
    createdAt: new Date().toISOString(),
    read: false,
    dismissed: false,
    expiresAt: expiresInHours
      ? new Date(Date.now() + expiresInHours * 3600000).toISOString()
      : undefined,
    sourceKey,
  };
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
}

// ── Main Engine ──────────────────────────────────────────────────

export function generateNotifications(slots, stats, labData, persistedState = {}) {
  const notifications = [];
  const today = new Date().toISOString().split("T")[0];
  const hour = new Date().getHours();
  const plantedSlots = slots.filter((s) => s.crop !== null);

  // ── 1. Per-slot notifications ──────────────────────────────────

  // Track which slots already have a high-priority notification (only show highest per slot)
  const slotNotified = new Set();

  for (const slot of plantedSlots) {
    const daysLeft = getDaysUntilHarvest(slot.plantedDate, slot.crop.growDays);
    const daysSincePlant = getDaysSincePlanting(slot.plantedDate);
    const lastScan = getLastScanDate(slot);
    const daysSinceLastScan = daysSinceDate(lastScan);

    // Harvest ready (priority 1)
    if (daysLeft === 0) {
      notifications.push(
        makeNotification("urgent", {
          icon: "🎉",
          title: `${slot.crop.icon} ${slot.crop.name} is ready!`,
          body: `Slot #${slot.id + 1} — Your ${slot.crop.name} has reached maturity. Time to harvest!`,
          ctaLabel: "Harvest now",
          action: { tab: "tower", slotId: slot.id },
          sourceKey: `harvest-ready-${slot.id}`,
        })
      );
      slotNotified.add(slot.id);
      continue; // Skip lower-priority notifications for this slot
    }

    // Health critical (priority 1)
    if (slot.health > 0 && slot.health < 50) {
      notifications.push(
        makeNotification("urgent", {
          icon: "🚨",
          title: `${slot.crop.icon} ${slot.crop.name} needs help!`,
          body: `Slot #${slot.id + 1} health is at ${slot.health}%. Scan immediately to diagnose.`,
          ctaLabel: "Scan now",
          action: { tab: "ai" },
          sourceKey: `health-critical-${slot.id}`,
        })
      );
      slotNotified.add(slot.id);
      continue;
    }

    // Health warning (priority 1)
    if (slot.health > 0 && slot.health < 70) {
      notifications.push(
        makeNotification("urgent", {
          icon: "⚠️",
          title: `${slot.crop.icon} ${slot.crop.name} health dropping`,
          body: `Slot #${slot.id + 1} is at ${slot.health}%. Check for issues.`,
          ctaLabel: "Check plant",
          action: { tab: "tower", slotId: slot.id },
          sourceKey: `health-warning-${slot.id}`,
        })
      );
      slotNotified.add(slot.id);
    }

    // Harvest 1 day away (priority 3)
    if (daysLeft === 1 && !slotNotified.has(slot.id)) {
      notifications.push(
        makeNotification("reminder", {
          icon: "⏰",
          title: `${slot.crop.icon} ${slot.crop.name} almost ready!`,
          body: `Slot #${slot.id + 1} — Just 1 day until harvest!`,
          ctaLabel: "Check growth",
          action: { tab: "tower", slotId: slot.id },
          sourceKey: `harvest-1day-${slot.id}`,
          expiresInHours: 24,
        })
      );
      slotNotified.add(slot.id);
    }

    // Harvest 3 days away (priority 3)
    if (daysLeft === 3 && !slotNotified.has(slot.id)) {
      notifications.push(
        makeNotification("reminder", {
          icon: "📅",
          title: `${slot.crop.icon} ${slot.crop.name} in 3 days`,
          body: `Slot #${slot.id + 1} — Getting close! 3 days to harvest.`,
          ctaLabel: "View plant",
          action: { tab: "tower", slotId: slot.id },
          sourceKey: `harvest-3day-${slot.id}`,
          expiresInHours: 48,
        })
      );
    }

    // Scan overdue (priority 3)
    if (daysSinceLastScan >= 3 && daysSincePlant >= 3 && !slotNotified.has(slot.id)) {
      notifications.push(
        makeNotification("reminder", {
          icon: "📸",
          title: `${slot.crop.icon} ${slot.crop.name} needs a scan`,
          body: `Slot #${slot.id + 1} hasn't been scanned in ${daysSinceLastScan === Infinity ? "a while" : daysSinceLastScan + " days"}. Check on it!`,
          ctaLabel: "Scan with Dr. AI",
          action: { tab: "ai" },
          sourceKey: `scan-overdue-${slot.id}`,
          expiresInHours: 24,
        })
      );
    }
  }

  // ── 2. Achievement notifications ───────────────────────────────

  const achievements = deriveAchievements(slots, stats);
  const prevEarned = persistedState.previousAchievements || [];

  for (const ach of achievements) {
    // Newly earned celebration
    if (ach.earned && !prevEarned.includes(ach.id)) {
      notifications.push(
        makeNotification("celebration", {
          icon: ach.icon,
          title: `Achievement unlocked!`,
          body: `${ach.name} — ${ach.description}`,
          ctaLabel: "See your badge",
          action: { tab: "home", openRewards: true },
          sourceKey: `achievement-${ach.id}`,
        })
      );
    }

    // Achievement nudge (at 50%+ progress)
    if (!ach.earned && ach.target > 0 && ach.current / ach.target >= 0.5) {
      const remaining = ach.target - ach.current;
      const tabMap = { harvest: "tower", care: "home", science: "ai", streak: "home" };
      notifications.push(
        makeNotification("tip", {
          icon: "🎯",
          title: `Almost there!`,
          body: `${remaining} more to unlock "${ach.name}" — ${ach.description}`,
          ctaLabel: "Keep going",
          action: { tab: tabMap[ach.category] || "home" },
          sourceKey: `ach-nudge-${ach.id}`,
          expiresInHours: 12,
        })
      );
    }
  }

  // ── 3. Level up ────────────────────────────────────────────────

  const xp = deriveXp(slots, stats);
  const currentLevel = getLevel(xp);
  const prevLevel = persistedState.previousLevel || 1;

  if (currentLevel.level > prevLevel) {
    notifications.push(
      makeNotification("celebration", {
        icon: currentLevel.icon,
        title: `Level up! You're a ${currentLevel.name}!`,
        body: `You reached Level ${currentLevel.level} with ${xp} XP. Keep growing!`,
        ctaLabel: "View progress",
        action: { tab: "home", openRewards: true },
        sourceKey: `level-up-${currentLevel.level}`,
      })
    );
  }

  // ── 4. Streak at risk ──────────────────────────────────────────

  if (stats.streak > 0 && hour >= 18) {
    notifications.push(
      makeNotification("reminder", {
        icon: "🔥",
        title: `Don't lose your ${stats.streak}-day streak!`,
        body: `Log a quick activity to keep it alive. Water, scan, or check your lab.`,
        ctaLabel: "Log activity",
        action: { tab: "home" },
        sourceKey: `streak-risk-${today}`,
        expiresInHours: 8,
      })
    );
  }

  // ── 5. Weekly goal progress ────────────────────────────────────

  if (stats.weeklyActivities < 7) {
    const remaining = 7 - stats.weeklyActivities;
    notifications.push(
      makeNotification("social", {
        icon: "🎯",
        title: `Weekly goal: ${remaining} to go!`,
        body: `You've done ${stats.weeklyActivities}/7 activities this week. Almost there!`,
        ctaLabel: "View goal",
        action: { tab: "home", openRewards: true },
        sourceKey: `weekly-goal-${getWeekNumber()}`,
        expiresInHours: 24,
      })
    );
  }

  // ── 6. Lab data freshness ──────────────────────────────────────

  const lastLabDate = labData.ph.length > 0 ? labData.ph[labData.ph.length - 1].date : null;
  if (daysSinceDate(lastLabDate) >= 2) {
    notifications.push(
      makeNotification("reminder", {
        icon: "🧪",
        title: "Time for a lab check",
        body: `Your last water reading was ${lastLabDate ? daysSinceDate(lastLabDate) + " days ago" : "never"}. Keep your data fresh!`,
        ctaLabel: "Log reading",
        action: { tab: "lab" },
        sourceKey: `lab-overdue-${today}`,
        expiresInHours: 24,
      })
    );
  }

  // ── 7. Social FOMO (1 per day) ─────────────────────────────────

  const socialTemplate = pickRandom(SOCIAL_TEMPLATES);
  const fakeCount = Math.floor(Math.random() * 23) + 8;
  notifications.push(
    makeNotification("social", {
      icon: "🌍",
      title: socialTemplate.title,
      body: socialTemplate.body.replace("{n}", fakeCount),
      ctaLabel: "Tend your garden",
      action: { tab: "home" },
      sourceKey: `social-${today}`,
      expiresInHours: 16,
    })
  );

  // ── 8. Time-of-day tip ─────────────────────────────────────────

  let tipPool;
  let timeBucket;
  if (hour >= 6 && hour < 12) {
    tipPool = MORNING_TIPS;
    timeBucket = "morning";
  } else if (hour >= 12 && hour < 18) {
    tipPool = AFTERNOON_TIPS;
    timeBucket = "afternoon";
  } else {
    tipPool = EVENING_TIPS;
    timeBucket = "evening";
  }

  const tip = pickRandom(tipPool);
  notifications.push(
    makeNotification("tip", {
      icon: tip.icon,
      title: "Growing tip",
      body: tip.body,
      ctaLabel: "Learn more",
      action: tip.action,
      sourceKey: `tip-${today}-${timeBucket}`,
      expiresInHours: 8,
    })
  );

  // ── Sort & cap ─────────────────────────────────────────────────

  notifications.sort((a, b) => a.priority - b.priority || new Date(b.createdAt) - new Date(a.createdAt));

  return notifications.slice(0, MAX_NOTIFICATIONS);
}
