import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

const PROFILE_STORAGE_KEY = "powerplant_profile";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Read cached profile from localStorage
function getCachedProfile(userId) {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    // Only use cache if it belongs to this user
    if (cached && cached.id === userId) return cached;
    return null;
  } catch {
    return null;
  }
}

// Save profile to localStorage
function cacheProfile(profile) {
  try {
    if (profile) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  } catch {
    // localStorage not available — silently ignore
  }
}

// Fetch profile from Supabase, fall back to localStorage cache
async function fetchProfile(userId) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error);
    }

    if (data) {
      cacheProfile(data);
      return data;
    }

    // Supabase returned nothing — check localStorage cache
    return getCachedProfile(userId);
  } catch {
    // Network/Supabase error — fall back to cache
    return getCachedProfile(userId);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const userRef = useRef(null);
  const initDone = useRef(false);

  // Initialize auth state
  useEffect(() => {
    // Guard against StrictMode double-mount
    if (initDone.current) return;
    initDone.current = true;

    // Safety timeout — never stay on loading screen longer than 5s
    const timeout = setTimeout(() => setLoading(false), 5000);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout);
      if (session?.user) {
        setUser(session.user);
        userRef.current = session.user;
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      }
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeout);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
        setUser(session.user);
        userRef.current = session.user;
      } else if (session?.user) {
        setUser(session.user);
        userRef.current = session.user;
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          // Immediately restore cached profile so needsOnboarding never flickers true
          const cached = getCachedProfile(session.user.id);
          if (cached) setProfile(cached);
          // Then refresh from Supabase in the background
          const p = await fetchProfile(session.user.id);
          if (p) setProfile(p);
        }
      } else {
        setUser(null);
        userRef.current = null;
        setProfile(null);
        setPasswordRecovery(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email + password
  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  // Sign in with email + password
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  // Send password reset email
  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  }

  // Set a new password after recovery (called from ResetPasswordScreen)
  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    setPasswordRecovery(false);
    // Fetch profile so the app proceeds to the main screen
    if (userRef.current) {
      const p = await fetchProfile(userRef.current.id);
      setProfile(p);
    }
  }

  // Sign in with OAuth provider (google, apple, facebook)
  async function signInWithOAuth(provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  }

  // Sign out — always clear local state even if Supabase call fails
  async function signOut() {
    setUser(null);
    userRef.current = null;
    setProfile(null);
    cacheProfile(null); // clear localStorage cache
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Supabase signOut error:", err);
    }
  }

  // Save / update profile (called during onboarding personalize step)
  async function saveProfile({ display_name, tower_name, avatar }) {
    const currentUser = userRef.current;
    if (!currentUser) throw new Error("Not authenticated");

    // Build a local profile object as fallback
    const localProfile = {
      id: currentUser.id,
      display_name,
      tower_name: tower_name || "My Tower",
      avatar,
    };

    // Always cache + set locally so user can proceed
    cacheProfile(localProfile);

    // Try to save to Supabase too
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: currentUser.id,
        display_name,
        tower_name: tower_name || "My Tower",
        avatar,
      });

      if (error) {
        console.warn("Supabase profile upsert failed:", error.message);
      } else {
        // Success — fetch the persisted profile to get any server-side fields
        const p = await fetchProfile(currentUser.id);
        if (p) {
          cacheProfile(p);
          setProfile(p);
          return p;
        }
      }
    } catch (err) {
      console.warn("saveProfile Supabase error:", err.message);
    }

    // Either way, user proceeds with the local profile
    setProfile(localProfile);
    return localProfile;
  }

  const needsOnboarding = !!user && !profile && !passwordRecovery;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        needsOnboarding,
        passwordRecovery,
        signUp,
        signIn,
        signInWithOAuth,
        resetPassword,
        updatePassword,
        signOut,
        saveProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
