// Types for the photo booth application
export interface Control {
  id: string;
  icon: React.ComponentType<{ className: string; title?: string }>;
  action: string;
}

export interface StepProgressProps {
  currentStep: number;
}

export interface PhotoShootProps {
  capturedImages: string[];
  setCapturedImages: React.Dispatch<React.SetStateAction<string[]>>;
  canProceedToLayout: boolean;
  goToLayoutScreen: () => void;
}

export interface StickerPosition {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface StickerItem {
  id: string;
  name: string;
  url: string;
  position: StickerPosition;
}

export interface StickerLayout {
  id: string;
  name: string;
  stickers: {
    url: string;
    positions: StickerPosition[];
  }[];
}

export interface LayoutSelectionProps {
  capturedImages: string[];
  previewRef: React.RefObject<HTMLDivElement | null>;
  layoutType: number;
  selectedIndices: number[];
  setSelectedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  setLayoutType: React.Dispatch<React.SetStateAction<number>>;
  selectedFrame: string | null;
  setSelectedFrame: React.Dispatch<React.SetStateAction<string | null>>;
  selectedStickerLayout: string | null;
  setSelectedStickerLayout: React.Dispatch<React.SetStateAction<string | null>>;
  customStickers: StickerItem[];
  setCustomStickers: React.Dispatch<React.SetStateAction<StickerItem[]>>;
  retakePhotos: () => void;
  downloadComposite: () => Promise<void>;
  canDownload: boolean;
  isDownloading: boolean;
  uploadAndGenerateQR: () => Promise<void>;
  isUploading: boolean;
  imageUrl: string | null;
  setImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
}
