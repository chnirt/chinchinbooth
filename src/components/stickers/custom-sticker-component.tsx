"use client";

import { X } from "lucide-react";
import { StickerItem, StickerPosition } from "@/types";

interface CustomStickerComponentProps {
  sticker: StickerItem;
  position: StickerPosition;
  onRemove: () => void;
}

export function CustomStickerComponent({
  sticker,
  position,
  onRemove,
}: CustomStickerComponentProps) {
  return (
    <div
      className="absolute cursor-grab"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) rotate(${position.rotation}deg) scale(${position.scale})`,
      }}
    >
      <div className="group relative">
        <img
          src={sticker.url || "/placeholder.svg"}
          alt={sticker.name}
          className="h-16 w-16 object-contain"
        />
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
