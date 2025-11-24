import { motion } from "framer-motion";
import RickshawWheel from "./airbear-wheel";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = "md", 
  text = "Loading...", 
  className 
}: LoadingSpinnerProps) {
  const containerClass = cn(
    "flex flex-col items-center justify-center space-y-4",
    className
  );

  const wheelSize = size === "sm" ? "md" : size === "md" ? "lg" : "xl";

  return (
    <motion.div 
      className={containerClass}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-testid="loading-spinner"
    >
      {/* Multiple spinning wheels for extra effect */}
      <div className="relative">
        <RickshawWheel 
          size={wheelSize} 
          glowing 
          className="animate-wheel-spin" 
        />
        
        {/* Secondary wheel with different timing */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          <RickshawWheel 
            size={size} 
            className="opacity-50 border-emerald-400" 
          />
        </motion.div>
      </div>

      {/* Loading text with particle effect */}
      <motion.div 
        className="text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="text-muted-foreground font-medium">{text}</p>
        
        {/* Particle dots */}
        <div className="flex justify-center space-x-1 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5] 
              }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity,
                delay: i * 0.2 
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
