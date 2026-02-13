import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { generateNotifications } from "../data/notifications";
import { deriveAchievements, deriveXp, getLevel } from "../data/shared";

const NotificationContext = createContext(null);

const STORAGE_KEY = "pp_notification_state";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable
  }
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider");
  return ctx;
}

export function NotificationProvider({ slots, rewardStats, labData, onAction, children }) {
  const [notifications, setNotifications] = useState([]);
  const persistedRef = useRef(loadState());

  const runEngine = useCallback(() => {
    const persisted = persistedRef.current;
    const raw = generateNotifications(slots, rewardStats, labData, persisted);

    // Filter out dismissed + expired
    const now = new Date().toISOString();
    const dismissed = persisted.dismissed || [];
    const readSet = persisted.read || [];

    const filtered = raw
      .filter((n) => !dismissed.includes(n.sourceKey))
      .filter((n) => !n.expiresAt || n.expiresAt > now)
      .map((n) => ({
        ...n,
        read: readSet.includes(n.sourceKey),
      }));

    setNotifications(filtered);

    // Snapshot current achievements + level for next engine run
    const achievements = deriveAchievements(slots, rewardStats);
    const earnedIds = achievements.filter((a) => a.earned).map((a) => a.id);
    const xp = deriveXp(slots, rewardStats);
    const level = getLevel(xp).level;

    const updated = {
      ...persisted,
      previousAchievements: earnedIds,
      previousLevel: level,
    };
    persistedRef.current = updated;
    saveState(updated);
  }, [slots, rewardStats, labData]);

  // Run on mount + when data changes
  useEffect(() => {
    runEngine();
  }, [runEngine]);

  // Run every 60 seconds
  useEffect(() => {
    const interval = setInterval(runEngine, 60000);
    return () => clearInterval(interval);
  }, [runEngine]);

  const unreadCount = notifications.filter((n) => !n.read && !n.dismissed).length;

  const markRead = useCallback((sourceKey) => {
    const persisted = persistedRef.current;
    const readSet = new Set(persisted.read || []);
    readSet.add(sourceKey);
    const updated = { ...persisted, read: Array.from(readSet) };
    persistedRef.current = updated;
    saveState(updated);
    setNotifications((prev) =>
      prev.map((n) => (n.sourceKey === sourceKey ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    const persisted = persistedRef.current;
    const allKeys = notifications.map((n) => n.sourceKey);
    const readSet = new Set([...(persisted.read || []), ...allKeys]);
    const updated = { ...persisted, read: Array.from(readSet) };
    persistedRef.current = updated;
    saveState(updated);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [notifications]);

  const dismiss = useCallback((sourceKey) => {
    const persisted = persistedRef.current;
    const dismissed = new Set(persisted.dismissed || []);
    dismissed.add(sourceKey);
    const updated = { ...persisted, dismissed: Array.from(dismissed) };
    persistedRef.current = updated;
    saveState(updated);
    setNotifications((prev) => prev.filter((n) => n.sourceKey !== sourceKey));
  }, []);

  const dismissAll = useCallback(() => {
    const persisted = persistedRef.current;
    const allKeys = notifications.map((n) => n.sourceKey);
    const dismissed = new Set([...(persisted.dismissed || []), ...allKeys]);
    const updated = { ...persisted, dismissed: Array.from(dismissed) };
    persistedRef.current = updated;
    saveState(updated);
    setNotifications([]);
  }, [notifications]);

  const executeAction = useCallback(
    (notification) => {
      markRead(notification.sourceKey);
      onAction(notification.action);
    },
    [onAction, markRead]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markRead,
        markAllRead,
        dismiss,
        dismissAll,
        executeAction,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
