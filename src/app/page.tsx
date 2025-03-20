"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas-pro";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlipHorizontal,
  Sun,
  Contrast,
  ImageOff,
  Sparkles,
  Wand,
  Glasses,
  RefreshCw,
  Undo2,
  Camera,
  Download,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Spotlight } from "@/components/ui/spotlight";

const MAX_CAPTURE = 10;

const defaultFilters = {
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  sepia: 0,
  saturate: 100,
  blur: 0,
};

interface Control {
  id: string;
  name: string;
  icon: React.ComponentType<{ className: string; title?: string }>;
  action: string;
}

const controls: Control[] = [
  { id: "mirror", name: "Mirror", icon: FlipHorizontal, action: "mirror" },
  { id: "brightness", name: "Brightness", icon: Sun, action: "brightness" },
  { id: "contrast", name: "Contrast", icon: Contrast, action: "contrast" },
  { id: "grayscale", name: "B&W", icon: ImageOff, action: "filter" },
  { id: "sepia", name: "Sepia", icon: Sparkles, action: "filter" },
  { id: "saturate", name: "Saturation", icon: Wand, action: "filter" },
  { id: "blur", name: "Soft Focus", icon: Glasses, action: "filter" },
  { id: "reset", name: "Reset", icon: RefreshCw, action: "reset" },
];

function Navbar() {
  return (
    <motion.nav
      className="w-full p-4 bg-gradient-to-r from-rose-100 to-teal-100 border-b flex justify-center items-center relative overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Spotlight className="top-10 left-0 md:left-60 md:-top-20" fill="white" />
      <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center relative z-10">
        <span className="text-pink-500">@</span>chinchinbooth
      </h1>
    </motion.nav>
  );
}

interface StepProgressProps {
  currentStep: number;
}

function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="flex justify-center items-center space-x-4 my-6">
      <motion.div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
          currentStep === 1
            ? "bg-gray-800 text-white shadow-md"
            : "bg-gray-200 text-gray-600"
        }`}
        initial={{ scale: 0.8 }}
        animate={{
          scale: currentStep === 1 ? 1.1 : 1,
          backgroundColor: currentStep === 1 ? "#1f2937" : "#e5e7eb",
          color: currentStep === 1 ? "#ffffff" : "#4b5563",
        }}
        transition={{ duration: 0.3 }}
      >
        1
      </motion.div>
      <div className="w-16 h-0.5 bg-gray-300 relative">
        <motion.div
          className="absolute inset-0 bg-gray-800"
          initial={{ width: "0%" }}
          animate={{ width: currentStep === 2 ? "100%" : "0%" }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <motion.div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
          currentStep === 2
            ? "bg-gray-800 text-white shadow-md"
            : "bg-gray-200 text-gray-600"
        }`}
        initial={{ scale: 0.8 }}
        animate={{
          scale: currentStep === 2 ? 1.1 : 1,
          backgroundColor: currentStep === 2 ? "#1f2937" : "#e5e7eb",
          color: currentStep === 2 ? "#ffffff" : "#4b5563",
        }}
        transition={{ duration: 0.3 }}
      >
        2
      </motion.div>
    </div>
  );
}

interface PhotoShootProps {
  capturedImages: string[];
  setCapturedImages: React.Dispatch<React.SetStateAction<string[]>>;
}

function PhotoShoot({ capturedImages, setCapturedImages }: PhotoShootProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capturedImagesRef = useRef<HTMLDivElement>(null);
  const cameraContainerRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [isMirrored, setIsMirrored] = useState(true);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>(["mirror"]);
  const [isCapturing, setIsCapturing] = useState(false);
  const filterDisabled = !isCameraStarted;

  useEffect(() => {
    const startCamera = async () => {
      if (isCameraStarted) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraStarted(true);
          setCameraError(null);
        }
      } catch {
        setCameraError(
          "Camera access is required. Please enable camera access in your browser settings and reload the page."
        );
      }
    };
    startCamera();
  }, [isCameraStarted]);

  const captureImage = () => {
    if (
      !isCameraStarted ||
      !videoRef.current ||
      !canvasRef.current ||
      capturedImages.length >= MAX_CAPTURE ||
      isCapturing
    )
      return;

    setIsCapturing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    const { videoWidth: width, videoHeight: height } = videoRef.current;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) saturate(${filters.saturate}%) blur(${filters.blur}px)`;
    ctx.setTransform(isMirrored ? -1 : 1, 0, 0, 1, isMirrored ? width : 0, 0);
    ctx.drawImage(videoRef.current, 0, 0, width, height);

    // Flash effect
    const videoContainer = videoRef.current.parentElement;
    if (videoContainer) {
      videoContainer.classList.add("flash");
      setTimeout(() => {
        videoContainer.classList.remove("flash");
        setCapturedImages((prev) => [...prev, canvas.toDataURL("image/png")]);
        setIsCapturing(false);
      }, 300);
    } else {
      setCapturedImages((prev) => [...prev, canvas.toDataURL("image/png")]);
      setIsCapturing(false);
    }
  };

  const undoCapture = () => {
    if (capturedImages.length) {
      setCapturedImages((prev) => prev.slice(0, -1));
    }
  };

  const resetCaptures = () => setCapturedImages([]);

  const resetFilters = () => {
    setFilters(defaultFilters);
    setActiveFilters(["mirror"]);
  };

  const toggleFilter = (id: string) => {
    if (!filterDisabled) {
      if (id === "mirror") {
        setIsMirrored((prev) => !prev);
        setActiveFilters((prev) =>
          prev.includes("mirror")
            ? prev.filter((f) => f !== "mirror")
            : [...prev, "mirror"]
        );
      } else if (id === "grayscale") {
        setFilters((prev) => ({
          ...prev,
          grayscale: prev.grayscale === 0 ? 100 : 0,
          sepia: 0, // Turn off sepia when grayscale is enabled
        }));
        setActiveFilters((prev) => {
          const newFilters = prev.filter(
            (f) => f !== "sepia" && f !== "grayscale"
          );
          return prev.includes("grayscale")
            ? newFilters
            : [...newFilters, "grayscale"];
        });
      } else if (id === "sepia") {
        setFilters((prev) => ({
          ...prev,
          sepia: prev.sepia === 0 ? 100 : 0,
          grayscale: 0, // Turn off grayscale when sepia is enabled
        }));
        setActiveFilters((prev) => {
          const newFilters = prev.filter(
            (f) => f !== "sepia" && f !== "grayscale"
          );
          return prev.includes("sepia") ? newFilters : [...newFilters, "sepia"];
        });
      } else if (id === "brightness") {
        setFilters((prev) => ({
          ...prev,
          brightness: prev.brightness === 100 ? 130 : 100,
        }));
        setActiveFilters((prev) =>
          prev.includes("brightness")
            ? prev.filter((f) => f !== "brightness")
            : [...prev, "brightness"]
        );
      } else if (id === "contrast") {
        setFilters((prev) => ({
          ...prev,
          contrast: prev.contrast === 100 ? 130 : 100,
        }));
        setActiveFilters((prev) =>
          prev.includes("contrast")
            ? prev.filter((f) => f !== "contrast")
            : [...prev, "contrast"]
        );
      } else if (id === "saturate") {
        setFilters((prev) => ({
          ...prev,
          saturate: prev.saturate === 100 ? 150 : 100,
        }));
        setActiveFilters((prev) =>
          prev.includes("saturate")
            ? prev.filter((f) => f !== "saturate")
            : [...prev, "saturate"]
        );
      } else if (id === "blur") {
        setFilters((prev) => ({
          ...prev,
          blur: prev.blur === 0 ? 2 : 0,
        }));
        setActiveFilters((prev) =>
          prev.includes("blur")
            ? prev.filter((f) => f !== "blur")
            : [...prev, "blur"]
        );
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || ""))
        return;
      switch (e.key) {
        case " ":
        case "Enter":
          captureImage();
          break;
        case "Backspace":
        case "Delete":
          undoCapture();
          break;
        case "Escape":
          resetCaptures();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [capturedImages, isCameraStarted, filters, isMirrored, isCapturing]);

  return (
    <motion.div
      className="flex flex-col items-center space-y-4 p-3 max-w-xl mx-auto select-none"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between w-full">
        <Badge variant="outline" className="px-3 py-1.5 text-xs font-medium">
          <span className="font-bold">{capturedImages.length}</span>
          <span className="mx-1">/</span>
          <span>{MAX_CAPTURE}</span>
        </Badge>

        <div className="text-xs text-gray-500">
          <span className="font-medium">Space</span>: Capture |{" "}
          <span className="font-medium">Delete</span>: Undo |{" "}
          <span className="font-medium">Esc</span>: Reset
        </div>
      </div>

      {cameraError ? (
        <div className="text-red-500 font-bold p-4 bg-red-50 rounded-lg text-center">
          {cameraError}
        </div>
      ) : (
        <div
          ref={cameraContainerRef}
          className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black"
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{
              transform: isMirrored ? "scaleX(-1)" : "scaleX(1)",
              filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) saturate(${filters.saturate}%) blur(${filters.blur}px)`,
            }}
          />
          <div className="absolute inset-0 pointer-events-none flash-overlay"></div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex justify-center items-center gap-4 w-full">
        <Button
          onClick={undoCapture}
          disabled={!capturedImages.length}
          className="w-12 h-12 rounded-full p-0 flex items-center justify-center bg-white"
          variant="outline"
        >
          <Undo2 className="w-5 h-5" />
        </Button>

        <Button
          onClick={captureImage}
          disabled={
            !isCameraStarted ||
            capturedImages.length >= MAX_CAPTURE ||
            isCapturing
          }
          className="w-16 h-16 rounded-full p-0 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
          variant="default"
        >
          <Camera className="w-7 h-7" />
        </Button>

        <Button
          onClick={resetCaptures}
          disabled={!capturedImages.length}
          className="w-12 h-12 rounded-full p-0 flex items-center justify-center bg-white"
          variant="outline"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      <div className="w-full">
        <div className="flex flex-wrap justify-center gap-3">
          {controls
            .filter((c) => c.id !== "reset")
            .map(({ id, name, icon: Icon }) => (
              <TooltipProvider key={id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => toggleFilter(id)}
                      disabled={filterDisabled}
                      variant={
                        activeFilters.includes(id) ? "default" : "outline"
                      }
                      className="w-10 h-10 rounded-full p-0"
                      size="icon"
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 rounded-full"
                  disabled={filterDisabled}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset Filters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {capturedImages.length > 0 && (
        <div
          ref={capturedImagesRef}
          className="w-full flex gap-2 overflow-x-auto pb-2 snap-x custom-scrollbar hide-scrollbar"
          style={{
            height: cameraContainerRef.current
              ? cameraContainerRef.current.clientHeight / 2.5
              : "auto",
          }}
        >
          {capturedImages.map((img, index) => (
            <div
              key={index}
              className="flex-shrink-0 rounded-lg overflow-hidden snap-center aspect-[4/3]"
              style={{ height: "100%" }}
            >
              <img
                src={img || "/placeholder.svg"}
                alt={`Captured ${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

interface LayoutSelectionProps {
  capturedImages: string[];
  previewRef: React.RefObject<HTMLDivElement | null>;
  layoutType: number;
  selectedIndices: number[];
  setSelectedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  setLayoutType: React.Dispatch<React.SetStateAction<number>>;
}

function LayoutSelection({
  capturedImages,
  previewRef,
  layoutType,
  selectedIndices,
  setSelectedIndices,
  setLayoutType,
}: LayoutSelectionProps) {
  // Photo booth inspired color palette
  const [frameColor, setFrameColor] = useState<string>("#FFFFFF");
  const palette = [
    "#FFFFFF", // White
    "#000000", // Black
    "#F5F5F5", // Light Gray
    "#FF6F61", // Coral
    "#6B5B95", // Purple
    "#88B04B", // Green
    "#F7CAC9", // Light Pink
    "#92A8D1", // Blue
    "#034F84", // Dark Blue
    "#F4D06F", // Mustard Yellow
    "#E94E77", // Hot Pink
  ];

  const selectLayoutType = (type: number) => {
    setLayoutType(type);
    setSelectedIndices([]);
  };

  const toggleSelect = (index: number) =>
    setSelectedIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : prev.length < layoutType
        ? [...prev, index]
        : prev
    );

  const renderCell = (idx: number) => {
    const cellContent =
      selectedIndices[idx] !== undefined ? (
        <img
          src={capturedImages[selectedIndices[idx]] || "/placeholder.svg"}
          alt={`Slot ${idx}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400">
          <span className="text-xs">Empty</span>
        </div>
      );

    const baseClass =
      "w-full aspect-[4/3] flex items-center justify-center transition-all duration-200 overflow-hidden";
    const emptyClass = "border-dashed border border-gray-300 bg-gray-50";

    return (
      <motion.div
        key={idx}
        className={`${baseClass} ${
          selectedIndices[idx] !== undefined ? "" : emptyClass
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: idx * 0.05 }}
      >
        {cellContent}
      </motion.div>
    );
  };

  const renderPreview = () => {
    if (layoutType === 4) {
      return (
        <motion.div
          className="rounded-md border border-gray-300 overflow-hidden shadow-md max-w-3xs mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            ref={previewRef}
            className="flex flex-col gap-4 px-4 pt-4 pb-20"
            style={{ backgroundColor: frameColor }}
          >
            <div className="grid grid-cols-1 gap-2">
              {Array.from({ length: 4 }, (_, idx) => renderCell(idx))}
            </div>
          </div>
        </motion.div>
      );
    }
    return (
      <motion.div
        className="rounded-md border border-gray-300 overflow-hidden shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div
          ref={previewRef}
          className="px-4 pt-4 pb-20"
          style={{ backgroundColor: frameColor }}
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }, (_, idx) => renderCell(idx))}
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }, (_, idx) => renderCell(idx + 4))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="p-3 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          {/* Photo Selection Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold mb-2">Select Photos</h2>
            <div className="flex gap-3 mb-3">
              <Button
                onClick={() => selectLayoutType(4)}
                variant={layoutType === 4 ? "default" : "outline"}
                className="rounded-full text-sm px-4 py-1 h-auto"
                size="sm"
              >
                Photo Strip
              </Button>
              <Button
                onClick={() => selectLayoutType(8)}
                variant={layoutType === 8 ? "default" : "outline"}
                className="rounded-full text-sm px-4 py-1 h-auto"
                size="sm"
              >
                2-Strip
              </Button>
            </div>

            <p className="text-gray-600 mb-2 text-xs">
              {layoutType === 4
                ? `Select 4 photos (${selectedIndices.length}/4)`
                : `Select 8 photos (${selectedIndices.length}/8)`}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto p-2 border rounded-lg hide-scrollbar">
              <AnimatePresence>
                {capturedImages.map((img, index) => {
                  const isSelected = selectedIndices.includes(index);
                  const selectionIndex = selectedIndices.indexOf(index) + 1;

                  return (
                    <motion.div
                      key={index}
                      onClick={() => toggleSelect(index)}
                      className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 aspect-[4/3] ${
                        isSelected
                          ? "border-gray-800 shadow-md z-10"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: isSelected ? 1.05 : 1,
                        borderColor: isSelected ? "#1f2937" : "#e5e7eb",
                      }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`Photo ${index}`}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <motion.div
                          className="absolute top-1 right-1 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {selectionIndex}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Frame Color Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold mb-2">Frame Color</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {palette.map((color) => (
                <motion.button
                  key={color}
                  onClick={() => setFrameColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-8 h-8 rounded-full transition-all ${
                    frameColor === color
                      ? "ring-2 ring-offset-1 ring-gray-500"
                      : "border border-gray-300 hover:scale-105"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Select ${color} frame color`}
                ></motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Layout Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-3">Layout Preview</h2>
          <div className="mb-4">{renderPreview()}</div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function PhotoBoothApp() {
  const [step, setStep] = useState<"shoot" | "layout">("shoot");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [layoutType, setLayoutType] = useState<number>(4); // Default to photo strip layout
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadComposite = async () => {
    if (!previewRef.current || isDownloading) return;

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(previewRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
        scale: 2, // Higher quality for Retina displays
      });

      const link = document.createElement("a");
      link.download = "chinchinbooth_photo.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const retakePhotos = () => {
    setCapturedImages([]);
    setSelectedIndices([]);
    setStep("shoot");
  };

  // Require all 10 photos before proceeding
  const canProceedToLayout = capturedImages.length === MAX_CAPTURE;
  const canDownload = selectedIndices.length === layoutType;

  useEffect(() => {
    if (step === "layout") {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")
        )
          return;
        if (e.key === "Escape") retakePhotos();
        else if (e.key.toLowerCase() === "d") downloadComposite();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [step, capturedImages, layoutType, selectedIndices, isDownloading]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <Navbar />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <StepProgress currentStep={step === "shoot" ? 1 : 2} />
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "shoot" ? (
          <motion.div
            key="shoot"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PhotoShoot
              capturedImages={capturedImages}
              setCapturedImages={setCapturedImages}
            />
          </motion.div>
        ) : (
          <motion.div
            key="layout"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <LayoutSelection
              capturedImages={capturedImages}
              previewRef={previewRef}
              layoutType={layoutType}
              selectedIndices={selectedIndices}
              setSelectedIndices={setSelectedIndices}
              setLayoutType={setLayoutType}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex justify-center my-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        {step === "shoot" ? (
          <AnimatePresence>
            {canProceedToLayout && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={() => setStep("layout")}
                  className="px-5 py-2 rounded-full font-medium"
                  variant="default"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2 inline-block" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={retakePhotos}
              variant="outline"
              className="px-4 py-2 rounded-full flex items-center justify-center"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retake
            </Button>
            <Button
              onClick={downloadComposite}
              disabled={!canDownload || isDownloading}
              className={cn(
                "px-4 py-2 rounded-full font-medium flex items-center justify-center",
                !canDownload && "cursor-not-allowed"
              )}
              variant={canDownload && !isDownloading ? "default" : "secondary"}
              size="sm"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-1" />
                  {canDownload
                    ? "Download"
                    : `Select ${layoutType - selectedIndices.length} more`}
                </>
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
