// ── Types (documented via JSDoc) ──────────────────────────────────

/**
 * @typedef {{ name: string; icon: string; growDays: number; color: string }} CropType
 * @typedef {{ date: string; diagnosis: string; healthScore: number }} ScanResult
 * @typedef {{ id: number; crop: CropType | null; plantedDate: string | null; health: number; scanHistory: ScanResult[] }} SlotData
 * @typedef {{ date: string; value: number }} LabEntry
 * @typedef {{ ph: LabEntry[]; ec: LabEntry[]; temp: LabEntry[] }} LabData
 * @typedef {"home" | "lab" | "tower" | "ai"} Tab
 * @typedef {{ waterLogs: number; nutrientLogs: number; labLogs: number; streak: number; longestStreak: number; weeklyActivities: number }} RewardStats
 * @typedef {{ id: string; name: string; description: string; icon: string; category: "harvest"|"care"|"science"|"streak"; target: number; current: number; earned: boolean; earnedDate?: string }} Achievement
 * @typedef {{ label: string; value: string; icon: string }} PersonalRecord
 * @typedef {{ level: number; name: string; icon: string; minXp: number; maxXp: number }} GrowLevel
 */

// ── Constants ─────────────────────────────────────────────────────

export const CROP_OPTIONS = [
  // Leafy Greens
  { name: "Lettuce", icon: "🥬", growDays: 30, color: "#4CAF50" },
  { name: "Spinach", icon: "🍃", growDays: 25, color: "#2E7D32" },
  { name: "Kale", icon: "🥗", growDays: 35, color: "#33691E" },
  { name: "Arugula", icon: "🌿", growDays: 21, color: "#8BC34A" },
  { name: "Swiss Chard", icon: "🥬", growDays: 30, color: "#43A047" },
  { name: "Bok Choy", icon: "🥬", growDays: 28, color: "#66BB6A" },
  { name: "Watercress", icon: "🌱", growDays: 14, color: "#81C784" },
  { name: "Microgreens", icon: "🌱", growDays: 10, color: "#AED581" },
  // Herbs
  { name: "Basil", icon: "🌿", growDays: 25, color: "#66BB6A" },
  { name: "Cilantro", icon: "🌿", growDays: 20, color: "#7CB342" },
  { name: "Mint", icon: "🌿", growDays: 18, color: "#4CAF50" },
  { name: "Parsley", icon: "🌿", growDays: 28, color: "#558B2F" },
  { name: "Dill", icon: "🌿", growDays: 22, color: "#689F38" },
  { name: "Oregano", icon: "🌿", growDays: 30, color: "#827717" },
  { name: "Thyme", icon: "🌿", growDays: 30, color: "#9E9D24" },
  { name: "Chives", icon: "🌿", growDays: 28, color: "#7CB342" },
  { name: "Rosemary", icon: "🌿", growDays: 45, color: "#5D8A3C" },
  { name: "Sage", icon: "🌿", growDays: 35, color: "#6D8B74" },
  // Fruiting Crops
  { name: "Tomato", icon: "🍅", growDays: 60, color: "#EF5350" },
  { name: "Cherry Tomato", icon: "🍅", growDays: 55, color: "#E53935" },
  { name: "Peppers", icon: "🫑", growDays: 50, color: "#43A047" },
  { name: "Chili", icon: "🌶️", growDays: 65, color: "#D32F2F" },
  { name: "Cucumber", icon: "🥒", growDays: 35, color: "#66BB6A" },
  { name: "Zucchini", icon: "🥒", growDays: 40, color: "#558B2F" },
  { name: "Strawberry", icon: "🍓", growDays: 45, color: "#E91E63" },
  { name: "Eggplant", icon: "🍆", growDays: 65, color: "#7B1FA2" },
  // Brassicas & Root Veggies
  { name: "Broccoli", icon: "🥦", growDays: 55, color: "#388E3C" },
  { name: "Cauliflower", icon: "🥦", growDays: 60, color: "#BDBDBD" },
  { name: "Cabbage", icon: "🥬", growDays: 50, color: "#2E7D32" },
  { name: "Radish", icon: "🔴", growDays: 22, color: "#C62828" },
  { name: "Turnip", icon: "🟣", growDays: 35, color: "#6A1B9A" },
  // Legumes & Others
  { name: "Snap Peas", icon: "🫛", growDays: 40, color: "#558B2F" },
  { name: "Green Beans", icon: "🫘", growDays: 45, color: "#33691E" },
  { name: "Celery", icon: "🥬", growDays: 60, color: "#A5D6A7" },
  { name: "Green Onion", icon: "🧅", growDays: 20, color: "#7CB342" },
  { name: "Fennel", icon: "🌿", growDays: 40, color: "#C0CA33" },
  // Edible Flowers & Specialty
  { name: "Edible Flowers", icon: "🌸", growDays: 30, color: "#F48FB1" },
  { name: "Wheatgrass", icon: "🌾", growDays: 8, color: "#9CCC65" },
  { name: "Lemongrass", icon: "🌾", growDays: 50, color: "#CDDC39" },
];

export const LEVELS = [
  { level: 1, name: "Seedling", icon: "🌱", minXp: 0, maxXp: 100 },
  { level: 2, name: "Sprout", icon: "🌿", minXp: 100, maxXp: 300 },
  { level: 3, name: "Gardener", icon: "🪴", minXp: 300, maxXp: 600 },
  { level: 4, name: "Botanist", icon: "🧬", minXp: 600, maxXp: 1000 },
  { level: 5, name: "Master Grower", icon: "👑", minXp: 1000, maxXp: 2000 },
];

// ── Derived Functions ─────────────────────────────────────────────

export function deriveXp(slots, stats) {
  const planted = slots.filter((s) => s.crop !== null).length;
  const scans = slots.reduce((sum, s) => sum + s.scanHistory.length, 0);
  return (
    planted * 30 +
    scans * 25 +
    stats.waterLogs * 10 +
    stats.nutrientLogs * 15 +
    stats.labLogs * 20 +
    (stats.bonusXp || 0)
  );
}

export function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getLevelProgress(xp) {
  const level = getLevel(xp);
  const range = level.maxXp - level.minXp;
  return Math.min(1, (xp - level.minXp) / range);
}

export function deriveAchievements(slots, stats) {
  const planted = slots.filter((s) => s.crop !== null);
  const uniqueCrops = new Set(planted.map((s) => s.crop?.name)).size;
  const totalScans = slots.reduce((sum, s) => sum + s.scanHistory.length, 0);
  const bestHealth = Math.max(
    0,
    ...slots.flatMap((s) => s.scanHistory.map((r) => r.healthScore))
  );

  return [
    // Harvest
    { id: "h1", name: "First Seed", description: "Plant your first crop", icon: "🌱", category: "harvest", target: 1, current: planted.length, earned: planted.length >= 1 },
    { id: "h2", name: "Diverse Garden", description: "Grow 6 different crop types", icon: "🌈", category: "harvest", target: 6, current: uniqueCrops, earned: uniqueCrops >= 6 },
    { id: "h3", name: "Full Tower", description: "Fill 20+ slots", icon: "🏗️", category: "harvest", target: 20, current: planted.length, earned: planted.length >= 20 },
    // Care
    { id: "c1", name: "Hydration Hero", description: "Log 7 water entries", icon: "💧", category: "care", target: 7, current: stats.waterLogs, earned: stats.waterLogs >= 7 },
    { id: "c2", name: "Nutrient Master", description: "Log 10 nutrient entries", icon: "⚗️", category: "care", target: 10, current: stats.nutrientLogs, earned: stats.nutrientLogs >= 10 },
    { id: "c3", name: "Lab Regular", description: "Log 14 lab readings", icon: "🔬", category: "care", target: 14, current: stats.labLogs, earned: stats.labLogs >= 14 },
    // Science
    { id: "s1", name: "First Scan", description: "Complete 5 AI scans", icon: "📸", category: "science", target: 5, current: totalScans, earned: totalScans >= 5 },
    { id: "s2", name: "Perfect Health", description: "Achieve 95%+ health score", icon: "💚", category: "science", target: 95, current: bestHealth, earned: bestHealth >= 95 },
    { id: "s3", name: "Data Nerd", description: "Log 7 lab readings", icon: "📊", category: "science", target: 7, current: stats.labLogs, earned: stats.labLogs >= 7 },
    // Streak
    { id: "st1", name: "Consistent", description: "Maintain a 3-day streak", icon: "🔥", category: "streak", target: 3, current: stats.longestStreak, earned: stats.longestStreak >= 3 },
    { id: "st2", name: "Dedicated", description: "Maintain a 7-day streak", icon: "⚡", category: "streak", target: 7, current: stats.longestStreak, earned: stats.longestStreak >= 7 },
    { id: "st3", name: "Unstoppable", description: "Maintain a 30-day streak", icon: "🏆", category: "streak", target: 30, current: stats.longestStreak, earned: stats.longestStreak >= 30 },
  ];
}

export function derivePersonalRecords(slots, stats) {
  const bestHealth = Math.max(
    0,
    ...slots.flatMap((s) => s.scanHistory.map((r) => r.healthScore))
  );
  const totalCrops = slots.filter((s) => s.crop !== null).length;
  const totalScans = slots.reduce((sum, s) => sum + s.scanHistory.length, 0);

  return [
    { label: "Best Health Score", value: `${bestHealth}%`, icon: "💚" },
    { label: "Total Crops Planted", value: `${totalCrops}`, icon: "🌱" },
    { label: "Total Scans", value: `${totalScans}`, icon: "📸" },
    { label: "Longest Streak", value: `${stats.longestStreak} days`, icon: "🔥" },
    { label: "Water Logged", value: `${stats.waterLogs}`, icon: "💧" },
  ];
}

// ── Generator Functions ───────────────────────────────────────────

export function generateEmptySlots(count = 40) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    crop: null,
    plantedDate: null,
    health: 0,
    scanHistory: [],
  }));
}

export function generateEmptyRewardStats() {
  return {
    waterLogs: 0,
    nutrientLogs: 0,
    labLogs: 0,
    streak: 0,
    longestStreak: 0,
    weeklyActivities: 0,
    bonusXp: 0,
  };
}

export function generateInitialSlots(count = 40) {
  const initialCrops = CROP_OPTIONS.slice(0, 8); // First 8 crops
  const slots = [];

  for (let i = 0; i < count; i++) {
    if (i < initialCrops.length) {
      const crop = initialCrops[i];
      const daysAgo = Math.floor(Math.random() * 20) + 5;
      const plantedDate = new Date();
      plantedDate.setDate(plantedDate.getDate() - daysAgo);
      const health = Math.floor(Math.random() * 20) + 78; // 78-97

      slots.push({
        id: i,
        crop,
        plantedDate: plantedDate.toISOString().split("T")[0],
        health,
        scanHistory: [
          {
            date: new Date(Date.now() - Math.random() * 7 * 86400000)
              .toISOString()
              .split("T")[0],
            diagnosis: "Healthy growth pattern",
            healthScore: health,
          },
        ],
      });
    } else {
      slots.push({
        id: i,
        crop: null,
        plantedDate: null,
        health: 0,
        scanHistory: [],
      });
    }
  }
  return slots;
}

export function generateInitialLabData() {
  const ph = [];
  const ec = [];
  const temp = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];

    ph.push({ date, value: +(5.8 + Math.random() * 1.0).toFixed(1) });
    ec.push({ date, value: +(1.0 + Math.random() * 0.8).toFixed(1) });
    temp.push({ date, value: +(20 + Math.random() * 4).toFixed(1) });
  }

  return { ph, ec, temp };
}

export function generateInitialRewardStats() {
  return {
    waterLogs: 12,
    nutrientLogs: 5,
    labLogs: 7,
    streak: 5,
    longestStreak: 8,
    weeklyActivities: 4,
  };
}

// ── Utility Functions ─────────────────────────────────────────────

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getHarvestDate(plantedDate, growDays) {
  const d = new Date(plantedDate);
  d.setDate(d.getDate() + growDays);
  return d.toISOString().split("T")[0];
}

export function getDaysUntilHarvest(plantedDate, growDays) {
  const harvest = new Date(plantedDate);
  harvest.setDate(harvest.getDate() + growDays);
  const diff = Math.ceil((harvest - new Date()) / 86400000);
  return Math.max(0, diff);
}

export function getDaysSincePlanting(plantedDate) {
  return Math.floor((new Date() - new Date(plantedDate)) / 86400000);
}

export function getLastScanDate(slot) {
  if (!slot.scanHistory || slot.scanHistory.length === 0) return null;
  return slot.scanHistory[slot.scanHistory.length - 1].date;
}

export function daysSinceDate(dateStr) {
  if (!dateStr) return Infinity;
  return Math.floor((new Date() - new Date(dateStr)) / 86400000);
}
