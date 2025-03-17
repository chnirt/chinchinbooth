"use client";

import React, { useState, useRef, useEffect } from "react";
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

// Hàm tạo ảnh composite từ mảng images với layout (4 hoặc 8) và màu frame
async function exportCompositeImage(
  layoutType: number,
  images: string[],
  frameColor: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const cellWidth = 600; // Chiều rộng của ảnh
    const cellHeight = 400; // Chiều cao của ảnh
    const gap = 10; // Khoảng cách giữa các ảnh
    const borderThickness = 10; // Độ dày của khung
    const canvas = document.createElement("canvas");

    if (layoutType === 4) {
      // Layout dọc cho 4 ảnh
      canvas.width = cellWidth + 2 * borderThickness;
      canvas.height = (cellHeight + 2 * borderThickness) * 4 + gap * (4 - 1);
    } else if (layoutType === 8) {
      // Layout 2 cột x 4 hàng cho 8 ảnh
      canvas.width = (cellWidth + 2 * borderThickness) * 2 + gap;
      canvas.height = (cellHeight + 2 * borderThickness) * 4 + gap * (4 - 1);
    } else {
      reject("Unsupported layout type. Only supports 4 or 8.");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject("Unable to get canvas context.");
      return;
    }

    // Load tất cả ảnh (đảm bảo crossOrigin nếu cần)
    Promise.all(
      images.map(
        (src) =>
          new Promise<HTMLImageElement>((res, rej) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => res(img);
            img.onerror = rej;
            img.src = src;
          })
      )
    )
      .then((loadedImages) => {
        if (layoutType === 4) {
          for (let i = 0; i < 4; i++) {
            const x = 0;
            const y = i * (cellHeight + 2 * borderThickness + gap);
            // Vẽ khung với màu được chọn
            ctx.fillStyle = frameColor;
            ctx.fillRect(
              x,
              y,
              cellWidth + 2 * borderThickness,
              cellHeight + 2 * borderThickness
            );
            // Vẽ ảnh bên trong khung
            ctx.drawImage(
              loadedImages[i],
              x + borderThickness,
              y + borderThickness,
              cellWidth,
              cellHeight
            );
          }
        } else if (layoutType === 8) {
          for (let i = 0; i < 8; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = col * (cellWidth + 2 * borderThickness + gap);
            const y = row * (cellHeight + 2 * borderThickness + gap);
            // Vẽ khung với màu được chọn
            ctx.fillStyle = frameColor;
            ctx.fillRect(
              x,
              y,
              cellWidth + 2 * borderThickness,
              cellHeight + 2 * borderThickness
            );
            // Vẽ ảnh bên trong khung
            ctx.drawImage(
              loadedImages[i],
              x + borderThickness,
              y + borderThickness,
              cellWidth,
              cellHeight
            );
          }
        }
        resolve(canvas.toDataURL("image/png"));
      })
      .catch((err) => reject(err));
  });
}

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
    startCamera();
  }, []);

  // Start the camera stream
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

  // Toggle mirror mode
  const toggleMirrorMode = () => {
    if (!filterDisabled) {
      setIsMirrored((prev) => !prev);
    }
  };

  // Capture an image from the video stream
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

    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) saturate(${filters.saturate}%) blur(${filters.blur}px)`;

    // Apply mirroring if enabled
    if (isMirrored) {
      ctx.setTransform(-1, 0, 0, 1, width, 0);
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    ctx.drawImage(videoRef.current, 0, 0, width, height);
    setCapturedImages((prev) => [...prev, canvas.toDataURL("image/png")]);
  };

  // Remove the last captured image
  const undoCapture = () => {
    if (capturedImages.length === 0) return;
    setCapturedImages((prev) => prev.slice(0, -1));
  };

  // Reset all captured images
  const resetCaptures = () => {
    setCapturedImages([]);
  };

  // Reset filters to their default values
  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // Update a specific filter value
  const updateFilter = (id: string, value: string) => {
    setFilters((prev) => ({ ...prev, [id]: Number(value) }));
  };

  // Keyboard shortcuts for photo shooting:
  // Space/Enter: Capture, Delete/Backspace: Undo, Escape: Reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }
      if (e.key === " " || e.key === "Enter") {
        captureImage();
      } else if (e.key === "Backspace" || e.key === "Delete") {
        undoCapture();
      } else if (e.key === "Escape") {
        resetCaptures();
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
      <div className="flex flex-row gap-6 items-center">
        <button
          onClick={captureImage}
          disabled={!isCameraStarted || capturedImages.length >= MAX_CAPTURE}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-transparent text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
          title="Capture Image (Space/Enter)"
        >
          <Camera className="w-5 h-5" />
        </button>
        <button
          onClick={undoCapture}
          disabled={capturedImages.length === 0}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-transparent text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
          title="Undo Capture (Delete/Backspace)"
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          onClick={resetCaptures}
          disabled={capturedImages.length === 0}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-transparent text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
          title="Reset Captures (Escape)"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
      {/* Preview captured images */}
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
      {/* Simple keyboard shortcut hint */}
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
              className={`flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-transparent ${
                filterDisabled ? "text-gray-400" : "text-gray-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={name}
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
                className="mt-2 w-32 h-2 bg-gray-200 rounded-full appearance-none accent-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
  // Change layout type and reset selected images
  const selectLayoutType = (type: number) => {
    setLayoutType(type);
    setSelectedIndices([]);
  };

  // Toggle selection of an image index
  const toggleSelect = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices((prev) => prev.filter((i) => i !== index));
    } else {
      if (selectedIndices.length < layoutType) {
        setSelectedIndices((prev) => [...prev, index]);
      }
    }
  };

  // Render a preview of the layout with empty or selected slots
  const renderPreview = () => {
    const cellClass =
      "w-64 h-48 border flex items-center justify-center transition-all duration-200";
    const emptyClass = "border-dashed border-gray-300 bg-gray-50";
    if (layoutType === 4) {
      return (
        <div ref={previewRef} className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className={`${cellClass} ${
                selectedIndices[idx] !== undefined
                  ? "border-gray-500"
                  : emptyClass
              }`}
              onClick={() => {}}
            >
              {selectedIndices[idx] !== undefined ? (
                <img
                  src={capturedImages[selectedIndices[idx]]}
                  alt={`Slot ${idx}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">Empty</span>
              )}
            </div>
          ))}
        </div>
      );
    } else if (layoutType === 8) {
      return (
        <div ref={previewRef} className="grid grid-cols-2 gap-2">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className={`${cellClass} ${
                selectedIndices[idx] !== undefined
                  ? "border-gray-500"
                  : emptyClass
              }`}
              onClick={() => {}}
            >
              {selectedIndices[idx] !== undefined ? (
                <img
                  src={capturedImages[selectedIndices[idx]]}
                  alt={`Slot ${idx}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">Empty</span>
              )}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row p-6 gap-6">
      {/* Photo Selection Gallery */}
      <div className="md:w-1/2">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Select Photos for Layout
          </h2>
          <p className="text-gray-600 mb-2">
            {layoutType === 4
              ? "Please select exactly 4 photos for your Photo Strip Layout."
              : "Please select exactly 8 photos for your 2-Strip Layout."}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => selectLayoutType(4)}
              className={`px-4 py-2 rounded-full ${
                layoutType === 4
                  ? "bg-gray-800 text-white border border-transparent"
                  : "bg-transparent text-gray-600 border border-gray-300"
              }`}
            >
              Photo Strip
            </button>
            <button
              onClick={() => selectLayoutType(8)}
              className={`px-4 py-2 rounded-full ${
                layoutType === 8
                  ? "bg-gray-800 text-white border border-transparent"
                  : "bg-transparent text-gray-600 border border-gray-300"
              }`}
            >
              2-Strip
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {capturedImages.map((img, index) => {
            const isSelected = selectedIndices.includes(index);
            return (
              <div
                key={index}
                className={`border p-1 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-gray-500 scale-105 z-10"
                    : "border-gray-300"
                }`}
                onClick={() => toggleSelect(index)}
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
      {/* Layout Preview */}
      <div className="md:w-1/2">
        <h2 className="text-xl font-semibold mb-4">Layout Preview</h2>
        <div className="border p-4 flex flex-col items-center justify-center">
          {renderPreview()}
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
  // Thêm state cho frame color (mặc định là pastel pink)
  const [frameColor, setFrameColor] = useState<string>("#FFB3BA");

  // Download composite image using the selected images from layout preview
  const downloadComposite = async () => {
    if (selectedIndices.length < layoutType) {
      alert(`Please select exactly ${layoutType} photos for export.`);
      return;
    }
    const selectedImages = selectedIndices.map(
      (index) => capturedImages[index]
    );
    try {
      const compositeDataUrl = await exportCompositeImage(
        layoutType,
        selectedImages,
        frameColor
      );
      const link = document.createElement("a");
      link.href = compositeDataUrl;
      link.download = "photo_booth_composite.png";
      link.click();
    } catch (error) {
      console.error("Export composite image failed:", error);
    }
  };

  // Reset captured images and return to shooting step
  const retakePhotos = () => {
    setCapturedImages([]);
    setSelectedIndices([]);
    setStep("shoot");
  };

  // Keyboard shortcuts for layout mode: Escape for retake, "d" for download composite
  useEffect(() => {
    if (step === "layout") {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          document.activeElement &&
          (document.activeElement.tagName === "INPUT" ||
            document.activeElement.tagName === "TEXTAREA")
        ) {
          return;
        }
        if (e.key === "Escape") {
          retakePhotos();
        } else if (e.key.toLowerCase() === "d") {
          downloadComposite();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [step, capturedImages, layoutType, frameColor]);

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
        {/* Hiển thị color picker để chọn frame color */}
        {step === "layout" && (
          <div className="flex flex-col items-center mb-4">
            <label htmlFor="frameColor" className="text-gray-600 font-medium">
              Frame Color:
            </label>
            <input
              type="color"
              id="frameColor"
              value={frameColor}
              onChange={(e) => setFrameColor(e.target.value)}
              className="mt-2"
            />
          </div>
        )}
        {step === "shoot" ? (
          capturedImages.length >= MAX_CAPTURE && (
            <button
              onClick={() => setStep("layout")}
              disabled={capturedImages.length < MAX_CAPTURE}
              className="px-4 py-2 rounded-full bg-gray-800 text-white border border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
