import React from "react";
import { motion } from "motion/react";
import { Leaf } from "lucide-react";

export default function WelcomeScreen({ onNavigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col items-center text-center"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-20 h-20 rounded-[24px] bg-white/15 backdrop-blur-sm flex items-center justify-center mb-6 border border-white/20"
      >
        <Leaf className="w-10 h-10 text-white" strokeWidth={2} />
      </motion.div>

      {/* Title */}
      <h1 className="text-[28px] font-[700] text-white tracking-[2px] uppercase mb-2">
        Power Plant
      </h1>
      <p className="text-[14px] font-[300] text-white/70 mb-12">
        Grow smarter. Grow greener.
      </p>

      {/* Buttons */}
      <div className="w-full space-y-3 max-w-[300px]">
        <button
          onClick={() => onNavigate("signup")}
          className="w-full py-3.5 rounded-full bg-white text-forest text-[14px] font-[600] active:scale-[0.98] transition-transform shadow-lg"
        >
          Get Started
        </button>
        <button
          onClick={() => onNavigate("login")}
          className="w-full py-3.5 rounded-full bg-white/10 text-white text-[14px] font-[600] border border-white/20 active:scale-[0.98] transition-transform backdrop-blur-sm"
        >
          I have an account
        </button>
      </div>
    </motion.div>
  );
}
