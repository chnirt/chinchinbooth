import type { QrShare } from "@/lib/upload-utils";

// Types for the photo booth application
export interface StepProgressProps {
  currentStep: number;
}

export interface PhotoShootProps {
  capturedImages: string[];
  setCapturedImages: React.Dispatch<React.SetStateAction<string[]>>;
  canProceedToLayout: boolean;
  goToLayoutScreen: () => void;
}

export interface Layout {
  count: number;
  overlayUrl: string | null;
  backgroundUrl: string | null;
}

export interface Frame {
  id: string;
  name: string;
  layouts: Layout[];
  isNew?: boolean;
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
  retakePhotos: () => void;
  generateImage: (stripKey: string) => Promise<Blob | null>;
  canDownload: boolean;
  isDownloading: boolean;
  uploadAndGenerateQR: (stripKey: string) => Promise<QrShare | null>;
  isUploading: boolean;
}
