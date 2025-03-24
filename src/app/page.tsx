"use client";

import { useEffect } from "react";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas-pro";
import { Navbar } from "@/components/navbar";
import { StepProgress } from "@/components/step-progress";
import { PhotoShoot } from "@/components/photo-shoot";
import { LayoutSelection } from "@/components/layout-selection";
import { MAX_CAPTURE } from "@/constants";
import type { StickerItem } from "@/types";

export default function PhotoBoothApp() {
  const [step, setStep] = useState<"shoot" | "layout">("shoot");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [layoutType, setLayoutType] = useState<number>(4);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [selectedStickerLayout, setSelectedStickerLayout] = useState<
    string | null
  >("none");
  const [customStickers, setCustomStickers] = useState<StickerItem[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const canProceedToLayout = capturedImages.length === MAX_CAPTURE;
  const canDownload = selectedIndices.length === layoutType;

  const handleStepChange = () => {
    setStep("layout");
  };

  const retakePhotos = () => {
    setCapturedImages([]);
    setSelectedIndices([]);
    setStep("shoot");
  };

  const downloadComposite = async () => {
    if (!previewRef.current || isDownloading) return;

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(previewRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
        scale: 3, // Higher quality for Retina displays
      });

      const link = document.createElement("a");
      const fileName = `chinchinbooth_photo_${Date.now()}.jpeg`;
      link.download = fileName;
      link.href = canvas.toDataURL("image/jpeg", 1.0);
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Keyboard shortcuts for layout screen
  useEffect(() => {
    if (step === "layout") {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")
        )
          return;
        if (e.key === "Escape") retakePhotos();
        if (e.key.toLowerCase() === "d") downloadComposite();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [step]);

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-hidden">
      <Navbar />

      <StepProgress currentStep={step === "shoot" ? 1 : 2} />

      <AnimatePresence mode="wait">
        {step === "shoot" ? (
          <motion.div
            key="shoot"
            className="flex-1 overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <PhotoShoot
              capturedImages={capturedImages}
              setCapturedImages={setCapturedImages}
              canProceedToLayout={canProceedToLayout}
              goToLayoutScreen={handleStepChange}
            />
          </motion.div>
        ) : (
          <motion.div
            key="layout"
            className="flex-1 overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <LayoutSelection
              capturedImages={capturedImages}
              previewRef={previewRef}
              layoutType={layoutType}
              selectedIndices={selectedIndices}
              setSelectedIndices={setSelectedIndices}
              setLayoutType={setLayoutType}
              selectedFrame={selectedFrame}
              setSelectedFrame={setSelectedFrame}
              selectedStickerLayout={selectedStickerLayout}
              setSelectedStickerLayout={setSelectedStickerLayout}
              customStickers={customStickers}
              setCustomStickers={setCustomStickers}
              retakePhotos={retakePhotos}
              downloadComposite={downloadComposite}
              canDownload={canDownload}
              isDownloading={isDownloading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
