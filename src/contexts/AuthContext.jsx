import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Fetch profile — standalone function, no hooks dependency
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
    return data || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(null);
  const initDone = useRef(false);

  // Initialize auth state
  useEffect(() => {
    // Guard against StrictMode double-mount
    if (initDone.current) return;
    initDone.current = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        userRef.current = session.user;
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        userRef.current = session.user;
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          const p = await fetchProfile(session.user.id);
          setProfile(p);
        }
      } else {
        setUser(null);
        userRef.current = null;
        setProfile(null);
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

  // Sign out
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    userRef.current = null;
    setProfile(null);
  }

  // Save / update profile (called during onboarding personalize step)
  async function saveProfile({ display_name, tower_name, avatar }) {
    const currentUser = userRef.current;
    if (!currentUser) throw new Error("Not authenticated");

    // Upsert with retry to handle transient AbortErrors
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { error } = await supabase.from("profiles").upsert({
          id: currentUser.id,
          display_name,
          tower_name,
          avatar,
        });

        if (error) throw error;

        // Success — now fetch the profile
        const p = await fetchProfile(currentUser.id);
        setProfile(p);
        return p;
      } catch (err) {
        lastError = err;
        if (err?.name === "AbortError") {
          // Wait a beat and retry
          await new Promise((r) => setTimeout(r, 300));
          continue;
        }
        throw err; // Non-abort errors fail immediately
      }
    }
    throw lastError;
  }

  const needsOnboarding = !!user && !profile;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        needsOnboarding,
        signUp,
        signIn,
        signOut,
        saveProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
