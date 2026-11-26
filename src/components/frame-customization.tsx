"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { COLOR_PALETTE, GRADIENT_PRESETS } from "@/constants/styles";
import { cn } from "@/lib/utils";
import { FrameSelector } from "./frame-selector";

export type FrameTab = "solid" | "gradient" | "frames";

interface FrameCustomizationProps {
  activeTab: FrameTab;
  setActiveTab: (tab: FrameTab) => void;
  frameColor: string | null;
  selectedGradient: string | null;
  selectedFrame: string | null;
  layoutType: number;
  handleColorChange: (color: string) => void;
  handleGradientChange: (gradient: string) => void;
  handleFrameChange: (frameId: string | null) => void;
  setImageUrl: (url: string | null) => void;
}

export const FrameCustomization = memo(function FrameCustomization({
  activeTab,
  setActiveTab,
  frameColor,
  selectedGradient,
  selectedFrame,
  layoutType,
  handleColorChange,
  handleGradientChange,
  handleFrameChange,
  setImageUrl,
}: FrameCustomizationProps) {
  const t = useTranslations("HomePage");

  return (
    <>
      {/* Tabs for different customization options */}
      <motion.div
        className="animate-fade-in mb-4"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-wrap gap-1 rounded-2xl border border-white/85 bg-white/35 p-1">
          <button
            onClick={() => setActiveTab("frames")}
            aria-pressed={activeTab === "frames"}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-violet-600",
              activeTab === "frames"
                ? "text-primary bg-white/90 shadow-sm"
                : "text-violet-950/75 hover:bg-white/60",
            )}
          >
            {t("frames")}
          </button>
          <button
            onClick={() => setActiveTab("solid")}
            aria-pressed={activeTab === "solid"}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-violet-600",
              activeTab === "solid"
                ? "text-primary bg-white/90 shadow-sm"
                : "text-violet-950/75 hover:bg-white/60",
            )}
          >
            {t("solid_colors")}
          </button>
          <button
            onClick={() => setActiveTab("gradient")}
            aria-pressed={activeTab === "gradient"}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-violet-600",
              activeTab === "gradient"
                ? "text-primary bg-white/90 shadow-sm"
                : "text-violet-950/75 hover:bg-white/60",
            )}
          >
            {t("gradients")}
          </button>
        </div>
      </motion.div>

      {/* Content based on active tab */}
      <div className="mb-4">
        {activeTab === "solid" && (
          <div className="mb-3 grid grid-cols-6 gap-2">
            {COLOR_PALETTE.map((color) => {
              const isSelected = frameColor === color && !selectedGradient;
              return (
                <motion.button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  style={{ backgroundColor: color }}
                  className={cn(
                    "relative h-8 w-full rounded-md border-2 transition-all hover:shadow-sm",
                    isSelected ? "border-primary shadow-sm" : "border-gray-200",
                  )}
                  aria-label={`Select ${color}`}
                >
                  {isSelected && (
                    <div className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full border border-gray-200 bg-white">
                      <Check className="text-primary h-2 w-2" />
                    </div>
                  )}
                  <span className="sr-only">{color}</span>
                </motion.button>
              );
            })}
          </div>
        )}

        {activeTab === "gradient" && (
          <div className="grid grid-cols-2 gap-2">
            {GRADIENT_PRESETS.map((gradient) => {
              const isSelected = selectedGradient === gradient.value;
              return (
                <motion.button
                  key={gradient.name}
                  onClick={() => handleGradientChange(gradient.value)}
                  style={{ background: gradient.value }}
                  className={cn(
                    "relative h-10 w-full rounded-md border-2 transition-all hover:shadow-sm",
                    isSelected ? "border-primary shadow-sm" : "border-gray-200",
                  )}
                  aria-label={`Select ${gradient.name} gradient`}
                >
                  {isSelected && (
                    <div className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full border border-gray-200 bg-white">
                      <Check className="text-primary h-2 w-2" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-gray-800 drop-shadow-sm">
                    {gradient.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}

        {activeTab === "frames" && (
          <FrameSelector
            selectedFrame={selectedFrame}
            setSelectedFrame={handleFrameChange}
            setImageUrl={setImageUrl}
            layoutType={layoutType}
          />
        )}
      </div>

      {/* Current Selection Preview for colors */}
      {activeTab === "solid" && (
        <div className="mt-3 flex items-center gap-3 rounded-md bg-gray-50 p-2">
          {/* Color Picker */}
          <input
            type="color"
            value={frameColor ?? "#FFFFFF"}
            onChange={(e) => handleColorChange(e.target.value)}
            className="h-6 w-6 cursor-pointer"
            title="Pick a color"
          />

          <div
            className="pointer-events-none absolute h-6 w-6 rounded-md border border-gray-200"
            style={
              selectedGradient
                ? { background: selectedGradient }
                : { backgroundColor: frameColor || "#FFFFFF" }
            }
          ></div>

          <span className="text-xs text-gray-700">
            {selectedGradient
              ? `Gradient: ${GRADIENT_PRESETS.find((g) => g.value === selectedGradient)?.name || "Custom"}`
              : frameColor
                ? `Color: ${frameColor}`
                : null}
          </span>
        </div>
      )}
    </>
  );
});
