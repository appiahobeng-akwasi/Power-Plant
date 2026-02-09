import React, { useState } from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const AVATAR_OPTIONS = [
  "🌱", "🌿", "🍀", "🌻", "🌺", "🌸",
  "🌵", "🌴", "🍃", "🌾", "🪴", "🌳",
];

export default function PersonalizeScreen() {
  const { saveProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [towerName, setTowerName] = useState("");
  const [avatar, setAvatar] = useState("🌱");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    try {
      await saveProfile({
        display_name: displayName.trim(),
        tower_name: towerName.trim() || "My Tower",
        avatar,
      });
      // Profile save will trigger re-render in App.jsx via AuthContext
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-[340px]"
    >
      <div className="bg-white rounded-[24px] p-6 shadow-xl">
        <div className="text-center mb-5">
          <motion.span
            className="text-[48px] block mb-2"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {avatar}
          </motion.span>
          <h2 className="text-[20px] font-[700] text-forest">Set Up Your Tower</h2>
          <p className="text-[13px] text-gray-400">
            Personalize your growing experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-[600] text-gray-500 uppercase tracking-wider block mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="What should we call you?"
              className="w-full px-4 py-3 rounded-[12px] bg-gray-50 border border-gray-100 text-[14px] text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="text-[11px] font-[600] text-gray-500 uppercase tracking-wider block mb-1.5">
              Tower Name
            </label>
            <input
              type="text"
              value={towerName}
              onChange={(e) => setTowerName(e.target.value)}
              placeholder="My Tower"
              className="w-full px-4 py-3 rounded-[12px] bg-gray-50 border border-gray-100 text-[14px] text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-[600] text-gray-500 uppercase tracking-wider block mb-1.5">
              Choose Your Avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`w-full aspect-square rounded-[12px] text-[24px] flex items-center justify-center transition-all active:scale-90 ${
                    avatar === emoji
                      ? "bg-forest/10 border-2 border-forest scale-110"
                      : "bg-gray-50 border border-gray-100 hover:bg-gray-100"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[12px] text-alert-pink font-[500]"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full bg-forest text-white text-[14px] font-[600] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Start Growing 🌱"
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
