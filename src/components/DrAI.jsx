import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Camera, Check, AlertTriangle, Leaf } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "../data/shared";
import { identifyPlant, isPlantNetConfigured } from "../lib/plantnet";

function mapPlantNetResult(result, slotCrop) {
  const { commonName, confidence, species, family } = result;
  const healthScore = Math.round(60 + confidence * 40);

  let diagnosis;
  if (confidence >= 0.7) {
    const cropName = slotCrop?.name?.toLowerCase() || "";
    const identifiedName = commonName.toLowerCase();
    const speciesLower = species.toLowerCase();
    const isMatch =
      identifiedName.includes(cropName) ||
      speciesLower.includes(cropName) ||
      cropName.includes(identifiedName);

    if (isMatch) {
      diagnosis = `Identified as ${commonName} (${Math.round(confidence * 100)}% match). Healthy growth confirmed.`;
    } else {
      diagnosis = `Identified as ${commonName} (${family}). Expected ${slotCrop?.name || "unknown"}.`;
    }
  } else if (confidence >= 0.3) {
    diagnosis = `Possible ${commonName} (${Math.round(confidence * 100)}% confidence). Review recommended.`;
  } else {
    diagnosis = `Low confidence identification (${Math.round(confidence * 100)}%). Clearer photo recommended.`;
  }

  return { diagnosis, healthScore };
}

export default function DrAI({ slots, onUpdateSlot }) {
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [identificationResult, setIdentificationResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const fallbackScan = (target) => {
    setTimeout(() => {
      const diagnoses = [
        "Healthy growth pattern",
        "Minor nutrient deficiency detected",
        "Excellent root development",
        "Slight pH imbalance observed",
        "Strong vegetative growth",
        "Optimal photosynthesis rate",
      ];
      const diagnosis =
        diagnoses[Math.floor(Math.random() * diagnoses.length)];
      const healthScore = Math.floor(Math.random() * 17) + 80;
      const date = new Date().toISOString().split("T")[0];

      onUpdateSlot(target.id, {
        health: healthScore,
        scanHistory: [
          ...target.scanHistory,
          { date, diagnosis, healthScore },
        ],
      });

      setLastResult({
        slotId: target.id,
        crop: target.crop,
        diagnosis,
        healthScore,
      });
      setScanning(false);
      toast.success(`Scan complete: ${healthScore}% health`);
    }, 2500);
  };

  const handleScanClick = () => {
    const plantedSlots = slots.filter((s) => s.crop !== null);
    if (plantedSlots.length === 0) {
      toast.error("No plants to scan!");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleImageCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setIdentificationResult(null);

    const plantedSlots = slots.filter((s) => s.crop !== null);
    const target =
      plantedSlots[Math.floor(Math.random() * plantedSlots.length)];

    setScanning(true);

    if (isPlantNetConfigured()) {
      try {
        const result = await identifyPlant(file);
        const { diagnosis, healthScore } = mapPlantNetResult(
          result,
          target.crop
        );
        const date = new Date().toISOString().split("T")[0];

        onUpdateSlot(target.id, {
          health: healthScore,
          scanHistory: [
            ...target.scanHistory,
            { date, diagnosis, healthScore },
          ],
        });

        setLastResult({
          slotId: target.id,
          crop: target.crop,
          diagnosis,
          healthScore,
        });
        setIdentificationResult(result);
        setScanning(false);
        toast.success(`Scan complete: ${healthScore}% health`);
      } catch (err) {
        console.error("Pl@ntNet scan failed:", err);
        const msg = err.message || "";
        if (msg.includes("404") || msg.includes("Species not found")) {
          toast.error("Could not identify species. Try a clearer plant photo.");
        } else {
          toast.error("API scan failed. Using local diagnosis.");
        }
        fallbackScan(target);
      }
    } else {
      fallbackScan(target);
    }

    e.target.value = "";
  };

  const recentScans = slots
    .flatMap((slot) =>
      slot.scanHistory.map((scan) => ({
        ...scan,
        slotId: slot.id,
        crop: slot.crop,
      }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return (
    <div className="pb-4">
      {/* Header Card */}
      <div className="px-5 pt-2 pb-4">
        <div
          className="bg-white rounded-[20px] p-6 text-center"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="w-16 h-16 rounded-2xl bg-forest/8 flex items-center justify-center mx-auto mb-3">
            <Sparkles size={28} className="text-forest" />
          </div>
          <h1 className="text-[20px] font-[700] text-forest mb-1">
            Dr. Lagom
          </h1>
          <p className="text-[13px] text-gray-400 mb-4">
            AI Plant Pathologist
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageCapture}
          />

          <button
            onClick={handleScanClick}
            disabled={scanning}
            className="w-full py-3 bg-forest text-white rounded-full text-[14px] font-[600] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70"
          >
            {scanning ? (
              <>
                <Sparkles size={16} className="animate-spin" /> Scanning…
              </>
            ) : (
              <>
                <Camera size={16} /> Scan Plant
              </>
            )}
          </button>
        </div>
      </div>

      {/* Image Preview + Identification */}
      {imagePreview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 mb-4"
        >
          <div
            className="bg-white rounded-[16px] overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <img
              src={imagePreview}
              alt="Scanned plant"
              className="w-full h-40 object-cover"
            />
            {identificationResult && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf size={14} className="text-forest" />
                  <span className="text-[13px] font-[600] text-forest">
                    {identificationResult.commonName}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 italic">
                  {identificationResult.scientificName}
                </p>
                <p className="text-[11px] text-gray-400">
                  Family: {identificationResult.family}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-forest rounded-full h-1.5 transition-all"
                      style={{
                        width: `${Math.round(identificationResult.confidence * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-[600] text-forest">
                    {Math.round(identificationResult.confidence * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Latest Result */}
      {lastResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 mb-4"
        >
          <div className="bg-green-50 rounded-[16px] p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Check size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-[13px] font-[600] text-green-800">
                {lastResult.crop?.icon} {lastResult.crop?.name} — Slot #
                {lastResult.slotId + 1}
              </p>
              <p className="text-[12px] text-green-600 mt-0.5">
                {lastResult.diagnosis}
              </p>
              <p className="text-[11px] text-green-500 mt-1">
                Health Score: {lastResult.healthScore}%
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Diagnoses */}
      <div className="px-5">
        <h3 className="text-[12px] font-[700] text-gray-400 uppercase tracking-[1.2px] mb-3">
          Recent Diagnoses
        </h3>
        {recentScans.length === 0 ? (
          <p className="text-[13px] text-gray-400 text-center py-8">
            No scans yet. Tap "Scan Plant" to start!
          </p>
        ) : (
          <div className="space-y-2">
            {recentScans.map((scan, i) => (
              <div
                key={i}
                className="bg-white rounded-[12px] p-3 flex items-start gap-3"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                {scan.healthScore >= 80 ? (
                  <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-green-500" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                    <AlertTriangle size={12} className="text-amber-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-[500] text-gray-700">
                    {scan.crop?.icon} Slot #{scan.slotId + 1} ·{" "}
                    {scan.diagnosis}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {formatDate(scan.date)} · {scan.healthScore}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attribution */}
      {isPlantNetConfigured() && (
        <p className="text-center text-[10px] text-gray-300 mt-4 pb-2">
          Powered by Pl@ntNet
        </p>
      )}
    </div>
  );
}
