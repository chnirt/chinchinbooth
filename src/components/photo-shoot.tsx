"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Undo2,
  Camera,
  X,
  ImageIcon,
  ChevronDown,
  Check,
  Smartphone,
  Monitor,
  CameraOff,
  Clock,
  ArrowRight,
  FlipHorizontal,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { PhotoShootProps } from "@/types";
import { MAX_CAPTURE, TIMER_OPTIONS, DEFAULT_TIMER_INDEX } from "@/constants";
import { FilterGallery, generateFilterStyle } from "./filter-gallery";
import type { FilterValues } from "@/types/filters";
import { FILTER_COLLECTIONS } from "@/constants/filters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMobile } from "@/hooks/use-mobile";
import { CameraType, useBoothCamera } from "@/hooks/use-booth-camera";
import "context-filter-polyfill";
import UploadPhotoButton from "./upload-photo-button";

const cameraFrameClass =
  "aspect-[4/3] w-full overflow-hidden rounded-xl border";

export function PhotoShoot({
  capturedImages,
  setCapturedImages,
  canProceedToLayout,
  goToLayoutScreen,
}: PhotoShootProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capturedImagesRef = useRef<HTMLDivElement>(null);
  const cameraContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextCaptureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const captureRequestedRef = useRef(false);

  const isMobile = useMobile();
  const [currentFilter, setCurrentFilter] = useState<FilterValues>(
    FILTER_COLLECTIONS.normal[0].filter,
  );
  const [isMirrored, setIsMirrored] = useState(isMobile);
  const {
    videoRef,
    attachVideo,
    cameras,
    currentCameraIndex,
    selectCamera,
    isCameraStarted,
    cameraError,
    retryCamera,
    isRetrying,
  } = useBoothCamera(setIsMirrored);
  const [isCapturing, setIsCapturing] = useState(false);

  // Mode toggles and auto sequence state
  const [isAutoModeEnabled, setIsAutoModeEnabled] = useState(true); // just mode toggle
  const [isAutoSequenceActive, setIsAutoSequenceActive] = useState(false); // whether auto capture sequence is running

  // Timer-related state
  const [selectedTimerIndex, setSelectedTimerIndex] =
    useState<number>(DEFAULT_TIMER_INDEX);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Add a new state variable for filter gallery visibility after the other state declarations
  const [showFilters, setShowFilters] = useState(true);

  const [isFlashing, setIsFlashing] = useState(false);

  const t = useTranslations("HomePage");

  const isMaxCaptureReached = capturedImages.length >= MAX_CAPTURE;
  const selectedTimer = TIMER_OPTIONS[selectedTimerIndex];

  // Create disable variable for Timer button
  const timerDisabled =
    !isCameraStarted || isAutoSequenceActive || countdown !== null;

  // Timer control functions
  const changeTimer = useCallback(() => {
    if (timerDisabled) return;
    setSelectedTimerIndex((prev) => (prev + 1) % TIMER_OPTIONS.length);
  }, [timerDisabled]);

  // Add a toggle function after the other function declarations
  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const cameraNames = cameras.map(({ device, type }, index) => {
    if (device.label.trim()) return device.label.trim();

    switch (type) {
      case CameraType.FRONT:
        return isMobile ? "Front Camera" : "Main Camera";
      case CameraType.BACK:
        return "Rear Camera";
      case CameraType.BACK_ULTRA_WIDE:
        return "Ultra-Wide Camera";
      case CameraType.BACK_TELEPHOTO:
        return "Telephoto Camera";
      case CameraType.EXTERNAL:
        return "External Camera";
      default:
        return `Camera ${index + 1}`;
    }
  });

  const cameraNameKeys = cameraNames.map((name) => name.toLowerCase());
  const cameraLabels = cameraNames.map((name, index) => {
    const key = cameraNameKeys[index];
    if (cameraNameKeys.indexOf(key) === cameraNameKeys.lastIndexOf(key))
      return name;

    const number = cameraNameKeys
      .slice(0, index + 1)
      .filter((label) => label === key).length;
    return `${name} (${number})`;
  });

  const selectedCameraLabel =
    cameraLabels[currentCameraIndex] ?? "Select Camera";
  const shortCameraLabel = selectedCameraLabel
    .replace(/\s+\([\da-f]+:[\da-f]+\)$/i, "")
    .replace(/\s+Camera(?=\s+\(\d+\)$|$)/i, "");

  const clearCaptureTimers = useCallback(() => {
    captureRequestedRef.current = false;
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    if (nextCaptureTimerRef.current !== null)
      clearTimeout(nextCaptureTimerRef.current);
    timerRef.current = null;
    nextCaptureTimerRef.current = null;
  }, []);

  const stopAutoSequence = useCallback(() => {
    clearCaptureTimers();
    setIsAutoSequenceActive(false);
    setCountdown(null);
  }, [clearCaptureTimers]);

  useEffect(() => clearCaptureTimers, [clearCaptureTimers]);

  useEffect(() => {
    if (!isCameraStarted) stopAutoSequence();
  }, [isCameraStarted, stopAutoSequence]);

  // Auto-scroll when new capture is added and stop auto sequence if max capture reached
  useEffect(() => {
    if (capturedImagesRef.current && capturedImages.length > 0) {
      capturedImagesRef.current.scrollLeft =
        capturedImagesRef.current.scrollWidth;
    }
    if (isMaxCaptureReached && isAutoSequenceActive) {
      stopAutoSequence();
    }
  }, [
    capturedImages.length,
    isMaxCaptureReached,
    isAutoSequenceActive,
    stopAutoSequence,
  ]);

  // After captureImage completes, schedule the next auto capture if in auto mode
  const scheduleNextAutoCapture = useCallback(() => {
    if (isAutoModeEnabled && capturedImages.length < MAX_CAPTURE - 1) {
      nextCaptureTimerRef.current = setTimeout(() => {
        nextCaptureTimerRef.current = null;
        if (!captureRequestedRef.current) return;
        hasCapturedRef.current = false;
        setCountdown(selectedTimer);
      }, 1000);
    } else {
      stopAutoSequence();
    }
  }, [
    capturedImages.length,
    isAutoModeEnabled,
    selectedTimer,
    stopAutoSequence,
  ]);

  // Modify the captureImage function to remove the flash effect
  const captureImage = useCallback(() => {
    if (
      !isCameraStarted ||
      !videoRef.current ||
      !canvasRef.current ||
      isMaxCaptureReached ||
      isCapturing
    )
      return;

    // Trigger Black Flash Effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 80); // Quick flash like iPhone

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
    ctx.filter = generateFilterStyle(currentFilter);

    // Mirror image if needed
    ctx.setTransform(isMirrored ? -1 : 1, 0, 0, 1, isMirrored ? width : 0, 0);
    ctx.drawImage(videoRef.current, 0, 0, width, height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const imageData = canvas.toDataURL("image/png");

    // Remove flash effect and just add the image
    setCapturedImages((prev) => [...prev, imageData]);
    setIsCapturing(false);
    scheduleNextAutoCapture();
  }, [
    videoRef,
    currentFilter,
    isCameraStarted,
    isCapturing,
    isMaxCaptureReached,
    isMirrored,
    scheduleNextAutoCapture,
    setCapturedImages,
  ]);

  const uploadDisabled =
    !isCameraStarted ||
    isCapturing ||
    countdown !== null ||
    isAutoSequenceActive ||
    isMaxCaptureReached;
  // Create disable variable for Undo button
  const undoDisabled =
    !capturedImages.length || isAutoSequenceActive || countdown !== null;
  const captureDisabled =
    !canProceedToLayout &&
    (!isCameraStarted || isMaxCaptureReached || isCapturing);
  // const autoDisabled =
  //   !isCameraStarted ||
  //   isMaxCaptureReached ||
  //   isCapturing ||
  //   countdown !== null ||
  //   isAutoSequenceActive;
  const selectCameraDisabled =
    !isCameraStarted ||
    isCapturing ||
    countdown !== null ||
    isAutoSequenceActive;
  const mirrorDisabled =
    !isCameraStarted ||
    isCapturing ||
    countdown !== null ||
    isAutoSequenceActive;
  const filtersDisabled =
    !isCameraStarted ||
    isCapturing ||
    countdown !== null ||
    isAutoSequenceActive;

  // Undo last capture
  const undoCapture = useCallback(() => {
    if (undoDisabled) return;
    if (capturedImages.length) {
      setCapturedImages((prev) => prev.slice(0, -1));
    }
  }, [capturedImages.length, setCapturedImages, undoDisabled]);

  // Start capture (single-shot or auto-capture)
  const startCapture = useCallback(() => {
    if (!isCameraStarted || isMaxCaptureReached) return;
    captureRequestedRef.current = true;
    // Start countdown with the selected timer
    setCountdown(selectedTimer);
    if (isAutoModeEnabled) {
      setIsAutoSequenceActive(true);
    }
  }, [isAutoModeEnabled, isCameraStarted, isMaxCaptureReached, selectedTimer]);

  const toggleAutoMode = useCallback(() => {
    setIsAutoModeEnabled((prev) => !prev);
    if (isAutoSequenceActive) {
      stopAutoSequence();
    }
  }, [isAutoSequenceActive, stopAutoSequence]);

  // Ref to ensure captureImage is only called once when countdown reaches 0
  const hasCapturedRef = useRef(false);

  // Countdown effect: reduce countdown every second and trigger capture when it hits 0
  useEffect(() => {
    if (countdown === null) {
      hasCapturedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (countdown > 0) {
      hasCapturedRef.current = false;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (
      countdown === 0 &&
      captureRequestedRef.current &&
      !hasCapturedRef.current
    ) {
      hasCapturedRef.current = true;
      captureImage();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [countdown, captureImage]);

  // Handle filter change
  const handleFilterChange = (filter: FilterValues) => {
    // Apply the filter immediately
    setCurrentFilter(filter);

    // Add a subtle animation to indicate the filter has changed
    if (videoRef.current) {
      const video = videoRef.current;
      video.classList.add("filter-transition");
      setTimeout(() => {
        video.classList.remove("filter-transition");
      }, 300);
    }
  };

  // Toggle mirroring manually
  const toggleMirroring = useCallback(() => {
    setIsMirrored((prev) => !prev);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || ""))
        return;
      switch (e.key) {
        case " ":
        case "Enter": {
          if (
            e.repeat ||
            (e.target instanceof HTMLElement &&
              e.target.closest(
                "button, a, select, [role=button], [role=menuitem]",
              ))
          )
            return;

          e.preventDefault();
          if (canProceedToLayout) {
            goToLayoutScreen();
          } else if (isAutoSequenceActive || countdown !== null) {
            stopAutoSequence();
          } else {
            startCapture();
          }
          break;
        }
        case "Backspace":
        case "Delete":
          undoCapture();
          break;
          // case "a":
          //   toggleAutoMode();
          break;
        case "m":
          toggleMirroring();
          break;
        case "t":
          changeTimer();
          break;
        case "f":
          toggleFilters();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    capturedImages,
    isCameraStarted,
    isMirrored,
    isCapturing,
    isAutoSequenceActive,
    countdown,
    canProceedToLayout,
    goToLayoutScreen,
    stopAutoSequence,
    startCapture,
    undoCapture,
    toggleAutoMode,
    toggleMirroring,
    changeTimer,
    toggleFilters,
  ]);

  // Get camera icon based on type
  const getCameraIcon = useCallback((type: CameraType) => {
    switch (type) {
      case CameraType.FRONT:
        return <Camera className="h-4 w-4" />;
      case CameraType.BACK:
      case CameraType.BACK_ULTRA_WIDE:
      case CameraType.BACK_TELEPHOTO:
        return <Smartphone className="h-4 w-4" />;
      case CameraType.EXTERNAL:
        return <Monitor className="h-4 w-4" />;
      default:
        return <Camera className="h-4 w-4" />;
    }
  }, []);

  // Get appropriate icon for the main capture button
  const getCaptureButtonIcon = useCallback(() => {
    if (canProceedToLayout) {
      return <ArrowRight className="h-7 w-7" />;
    } else if (isAutoSequenceActive || countdown !== null) {
      return <X className="h-7 w-7" />;
    } else if (!isCameraStarted) {
      return <CameraOff className="h-7 w-7" />;
    } else {
      return <Camera className="h-7 w-7" />;
    }
  }, [canProceedToLayout, countdown, isAutoSequenceActive, isCameraStarted]);

  const handleImageUpload = (
    imageDataArray: (string | ArrayBuffer | null)[],
  ) => {
    // Filter to include only strings (base64 data)
    const validImages = imageDataArray.filter(
      (data): data is string => typeof data === "string",
    );
    if (validImages.length > 0) {
      setCapturedImages((prev) => [...prev, ...validImages]);
    }
  };

  useEffect(() => {
    setShowFilters(!isMobile);
  }, [isMobile]);

  // Update the UI with the rose-teal color scheme
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center space-y-4 p-3 select-none">
      {/* Camera view with standard border */}
      {cameraError ? (
        <div
          className={cn(
            cameraFrameClass,
            "grid place-items-center border-red-100 bg-red-50 p-4 text-center font-bold text-red-600",
          )}
        >
          <div className="flex max-w-sm flex-col items-center gap-3 sm:gap-4">
            <p role="alert" className="text-sm sm:text-base">
              {cameraError === "no-devices"
                ? t("errors.camera_unavailable")
                : cameraError === "blocked"
                  ? t("errors.camera_still_blocked")
                  : t("errors.camera_access_required")}
            </p>
            <Button
              type="button"
              onClick={retryCamera}
              disabled={isRetrying}
              aria-busy={isRetrying}
              className="rounded-full"
            >
              <RotateCcw
                aria-hidden="true"
                className={isRetrying ? "motion-safe:animate-spin" : undefined}
              />
              {t(isRetrying ? "opening_camera" : "retry_camera")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-2">
          <motion.div
            ref={cameraContainerRef}
            className={cn(
              cameraFrameClass,
              "bg-muted relative border-gray-200",
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="relative h-full w-full">
              <video
                ref={attachVideo}
                autoPlay
                playsInline
                className={cn(
                  "block h-full w-full object-cover",
                  isMirrored ? "-scale-x-100" : "",
                )}
                style={{ filter: generateFilterStyle(currentFilter) }}
              />

              {/* Black Flash Overlay */}
              <AnimatePresence>
                {isFlashing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.05 }}
                    className="pointer-events-none absolute inset-0 z-50 bg-black"
                  />
                )}
              </AnimatePresence>

              {/* Camera controls overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                {/* Camera selection dropdown */}
                {cameras.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      disabled={selectCameraDisabled}
                    >
                      <Button
                        aria-label={selectedCameraLabel}
                        title={selectedCameraLabel}
                        className="flex items-center gap-1 rounded-lg bg-black/50 p-2 text-white hover:bg-black/70"
                      >
                        {cameras[currentCameraIndex] &&
                          getCameraIcon(cameras[currentCameraIndex].type)}
                        <span
                          aria-hidden="true"
                          className="max-w-[min(10rem,35vw)] min-w-0 truncate text-xs font-medium"
                        >
                          {shortCameraLabel}
                        </span>
                        <ChevronDown className="h-3 w-3 opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      collisionPadding={12}
                      className="w-72 max-w-[calc(100vw-1.5rem)]"
                    >
                      {cameras.map((camera, index) => (
                        <DropdownMenuItem
                          key={camera.device.deviceId}
                          className={cn(
                            "flex items-center gap-2 text-sm",
                            currentCameraIndex === index &&
                              "bg-accent font-medium",
                          )}
                          aria-current={
                            currentCameraIndex === index ? "true" : undefined
                          }
                          textValue={cameraLabels[index]}
                          onSelect={() => selectCamera(index)}
                        >
                          {getCameraIcon(camera.type)}
                          <span
                            className="min-w-0 flex-1 truncate"
                            title={cameraLabels[index]}
                          >
                            {cameraLabels[index]}
                          </span>
                          {currentCameraIndex === index && (
                            <Check
                              aria-hidden="true"
                              className="text-primary size-4 shrink-0"
                            />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Guide overlay with animated border */}
              <div className="animate-pulse-gentle pointer-events-none absolute inset-4 rounded-lg border-2 border-white/30" />

              {/* Countdown overlay with default styling */}
              <AnimatePresence>
                {countdown !== null && countdown > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 1.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="text-primary-foreground absolute right-4 bottom-4 flex h-16 w-16 items-center justify-center rounded-full bg-black/50 shadow-lg hover:bg-black/70"
                  >
                    <span className="text-3xl font-bold">{countdown}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute top-4 right-4 flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 text-white">
                <ImageIcon className="h-4 w-4" />
                <span>
                  {capturedImages.length}/{MAX_CAPTURE}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Filter Gallery with Toggle Button */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="rounded-lg bg-white"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FilterGallery
                    onFilterChange={handleFilterChange}
                    currentFilter={currentFilter}
                    sampleImageUrl="/placeholder.jpg"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* Camera controls with reorganized layout */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="flex w-full items-center justify-center gap-6">
          {/* Upload Photo Button */}
          <UploadPhotoButton
            onImageUpload={handleImageUpload}
            disabled={uploadDisabled}
            maxFiles={MAX_CAPTURE - capturedImages.length}
          />

          {/* Center - Main capture button */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={
                canProceedToLayout
                  ? goToLayoutScreen
                  : isAutoSequenceActive || countdown !== null
                    ? stopAutoSequence
                    : startCapture
              }
              disabled={captureDisabled}
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full p-0",
                canProceedToLayout &&
                  "bg-green-400 text-white hover:bg-green-500",
                (isAutoSequenceActive || countdown !== null) &&
                  "bg-red-400 text-white hover:bg-red-500",
              )}
              size="icon"
            >
              {getCaptureButtonIcon()}
              <span className="sr-only">Capture</span>
            </Button>
          </motion.div>

          {/* Filter Toggle Button */}
          <Button
            onClick={toggleFilters}
            disabled={filtersDisabled}
            className="aria-pressed:border-primary/50 aria-pressed:bg-accent size-10 rounded-full"
            aria-pressed={showFilters}
            variant="outline"
            size="icon"
          >
            <img
              className="dark:invert"
              src="/color-filters.png"
              alt=""
              loading="eager"
              width={22}
              height={22}
            />
            <span className="sr-only">Toggle filters</span>
          </Button>
        </div>

        <div className="flex w-full items-center justify-center gap-2 border-t border-gray-100 pt-2">
          <Button
            onClick={undoCapture}
            disabled={undoDisabled}
            className="rounded-full"
            variant="outline"
            size="icon"
          >
            <Undo2 aria-hidden="true" />
            <span className="sr-only">Undo capture</span>
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={changeTimer}
              disabled={timerDisabled}
            >
              <Clock aria-hidden="true" />
              <span className="sr-only">Next timer</span>
            </Button>
            <div
              className={cn(
                "bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-medium",
                timerDisabled && "pointer-events-none opacity-50",
              )}
            >
              {selectedTimer}
            </div>
          </div>

          <Button
            onClick={toggleMirroring}
            disabled={mirrorDisabled}
            className="rounded-full"
            aria-pressed={isMirrored}
            variant={isMirrored ? "default" : "outline"}
            size="icon"
          >
            <FlipHorizontal aria-hidden="true" />
            <span className="sr-only">Mirror image</span>
          </Button>
        </div>

        {/* Keyboard shortcuts info */}
        <div className="mt-2 hidden text-xs text-gray-600 lg:block">
          <strong>Delete</strong>: {t("undo")} | <strong>T</strong>:{" "}
          {t("change_timer")} | <strong>Space</strong>: {t("capture")} |{" "}
          <strong>M</strong>: {t("toggle_mirror")} | <strong>F</strong>:{" "}
          {t("toggle_filters")}
        </div>
      </motion.div>

      {/* Captured images display with standard border */}
      <div
        ref={capturedImagesRef}
        className="custom-scrollbar hide-scrollbar flex w-full snap-x gap-1 overflow-x-auto scroll-smooth md:gap-2"
        style={{
          height: cameraContainerRef.current
            ? cameraContainerRef.current.clientHeight / 2.5
            : "auto",
        }}
      >
        <AnimatePresence>
          {capturedImages.map((img, index) => (
            <motion.div
              key={img}
              className="relative aspect-[4/3] flex-shrink-0 overflow-hidden rounded-lg border border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.3, ease: "easeInOut" },
              }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 20,
                delay: index * 0.03,
              }}
              layout
            >
              {/* Image */}
              <motion.img
                src={img || "/placeholder.svg"}
                alt={`Captured ${index}`}
                className="h-full w-full object-cover"
                initial={{ filter: "blur(8px)" }}
                animate={{
                  filter: "blur(0px)",
                  transition: { duration: 0.3, delay: 0.1 },
                }}
              />

              {/* Delete button at top-right with better styling */}
              <Button
                onClick={() =>
                  setCapturedImages((prev) =>
                    prev.filter((_, i) => i !== index),
                  )
                }
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-80 hover:opacity-100"
                aria-label={`Delete image ${index + 1}`}
                disabled={captureDisabled}
              >
                <X className="h-3 w-3" />
              </Button>

              {/* Image number indicator */}
              <motion.div
                className="bg-primary absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white opacity-80"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 0.9,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 25,
                    delay: 0.2 + index * 0.05,
                  },
                }}
              >
                {index + 1}
              </motion.div>

              {/* Subtle overlay gradient */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-50" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
