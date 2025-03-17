"use client";

import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas-pro";
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
} from "lucide-react";

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
  slider?: boolean;
}

const controls: Control[] = [
  { id: "mirror", name: "Mirror Mode", icon: FlipHorizontal, action: "mirror" },
  {
    id: "brightness",
    name: "Brightness",
    icon: Sun,
    action: "brightness",
    slider: true,
  },
  {
    id: "contrast",
    name: "Contrast",
    icon: Contrast,
    action: "contrast",
    slider: true,
  },
  {
    id: "grayscale",
    name: "Grayscale",
    icon: ImageOff,
    action: "filter",
    slider: true,
  },
  {
    id: "sepia",
    name: "Sepia",
    icon: Sparkles,
    action: "filter",
    slider: true,
  },
  {
    id: "saturate",
    name: "Saturation",
    icon: Wand,
    action: "filter",
    slider: true,
  },
  {
    id: "blur",
    name: "Soft Focus",
    icon: Glasses,
    action: "filter",
    slider: true,
  },
  { id: "reset", name: "Reset Filter", icon: RefreshCw, action: "reset" },
];

function Navbar() {
  return (
    <nav className="w-full p-4 bg-white border-b flex justify-center">
      <h1 className="text-2xl font-bold text-gray-800">@chinchinbooth</h1>
    </nav>
  );
}

interface StepProgressProps {
  currentStep: number;
}

function StepProgress({ currentStep }: StepProgressProps) {
  const circleClass = (step: number) =>
    `w-6 h-6 rounded-full flex items-center justify-center text-sm ${
      currentStep === step
        ? "bg-gray-800 text-white"
        : "bg-gray-200 text-gray-600"
    }`;
  return (
    <div className="flex justify-center items-center space-x-2 my-4">
      <div className={circleClass(1)}>1</div>
      <span className="text-gray-600">—</span>
      <div className={circleClass(2)}>2</div>
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
  const [filters, setFilters] = useState(defaultFilters);
  const [isMirrored, setIsMirrored] = useState(true);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
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
      capturedImages.length >= MAX_CAPTURE
    )
      return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { videoWidth: width, videoHeight: height } = videoRef.current;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) saturate(${filters.saturate}%) blur(${filters.blur}px)`;
    ctx.setTransform(isMirrored ? -1 : 1, 0, 0, 1, isMirrored ? width : 0, 0);
    ctx.drawImage(videoRef.current, 0, 0, width, height);
    setCapturedImages((prev) => [...prev, canvas.toDataURL("image/png")]);
  };

  const undoCapture = () =>
    capturedImages.length && setCapturedImages((prev) => prev.slice(0, -1));
  const resetCaptures = () => setCapturedImages([]);
  const resetFilters = () => setFilters(defaultFilters);
  const updateFilter = (id: string, value: string) =>
    setFilters((prev) => ({ ...prev, [id]: Number(value) }));
  const toggleMirrorMode = () =>
    !filterDisabled && setIsMirrored((prev) => !prev);

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
  }, [capturedImages, isCameraStarted, filters, isMirrored]);

  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      <div className="inline-flex items-center rounded-md bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1">
        {capturedImages.length}/{MAX_CAPTURE}
      </div>
      {cameraError ? (
        <div className="text-red-500 font-bold">{cameraError}</div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-80 h-60 border object-cover"
          style={{
            transform: isMirrored ? "scaleX(-1)" : "scaleX(1)",
            filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) saturate(${filters.saturate}%) blur(${filters.blur}px)`,
          }}
        />
      )}
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex gap-6">
        <button
          onClick={captureImage}
          disabled={!isCameraStarted || capturedImages.length >= MAX_CAPTURE}
          title="Capture Image (Space/Enter)"
          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 bg-transparent disabled:opacity-50"
        >
          <Camera className="w-5 h-5" />
        </button>
        <button
          onClick={undoCapture}
          disabled={!capturedImages.length}
          title="Undo Capture (Delete/Backspace)"
          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 bg-transparent disabled:opacity-50"
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          onClick={resetCaptures}
          disabled={!capturedImages.length}
          title="Reset Captures (Escape)"
          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 bg-transparent disabled:opacity-50"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-4">
        {capturedImages.map((img, index) => (
          <div key={index} className="w-48 aspect-[4/3] border">
            <img
              src={img}
              alt={`Captured ${index}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Space/Enter:</strong> Capture |{" "}
          <strong>Delete/Backspace:</strong> Undo | <strong>Escape:</strong>{" "}
          Reset
        </p>
      </div>
      <div className="flex flex-wrap gap-6 mt-6">
        {controls.map(({ id, name, icon: Icon, slider }) => (
          <div key={id} className="flex flex-col items-center">
            <button
              onClick={() => {
                if (!filterDisabled) {
                  if (id === "mirror") toggleMirrorMode();
                  if (id === "reset") resetFilters();
                }
              }}
              disabled={filterDisabled}
              title={name}
              className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-transparent ${
                filterDisabled ? "text-gray-400" : "text-gray-600"
              } disabled:opacity-50`}
            >
              <Icon className="w-5 h-5" />
            </button>
            {slider && (
              <input
                type="range"
                disabled={filterDisabled}
                min={id === "blur" ? 0 : 0}
                max={id === "blur" ? 10 : 200}
                value={(filters as Record<string, number>)[id]}
                onChange={(e) => updateFilter(id, e.target.value)}
                className="mt-2 w-32 h-2 bg-gray-200 rounded-full appearance-none accent-gray-600 disabled:opacity-50"
              />
            )}
            <span
              className={`mt-1 text-sm font-medium ${
                filterDisabled ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
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
  // Use a trendy, updated color palette for the photo booth
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
          src={capturedImages[selectedIndices[idx]]}
          alt={`Slot ${idx}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-gray-400">Empty</span>
      );
    const baseClass =
      "w-64 h-48 flex items-center justify-center transition-transform duration-200";
    const emptyClass = "border-dashed border-gray-300 bg-gray-50";
    return (
      <div
        key={idx}
        className={`${baseClass} ${
          selectedIndices[idx] !== undefined ? "border-gray-500" : emptyClass
        }`}
      >
        {cellContent}
      </div>
    );
  };

  const renderPreview = () => {
    if (layoutType === 4) {
      return (
        <div className="rounded-lg border border-gray-300 overflow-hidden">
          <div
            ref={previewRef}
            className="flex flex-col gap-4 p-4"
            style={{ backgroundColor: frameColor }}
          >
            {Array.from({ length: 4 }, (_, idx) => renderCell(idx))}
          </div>
        </div>
      );
    }
    return (
      <div
        ref={previewRef}
        className="grid grid-cols-2 gap-2"
        style={{ backgroundColor: frameColor }}
      >
        {Array.from({ length: 8 }, (_, idx) => renderCell(idx))}
      </div>
    );
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Photo Selection Gallery */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Select Photos for Layout</h2>
        <p className="text-gray-600 mb-4">
          {layoutType === 4
            ? "Select exactly 4 photos for your Photo Strip Layout."
            : "Select exactly 8 photos for your 2-Strip Layout."}
        </p>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => selectLayoutType(4)}
            className={`px-4 py-2 rounded-full ${
              layoutType === 4
                ? "bg-gray-800 text-white"
                : "bg-transparent text-gray-600 border"
            }`}
          >
            Photo Strip
          </button>
          <button
            onClick={() => selectLayoutType(8)}
            className={`px-4 py-2 rounded-full ${
              layoutType === 8
                ? "bg-gray-800 text-white"
                : "bg-transparent text-gray-600 border"
            }`}
          >
            2-Strip
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {capturedImages.map((img, index) => {
            const isSelected = selectedIndices.includes(index);
            return (
              <div
                key={index}
                onClick={() => toggleSelect(index)}
                className={`border p-1 cursor-pointer transition-transform duration-200 ${
                  isSelected ? "border-gray-500 scale-105" : "border-gray-300"
                }`}
              >
                <img
                  src={img}
                  alt={`Photo ${index}`}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>
      {/* Layout Preview & Frame Color Controls */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-center">
          Layout Preview
        </h2>
        <div className="flex justify-center mb-4">{renderPreview()}</div>
        {/* Frame Color Controls với horizontal scroll */}
        <div className="flex overflow-x-auto">
          <div className="flex gap-2 flex-nowrap justify-center">
            {palette.map((color) => (
              <button
                key={color}
                onClick={() => setFrameColor(color)}
                style={{ backgroundColor: color }}
                className={`w-10 h-10 rounded-full border flex-shrink-0 ${
                  frameColor === color ? "border-gray-500" : "border-gray-300"
                }`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PhotoBoothApp() {
  const [step, setStep] = useState<"shoot" | "layout">("shoot");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [layoutType, setLayoutType] = useState<number>(4);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  const downloadComposite = async () => {
    if (!previewRef.current) return;
    html2canvas(previewRef.current, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "photo_booth_composite.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  const retakePhotos = () => {
    setCapturedImages([]);
    setSelectedIndices([]);
    setStep("shoot");
  };

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
  }, [step, capturedImages, layoutType]);

  return (
    <div>
      <Navbar />
      <StepProgress currentStep={step === "shoot" ? 1 : 2} />
      {step === "shoot" ? (
        <PhotoShoot
          capturedImages={capturedImages}
          setCapturedImages={setCapturedImages}
        />
      ) : (
        <LayoutSelection
          capturedImages={capturedImages}
          previewRef={previewRef}
          layoutType={layoutType}
          selectedIndices={selectedIndices}
          setSelectedIndices={setSelectedIndices}
          setLayoutType={setLayoutType}
        />
      )}
      <div className="flex flex-col items-center my-4">
        {step === "shoot" ? (
          capturedImages.length >= MAX_CAPTURE && (
            <button
              onClick={() => setStep("layout")}
              disabled={capturedImages.length < MAX_CAPTURE}
              className="px-4 py-2 rounded-full bg-gray-800 text-white border border-transparent disabled:opacity-50"
            >
              Let&apos;s Proceed
            </button>
          )
        ) : (
          <div className="flex gap-4">
            <button
              onClick={retakePhotos}
              className="px-4 py-2 rounded-full bg-transparent text-gray-600 border border-gray-300"
            >
              Retake Photos
            </button>
            <button
              onClick={downloadComposite}
              className="px-4 py-2 rounded-full bg-gray-800 text-white border border-transparent"
            >
              Download Composite
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
