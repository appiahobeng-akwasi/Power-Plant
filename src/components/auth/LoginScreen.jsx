import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginScreen({ onNavigate }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      // Auth state change listener will handle navigation
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-[340px]"
    >
      {/* Back button */}
      <button
        onClick={() => onNavigate("welcome")}
        className="flex items-center gap-1.5 text-white/70 mb-6 active:scale-95 transition-transform"
      >
        <ArrowLeft size={18} />
        <span className="text-[13px] font-[500]">Back</span>
      </button>

      {/* Card */}
      <div className="bg-white rounded-[24px] p-6 shadow-xl">
        <h2 className="text-[20px] font-[700] text-forest mb-1">Welcome Back</h2>
        <p className="text-[13px] text-gray-400 mb-5">
          Sign in to your tower
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-[600] text-gray-500 uppercase tracking-wider block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-[12px] bg-gray-50 border border-gray-100 text-[14px] text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-[11px] font-[600] text-gray-500 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full px-4 py-3 rounded-[12px] bg-gray-50 border border-gray-100 text-[14px] text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10 transition-all"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[12px] text-alert-pink font-[500]"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full bg-forest text-white text-[14px] font-[600] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-[12px] text-gray-400 mt-4">
          Don't have an account?{" "}
          <button
            onClick={() => onNavigate("signup")}
            className="text-forest font-[600]"
          >
            Create one
          </button>
        </p>
      </div>
    </motion.div>
  );
}
