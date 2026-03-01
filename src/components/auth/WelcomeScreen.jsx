import React, { useState } from "react";
import { motion } from "motion/react";
import { Leaf } from "lucide-react";
import SocialAuthButtons from "./SocialAuthButtons";

export default function WelcomeScreen({ onNavigate }) {
  const [oauthError, setOauthError] = useState("");

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
      <p className="text-[14px] font-[300] text-white/70 mb-10">
        Grow smarter. Grow greener.
      </p>

      {/* Social auth buttons */}
      <div className="w-full max-w-[300px] mb-5">
        <SocialAuthButtons onError={setOauthError} />
        {oauthError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12px] text-red-300 font-[500] mt-2 text-center"
          >
            {oauthError}
          </motion.p>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 w-full max-w-[300px] mb-5">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-[12px] text-white/50 font-[500]">or</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      {/* Email auth buttons */}
      <div className="w-full space-y-3 max-w-[300px]">
        <button
          onClick={() => onNavigate("signup")}
          className="w-full py-3.5 rounded-full bg-white text-forest text-[14px] font-[600] active:scale-[0.98] transition-transform shadow-lg"
        >
          Sign up with Email
        </button>
        <button
          onClick={() => onNavigate("login")}
          className="w-full py-3.5 rounded-full bg-white/10 text-white text-[14px] font-[600] border border-white/20 active:scale-[0.98] transition-transform backdrop-blur-sm"
        >
          Sign in with Email
        </button>
      </div>
    </motion.div>
  );
}
