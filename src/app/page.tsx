'use client'

import { useState, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas-pro'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FlipHorizontal,
  Sun,
  Contrast,
  ImageOff,
  Sparkles,
  Wand,
  RefreshCw,
  Undo2,
  Camera,
  Download,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Timer,
  X,
  ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Spotlight } from '@/components/ui/spotlight'

// Constants
const MAX_CAPTURE = 10
const DEFAULT_FILTERS = {
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  sepia: 0,
  saturate: 100,
  blur: 0,
}

// Types
interface Control {
  id: string
  icon: React.ComponentType<{ className: string; title?: string }>
  action: string
}

interface StepProgressProps {
  currentStep: number
}

interface PhotoShootProps {
  capturedImages: string[]
  setCapturedImages: React.Dispatch<React.SetStateAction<string[]>>
}

interface LayoutSelectionProps {
  capturedImages: string[]
  previewRef: React.RefObject<HTMLDivElement | null>
  layoutType: number
  selectedIndices: number[]
  setSelectedIndices: React.Dispatch<React.SetStateAction<number[]>>
  setLayoutType: React.Dispatch<React.SetStateAction<number>>
  selectedFrame: string | null
  setSelectedFrame: React.Dispatch<React.SetStateAction<string | null>>
}

// Filter Controls
const FILTER_CONTROLS: Control[] = [
  { id: 'mirror', icon: FlipHorizontal, action: 'mirror' },
  { id: 'brightness', icon: Sun, action: 'brightness' },
  { id: 'contrast', icon: Contrast, action: 'contrast' },
  { id: 'grayscale', icon: ImageOff, action: 'filter' },
  { id: 'sepia', icon: Sparkles, action: 'filter' },
  { id: 'saturate', icon: Wand, action: 'filter' },
  { id: 'reset', icon: RefreshCw, action: 'reset' },
]

// Frame color palette
const COLOR_PALETTE = [
  '#FFFFFF', // White
  '#000000', // Black
  '#F5F5F5', // Light Gray
  '#FF6F61', // Coral
  '#6B5B95', // Purple
  '#88B04B', // Green
  '#F7CAC9', // Light Pink
  '#92A8D1', // Blue
  '#034F84', // Dark Blue
  '#F4D06F', // Mustard Yellow
  '#E94E77', // Hot Pink
]

// Available frames
const FRAMES = [
  { id: 'none', name: 'No Frame', url: null },
  {
    id: 'birthday',
    name: 'Birthday',
    url: '/birthday-frame-removebg-preview.png',
  },
]

// Replace the timer options and selection logic in the PhotoShoot component
const TIMER_OPTIONS = [3, 5, 10] as const
const DEFAULT_TIMER_INDEX = 1 // Default to 5 seconds (index 1)

function Navbar() {
  return (
    <motion.nav
      className="relative flex w-full items-center justify-center overflow-hidden border-b bg-gradient-to-r from-rose-100 to-teal-100 p-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Spotlight className="top-10 left-0 md:-top-20 md:left-60" fill="white" />
      <h1 className="relative z-10 flex items-center text-2xl font-bold tracking-tight text-gray-800">
        <span className="text-pink-500">@</span>chinchinbooth
      </h1>
    </motion.nav>
  )
}

function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="my-6 flex items-center justify-center space-x-4">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
          currentStep === 1
            ? 'bg-gray-800 text-white shadow-md'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        1
      </div>
      <div className="relative h-0.5 w-16 bg-gray-300">
        <div className="absolute inset-0 bg-gray-800" />
      </div>
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
          currentStep === 2
            ? 'bg-gray-800 text-white shadow-md'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        2
      </div>
    </div>
  )
}

function PhotoShoot({ capturedImages, setCapturedImages }: PhotoShootProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const capturedImagesRef = useRef<HTMLDivElement>(null)
  const cameraContainerRef = useRef<HTMLDivElement>(null)

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [isMirrored, setIsMirrored] = useState(true)
  const [isCameraStarted, setIsCameraStarted] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>(['mirror'])
  const [isCapturing, setIsCapturing] = useState(false)

  // Mode toggles and auto sequence state
  const [isAutoModeEnabled, setIsAutoModeEnabled] = useState(false) // just mode toggle
  const [isAutoSequenceActive, setIsAutoSequenceActive] = useState(false) // whether auto capture sequence is running

  const [selectedTimerIndex, setSelectedTimerIndex] =
    useState<number>(DEFAULT_TIMER_INDEX)
  const [countdown, setCountdown] = useState<number | null>(null)

  const filterDisabled = !isCameraStarted
  const isMaxCaptureReached = capturedImages.length >= MAX_CAPTURE
  const selectedTimer = TIMER_OPTIONS[selectedTimerIndex]

  const cycleTimer = () => {
    setSelectedTimerIndex((prev) => (prev + 1) % TIMER_OPTIONS.length)
  }

  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      if (isCameraStarted) return
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsCameraStarted(true)
          setCameraError(null)
        }
      } catch {
        setCameraError(
          'Camera access is required. Please enable camera access in your browser settings and reload the page.',
        )
      }
    }
    startCamera()
  }, [isCameraStarted])

  // Auto-scroll when new capture is added and stop auto sequence if max capture reached
  useEffect(() => {
    if (capturedImagesRef.current && capturedImages.length > 0) {
      capturedImagesRef.current.scrollLeft =
        capturedImagesRef.current.scrollWidth
    }
    if (capturedImages.length >= MAX_CAPTURE && isAutoSequenceActive) {
      stopAutoSequence()
    }
  }, [capturedImages.length])

  // Capture image from video stream
  const captureImage = () => {
    if (
      !isCameraStarted ||
      !videoRef.current ||
      !canvasRef.current ||
      capturedImages.length >= MAX_CAPTURE ||
      isCapturing
    )
      return

    setIsCapturing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setIsCapturing(false)
      return
    }

    const { videoWidth: width, videoHeight: height } = videoRef.current
    canvas.width = width
    canvas.height = height
    ctx.clearRect(0, 0, width, height)
    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) saturate(${filters.saturate}%)`

    // Mirror image if needed
    ctx.setTransform(isMirrored ? -1 : 1, 0, 0, 1, isMirrored ? width : 0, 0)
    ctx.drawImage(videoRef.current, 0, 0, width, height)
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    const videoContainer = videoRef.current.parentElement
    const imageData = canvas.toDataURL('image/png')
    if (videoContainer) {
      videoContainer.classList.add('flash')
      setTimeout(() => {
        videoContainer.classList.remove('flash')
        setCapturedImages((prev) => [...prev, imageData])
        setIsCapturing(false)
        scheduleNextAutoCapture()
      }, 300)
    } else {
      setCapturedImages((prev) => [...prev, imageData])
      setIsCapturing(false)
      scheduleNextAutoCapture()
    }
  }

  // Undo last capture
  const undoCapture = () => {
    if (capturedImages.length) {
      setCapturedImages((prev) => prev.slice(0, -1))
    }
  }

  // Reset all captures and stop auto sequence
  const resetCaptures = () => {
    setCapturedImages([])
    stopAutoSequence()
  }

  // Reset filters to default
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setActiveFilters(['mirror'])
  }

  // Toggle individual filter
  const toggleFilter = (id: string) => {
    if (filterDisabled) return

    if (id === 'mirror') {
      setIsMirrored((prev) => !prev)
      setActiveFilters((prev) =>
        prev.includes('mirror')
          ? prev.filter((f) => f !== 'mirror')
          : [...prev, 'mirror'],
      )
    } else if (id === 'grayscale') {
      setFilters((prev) => ({
        ...prev,
        grayscale: prev.grayscale === 0 ? 100 : 0,
        sepia: 0,
      }))
      setActiveFilters((prev) => {
        const newFilters = prev.filter(
          (f) => f !== 'sepia' && f !== 'grayscale',
        )
        return prev.includes('grayscale')
          ? newFilters
          : [...newFilters, 'grayscale']
      })
    } else if (id === 'sepia') {
      setFilters((prev) => ({
        ...prev,
        sepia: prev.sepia === 0 ? 100 : 0,
        grayscale: 0,
      }))
      setActiveFilters((prev) => {
        const newFilters = prev.filter(
          (f) => f !== 'sepia' && f !== 'grayscale',
        )
        return prev.includes('sepia') ? newFilters : [...newFilters, 'sepia']
      })
    } else if (id === 'brightness') {
      setFilters((prev) => ({
        ...prev,
        brightness: prev.brightness === 100 ? 130 : 100,
      }))
      setActiveFilters((prev) =>
        prev.includes('brightness')
          ? prev.filter((f) => f !== 'brightness')
          : [...prev, 'brightness'],
      )
    } else if (id === 'contrast') {
      setFilters((prev) => ({
        ...prev,
        contrast: prev.contrast === 100 ? 130 : 100,
      }))
      setActiveFilters((prev) =>
        prev.includes('contrast')
          ? prev.filter((f) => f !== 'contrast')
          : [...prev, 'contrast'],
      )
    } else if (id === 'saturate') {
      setFilters((prev) => ({
        ...prev,
        saturate: prev.saturate === 100 ? 150 : 100,
      }))
      setActiveFilters((prev) =>
        prev.includes('saturate')
          ? prev.filter((f) => f !== 'saturate')
          : [...prev, 'saturate'],
      )
    }
  }

  // Start capture (single-shot or auto-capture)
  const startCapture = () => {
    if (capturedImages.length >= MAX_CAPTURE) return
    // Start countdown with the selected timer
    setCountdown(selectedTimer)
    if (isAutoModeEnabled) {
      setIsAutoSequenceActive(true)
    }
  }

  const stopAutoSequence = () => {
    setIsAutoSequenceActive(false)
    setCountdown(null)
  }

  const toggleAutoMode = () => {
    setIsAutoModeEnabled((prev) => !prev)
    if (isAutoSequenceActive) {
      stopAutoSequence()
    }
  }

  // Ref to ensure captureImage is only called once when countdown reaches 0
  const hasCapturedRef = useRef(false)

  // Countdown effect: reduce countdown every second and trigger capture when it hits 0
  useEffect(() => {
    if (countdown === null) {
      hasCapturedRef.current = false
      return
    }
    if (countdown > 0) {
      hasCapturedRef.current = false
      const timerId = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null))
      }, 1000)
      return () => clearTimeout(timerId)
    } else if (countdown === 0 && !hasCapturedRef.current) {
      hasCapturedRef.current = true
      captureImage()
    }
  }, [countdown])

  // After captureImage completes, schedule the next auto capture if in auto mode
  const scheduleNextAutoCapture = () => {
    if (isAutoSequenceActive && capturedImages.length < MAX_CAPTURE - 1) {
      setTimeout(() => {
        hasCapturedRef.current = false
        setCountdown(selectedTimer)
      }, 1000)
    } else {
      setIsAutoSequenceActive(false)
      setCountdown(null)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || ''))
        return
      switch (e.key) {
        case ' ':
        case 'Enter': {
          if (isAutoSequenceActive) {
            stopAutoSequence()
          } else {
            if (countdown === null) {
              startCapture()
            } else {
              setCountdown(null)
            }
          }
          break
        }
        case 'Backspace':
        case 'Delete':
          undoCapture()
          break
        case 'Escape':
          resetCaptures()
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    capturedImages, // may not be necessary if other functions depend on it
    isCameraStarted,
    filters,
    isMirrored,
    isCapturing,
    isAutoSequenceActive,
    countdown,
    isMaxCaptureReached,
    stopAutoSequence,
    startCapture,
    undoCapture,
    resetCaptures,
  ])
  // Update the controls section with the new layout and 'A' button
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center space-y-4 p-3 select-none">
      {/* Existing code for badge and keyboard shortcuts info */}
      <div className="flex w-full items-center justify-between">
        <Badge variant="outline" className="px-3 py-1.5 text-xs font-medium">
          <span className="font-bold">{capturedImages.length}</span>
          <span className="mx-1">/</span>
          <span>{MAX_CAPTURE}</span>
        </Badge>

        <div className="text-xs text-gray-500">
          <span className="font-medium">Space</span>: Capture |{' '}
          <span className="font-medium">Delete</span>: Undo |{' '}
          <span className="font-medium">Esc</span>: Reset
        </div>
      </div>

      {/* Camera view and countdown overlay */}
      {cameraError ? (
        <div className="rounded-lg bg-red-50 p-4 text-center font-bold text-red-500">
          {cameraError}
        </div>
      ) : (
        <div
          ref={cameraContainerRef}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black"
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
            style={{
              transform: isMirrored ? 'scaleX(-1)' : 'scaleX(1)',
              filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) saturate(${filters.saturate}%)`,
            }}
          />
          {/* Guide overlay */}
          <div className="pointer-events-none absolute inset-4 rounded-lg border-2 border-white/30" />

          {/* Redesigned Countdown overlay */}
          <AnimatePresence>
            {countdown !== null && countdown > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 1.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute right-4 bottom-4 flex h-16 w-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
              >
                <span className="text-3xl font-bold text-white">
                  {countdown}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* Filter controls */}
      <div className="w-full">
        <div className="filter-controls flex flex-wrap justify-center gap-2 md:gap-3">
          {FILTER_CONTROLS.filter((c) => c.id !== 'reset').map(
            ({ id, icon: Icon }) => (
              <Button
                key={id}
                onClick={() => toggleFilter(id)}
                disabled={
                  filterDisabled || isAutoSequenceActive || countdown !== null
                }
                variant={activeFilters.includes(id) ? 'default' : 'outline'}
                className="h-9 w-9 rounded-full p-0 md:h-10 md:w-10"
                size="icon"
              >
                <Icon className="h-4 w-4" />
              </Button>
            ),
          )}

          <Button
            onClick={resetFilters}
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full p-0 md:h-10 md:w-10"
            disabled={
              filterDisabled || isAutoSequenceActive || countdown !== null
            }
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Camera controls with balanced layout */}
      <div className="flex w-full items-center justify-center gap-3">
        {/* Left side controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={undoCapture}
            disabled={
              !capturedImages.length ||
              isAutoSequenceActive ||
              countdown !== null
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white p-0"
            variant="outline"
          >
            <Undo2 className="h-4 w-4" />
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={cycleTimer}
              disabled={isAutoSequenceActive || countdown !== null}
            >
              <Timer className="h-4 w-4" />
            </Button>
            <div className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium">
              {selectedTimer}
            </div>
          </div>
        </div>

        {/* Center - Main capture button */}
        <Button
          onClick={
            isAutoSequenceActive
              ? stopAutoSequence
              : countdown === null
                ? startCapture
                : () => setCountdown(null)
          }
          disabled={
            !isCameraStarted ||
            capturedImages.length >= MAX_CAPTURE ||
            isCapturing
          }
          className="flex h-16 w-16 items-center justify-center rounded-full p-0 shadow-md transition-all hover:shadow-lg"
        >
          {isAutoSequenceActive ? (
            <X className="h-7 w-7" />
          ) : countdown !== null ? (
            <X className="h-7 w-7" />
          ) : (
            <Camera className="h-7 w-7" />
          )}
        </Button>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleAutoMode}
            disabled={
              !isCameraStarted ||
              capturedImages.length >= MAX_CAPTURE ||
              isCapturing ||
              countdown !== null ||
              isAutoSequenceActive
            }
            className="flex h-10 w-10 items-center justify-center rounded-full p-0 font-bold"
            variant={isAutoModeEnabled ? 'default' : 'outline'}
            size="icon"
          >
            <span className="text-sm font-bold">A</span>
          </Button>

          <Button
            onClick={resetCaptures}
            disabled={
              !capturedImages.length ||
              isAutoSequenceActive ||
              countdown !== null
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white p-0"
            variant="outline"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Captured images display */}
      {capturedImages.length > 0 && (
        <div
          ref={capturedImagesRef}
          className="custom-scrollbar hide-scrollbar flex w-full snap-x gap-1 overflow-x-auto pb-2 md:gap-2"
          style={{
            height: cameraContainerRef.current
              ? cameraContainerRef.current.clientHeight / 2.5
              : 'auto',
          }}
        >
          <AnimatePresence initial={false}>
            {capturedImages.map((img, index) => (
              <motion.div
                key={index}
                className="aspect-[4/3] flex-shrink-0 snap-center overflow-hidden rounded-lg border border-gray-200"
                style={{ height: '100%' }}
                initial={{ opacity: 0, scale: 0.8, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -50 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <img
                  src={img || '/placeholder.svg'}
                  alt={`Captured ${index}`}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function LayoutSelection({
  capturedImages,
  previewRef,
  layoutType,
  selectedIndices,
  setSelectedIndices,
  setLayoutType,
  selectedFrame,
  setSelectedFrame,
}: LayoutSelectionProps) {
  const [frameColor, setFrameColor] = useState<string>('#FFFFFF')

  const selectLayoutType = (type: number) => {
    setLayoutType(type)
    setSelectedIndices([])
  }

  const toggleSelect = (index: number) =>
    setSelectedIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : prev.length < layoutType
          ? [...prev, index]
          : prev,
    )

  const renderCell = (idx: number) => {
    const cellContent =
      selectedIndices[idx] !== undefined ? (
        <img
          src={capturedImages[selectedIndices[idx]] || '/placeholder.svg'}
          alt={`Slot ${idx}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400">
          <span className="text-xs">Empty</span>
        </div>
      )

    const baseClass =
      'w-full aspect-[4/3] flex items-center justify-center transition-all duration-200 overflow-hidden'
    const emptyClass = 'border-dashed border border-gray-300 bg-gray-50'

    return (
      <div
        key={idx}
        className={`${baseClass} ${selectedIndices[idx] !== undefined ? '' : emptyClass}`}
      >
        {cellContent}
      </div>
    )
  }

  const renderPreview = () => {
    const commonClasses =
      'mx-auto overflow-hidden rounded-md border border-gray-300 shadow-md'

    // Frame overlay
    const frameOverlay = selectedFrame && (
      <div className="pointer-events-none absolute inset-0">
        <img
          src={FRAMES.find((f) => f.id === selectedFrame)?.url || ''}
          alt="Frame"
          className="h-full w-full object-contain"
        />
      </div>
    )

    if (layoutType === 4) {
      return (
        <div className={`${commonClasses} relative max-w-3xs`}>
          <div
            ref={previewRef}
            className="flex flex-col gap-4 px-4 pt-4 pb-20"
            style={{ backgroundColor: frameColor }}
          >
            <div className="grid grid-cols-1 gap-2">
              {Array.from({ length: 4 }, (_, idx) => renderCell(idx))}
            </div>
            {frameOverlay}
          </div>
        </div>
      )
    }

    return (
      <div className={`${commonClasses} relative`}>
        <div
          ref={previewRef}
          className="px-4 pt-4 pb-20"
          style={{ backgroundColor: frameColor }}
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }, (_, idx) => renderCell(idx))}
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }, (_, idx) => renderCell(idx + 4))}
            </div>
          </div>
          {frameOverlay}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-3">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          {/* Photo Selection Gallery */}
          <div>
            <h2 className="mb-2 text-lg font-semibold">Select Photos</h2>
            <div className="mb-3 flex gap-3">
              <Button
                onClick={() => selectLayoutType(4)}
                variant={layoutType === 4 ? 'default' : 'outline'}
                className="h-auto rounded-full px-4 py-1 text-sm"
                size="sm"
              >
                Photo Strip
              </Button>
              <Button
                onClick={() => selectLayoutType(8)}
                variant={layoutType === 8 ? 'default' : 'outline'}
                className="h-auto rounded-full px-4 py-1 text-sm"
                size="sm"
              >
                2-Strip
              </Button>
            </div>

            <p className="mb-2 text-xs text-gray-600">
              {layoutType === 4
                ? `Select 4 photos (${selectedIndices.length}/4)`
                : `Select 8 photos (${selectedIndices.length}/8)`}
            </p>

            <div className="grid grid-cols-2 gap-2 rounded-lg border p-2 sm:grid-cols-3">
              {capturedImages.map((img, index) => {
                const isSelected = selectedIndices.includes(index)
                const selectionIndex = selectedIndices.indexOf(index) + 1

                return (
                  <div
                    key={index}
                    onClick={() => toggleSelect(index)}
                    className={`relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? 'z-10 border-gray-800 shadow-md'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={img || '/placeholder.svg'}
                      alt={`Photo ${index}`}
                      className="h-full w-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-white">
                        {selectionIndex}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Redesigned Frame Customization Section */}
          <div className="rounded-lg border bg-white p-3">
            <h2 className="mb-3 text-lg font-semibold">Frame Customization</h2>

            {/* Frame Selection */}
            <div className="mb-4 hidden">
              <h3 className="mb-2 text-sm font-medium text-gray-700">Style</h3>
              <div className="flex flex-wrap gap-2">
                {FRAMES.map((frame) => (
                  <Button
                    key={frame.id}
                    onClick={() =>
                      setSelectedFrame(frame.id === 'none' ? null : frame.id)
                    }
                    variant={
                      selectedFrame === frame.id ||
                      (frame.id === 'none' && selectedFrame === null)
                        ? 'default'
                        : 'outline'
                    }
                    className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-sm"
                    size="sm"
                  >
                    {frame.id === 'none' ? (
                      <ImageOff className="h-3 w-3" />
                    ) : (
                      <ImageIcon className="h-3 w-3" />
                    )}
                    {frame.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Frame Color Selection with Horizontal Scroll */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">Color</h3>
              <div className="scrolling-touch hide-scrollbar flex flex-nowrap gap-2 overflow-x-auto border-0">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFrameColor(color)}
                    style={{ backgroundColor: color }}
                    className={`h-8 w-8 flex-shrink-0 rounded-full border-2 transition-all ${
                      frameColor === color
                        ? 'border-primary'
                        : 'border-gray-200'
                    }`}
                    aria-label={`Select ${color}`}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Layout Preview */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">Layout Preview</h2>
          <div className="flex items-center justify-center rounded-lg border bg-white p-4">
            <div className="w-full max-w-md">{renderPreview()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PhotoBoothApp() {
  const [step, setStep] = useState<'shoot' | 'layout'>('shoot')
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [layoutType, setLayoutType] = useState<number>(4) // Default to photo strip layout
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadComposite = async () => {
    if (!previewRef.current || isDownloading) return

    setIsDownloading(true)

    try {
      const canvas = await html2canvas(previewRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
        scale: 2, // Higher quality for Retina displays
      })

      const link = document.createElement('a')
      link.download = 'chinchinbooth_photo.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const retakePhotos = () => {
    setCapturedImages([])
    setSelectedIndices([])
    setStep('shoot')
  }

  // Require all 10 photos before proceeding
  const canProceedToLayout = capturedImages.length === MAX_CAPTURE
  const canDownload = selectedIndices.length === layoutType

  useEffect(() => {
    if (step === 'layout') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')
        )
          return
        if (e.key === 'Escape') retakePhotos()
        else if (e.key.toLowerCase() === 'd') downloadComposite()
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [step])

  return (
    <div className="min-h-screen overflow-hidden bg-gray-50">
      <Navbar />

      <StepProgress currentStep={step === 'shoot' ? 1 : 2} />

      <div className="flex-1 overflow-hidden">
        {step === 'shoot' ? (
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
            selectedFrame={selectedFrame}
            setSelectedFrame={setSelectedFrame}
          />
        )}
      </div>

      <div className="my-6 flex justify-center">
        {step === 'shoot' ? (
          <>
            {canProceedToLayout && (
              <Button
                onClick={() => setStep('layout')}
                className="rounded-full px-5 py-2 font-medium"
                variant="default"
              >
                Continue
                <ArrowRight className="ml-2 inline-block h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={retakePhotos}
              variant="outline"
              className="flex items-center justify-center rounded-full px-4 py-2"
              size="sm"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retake
            </Button>
            <Button
              onClick={downloadComposite}
              disabled={!canDownload || isDownloading}
              className={cn(
                'flex items-center justify-center rounded-full px-4 py-2 font-medium',
                !canDownload && 'cursor-not-allowed',
              )}
              variant={canDownload && !isDownloading ? 'default' : 'secondary'}
              size="sm"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="mr-1 h-4 w-4" />
                  {canDownload
                    ? 'Download'
                    : `Select ${layoutType - selectedIndices.length} more`}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
