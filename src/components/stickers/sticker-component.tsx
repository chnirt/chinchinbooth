"use client";

import { useState, useEffect } from "react";
import { StickerPosition } from "@/types";

interface StickerComponentProps {
  url: string;
  position: StickerPosition;
}

export function StickerComponent({ url, position }: StickerComponentProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 64, height: 64 });

  // Determine if the image is SVG
  const isSvg = url.endsWith(".svg");

  useEffect(() => {
    // For non-SVG images, preload to get dimensions
    if (!isSvg && url) {
      const img = new Image();
      img.onload = () => {
        setDimensions({
          width: img.width,
          height: img.height,
        });
        setImageLoaded(true);
      };
      img.src = url;
    } else {
      setImageLoaded(true);
    }
  }, [url, isSvg]);

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) rotate(${position.rotation}deg) scale(${position.scale})`,
        opacity: imageLoaded ? 1 : 0,
        transition: "opacity 0.3s ease-in-out",
      }}
    >
      <img
        src={url || "/placeholder.svg"}
        alt="Sticker"
        className="object-contain"
        style={{
          width: isSvg ? "4rem" : `${dimensions.width / 16}rem`,
          height: isSvg ? "4rem" : `${dimensions.height / 16}rem`,
          maxWidth: "6rem",
          maxHeight: "6rem",
        }}
        onLoad={() => setImageLoaded(true)}
        onError={(e) => {
          console.error(`Failed to load sticker: ${url}`);
          (e.target as HTMLImageElement).src =
            "/placeholder.svg?height=100&width=100";
        }}
      />
    </div>
  );
}
