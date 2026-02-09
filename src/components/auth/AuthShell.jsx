import React from "react";
import { motion } from "motion/react";

const FLOATING_EMOJIS = ["🌱", "🌿", "🍃", "🌻", "🪴", "🌾"];

export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-gray-200/60 flex items-center justify-center">
      <div
        className="w-full max-w-[430px] h-screen max-h-[932px] rounded-none sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative"
        style={{
          background: "linear-gradient(160deg, #2C5530 0%, #3E7042 40%, #8FA89B 100%)",
        }}
      >
        {/* Floating plant emojis */}
        {FLOATING_EMOJIS.map((emoji, i) => (
          <motion.span
            key={i}
            className="absolute text-[20px] opacity-20 pointer-events-none select-none"
            style={{
              left: `${12 + i * 15}%`,
              top: `${10 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -12, 0],
              rotate: [0, 8, -8, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            {emoji}
          </motion.span>
        ))}

        {/* Content area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
