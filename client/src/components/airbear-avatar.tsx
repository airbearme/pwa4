import { cn } from "@/lib/utils";
import RickshawWheel from "./airbear-wheel";

interface AirbearAvatarProps {
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-20 h-20",
};

export default function AirbearAvatar({ size = "md", showBadge = true, className }: AirbearAvatarProps) {
  return (
    <div
      className={cn(
        "relative rounded-full bg-gradient-to-br from-emerald-500 via-amber-400 to-lime-300 shadow-lg shadow-emerald-500/30 border-2 border-white/60 overflow-hidden hover-lift",
        sizeMap[size],
        className
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
      <img
        src="/airbear-mascot.png"
        alt="AirBear mascot"
        className="w-full h-full object-cover"
      />

      {/* Mini rickshaw energy ring */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
        <RickshawWheel size={size === "lg" ? "md" : "sm"} animated glowing effectType="solar" />
      </div>

      {showBadge && (
        <div className="absolute -top-2 -right-2 bg-white rounded-full px-2 py-1 text-[10px] font-semibold text-emerald-600 shadow-md border border-emerald-100">
          solar
        </div>
      )}
    </div>
  );
}
