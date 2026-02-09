import React from "react";
import { Leaf } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function TopBar({ onAvatarClick }) {
  const { profile } = useAuth();

  return (
    <header className="flex items-center justify-between px-5 py-3 bg-white shrink-0">
      <div className="flex items-center gap-2">
        <Leaf className="w-5 h-5 text-forest" strokeWidth={2.5} />
        <span className="text-[14px] font-[700] text-forest tracking-[1.2px] uppercase">
          Power Plant
        </span>
      </div>
      <button
        onClick={onAvatarClick}
        className="w-9 h-9 rounded-full bg-sage flex items-center justify-center active:scale-95 transition-transform"
      >
        <span className="text-[16px]">{profile?.avatar || "🌱"}</span>
      </button>
    </header>
  );
}
