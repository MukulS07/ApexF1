import React from "react";
import { cn } from "@/lib/utils";

interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
  color?: string;
}

export const Ripple = React.memo(function Ripple({
  mainCircleSize = 200,
  mainCircleOpacity = 0.25,
  numCircles = 8,
  className,
  color = "var(--team-hex, #1c69d4)",
}: RippleProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 select-none overflow-hidden [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]",
        className
      )}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 80;
        const opacity = mainCircleOpacity - i * 0.028;
        const animationDelay = `${i * 0.2}s`;
        const borderStyle = i % 2 === 0 ? "solid" : "dashed";

        return (
          <div
            key={i}
            className="absolute rounded-full border shadow-2xl animate-ripple left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={
              {
                width: `${size}px`,
                height: `${size}px`,
                opacity: Math.max(opacity, 0.03),
                animationDelay,
                borderStyle,
                borderColor: color,
                backgroundColor: i === 0 ? `${color}15` : "transparent",
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
});
