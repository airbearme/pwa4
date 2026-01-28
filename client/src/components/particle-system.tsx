import { motion } from "framer-motion";
import { memo, useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
  color: string;
}

function ParticleSystem() {
  const particles = useMemo(() => {
    const colors = ["#10b981", "#84cc16", "#f59e0b", "#22c55e"];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, []);

  return (
    <div className="particle-system fixed inset-0 z-0 pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-60"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: particle.color,
          }}
          animate={{
            y: [-20, 20, -20],
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Solar wind particles */}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={`solar-${i}`}
          className="absolute w-1 h-1 bg-amber-400 rounded-full opacity-80"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// ⚡ Bolt: Memoize the component to prevent unnecessary re-renders from parent state changes.
// This is a purely presentational component that doesn't accept props,
// so it only needs to render once.
export default memo(ParticleSystem);
