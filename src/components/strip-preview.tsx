"use client";

import { memo, type RefObject } from "react";
import { ImagePlus } from "lucide-react";
import { getFrameLayout } from "@/lib/frame-utils";
import { cn } from "@/lib/utils";

interface StripPreviewProps {
  capturedImages: string[];
  selectedIndices: number[];
  layoutType: number;
  selectedFrame: string | null;
  frameColor: string | null;
  selectedGradient: string | null;
  stripKey: string;
  previewRef: RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  onSelectPhotos: () => void;
}

function FrameLayer({ src, overlay }: { src: string; overlay: boolean }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0",
        overlay ? "z-20" : "z-0",
      )}
    >
      <img
        src={src}
        alt={overlay ? "Frame Overlay" : "Frame Background"}
        className="h-full w-full object-contain"
        crossOrigin="anonymous"
      />
    </div>
  );
}

export const StripPreview = memo(function StripPreview({
  capturedImages,
  selectedIndices,
  layoutType,
  selectedFrame,
  frameColor,
  selectedGradient,
  stripKey,
  previewRef,
  isMobile,
  onSelectPhotos,
}: StripPreviewProps) {
  const renderCell = (idx: number) => {
    const cellContent =
      selectedIndices[idx] !== undefined ? (
        <img
          src={capturedImages[selectedIndices[idx]] || "/placeholder.svg"}
          alt={`Slot ${idx}`}
          className="h-full w-full object-cover"
          crossOrigin="anonymous"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
          {!isMobile ? (
            <span className="text-xs">Empty</span>
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
        </div>
      );

    const baseClass =
      "w-full aspect-[4/3] flex items-center justify-center transition-all duration-200 overflow-hidden border border-transparent";
    const emptyClass = "border-dashed border-gray-200 bg-gray-50/50";

    return (
      <button
        key={idx}
        className={cn(
          baseClass,
          selectedIndices[idx] === undefined && emptyClass,
        )}
        onClick={onSelectPhotos}
        disabled={!isMobile}
      >
        {cellContent}
      </button>
    );
  };

  const commonClasses =
    "mx-auto overflow-hidden rounded-md border border-gray-200 shadow-md";

  const frame = getFrameLayout(selectedFrame, layoutType);
  const frameBackground = frame?.backgroundUrl && (
    <FrameLayer src={frame.backgroundUrl} overlay={false} />
  );
  const frameOverlay = frame?.overlayUrl && (
    <FrameLayer src={frame.overlayUrl} overlay />
  );

  const backgroundStyle = selectedGradient
    ? { background: selectedGradient }
    : { backgroundColor: frameColor || "#FFFFFF" };

  if (layoutType === 4) {
    return (
      <div className={cn("relative max-w-1/2", commonClasses)}>
        <div
          ref={previewRef}
          data-strip-key={stripKey}
          className="flex aspect-[1/3] flex-col gap-[5%] p-[10%]"
          style={backgroundStyle}
        >
          {frameBackground}
          <div className="relative z-10 grid grid-cols-1 gap-[5%]">
            {Array.from({ length: 4 }, (_, idx) => renderCell(idx))}
          </div>
          {frameOverlay}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", commonClasses)}>
      <div
        ref={previewRef}
        data-strip-key={stripKey}
        className="flex aspect-[2/3] flex-col gap-[calc(2.5%*3/2)] p-[5%]"
        style={backgroundStyle}
      >
        {frameBackground}
        <div className="relative z-10 grid grid-cols-2 gap-[calc(2.5%*3/2)]">
          <div className="flex flex-col gap-[2.5%]">
            {Array.from({ length: 4 }, (_, idx) => renderCell(idx))}
          </div>
          <div className="flex flex-col gap-[2.5%]">
            {Array.from({ length: 4 }, (_, idx) => renderCell(idx + 4))}
          </div>
        </div>
        {frameOverlay}
      </div>
    </div>
  );
});
