import React from "react";
import { motion } from "motion/react";
import { Leaf, Bell } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";

export default function TopBar({ onAvatarClick, onBellClick }) {
  const { profile } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <header className="flex items-center justify-between px-5 py-3 bg-white shrink-0">
      <div className="flex items-center gap-2">
        <Leaf className="w-5 h-5 text-forest" strokeWidth={2.5} />
        <span className="text-[14px] font-[700] text-forest tracking-[1.2px] uppercase">
          Power Plant
        </span>
      </div>
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          onClick={onBellClick}
          className="relative w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center active:scale-95 transition-transform"
        >
          {unreadCount > 0 ? (
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 4 }}
            >
              <Bell className="w-[18px] h-[18px] text-forest" strokeWidth={2} />
            </motion.div>
          ) : (
            <Bell className="w-[18px] h-[18px] text-gray-400" strokeWidth={2} />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full bg-red-500 flex items-center justify-center px-1">
              <span className="text-[9px] font-[700] text-white leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </button>

        {/* Avatar */}
        <button
          onClick={onAvatarClick}
          className="w-9 h-9 rounded-full bg-sage flex items-center justify-center active:scale-95 transition-transform"
        >
          <span className="text-[16px]">{profile?.avatar || "🌱"}</span>
        </button>
      </div>
    </header>
  );
}
