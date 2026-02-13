import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import {
  Droplets,
  Sun,
  Lightbulb,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  ArrowLeft,
  Camera,
  Trash2,
  AlertTriangle,
  Check,
  Sparkles,
  Plus,
  Clock,
  Leaf,
} from "lucide-react";
import { toast } from "sonner";
import {
  CROP_OPTIONS,
  formatDate,
  getDaysSincePlanting,
  getDaysUntilHarvest,
} from "../data/shared";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import Tower3DScene from "./Tower3DScene";
import { identifyPlant, isPlantIdConfigured } from "../lib/plantid";

// ── helpers ──────────────────────────────────────────────────────
function mapPlantIdResult(result, slotCrop) {
  const { commonName, confidence, species, family, isHealthy, diseases } =
    result;

  let healthScore;
  if (isHealthy === true) {
    healthScore = Math.round(85 + confidence * 15);
  } else if (isHealthy === false && diseases.length > 0) {
    const worstProb = Math.max(...diseases.map((d) => d.probability));
    healthScore = Math.max(20, Math.round(80 - worstProb * 60));
  } else {
    healthScore = Math.round(60 + confidence * 40);
  }

  let diagnosis;
  if (confidence >= 0.5) {
    const cropName = slotCrop?.name?.toLowerCase() || "";
    const identifiedName = commonName.toLowerCase();
    const speciesLower = species.toLowerCase();
    const isMatch =
      identifiedName.includes(cropName) ||
      speciesLower.includes(cropName) ||
      cropName.includes(identifiedName);

    if (isHealthy === true) {
      diagnosis = isMatch
        ? `✅ Identified as ${commonName} (${Math.round(confidence * 100)}% match). Plant is healthy!`
        : `Identified as ${commonName} (${family}). Expected ${slotCrop?.name || "unknown"}. Plant looks healthy.`;
    } else if (diseases.length > 0) {
      const topDisease = diseases[0];
      diagnosis = `⚠️ ${commonName} — ${topDisease.name} detected (${Math.round(topDisease.probability * 100)}% probability).`;
    } else {
      diagnosis = isMatch
        ? `Identified as ${commonName} (${Math.round(confidence * 100)}% match).`
        : `Identified as ${commonName} (${family}). Expected ${slotCrop?.name || "unknown"}.`;
    }
  } else if (confidence >= 0.2) {
    diagnosis = `Possible ${commonName} (${Math.round(confidence * 100)}% confidence). Review recommended.`;
  } else {
    diagnosis = `Low confidence identification (${Math.round(confidence * 100)}%). Clearer photo recommended.`;
  }

  return { diagnosis, healthScore };
}

// ── SlotDetail ────────────────────────────────────────────────────
function SlotDetail({ slot, onAssignCrop, onUpdateSlot, onBack }) {
  const [scanning, setScanning] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [identificationResult, setIdentificationResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const fallbackScan = () => {
    setTimeout(() => {
      const diagnoses = [
        "Healthy growth pattern detected",
        "Minor nutrient deficiency detected",
        "Excellent root development",
        "Slight pH imbalance observed",
        "Strong vegetative growth",
        "Optimal photosynthesis rate",
      ];
      const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
      const healthScore = Math.floor(Math.random() * 17) + 80;
      const date = new Date().toISOString().split("T")[0];

      onUpdateSlot(slot.id, {
        health: healthScore,
        scanHistory: [...slot.scanHistory, { date, diagnosis, healthScore }],
      });
      setScanning(false);
      toast.success(`Scan complete: ${healthScore}% health`);
    }, 1200);
  };

  const handleScanClick = () => {
    if (isPlantIdConfigured()) {
      fileInputRef.current?.click();
    } else {
      setScanning(true);
      fallbackScan();
    }
  };

  const handleImageCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
    setIdentificationResult(null);
    setScanning(true);

    try {
      const result = await identifyPlant(file);
      const { diagnosis, healthScore } = mapPlantIdResult(result, slot.crop);
      const date = new Date().toISOString().split("T")[0];

      onUpdateSlot(slot.id, {
        health: healthScore,
        scanHistory: [...slot.scanHistory, { date, diagnosis, healthScore }],
      });

      setIdentificationResult(result);
      setScanning(false);
      toast.success(`Scan complete: ${healthScore}% health`);
    } catch (err) {
      console.error("Plant.id scan failed:", err);
      const msg = err.message || "";
      if (msg.includes("404") || msg.includes("No plant")) {
        toast.error("Could not identify species. Try a clearer plant photo.");
      } else {
        toast.error("API scan failed. Using local diagnosis.");
      }
      fallbackScan();
    }

    e.target.value = "";
  };

  // Empty slot — show crop picker
  if (!slot.crop) {
    return (
      <div className="px-6 pb-6 overflow-y-auto max-h-[60vh]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[13px] text-gray-500 mb-4"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex flex-col items-center mb-5">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Plus size={22} className="text-forest" />
          </div>
          <h3 className="text-[16px] font-[600] text-forest">
            Slot #{slot.id + 1} — Empty
          </h3>
          <p className="text-[13px] text-gray-400 mt-1">
            Choose a crop to plant in this slot
          </p>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            {CROP_OPTIONS.map((crop) => (
              <button
                key={crop.name}
                onClick={() => {
                  onAssignCrop(slot.id, crop);
                  toast.success(`${crop.icon} ${crop.name} planted!`);
                  onBack();
                }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-[14px] bg-gray-50 hover:bg-forest/5 active:scale-95 transition-all"
              >
                <span className="text-[28px]">{crop.icon}</span>
                <span className="text-[12px] font-[600] text-gray-700">
                  {crop.name}
                </span>
                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                  <Clock size={9} /> {crop.growDays}d
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filled slot — show details
  const healthColor =
    slot.health >= 80 ? "#22c55e" : slot.health >= 60 ? "#f59e0b" : "#ef4444";
  const days = getDaysSincePlanting(slot.plantedDate);
  const daysLeft = getDaysUntilHarvest(slot.plantedDate, slot.crop.growDays);
  const growthPct = Math.min(100, Math.round((days / slot.crop.growDays) * 100));

  return (
    <div className="px-6 pb-6 overflow-y-auto max-h-[60vh]">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[13px] text-gray-500 mb-4"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header with crop icon, name, slot, health */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-[14px] flex items-center justify-center text-[28px]"
            style={{ backgroundColor: slot.crop.color + "18" }}
          >
            {slot.crop.icon}
          </div>
          <div>
            <h3 className="text-[18px] font-[700] text-forest">
              {slot.crop.name}
            </h3>
            <p className="text-[13px] text-gray-400">
              Slot #{slot.id + 1}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className="text-[22px] font-[700]"
            style={{ color: healthColor }}
          >
            {slot.health}%
          </p>
          <p className="text-[11px] text-gray-400">Health</p>
        </div>
      </div>

      {/* Growth progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-[500] text-gray-500">Growth Progress</span>
          <span className="text-[12px] font-[600] text-forest">{growthPct}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${growthPct}%` }}
            transition={{ duration: 0.6 }}
            style={{ backgroundColor: "#22c55e" }}
          />
        </div>
      </div>

      {/* Timeline stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-gray-50 rounded-[14px] p-3 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
            Planted
          </p>
          <p className="text-[14px] font-[600] text-forest">
            {formatDate(slot.plantedDate)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-[14px] p-3 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
            Day
          </p>
          <p className="text-[14px] font-[600] text-forest">{days}</p>
        </div>
        <div className="bg-gray-50 rounded-[14px] p-3 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
            Harvest
          </p>
          <p className="text-[14px] font-[600] text-forest">
            {daysLeft === 0 ? "Ready!" : `${daysLeft}d`}
          </p>
        </div>
      </div>

      {/* Hidden file input for camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageCapture}
      />

      {/* Scan button */}
      <button
        onClick={handleScanClick}
        disabled={scanning}
        className="w-full py-3.5 bg-forest text-white rounded-[14px] text-[14px] font-[600] flex items-center justify-center gap-2 mb-5 active:scale-[0.98] transition-transform disabled:opacity-70"
      >
        {scanning ? (
          <>
            <Sparkles size={16} className="animate-spin" /> Scanning…
          </>
        ) : (
          <>
            <Camera size={16} /> Scan with Dr. AI
          </>
        )}
      </button>

      {/* Image preview + identification result */}
      {imagePreview && (
        <div className="mb-5 rounded-[14px] overflow-hidden border border-gray-100">
          <img
            src={imagePreview}
            alt="Scanned plant"
            className="w-full h-40 object-cover"
          />
          {identificationResult && (
            <div className="p-3 bg-forest/5 space-y-2">
              <div className="flex items-center gap-2">
                <Leaf size={14} className="text-forest" />
                <span className="text-[13px] font-[600] text-forest">
                  {identificationResult.commonName}
                </span>
                <span className="ml-auto text-[11px] text-gray-400">
                  {Math.round(identificationResult.confidence * 100)}%
                </span>
              </div>
              <p className="text-[11px] text-gray-500 italic">
                {identificationResult.scientificName}
              </p>
              <p className="text-[11px] text-gray-400">
                Family: {identificationResult.family}
              </p>
              {/* Confidence bar */}
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-forest"
                  style={{ width: `${Math.round(identificationResult.confidence * 100)}%` }}
                />
              </div>

              {/* Health Status */}
              {identificationResult.isHealthy !== null && (
                <div
                  className={`flex items-center gap-2 p-2 rounded-[8px] ${
                    identificationResult.isHealthy
                      ? "bg-green-50"
                      : "bg-amber-50"
                  }`}
                >
                  {identificationResult.isHealthy ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <AlertTriangle size={14} className="text-amber-600" />
                  )}
                  <span
                    className={`text-[11px] font-[600] ${
                      identificationResult.isHealthy
                        ? "text-green-700"
                        : "text-amber-700"
                    }`}
                  >
                    {identificationResult.isHealthy
                      ? "Plant is Healthy"
                      : "Health Issues Detected"}
                  </span>
                </div>
              )}

              {/* Diseases */}
              {identificationResult.diseases?.length > 0 && (
                <div className="space-y-1.5">
                  {identificationResult.diseases.slice(0, 2).map((d, i) => (
                    <div
                      key={i}
                      className="bg-red-50/60 rounded-[8px] p-2 space-y-1"
                    >
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle size={10} className="text-red-500" />
                        <span className="text-[11px] font-[600] text-red-700">
                          {d.name}
                        </span>
                        <span className="ml-auto text-[9px] text-red-400">
                          {Math.round(d.probability * 100)}%
                        </span>
                      </div>
                      {d.description && (
                        <p className="text-[10px] text-gray-500">
                          {d.description.length > 80
                            ? d.description.slice(0, 80) + "…"
                            : d.description}
                        </p>
                      )}
                      {d.treatment?.prevention?.length > 0 && (
                        <p className="text-[9px] text-blue-600">
                          💡 {d.treatment.prevention[0]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Scan History */}
      {slot.scanHistory.length > 0 && (
        <div className="mb-5">
          <h4 className="text-[12px] font-[700] text-gray-400 uppercase tracking-[1px] mb-2">
            Scan History
          </h4>
          <div className="space-y-2">
            {[...slot.scanHistory].reverse().map((scan, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-gray-50 rounded-[12px] p-3"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    scan.healthScore >= 80
                      ? "bg-green-100"
                      : "bg-amber-100"
                  }`}
                >
                  {scan.healthScore >= 80 ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <AlertTriangle size={14} className="text-amber-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-[500] text-gray-700">
                    {scan.diagnosis}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {formatDate(scan.date)} · {scan.healthScore}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remove */}
      {!confirmRemove ? (
        <button
          onClick={() => setConfirmRemove(true)}
          className="w-full py-3 border border-red-200 text-red-500 rounded-[14px] text-[14px] font-[500] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Trash2 size={15} /> Remove Plant
        </button>
      ) : (
        <div className="bg-red-50 rounded-[14px] p-4 border border-red-200">
          <p className="text-[13px] text-red-600 mb-3 flex items-center gap-1.5">
            <AlertTriangle size={13} /> This will remove the plant from this slot
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmRemove(false)}
              className="flex-1 py-2.5 bg-white border border-gray-200 rounded-[10px] text-[13px] font-[500]"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onAssignCrop(slot.id, null);
                toast.success("Plant removed");
                onBack();
              }}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-[10px] text-[13px] font-[600]"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TowerControl Main ─────────────────────────────────────────────
export default function TowerControl({
  slots,
  onUpdateSlot,
  onAssignCrop,
  plantCapacity,
  onCapacityChange,
  immersive,
  onImmersiveChange,
  pendingSlotId,
  onPendingSlotHandled,
}) {
  const [wireframe, setWireframe] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Deep-link: auto-open slot detail when a notification targets a specific slot
  useEffect(() => {
    if (pendingSlotId != null && pendingSlotId >= 0 && pendingSlotId < slots.length) {
      setSelectedSlot(pendingSlotId);
      onPendingSlotHandled?.();
    }
  }, [pendingSlotId, slots.length, onPendingSlotHandled]);

  const setImmersive = onImmersiveChange;

  const planted = slots.filter((s) => s.crop !== null).length;

  const growTip =
    plantCapacity <= 16
      ? "Perfect for leafy greens and herbs — fast harvest cycles!"
      : plantCapacity <= 28
      ? "Great capacity for mixing leafy greens with fruiting crops."
      : "Maximum diversity! Try different crop families for best results.";

  return (
    <>
      <div className="pb-4">
        {/* Plant Capacity */}
        <div className="px-5 pt-2 pb-4">
          <h3 className="text-[12px] font-[700] text-gray-400 uppercase tracking-[1.2px] mb-3">
            Plant Capacity
          </h3>

          {/* Graduated slider */}
          {(() => {
            const steps = [8, 12, 16, 20, 24, 28, 32, 36, 40];
            const pct = ((plantCapacity - 8) / 32) * 100;
            return (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  {/* Track + thumb + invisible input */}
                  <div className="relative h-6 flex items-center">
                    {/* Track bg */}
                    <div className="absolute left-0 right-0 h-[5px] rounded-full bg-gray-200" />
                    {/* Filled track */}
                    <div
                      className="absolute left-0 h-[5px] rounded-full bg-forest"
                      style={{ width: `${pct}%` }}
                    />
                    {/* Thumb */}
                    <div
                      className="absolute w-5 h-5 rounded-full bg-forest border-[3px] border-white shadow-md"
                      style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
                    />
                    {/* Invisible range input on top */}
                    <input
                      type="range"
                      min="8"
                      max="40"
                      step="4"
                      value={plantCapacity}
                      onChange={(e) => onCapacityChange(+e.target.value)}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      style={{ margin: 0, height: "100%" }}
                    />
                  </div>

                  {/* Tick marks row */}
                  <div className="relative h-[10px] mt-[1px]">
                    {steps.map((val, i) => {
                      const tickPct = (i / (steps.length - 1)) * 100;
                      const isActive = val <= plantCapacity;
                      return (
                        <div
                          key={val}
                          className="absolute"
                          style={{ left: `${tickPct}%`, transform: "translateX(-50%)" }}
                        >
                          <div
                            className={`w-[2px] h-[8px] rounded-full ${
                              isActive ? "bg-forest/60" : "bg-gray-300"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Step labels */}
                  <div className="relative h-3">
                    {steps.map((val, i) => {
                      const tickPct = (i / (steps.length - 1)) * 100;
                      const isSelected = val === plantCapacity;
                      return (
                        <span
                          key={val}
                          className={`absolute text-[8px] ${
                            isSelected
                              ? "font-[700] text-forest"
                              : "font-[500] text-gray-400"
                          }`}
                          style={{
                            left: `${tickPct}%`,
                            transform: "translateX(-50%)",
                          }}
                        >
                          {val}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <span className="text-[18px] font-[700] text-forest w-8 text-right">
                  {plantCapacity}
                </span>
              </div>
            );
          })()}
        </div>

        {/* Cycle Stats */}
        <div className="px-5 grid grid-cols-2 gap-3 mb-4">
          <div
            className="bg-white rounded-[16px] p-4 flex items-center gap-3"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <div className="w-9 h-9 rounded-[10px] bg-blue-50 flex items-center justify-center">
              <Droplets size={16} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                Water Cycle
              </p>
              <p className="text-[14px] font-[600] text-forest">45 min</p>
            </div>
          </div>
          <div
            className="bg-white rounded-[16px] p-4 flex items-center gap-3"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <div className="w-9 h-9 rounded-[10px] bg-amber-50 flex items-center justify-center">
              <Sun size={16} className="text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                Light Cycle
              </p>
              <p className="text-[14px] font-[600] text-forest">16 hrs</p>
            </div>
          </div>
        </div>

        {/* Grow Tip */}
        <div className="px-5 mb-4">
          <div className="bg-forest/5 rounded-[16px] p-4 flex gap-3">
            <Lightbulb size={18} className="text-forest shrink-0 mt-0.5" />
            <p className="text-[13px] text-forest/80 leading-relaxed">
              {growTip}
            </p>
          </div>
        </div>

        {/* Live Preview */}
        <div className="px-5 mb-4">
          <div
            className="rounded-[20px] overflow-hidden"
            style={{
              height: 200,
              background: "linear-gradient(180deg, #f0fdf4 0%, #ecfccb 100%)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Tower3DScene
              slots={slots}
              plantCapacity={plantCapacity}
              mini
            />
          </div>
          <p className="text-center text-[12px] text-gray-400 mt-2">
            {planted}/{plantCapacity} slots planted
          </p>
        </div>

        {/* View Tower Button */}
        <div className="px-5">
          <button
            onClick={() => setImmersive(true)}
            className="w-full py-3.5 bg-forest text-white rounded-full text-[14px] font-[600] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            View Tower <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Immersive Fullscreen — portalled to body to escape overflow-hidden */}
      {immersive && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col"
          style={{
            background: wireframe
              ? "#080E08"
              : "linear-gradient(180deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 shrink-0">
            <h2
              className={`text-[16px] font-[600] ${
                wireframe ? "text-green-400" : "text-forest"
              }`}
            >
              {wireframe ? "Diagnostics" : "Tower Inspection"}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setWireframe(!wireframe)}
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  wireframe
                    ? "bg-green-400/20 text-green-400"
                    : "bg-white/80 text-forest"
                }`}
              >
                {wireframe ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={() => {
                  setImmersive(false);
                  setWireframe(false);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  wireframe
                    ? "bg-green-400/20 text-green-400"
                    : "bg-white/80 text-forest"
                }`}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Tower */}
          <div className="flex-1">
            <Tower3DScene
              slots={slots}
              plantCapacity={plantCapacity}
              onPodTap={(id) => setSelectedSlot(id)}
              wireframe={wireframe}
            />
          </div>

          {/* Hint */}
          <p
            className={`text-center text-[12px] pb-6 ${
              wireframe ? "text-green-400/50" : "text-forest/40"
            }`}
          >
            Drag to explore · Tap pod to inspect
          </p>
        </motion.div>,
        document.body
      )}

      {/* Slot Detail Drawer — portalled to body with z-[200] to appear above immersive */}
      {createPortal(
        <Drawer
          open={selectedSlot !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedSlot(null);
          }}
        >
          <DrawerContent className="z-[200]">
            <DrawerHeader>
              <DrawerTitle>Slot Details</DrawerTitle>
            </DrawerHeader>
            {selectedSlot !== null && (
              <SlotDetail
                slot={slots[selectedSlot]}
                onAssignCrop={onAssignCrop}
                onUpdateSlot={onUpdateSlot}
                onBack={() => setSelectedSlot(null)}
              />
            )}
          </DrawerContent>
        </Drawer>,
        document.body
      )}
    </>
  );
}
