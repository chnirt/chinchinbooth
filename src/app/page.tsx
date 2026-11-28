"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Navbar } from "@/components/navbar";
// import { StepProgress } from "@/components/step-progress";
import dynamic from "next/dynamic";
import { MAX_CAPTURE } from "@/constants";
import { uploadQrImage, type QrShare } from "@/lib/upload-utils";
import { maxQrImageBytes } from "@/lib/qr-limits";
import { toast } from "sonner";
import Footer from "@/components/footer";
import confetti from "canvas-confetti";

const PhotoShoot = dynamic(() =>
  import("../components/photo-shoot").then((mod) => mod.PhotoShoot),
);
const LayoutSelection = dynamic(() =>
  import("../components/layout-selection").then((mod) => mod.LayoutSelection),
);

const transitionVariants: Variants = {
  initial: (direction) => ({ opacity: 0, x: direction > 0 ? 20 : -20 }),
  animate: { opacity: 1, x: 0 },
  exit: (direction) => ({ opacity: 0, x: direction > 0 ? -20 : 20 }),
};

export default function PhotoBoothApp() {
  const [step, setStep] = useState<"shoot" | "layout">("shoot");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [layoutType, setLayoutType] = useState<number>(4);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<string | null>("none");
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const renderedStrip = useRef<{ key: string; canvas: Promise<HTMLCanvasElement> } | null>(null);
  const downloadInProgress = useRef(false);
  const uploadInProgress = useRef(false);
  const [isUploading, setIsUploading] = useState(false);

  const canProceedToLayout = capturedImages.length === MAX_CAPTURE;
  const canDownload = selectedIndices.length === layoutType;

  const handleStepChange = () => setStep("layout");

  const retakePhotos = () => {
    setCapturedImages([]);
    setSelectedIndices([]);
    renderedStrip.current = null;
    setStep("shoot");
  };

  const triggerConfetti = useCallback((duration: number = 3000) => {
    const end = Date.now() + duration;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors,
      });
      requestAnimationFrame(frame);
    };

    frame();
  }, []);

  const renderStrip = (key: string) => {
    if (renderedStrip.current?.key === key) return renderedStrip.current.canvas;

    const preview = previewRef.current;
    if (!preview) throw new Error("Strip preview is unavailable");
    const width = layoutType === 4 ? 600 : 1200;
    const height = 1800;
    const canvas = (async () => {
      const html2canvas = (await import("html2canvas-pro")).default;
      if (preview.dataset.stripKey !== key) throw new Error("Strip changed before rendering");
      const rect = preview.getBoundingClientRect();
      if (!rect.width || !rect.height) throw new Error("Strip preview is empty");
      const rendered = await html2canvas(preview, {
        useCORS: true,
        backgroundColor: null,
        width: rect.width,
        height: rect.height,
        scale: width / rect.width,
      });

      if (previewRef.current !== preview || preview.dataset.stripKey !== key) {
        throw new Error("Strip changed during rendering");
      }
      if (rendered.width === width && rendered.height === height) return rendered;
      const output = document.createElement("canvas");
      output.width = width;
      output.height = height;
      const ctx = output.getContext("2d");
      if (!ctx) throw new Error("Unable to get 2D context");
      ctx.drawImage(rendered, 0, 0, width, height);
      return output;
    })();
    renderedStrip.current = { key, canvas };
    void canvas.catch(() => {
      if (renderedStrip.current?.canvas === canvas) renderedStrip.current = null;
    });
    return canvas;
  };

  const encodeStrip = async (key: string, quality: number) => {
    const canvas = await renderStrip(key);
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Unable to encode strip as JPEG"));
      }, "image/jpeg", quality);
    });
  };

  const generateImage = async (key: string): Promise<Blob | null> => {
    if (!canDownload || downloadInProgress.current) return null;
    downloadInProgress.current = true;
    setIsDownloading(true);

    try {
      const jpeg = await encodeStrip(key, 1);
      if (previewRef.current?.dataset.stripKey !== key) return null;
      triggerConfetti();
      return jpeg;
    } catch (error) {
      console.error("Error generating the image:", error);
      return null;
    } finally {
      downloadInProgress.current = false;
      setIsDownloading(false);
    }
  };

  const uploadAndGenerateQR = async (key: string): Promise<QrShare | null> => {
    if (!canDownload || uploadInProgress.current) return null;
    uploadInProgress.current = true;
    setIsUploading(true);

    try {
      let jpeg = await encodeStrip(key, 0.8);
      for (const quality of [0.65, 0.5]) {
        if (jpeg.size <= maxQrImageBytes) break;
        jpeg = await encodeStrip(key, quality);
      }
      if (jpeg.size > maxQrImageBytes) throw new Error("QR image exceeds size limit");
      if (previewRef.current?.dataset.stripKey !== key) return null;
      const share = await uploadQrImage(jpeg);
      triggerConfetti();
      return share;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast("Failed to upload. Please try again.");
      return null;
    } finally {
      uploadInProgress.current = false;
      setIsUploading(false);
    }
  };

  return (
    <div className="booth-shell flex min-h-[100dvh] flex-col overflow-x-clip">
      <Navbar />
      <AnimatePresence custom={step === "shoot" ? -1 : 1} mode="wait">
        <motion.main
          key={step}
          className="flex-1 overflow-hidden"
          custom={step === "shoot" ? -1 : 1}
          variants={transitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {step === "shoot" ? (
            <PhotoShoot
              capturedImages={capturedImages}
              setCapturedImages={setCapturedImages}
              canProceedToLayout={canProceedToLayout}
              goToLayoutScreen={handleStepChange}
            />
          ) : (
            <LayoutSelection
              capturedImages={capturedImages}
              previewRef={previewRef}
              layoutType={layoutType}
              selectedIndices={selectedIndices}
              setSelectedIndices={setSelectedIndices}
              setLayoutType={setLayoutType}
              selectedFrame={selectedFrame}
              setSelectedFrame={setSelectedFrame}
              retakePhotos={retakePhotos}
              generateImage={generateImage}
              canDownload={canDownload}
              isDownloading={isDownloading}
              uploadAndGenerateQR={uploadAndGenerateQR}
              isUploading={isUploading}
            />
          )}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
