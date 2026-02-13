import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Bell } from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";

// ── Helpers ──────────────────────────────────────────────────────

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function groupByDate(notifications) {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const groups = { Today: [], Yesterday: [], Earlier: [] };

  for (const n of notifications) {
    const date = n.createdAt.split("T")[0];
    if (date === today) groups.Today.push(n);
    else if (date === yesterday) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  }

  return groups;
}

const FILTER_LABELS = {
  all: "All",
  urgent: "Urgent",
  celebration: "Celebrations",
  reminder: "Reminders",
  social: "Social",
  tip: "Tips",
};

const BORDER_COLORS = {
  urgent: "border-l-red-500",
  celebration: "border-l-amber-400",
  reminder: "border-l-blue-500",
  social: "border-l-purple-500",
  tip: "border-l-green-500",
};

const ICON_BG = {
  urgent: "bg-red-50",
  celebration: "bg-amber-50",
  reminder: "bg-blue-50",
  social: "bg-purple-50",
  tip: "bg-green-50",
};

// ── NotificationCard ─────────────────────────────────────────────

function NotificationCard({ notification, index, onAction, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ delay: index * 0.04 }}
      className={`bg-white rounded-[14px] p-4 border-l-[4px] ${BORDER_COLORS[notification.type]} ${
        !notification.read ? "ring-1 ring-forest/5 bg-forest/[0.02]" : ""
      }`}
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-[10px] ${ICON_BG[notification.type]} flex items-center justify-center shrink-0`}
        >
          <span className="text-[18px]">{notification.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-0.5">
            <p className="text-[13px] font-[600] text-gray-800 leading-tight pr-2">
              {notification.title}
            </p>
            <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">
              {timeAgo(notification.createdAt)}
            </span>
          </div>
          <p className="text-[12px] text-gray-500 leading-relaxed mb-2.5">
            {notification.body}
          </p>
          <div className="flex items-center justify-between">
            <button
              onClick={onAction}
              className="bg-forest text-white rounded-full px-4 py-1.5 text-[11px] font-[600] active:scale-95 transition-transform"
            >
              {notification.ctaLabel}
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 text-gray-300 hover:text-gray-500 active:scale-90 transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── EmptyState ───────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <motion.span
        className="text-[48px] block mb-3"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        🌿
      </motion.span>
      <p className="text-[16px] font-[600] text-forest mb-1">All caught up!</p>
      <p className="text-[13px] text-gray-400">Your garden is looking great.</p>
    </motion.div>
  );
}

// ── NotificationCenter ───────────────────────────────────────────

export default function NotificationCenter({ onClose }) {
  const { notifications, unreadCount, markAllRead, dismiss, executeAction } =
    useNotifications();
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const grouped = groupByDate(filtered);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-background"
    >
      {/* Inner phone frame */}
      <div className="min-h-screen bg-gray-200/60 flex items-center justify-center">
        <div className="w-full max-w-[430px] h-screen max-h-[932px] bg-background rounded-none sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-forest" />
              <h1 className="text-[18px] font-[700] text-forest">
                Notifications
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[12px] text-forest font-[500] active:opacity-70"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-hide bg-white border-b border-gray-100 shrink-0">
            {Object.entries(FILTER_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-[600] shrink-0 transition-colors ${
                  filter === key
                    ? "bg-forest text-white"
                    : "bg-gray-100 text-gray-500 active:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Notification list */}
          <main className="flex-1 overflow-y-auto px-5 pb-8">
            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <AnimatePresence mode="popLayout">
                {Object.entries(grouped).map(
                  ([groupLabel, items]) =>
                    items.length > 0 && (
                      <div key={groupLabel}>
                        <p className="text-[11px] font-[700] text-gray-400 uppercase tracking-[1.2px] mt-4 mb-2">
                          {groupLabel}
                        </p>
                        <div className="space-y-2">
                          {items.map((n, i) => (
                            <NotificationCard
                              key={n.id}
                              notification={n}
                              index={i}
                              onAction={() => executeAction(n)}
                              onDismiss={() => dismiss(n.sourceKey)}
                            />
                          ))}
                        </div>
                      </div>
                    )
                )}
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>
    </motion.div>
  );
}
