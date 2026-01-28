import React from 'react';

interface AirbearWheelProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  glowing?: boolean;
  animated?: boolean;
  effectType?: 'solar' | 'eco' | string;
}

export const AirbearWheel: React.FC<AirbearWheelProps> = React.memo(({
  size = 'md',
  className = '',
  glowing = false,
  animated = false,
  effectType
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const glowClass = glowing ? 'shadow-lg shadow-primary/50' : '';

  return (
    <div className={`airbear-wheel ${sizeClasses[size]} ${glowClass} ${className} relative`}>
      <div className={`w-full h-full rounded-full bg-gradient-to-br from-primary/80 to-primary/40 border-2 border-primary/60 flex items-center justify-center ${animated ? 'animate-spin' : ''} opacity-80`}>
        {/* Wheel spokes */}
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-full bg-primary/70"
            style={{
              transform: `rotate(${i * 45}deg)`,
              transformOrigin: 'center'
            }}
          />
        ))}
        {/* Center hub with AirBear face */}
        <div className="w-2/3 h-2/3 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 border border-primary/50 flex items-center justify-center relative">
          <span className="text-xs font-bold text-primary">🐻</span>
          {/* Mini wheel effect */}
          <div className="absolute inset-1 rounded-full border border-primary/30 animate-pulse opacity-60"></div>
        </div>
        {/* Transparent overlay for wheel look */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-primary/10 to-transparent opacity-50"></div>
      </div>
      {/* Glowing effect */}
      {glowing && (
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-sm animate-pulse"></div>
      )}
    </div>
  );
});

export default AirbearWheel;
