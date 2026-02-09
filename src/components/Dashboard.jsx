import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Droplets,
  Zap,
  Thermometer,
  ChevronRight,
  Flame,
  Plus,
  FlaskConical,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import {
  CROP_OPTIONS,
  deriveXp,
  getLevel,
  getLevelProgress,
} from "../data/shared";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "./ui/drawer";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard({
  slots,
  stats,
  onAssignCrop,
  onActivity,
  onOpenRewards,
  onOpenRecipes,
}) {
  const { profile } = useAuth();
  const [cropDrawerOpen, setCropDrawerOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [waterDrawerOpen, setWaterDrawerOpen] = useState(false);
  const [nutrientDrawerOpen, setNutrientDrawerOpen] = useState(false);
  const [waterAmount, setWaterAmount] = useState(500);
  const [nutrientType, setNutrientType] = useState("A");
  const [nutrientAmount, setNutrientAmount] = useState(10);

  const xp = deriveXp(slots, stats);
  const level = getLevel(xp);
  const progress = getLevelProgress(xp);
  const plantedSlots = slots.filter((s) => s.crop !== null).slice(0, 8);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleAddCrop = () => {
    const emptyIdx = slots.findIndex((s) => s.crop === null);
    if (emptyIdx === -1) {
      toast.error("All slots are full!");
      return;
    }
    setSelectedIdx(emptyIdx);
    setCropDrawerOpen(true);
  };

  return (
    <div className="pb-4">
      {/* Greeting */}
      <h1 className="text-[24px] font-[300] text-forest px-5 pt-2 pb-4">
        {getGreeting()}, {profile?.display_name || "Grower"}.
      </h1>

      {/* Hero Card */}
      <div
        className="mx-5 rounded-[24px] p-5 text-white"
        style={{
          background: "linear-gradient(135deg, #2C5530, #3E7042)",
          boxShadow: "0 8px 15px rgba(44,85,48,0.3)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-[700] tracking-[1.2px] uppercase text-white/80">
            Tower Status
          </span>
          <span className="text-[11px] font-[700] tracking-wider uppercase bg-white/20 px-3 py-1 rounded-full border border-white/30">
            OPTIMAL
          </span>
        </div>
        <h2 className="text-[22px] font-[700] mb-4">System Healthy</h2>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Droplets className="w-[14px] h-[14px] text-white/70" />
            <div>
              <p className="text-[10px] uppercase text-white/60 tracking-wider">pH</p>
              <p className="text-[18px] font-[700]">6.2</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-[14px] h-[14px] text-white/70" />
            <div>
              <p className="text-[10px] uppercase text-white/60 tracking-wider">EC</p>
              <p className="text-[18px] font-[700]">1.4</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="w-[14px] h-[14px] text-white/70" />
            <div>
              <p className="text-[10px] uppercase text-white/60 tracking-wider">Temp</p>
              <p className="text-[18px] font-[700]">22°</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <button
        onClick={onOpenRewards}
        className="mx-5 mt-3 w-[calc(100%-40px)] bg-white rounded-[16px] p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        <div className="w-12 h-12 rounded-2xl bg-forest/8 flex items-center justify-center text-[24px]">
          {level.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[14px] font-[600] text-forest">
              {level.name}
            </span>
            <span className="text-[10px] font-[600] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              Lvl {level.level}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-forest rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            {xp} / {level.maxXp} XP
          </p>
        </div>
        <div className="flex items-center gap-1 text-orange-500">
          <Flame size={16} />
          <span className="text-[14px] font-[700]">{stats.streak}</span>
        </div>
        <ChevronRight size={16} className="text-gray-300" />
      </button>

      {/* Active Crops */}
      <div className="mt-5">
        <h3 className="text-[12px] font-[700] text-gray-400 uppercase tracking-[1.2px] px-5 mb-3">
          Active Crops
        </h3>
        <div className="flex gap-4 px-5 overflow-x-auto scrollbar-hide pb-2">
          {plantedSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => slot.crop && onOpenRecipes(slot.crop)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-[0.98] transition-transform"
            >
              <div
                className="w-[65px] h-[65px] rounded-full bg-white flex items-center justify-center text-[28px]"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              >
                {slot.crop?.icon}
              </div>
              <span className="text-[12px] font-[500] text-gray-600">
                {slot.crop?.name}
              </span>
            </button>
          ))}
          <button
            onClick={handleAddCrop}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-[0.98] transition-transform"
          >
            <div className="w-[65px] h-[65px] rounded-full bg-white flex items-center justify-center border-2 border-dashed border-gray-300">
              <Plus size={22} className="text-gray-400" />
            </div>
            <span className="text-[12px] font-[500] text-gray-400">Add</span>
          </button>
        </div>
      </div>

      {/* Quick Log */}
      <div className="mt-5 px-5">
        <h3 className="text-[12px] font-[700] text-gray-400 uppercase tracking-[1.2px] mb-3">
          Quick Log
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => setWaterDrawerOpen(true)}
            className="flex-1 flex flex-col items-center gap-2 py-5 rounded-[16px] bg-white border border-gray-100 active:scale-[0.98] transition-transform"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <Droplets size={22} className="text-forest" />
            <span className="text-[14px] font-[500] text-gray-600">Log Water</span>
          </button>
          <button
            onClick={() => setNutrientDrawerOpen(true)}
            className="flex-1 flex flex-col items-center gap-2 py-5 rounded-[16px] bg-white border border-gray-100 active:scale-[0.98] transition-transform"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <FlaskConical size={22} className="text-forest" />
            <span className="text-[14px] font-[500] text-gray-600">Add Nutrients</span>
          </button>
        </div>
      </div>

      {/* Crop Selection Drawer */}
      <Drawer open={cropDrawerOpen} onOpenChange={setCropDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Select Crop</DrawerTitle>
          </DrawerHeader>
          <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-3 gap-3">
              {CROP_OPTIONS.map((crop) => (
                <button
                  key={crop.name}
                  onClick={() => {
                    onAssignCrop(selectedIdx, crop);
                    setCropDrawerOpen(false);
                    toast.success(`${crop.icon} ${crop.name} planted!`);
                  }}
                  className="flex flex-col items-center gap-1 p-3 rounded-[12px] bg-gray-50 hover:bg-forest/5 active:scale-95 transition-all"
                >
                  <span className="text-[32px]">{crop.icon}</span>
                  <span className="text-[12px] font-[500] text-gray-600">
                    {crop.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Water Drawer */}
      <Drawer open={waterDrawerOpen} onOpenChange={setWaterDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Log Water</DrawerTitle>
          </DrawerHeader>
          <div className="px-6 pb-2 flex items-center justify-center gap-6">
            <button
              onClick={() => setWaterAmount((v) => Math.max(100, v - 100))}
              className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center active:scale-95 transition-transform"
            >
              <Minus size={18} />
            </button>
            <div className="text-center">
              <span className="text-[36px] font-[700] text-forest">{waterAmount}</span>
              <span className="text-[16px] font-[500] text-gray-400 ml-1">ml</span>
            </div>
            <button
              onClick={() => setWaterAmount((v) => Math.min(2000, v + 100))}
              className="w-11 h-11 rounded-full bg-forest text-white flex items-center justify-center active:scale-95 transition-transform"
            >
              <Plus size={18} />
            </button>
          </div>
          <DrawerFooter>
            <button
              onClick={() => {
                onActivity("water");
                setWaterDrawerOpen(false);
                toast.success(`💧 ${waterAmount}ml water logged!`);
              }}
              className="w-full py-3 bg-forest text-white rounded-full text-[14px] font-[600] active:scale-[0.98] transition-transform"
            >
              Confirm
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Nutrient Drawer */}
      <Drawer open={nutrientDrawerOpen} onOpenChange={setNutrientDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add Nutrients</DrawerTitle>
          </DrawerHeader>
          <div className="px-6 pb-3">
            <div className="flex gap-2 justify-center mb-5">
              {["A", "B", "Boost"].map((t) => (
                <button
                  key={t}
                  onClick={() => setNutrientType(t)}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-[600] transition-colors ${
                    nutrientType === t
                      ? "bg-forest text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setNutrientAmount((v) => Math.max(5, v - 5))}
                className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center active:scale-95 transition-transform"
              >
                <Minus size={18} />
              </button>
              <div className="text-center">
                <span className="text-[36px] font-[700] text-forest">
                  {nutrientAmount}
                </span>
                <span className="text-[16px] font-[500] text-gray-400 ml-1">ml</span>
              </div>
              <button
                onClick={() => setNutrientAmount((v) => Math.min(50, v + 5))}
                className="w-11 h-11 rounded-full bg-forest text-white flex items-center justify-center active:scale-95 transition-transform"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          <DrawerFooter>
            <button
              onClick={() => {
                onActivity("nutrient");
                setNutrientDrawerOpen(false);
                toast.success(
                  `⚗️ ${nutrientAmount}ml Nutrient ${nutrientType} added!`
                );
              }}
              className="w-full py-3 bg-forest text-white rounded-full text-[14px] font-[600] active:scale-[0.98] transition-transform"
            >
              Confirm
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
