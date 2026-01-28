import { motion } from "framer-motion";
import React, { useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
  color: string;
}

const ParticleSystem = React.memo(function ParticleSystem() {
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

  // Memoize solar wind particles to prevent re-calculation on every render
  const solarWindParticles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: `solar-${i}`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: i * 0.8,
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
      {solarWindParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-amber-400 rounded-full opacity-80"
          style={{
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
});

export default ParticleSystem;
