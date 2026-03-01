import React, { useMemo } from "react";
import { motion } from "motion/react";

const EMOJIS = ["🎉", "🌱", "✨", "🌿", "⭐", "🏆", "🌸", "💚", "🎊", "🪴"];
const COUNT = 28;

export default function WelcomeConfetti() {
  const particles = useMemo(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      x: 2 + (i / COUNT) * 96,             // spread evenly with jitter
      xDrift: (Math.random() - 0.5) * 120,  // horizontal drift while falling
      delay: Math.random() * 1.2,
      duration: 2.2 + Math.random() * 1.4,
      size: 18 + Math.random() * 22,
      startRotate: Math.random() * 180,
      endRotate: Math.random() * 720 - 360,
    })),
  []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{
            y: -80,
            x: 0,
            opacity: 1,
            rotate: p.startRotate,
            scale: 0.6,
          }}
          animate={{
            y: "105vh",
            x: p.xDrift,
            opacity: [1, 1, 1, 0],
            rotate: p.endRotate,
            scale: [0.6, 1.1, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.2, 0.6, 0.8, 1],
            opacity: { times: [0, 0.6, 0.85, 1] },
          }}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: 0,
            fontSize: p.size,
            lineHeight: 1,
            display: "block",
            willChange: "transform",
          }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}
