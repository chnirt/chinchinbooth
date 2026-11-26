import { useCallback, useEffect, useRef, useState } from "react";
import { MOBILE_BREAKPOINT } from "./use-mobile";

// Camera type enum
export enum CameraType {
  FRONT = "front",
  BACK = "back",
  BACK_ULTRA_WIDE = "back_ultra_wide",
  BACK_TELEPHOTO = "back_telephoto",
  EXTERNAL = "external",
  UNKNOWN = "unknown",
}

// Camera info interface
export interface CameraInfo {
  device: MediaDeviceInfo;
  type: CameraType;
}

function detectCameraType(
  device: MediaDeviceInfo,
  index: number,
  totalCameras: number,
  isMobile: boolean,
): CameraType {
  const label = device.label.toLowerCase();

  // Check for explicit keywords in the label
  if (label.includes("ultra") || label.includes("wide")) {
    return CameraType.BACK_ULTRA_WIDE;
  }

  if (label.includes("tele") || label.includes("zoom")) {
    return CameraType.BACK_TELEPHOTO;
  }

  if (
    label.includes("back") ||
    label.includes("rear") ||
    label.includes("environment")
  ) {
    return CameraType.BACK;
  }

  if (
    label.includes("front") ||
    label.includes("face") ||
    label.includes("user") ||
    label.includes("selfie")
  ) {
    return CameraType.FRONT;
  }

  // Heuristics for mobile devices
  if (isMobile) {
    // On mobile with multiple cameras
    if (totalCameras >= 3) {
      // First is usually main back, second is ultra-wide or telephoto, last is front
      if (index === 0) return CameraType.BACK;
      if (index === totalCameras - 1) return CameraType.FRONT;
      return index === 1
        ? CameraType.BACK_ULTRA_WIDE
        : CameraType.BACK_TELEPHOTO;
    } else if (totalCameras === 2) {
      // With 2 cameras, first is usually back, second is front
      return index === 0 ? CameraType.BACK : CameraType.FRONT;
    }
    // Single camera on mobile is usually front
    return CameraType.FRONT;
  }

  // For desktop/laptop
  if (index === 0 && totalCameras === 1) {
    // Built-in webcam
    return CameraType.FRONT;
  }

  // External cameras or additional cameras
  if (index > 0 || totalCameras > 1) {
    return CameraType.EXTERNAL;
  }

  return CameraType.UNKNOWN;
}

function stopTracks(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

async function discoverVideoDevices() {
  const permissionStream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === "videoinput");
  } finally {
    stopTracks(permissionStream);
  }
}

function preferredCameraIndex(cameras: CameraInfo[], isMobile: boolean) {
  if (!isMobile) return 0;

  const front = cameras.findIndex(({ type }) => type === CameraType.FRONT);
  if (front >= 0) return front;

  const rear = cameras.findIndex(
    ({ type }) =>
      type === CameraType.BACK ||
      type === CameraType.BACK_ULTRA_WIDE ||
      type === CameraType.BACK_TELEPHOTO,
  );
  return Math.max(0, rear);
}

function getCameraError(error: unknown, isRetry: boolean) {
  if (error instanceof DOMException) {
    if (error.name === "NotFoundError") return "no-devices";
    if (error.name === "NotAllowedError") {
      return isRetry ? "blocked" : "access";
    }
  }

  console.warn("Unable to open camera:", error);
  return "access";
}

export function useBoothCamera(setMirrored: (mirrored: boolean) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const discoveryRef = useRef<Promise<MediaDeviceInfo[]> | null>(null);
  const [cameras, setCameras] = useState<CameraInfo[]>([]);
  const [currentCameraIndex, selectCamera] = useState(0);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState<
    "no-devices" | "access" | "blocked" | null
  >(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  function retryCamera() {
    if (!cameraError || isRetrying) return;

    discoveryRef.current = null;
    setIsRetrying(true);
    setCameras([]);
    setRetryCount((count) => count + 1);
  }

  const selectedCamera = cameras[currentCameraIndex];

  // The error view can unmount the video while a camera retry is in progress.
  const attachVideo = useCallback((video: HTMLVideoElement | null) => {
    if (video) video.srcObject = streamRef.current;
    videoRef.current = video;
  }, []);

  useEffect(() => {
    let active = true;
    discoveryRef.current ??= discoverVideoDevices();

    async function initialize() {
      try {
        const devices = await discoveryRef.current;
        if (!active || !devices) return;
        if (devices.length === 0) {
          setCameraError("no-devices");
          setIsRetrying(false);
          return;
        }

        const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
        const detected = devices.map((device, index) => ({
          device,
          type: detectCameraType(device, index, devices.length, isMobile),
        }));
        setCameras(detected);
        selectCamera(preferredCameraIndex(detected, isMobile));
      } catch (error) {
        if (!active) return;
        setCameraError(getCameraError(error, retryCount > 0));
        setIsRetrying(false);
      }
    }

    void initialize();
    return () => {
      active = false;
    };
  }, [retryCount]);

  useEffect(() => {
    if (!selectedCamera) return;

    let requestId = 0;
    let isStarting = false;

    function stopCamera() {
      requestId++;
      isStarting = false;
      stopTracks(streamRef.current);
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsCameraStarted(false);
    }

    async function startCamera(camera: CameraInfo) {
      if (isStarting || streamRef.current) return;
      isStarting = true;
      const id = ++requestId;
      setMirrored(
        camera.type === CameraType.FRONT || camera.type === CameraType.UNKNOWN,
      );

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: camera.device.deviceId },
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
        });
        if (id !== requestId) {
          stopTracks(stream);
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraError(null);
        setIsCameraStarted(true);
      } catch (error) {
        if (id !== requestId) return;
        setCameraError(getCameraError(error, retryCount > 0));
      } finally {
        if (id === requestId) {
          isStarting = false;
          setIsRetrying(false);
        }
      }
    }

    const syncVisibility = () => {
      if (document.visibilityState === "visible") {
        void startCamera(selectedCamera);
      } else {
        stopCamera();
      }
    };

    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    window.addEventListener("beforeunload", stopCamera);
    return () => {
      document.removeEventListener("visibilitychange", syncVisibility);
      window.removeEventListener("beforeunload", stopCamera);
      stopCamera();
    };
  }, [retryCount, selectedCamera, setMirrored]);

  return {
    videoRef,
    attachVideo,
    cameras,
    currentCameraIndex,
    selectCamera,
    isCameraStarted,
    cameraError,
    retryCamera,
    isRetrying,
  };
}
