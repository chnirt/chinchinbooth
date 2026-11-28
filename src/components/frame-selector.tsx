"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FRAMES } from "@/constants/assets";
import { preloadFrameLayout } from "@/lib/frame-utils";

interface FrameSelectorProps {
  selectedFrame: string | null;
  setSelectedFrame: (frameId: string | null) => void;
  className?: string;
  layoutType: number;
}

export function FrameSelector({
  selectedFrame,
  setSelectedFrame,
  className,
  layoutType = 4,
}: FrameSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectFrame = useCallback(
    async (frameId: string | null) => {
      setError(null);

      if (frameId === selectedFrame) {
        setSelectedFrame(null);
        return;
      }

      setIsLoading(true);
      try {
        await preloadFrameLayout(frameId, layoutType);
        setSelectedFrame(frameId);
      } catch (err) {
        setError("Failed to select frame. Please try again.");
        console.error("Frame selection error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [layoutType, selectedFrame, setSelectedFrame],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-medium text-gray-700">Frames</h3>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-2 text-xs text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto px-1 py-2">
        {FRAMES.map(({ id, name, layouts, isNew }) => {
          const isSelected = selectedFrame === id;

          // Lưu layout đã tìm
          const layout = layouts?.find((p) => p.count === layoutType);

          // Frame background
          const frameBackground = layout?.backgroundUrl ? (
            <div className="pointer-events-none absolute inset-0 z-0">
              <img
                src={layout.backgroundUrl}
                alt="Frame Background"
                loading="lazy"
                decoding="async"
                crossOrigin="anonymous"
              />
            </div>
          ) : null;

          // Frame overlay
          const frameOverlay = layout?.overlayUrl ? (
            <div className="pointer-events-none absolute inset-0 z-20">
              <img
                src={layout.overlayUrl}
                alt="Frame Overlay"
                loading="lazy"
                decoding="async"
                crossOrigin="anonymous"
              />
            </div>
          ) : null;

          return (
            <motion.button
              key={id}
              onClick={() => selectFrame(id)}
              disabled={isLoading}
              whileTap={{ scale: 0.95 }}
              initial={false}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-md bg-white ring-2 transition-all",
                isSelected ? "ring-primary shadow-sm" : "ring-gray-200",
                isLoading && "opacity-50",
                layoutType === 4
                  ? "aspect-[1/3] min-w-1/4"
                  : "aspect-[2/3] min-w-1/3",
              )}
            >
              {frameBackground}
              {frameOverlay}

              {isNew && (
                <img
                  className="absolute top-1 left-1 z-20 dark:invert"
                  src="/new.png"
                  alt="New"
                  loading="lazy"
                  width={20}
                  height={20}
                />
              )}

              {isSelected && (
                <div className="absolute top-1 right-1 z-30 rounded-full border border-gray-200 bg-white p-0.5">
                  <Check className="text-primary h-2 w-2" />
                </div>
              )}

              <div className="bg-opacity-60 relative z-30 mt-auto w-full truncate bg-black py-1 text-center text-xs font-semibold text-white">
                {name}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
