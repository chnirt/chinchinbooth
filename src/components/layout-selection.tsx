"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  GripHorizontal,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { LayoutSelectionProps } from "@/types";
import { FrameCustomization, type FrameTab } from "./frame-customization";
import { StripPreview } from "./strip-preview";
import { useMobile } from "@/hooks/use-mobile";
import { usePWA } from "@/hooks/use-pwa";
import ShareDialog from "./share-dialog";
import DownloadDialog from "./download-dialog";
import { MyDrawer } from "./my-drawer";
import BottomNavigation from "./bottom-navigation";
import Header from "./header";

export function LayoutSelection({
  capturedImages,
  previewRef,
  layoutType,
  selectedIndices,
  setSelectedIndices,
  setLayoutType,
  selectedFrame,
  setSelectedFrame,
  retakePhotos,
  generateImage,
  canDownload,
  isDownloading,
  uploadAndGenerateQR,
  isUploading,
  imageUrl,
  setImageUrl,
}: LayoutSelectionProps) {
  const isMobile = useMobile();
  const isPWA = usePWA();
  const [frameColor, setFrameColor] = useState<string | null>("#FFFFFF");
  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FrameTab>("frames");
  const [copied, setCopied] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [drawerType, setDrawerType] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const t = useTranslations("HomePage");

  // Show QR section when imageUrl is available
  useEffect(() => {
    if (imageUrl) {
      setShowShareDialog(true);
    }
  }, [imageUrl]);

  // Reset copied state when imageUrl changes
  useEffect(() => {
    setCopied(false);
  }, [imageUrl]);

  const selectLayoutType = useCallback(
    (type: number) => {
      setLayoutType(type);
      setSelectedIndices([]);
      setImageUrl(null);
    },
    [setImageUrl, setLayoutType, setSelectedIndices],
  );

  const toggleSelect = useCallback(
    (index: number) =>
      setSelectedIndices((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : prev.length < layoutType
            ? [...prev, index]
            : prev,
      ),
    [layoutType, setSelectedIndices],
  );

  const handleColorChange = useCallback(
    (color: string) => {
      setFrameColor(color);
      setSelectedGradient(null);
      setImageUrl(null);
      setSelectedFrame(null);
    },
    [setImageUrl, setSelectedFrame],
  );

  const handleGradientChange = useCallback(
    (gradient: string) => {
      setFrameColor(null);
      setSelectedGradient(gradient);
      setImageUrl(null);
      setSelectedFrame(null);
    },
    [setImageUrl, setSelectedFrame],
  );

  const handleFrameChange = useCallback(
    (frameId: string | null) => {
      setFrameColor(null);
      setSelectedGradient(null);
      setImageUrl(null);
      setSelectedFrame(frameId);
    },
    [setImageUrl, setSelectedFrame],
  );

  const copyToClipboard = useCallback(async () => {
    if (!imageUrl) return;

    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  }, [imageUrl]);

  const shareUrl = useCallback(async () => {
    if (!imageUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Photo Booth Creation",
          text: "Check out my photo booth creation!",
          url: imageUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      copyToClipboard();
    }
  }, [copyToClipboard, imageUrl]);

  const handleGenerateImage = useCallback(async () => {
    if (isPWA) {
      const newTab = window.open("", "_blank");
      if (!newTab) {
        alert("Popup blocked 😢");
        return;
      }

      // Show loading screen
      const loadingHTML = `
        <!DOCTYPE html>
        <html>
          <head><title>Loading...</title></head>
          <body style="background:#000; color:#fff; margin:0; display:flex; align-items:center; justify-content:center; height:100vh;">
            <h1>Preparing image...</h1>
          </body>
        </html>
      `;
      const loadingBlob = new Blob([loadingHTML], { type: "text/html" });
      newTab.location.href = URL.createObjectURL(loadingBlob);

      // Wait for canvas/image generation
      const dataUrl = await generateImage(layoutType); // Should return data:image/jpeg;base64,...

      // Final image page
      const imageHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Your Image</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body {
                margin: 0;
                background: #000;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              img {
                max-width: 100%;
                max-height: 100%;
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="Generated Image" />
          </body>
        </html>
      `;
      const imageBlob = new Blob([imageHTML], { type: "text/html" });
      newTab.location.href = URL.createObjectURL(imageBlob);
      return;
    }

    const dataUrl = await generateImage(layoutType); // gọi hàm xử lý canvas

    if (dataUrl) {
      if (isMobile) {
        setImageDataUrl(dataUrl);
        setShowDownloadDialog(true);
        return;
      }

      // Set the download file name based on the layout type
      // Use "1x4" for a 4-panel layout, and "2x4" for an 8-panel layout
      const fileName =
        layoutType === 4
          ? `chinchinbooth_1x4_${Date.now()}.jpeg`
          : `chinchinbooth_2x4_${Date.now()}.jpeg`;

      // Create a link to download the final image
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    }
  }, [generateImage, isMobile, isPWA, layoutType]);

  const renderCapturedImages = () => {
    return (
      <div className="grid grid-cols-2 gap-2 bg-white p-2 sm:grid-cols-3">
        {capturedImages.map((img, index) => {
          const isSelected = selectedIndices.includes(index);
          const selectionIndex = selectedIndices.indexOf(index) + 1;

          return (
            <motion.div
              key={index}
              onClick={() => toggleSelect(index)}
              className={cn(
                "relative aspect-[4/3] flex-1 cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200",
                isSelected ? "border-primary z-10" : "border-gray-200",
              )}
              // whileTap={{ scale: 0.98 }}
            >
              <img
                src={img || "/placeholder.svg"}
                alt={`Photo ${index}`}
                className="h-full w-full object-cover"
                crossOrigin="anonymous"
              />
              {isSelected && (
                <div className="bg-primary text-primary-foreground absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold">
                  {selectionIndex}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const showDrawerWithType = useCallback((newDrawerType: string) => {
    setDrawerType(newDrawerType);
    setShowDrawer(true);
  }, []);

  const openPhotoDrawer = useCallback(() => {
    showDrawerWithType("select_photo");
  }, [showDrawerWithType]);

  const renderLayoutType = () => {
    return (
      <div className="flex gap-3">
        <Button
          onClick={() => selectLayoutType(4)}
          variant={layoutType === 4 ? "default" : "outline"}
          className="h-auto rounded-full px-4 py-1 text-sm"
          size="sm"
        >
          {t("photo_strip", {
            count: 4,
          })}
        </Button>
        <Button
          onClick={() => selectLayoutType(8)}
          variant={layoutType === 8 ? "default" : "outline"}
          className="h-auto rounded-full px-4 py-1 text-sm"
          size="sm"
        >
          {t("photo_strip", {
            count: 8,
          })}
        </Button>
      </div>
    );
  };

  const frameCustomization = (
    <FrameCustomization
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      frameColor={frameColor}
      selectedGradient={selectedGradient}
      selectedFrame={selectedFrame}
      layoutType={layoutType}
      handleColorChange={handleColorChange}
      handleGradientChange={handleGradientChange}
      handleFrameChange={handleFrameChange}
      setImageUrl={setImageUrl}
    />
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-3">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {!isMobile && (
          <div className="hidden flex-col gap-6 md:flex">
            {/* Photo Selection Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <h2 className="mb-2 text-lg font-semibold text-gray-800">
                {t("select_photos")}
              </h2>
              <div className="mb-3">{renderLayoutType()}</div>

              <div className="flex flex-col">
                <p className="mb-2 text-xs text-gray-600">
                  {t("select_prompt", {
                    count: layoutType,
                    selectedCount: selectedIndices.length,
                  })}
                </p>

                <div className="rounded-lg border border-gray-200">
                  {renderCapturedImages()}
                </div>
              </div>
            </motion.div>

            {/* Enhanced Frame Customization Section */}
            <motion.div
              className="rounded-lg border border-gray-200 bg-white p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  {t("frame_customization")}
                </h2>
              </div>

              {frameCustomization}
            </motion.div>
          </div>
        )}

        {/* Layout Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="mb-3 hidden text-lg font-semibold text-gray-800 md:flex">
            {t("layout_preview")}
          </h2>

          <div className="mb-3 md:hidden">
            <Header
              retake={retakePhotos}
              download={handleGenerateImage}
              downloadDisabled={!canDownload || isDownloading}
              share={uploadAndGenerateQR}
              shareDisabled={!canDownload || isUploading}
              isDownloading={isDownloading}
              isUploading={isUploading}
            />
          </div>

          <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4">
            <div className="w-full max-w-md">
              <StripPreview
                capturedImages={capturedImages}
                selectedIndices={selectedIndices}
                layoutType={layoutType}
                selectedFrame={selectedFrame}
                frameColor={frameColor}
                selectedGradient={selectedGradient}
                previewRef={previewRef}
                isMobile={isMobile}
                onSelectPhotos={openPhotoDrawer}
              />
            </div>
          </div>

          <div className="mt-3 md:hidden">
            <BottomNavigation showDrawerWithType={showDrawerWithType} />
          </div>

          {/* Preview tips */}
          <div className="mt-3 hidden rounded-md bg-gray-50 p-3 md:flex">
            <div className="flex items-start gap-2">
              <GripHorizontal className="mt-0.5 h-4 w-4 text-gray-500" />
              <div>
                <h3 className="text-sm font-medium text-gray-700">
                  {t("layout_tips")}
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  {t("layout_tips_content")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="hidden flex-wrap justify-center gap-3 md:flex">
        <Button
          onClick={retakePhotos}
          variant="outline"
          className="flex items-center justify-center rounded-full px-4 py-2"
          size="sm"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t("retake")}
        </Button>
        <Button
          onClick={handleGenerateImage}
          disabled={!canDownload || isDownloading}
          className={cn(
            "flex items-center justify-center rounded-full px-4 py-2 font-medium",
            !canDownload && "cursor-not-allowed",
          )}
          variant={canDownload && !isDownloading ? "default" : "secondary"}
          size="sm"
        >
          {isDownloading ? (
            <>
              <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
              {t("processing")}...
            </>
          ) : (
            <>
              <Download className="mr-1 h-4 w-4" />
              {canDownload
                ? t("download")
                : t("select_more", {
                    count: layoutType - selectedIndices.length,
                  })}
            </>
          )}
        </Button>
        <Button
          onClick={uploadAndGenerateQR}
          disabled={!canDownload || isUploading}
          className={cn(
            "flex items-center justify-center rounded-full px-4 py-2 font-medium",
            !canDownload && "cursor-not-allowed",
          )}
          variant={canDownload && !isUploading ? "default" : "secondary"}
          size="sm"
        >
          {isUploading ? (
            <>
              <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
              {t("uploading")}...
            </>
          ) : (
            <>
              <Smartphone className="mr-1 h-4 w-4" />
              {t("send_to_phone")}
            </>
          )}
        </Button>
      </div>

      {/* Download Dialog for iOS users */}
      <DownloadDialog
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
        imageDataUrl={imageDataUrl}
        layoutType={layoutType}
      />

      {/* Share Dialog with QR Code */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        imageUrl={imageUrl}
        copied={copied}
        copyToClipboard={copyToClipboard}
        shareUrl={shareUrl}
      />

      <MyDrawer
        open={showDrawer}
        onOpenChange={setShowDrawer}
        title={
          drawerType === "frames"
            ? t("select_frame")
            : drawerType === "layouts"
              ? t("select_layout")
              : drawerType === "select_photo"
                ? t("select_photo")
                : ""
        }
        description={
          drawerType === "frames"
            ? t("select_frame_description")
            : drawerType === "layouts"
              ? t("select_layout_description")
              : drawerType === "select_photo"
                ? t("select_prompt", {
                    count: layoutType,
                    selectedCount: selectedIndices.length,
                  })
                : ""
        }
      >
        {drawerType === "frames" ? (
          <div className="overflow-y-auto p-4">{frameCustomization}</div>
        ) : null}
        {drawerType === "layouts" ? (
          <div className="flex justify-center p-4">{renderLayoutType()}</div>
        ) : null}
        {drawerType === "select_photo" ? (
          <div className="overflow-y-auto p-4">{renderCapturedImages()}</div>
        ) : null}
      </MyDrawer>
    </div>
  );
}
