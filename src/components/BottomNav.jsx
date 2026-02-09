import React from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

// ── Custom SVG Icons (Swedish-themed) ─────────────────────────────

function StugaIcon({ active }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M12 3L3 12h3v8h12v-8h3L12 3z"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.1 : 0}
      />
      <rect x="10" y="14" width="4" height="6" rx="0.5" />
    </svg>
  );
}

function DroppeIcon({ active }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M12 2C12 2 5 10 5 14a7 7 0 0014 0c0-4-7-12-7-12z"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.08 : 0}
      />
      {active && (
        <path d="M9.5 14a2.5 2.5 0 003 2.5" strokeWidth={1.5} />
      )}
    </svg>
  );
}

function GranIcon({ active }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Top tier */}
      <path
        d="M12 3L8 9h8L12 3z"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      {/* Mid tier */}
      <path
        d="M12 7L7 13h10L12 7z"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.1 : 0}
      />
      {/* Bottom tier */}
      <path
        d="M12 11L6 17h12L12 11z"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.08 : 0}
      />
      {/* Trunk */}
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

// ── Nav config ────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "home", label: "Hem", Icon: StugaIcon },
  { id: "lab", label: "Vatten", Icon: DroppeIcon },
  { id: "tower", label: "Torn", Icon: GranIcon },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <div className="relative shrink-0">
      {/* Dr. Lagom FAB */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => onTabChange("ai")}
        className={`absolute -top-14 right-5 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors z-10 ${
          activeTab === "ai"
            ? "bg-forest text-white"
            : "bg-white text-forest border border-black/5"
        }`}
      >
        <Sparkles size={20} />
      </motion.button>

      {/* Nav bar */}
      <nav className="bg-white/95 backdrop-blur-sm border-t border-black/[0.04] py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-around items-center">
          {NAV_ITEMS.map(({ id, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`flex flex-col items-center gap-1 px-5 py-1 transition-colors ${
                  isActive ? "text-forest" : "text-gray-300"
                }`}
              >
                <Icon active={isActive} />
                {isActive ? (
                  <motion.span
                    layoutId="nav-dot"
                    className="w-[4px] h-[4px] rounded-full bg-forest"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : (
                  <span className="w-[4px] h-[4px]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
