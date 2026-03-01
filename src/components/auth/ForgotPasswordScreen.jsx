import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function ForgotPasswordScreen({ onNavigate }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong");
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
        onClick={() => onNavigate("login")}
        className="flex items-center gap-1.5 text-white/70 mb-6 active:scale-95 transition-transform"
      >
        <ArrowLeft size={18} />
        <span className="text-[13px] font-[500]">Back</span>
      </button>

      <div className="bg-white rounded-[24px] p-6 shadow-xl">
        {sent ? (
          /* Success state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
              <MailCheck className="w-7 h-7 text-forest" />
            </div>
            <h2 className="text-[20px] font-[700] text-forest mb-2">Check your email</h2>
            <p className="text-[13px] text-gray-400 leading-relaxed mb-6">
              We sent a reset link to <span className="font-[600] text-gray-600">{email}</span>.
              Click it to set a new password.
            </p>
            <button
              onClick={() => onNavigate("login")}
              className="w-full py-3.5 rounded-full bg-forest text-white text-[14px] font-[600] active:scale-[0.98] transition-all"
            >
              Back to Sign In
            </button>
          </motion.div>
        ) : (
          /* Form state */
          <>
            <h2 className="text-[20px] font-[700] text-forest mb-1">Reset Password</h2>
            <p className="text-[13px] text-gray-400 mb-5">
              Enter your email and we'll send you a reset link.
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
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
}
