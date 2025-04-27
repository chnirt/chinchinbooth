"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FRAMES } from "@/constants/assets";
import { handleFrameSelection } from "@/lib/frame-utils";

interface FrameSelectorProps {
  selectedFrame: string | null;
  setSelectedFrame: (frameId: string | null) => void;
  setImageUrl: (url: string | null) => void;
  className?: string;
}

export function FrameSelector({
  selectedFrame,
  setSelectedFrame,
  setImageUrl,
  className,
}: FrameSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectFrame = useCallback(
    async (frameId: string | null) => {
      setError(null);
      setImageUrl(null);

      if (frameId === selectedFrame) {
        setSelectedFrame(null);
        return;
      }

      setIsLoading(true);
      try {
        await handleFrameSelection(frameId, setSelectedFrame);
      } catch (err) {
        setError("Failed to select frame. Please try again.");
        console.error("Frame selection error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedFrame, setSelectedFrame, setImageUrl],
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

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {FRAMES.map(({ id, name }) => {
          const isSelected = selectedFrame === id;

          return (
            <motion.button
              key={id}
              onClick={() => selectFrame(id)}
              disabled={isLoading}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative flex h-10 w-full flex-col items-center justify-center rounded-md border-2 transition-all",
                isSelected ? "border-primary shadow-sm" : "border-gray-200",
                isLoading && "opacity-50",
              )}
            >
              {isSelected && (
                <div className="absolute top-1 right-1 rounded-full border border-gray-200 bg-white p-0.5">
                  <Check className="h-2 w-2 text-primary" />
                </div>
              )}
              <span className="mt-1 text-xs font-medium text-gray-800">
                {name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
