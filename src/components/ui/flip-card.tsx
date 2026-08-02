import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  containerClassName?: string;
  isFlipped?: boolean;
  onFlip?: () => void;
  triggerOnHover?: boolean;
}

export function FlipCard({
  front,
  back,
  className,
  containerClassName,
  isFlipped: externalFlipped,
  onFlip,
  triggerOnHover = true,
}: FlipCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasHoverSupport, setHasHoverSupport] = useState(false);

  // Detect hover support (desktops vs mobile touch devices)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasHoverSupport(window.matchMedia("(hover: hover)").matches);
    }
  }, []);

  const shouldHoverFlip = triggerOnHover && hasHoverSupport && isHovered;
  const isFlipped = externalFlipped !== undefined ? externalFlipped : (internalFlipped || shouldHoverFlip);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFlip) {
      onFlip();
    } else {
      setInternalFlipped((prev) => !prev);
    }
  };

  const handleMouseEnter = () => {
    if (hasHoverSupport && triggerOnHover) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hasHoverSupport && triggerOnHover) setIsHovered(false);
  };

  return (
    <div
      className={cn("perspective-[1200px] w-full select-none cursor-pointer group touch-manipulation", containerClassName)}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          "relative w-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d] [-webkit-transform-style:preserve-3d]",
          isFlipped ? "[transform:rotateY(180deg)] [-webkit-transform:rotateY(180deg)]" : "",
          className
        )}
      >
        {/* Front Face */}
        <div className="w-full h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden] rounded-[2px] overflow-hidden">
          {front}
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 w-full h-full [transform:rotateY(180deg)] [-webkit-transform:rotateY(180deg)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] rounded-[2px] overflow-hidden">
          {back}
        </div>
      </div>
    </div>
  );
}
