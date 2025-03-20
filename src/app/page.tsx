'use client'

import type React from 'react'
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
  Glasses,
  RefreshCw,
  Undo2,
  Camera,
  Download,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Spotlight } from '@/components/ui/spotlight'

const MAX_CAPTURE = 10

const defaultFilters = {
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  sepia: 0,
  saturate: 100,
  blur: 0,
}

interface Control {
  id: string
  icon: React.ComponentType<{ className: string; title?: string }>
  action: string
}

const controls: Control[] = [
  { id: 'mirror', icon: FlipHorizontal, action: 'mirror' },
  { id: 'brightness', icon: Sun, action: 'brightness' },
  { id: 'contrast', icon: Contrast, action: 'contrast' },
  { id: 'grayscale', icon: ImageOff, action: 'filter' },
  { id: 'sepia', icon: Sparkles, action: 'filter' },
  { id: 'saturate', icon: Wand, action: 'filter' },
  { id: 'blur', icon: Glasses, action: 'filter' },
  { id: 'reset', icon: RefreshCw, action: 'reset' },
]

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

interface StepProgressProps {
  currentStep: number
}

function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="my-6 flex items-center justify-center space-x-4">
      <motion.div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
          currentStep === 1
            ? 'bg-gray-800 text-white shadow-md'
            : 'bg-gray-200 text-gray-600'
        }`}
        initial={{ scale: 0.8 }}
        animate={{
          scale: currentStep === 1 ? 1.1 : 1,
          backgroundColor: currentStep === 1 ? '#1f2937' : '#e5e7eb',
          color: currentStep === 1 ? '#ffffff' : '#4b5563',
        }}
        transition={{ duration: 0.3 }}
      >
        1
      </motion.div>
      <div className="relative h-0.5 w-16 bg-gray-300">
        <motion.div
          className="absolute inset-0 bg-gray-800"
          initial={{ width: '0%' }}
          animate={{ width: currentStep === 2 ? '100%' : '0%' }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <motion.div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
          currentStep === 2
            ? 'bg-gray-800 text-white shadow-md'
            : 'bg-gray-200 text-gray-600'
        }`}
        initial={{ scale: 0.8 }}
        animate={{
          scale: currentStep === 2 ? 1.1 : 1,
          backgroundColor: currentStep === 2 ? '#1f2937' : '#e5e7eb',
          color: currentStep === 2 ? '#ffffff' : '#4b5563',
        }}
        transition={{ duration: 0.3 }}
      >
        2
      </motion.div>
    </div>
  )
}

interface PhotoShootProps {
  capturedImages: string[]
  setCapturedImages: React.Dispatch<React.SetStateAction<string[]>>
}

function PhotoShoot({ capturedImages, setCapturedImages }: PhotoShootProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const capturedImagesRef = useRef<HTMLDivElement>(null)
  const cameraContainerRef = useRef<HTMLDivElement>(null)
  const [filters, setFilters] = useState(defaultFilters)
  const [isMirrored, setIsMirrored] = useState(true)
  const [isCameraStarted, setIsCameraStarted] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>(['mirror'])
  const [isCapturing, setIsCapturing] = useState(false)
  const filterDisabled = !isCameraStarted

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
    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) saturate(${filters.saturate}%) blur(${filters.blur}px)`
    ctx.setTransform(isMirrored ? -1 : 1, 0, 0, 1, isMirrored ? width : 0, 0)
    ctx.drawImage(videoRef.current, 0, 0, width, height)

    // Flash effect
    const videoContainer = videoRef.current.parentElement
    if (videoContainer) {
      videoContainer.classList.add('flash')
      setTimeout(() => {
        videoContainer.classList.remove('flash')
        setCapturedImages((prev) => [...prev, canvas.toDataURL('image/png')])
        setIsCapturing(false)
      }, 300)
    } else {
      setCapturedImages((prev) => [...prev, canvas.toDataURL('image/png')])
      setIsCapturing(false)
    }
  }

  const undoCapture = () => {
    if (capturedImages.length) {
      setCapturedImages((prev) => prev.slice(0, -1))
    }
  }

  const resetCaptures = () => setCapturedImages([])

  const resetFilters = () => {
    setFilters(defaultFilters)
    setActiveFilters(['mirror'])
  }

  const toggleFilter = (id: string) => {
    if (!filterDisabled) {
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
          sepia: 0, // Turn off sepia when grayscale is enabled
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
          grayscale: 0, // Turn off grayscale when sepia is enabled
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
      } else if (id === 'blur') {
        setFilters((prev) => ({
          ...prev,
          blur: prev.blur === 0 ? 2 : 0,
        }))
        setActiveFilters((prev) =>
          prev.includes('blur')
            ? prev.filter((f) => f !== 'blur')
            : [...prev, 'blur'],
        )
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || ''))
        return
      switch (e.key) {
        case ' ':
        case 'Enter':
          captureImage()
          break
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
  }, [capturedImages, isCameraStarted, filters, isMirrored, isCapturing])

  return (
    <motion.div
      className="mx-auto flex max-w-xl flex-col items-center space-y-4 p-3 select-none"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
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
              filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) saturate(${filters.saturate}%) blur(${filters.blur}px)`,
            }}
          />
          {/* Guide overlay */}
          <div className="pointer-events-none absolute inset-4 rounded-lg border-2 border-white/30" />
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex w-full items-center justify-center gap-4">
        <Button
          onClick={undoCapture}
          disabled={!capturedImages.length}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-0"
          variant="outline"
        >
          <Undo2 className="h-5 w-5" />
        </Button>

        <Button
          onClick={captureImage}
          disabled={
            !isCameraStarted ||
            capturedImages.length >= MAX_CAPTURE ||
            isCapturing
          }
          className="flex h-16 w-16 items-center justify-center rounded-full p-0 shadow-md transition-all hover:shadow-lg"
          variant="default"
        >
          <Camera className="h-7 w-7" />
        </Button>

        <Button
          onClick={resetCaptures}
          disabled={!capturedImages.length}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-0"
          variant="outline"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      <div className="w-full">
        <div className="flex flex-wrap justify-center gap-3">
          {controls
            .filter((c) => c.id !== 'reset')
            .map(({ id, icon: Icon }) => (
              <Button
                key={id}
                onClick={() => toggleFilter(id)}
                disabled={filterDisabled}
                variant={activeFilters.includes(id) ? 'default' : 'outline'}
                className="h-10 w-10 rounded-full p-0"
                size="icon"
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}

          <Button
            onClick={resetFilters}
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full"
            disabled={filterDisabled}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {capturedImages.length > 0 && (
        <div
          ref={capturedImagesRef}
          className="custom-scrollbar hide-scrollbar flex w-full snap-x gap-2 overflow-x-auto pb-2"
          style={{
            height: cameraContainerRef.current
              ? cameraContainerRef.current.clientHeight / 2.5
              : 'auto',
          }}
        >
          {capturedImages.map((img, index) => (
            <div
              key={index}
              className="aspect-[4/3] flex-shrink-0 snap-center overflow-hidden rounded-lg"
              style={{ height: '100%' }}
            >
              <img
                src={img || '/placeholder.svg'}
                alt={`Captured ${index}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

interface LayoutSelectionProps {
  capturedImages: string[]
  previewRef: React.RefObject<HTMLDivElement | null>
  layoutType: number
  selectedIndices: number[]
  setSelectedIndices: React.Dispatch<React.SetStateAction<number[]>>
  setLayoutType: React.Dispatch<React.SetStateAction<number>>
}

function LayoutSelection({
  capturedImages,
  previewRef,
  layoutType,
  selectedIndices,
  setSelectedIndices,
  setLayoutType,
}: LayoutSelectionProps) {
  // Photo booth inspired color palette
  const [frameColor, setFrameColor] = useState<string>('#FFFFFF')
  const palette = [
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
      <motion.div
        key={idx}
        className={`${baseClass} ${
          selectedIndices[idx] !== undefined ? '' : emptyClass
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: idx * 0.05 }}
      >
        {cellContent}
      </motion.div>
    )
  }

  const renderPreview = () => {
    if (layoutType === 4) {
      return (
        <motion.div
          className="mx-auto max-w-3xs overflow-hidden rounded-md border border-gray-300 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            ref={previewRef}
            className="flex flex-col gap-4 px-4 pt-4 pb-20"
            style={{ backgroundColor: frameColor }}
          >
            <div className="grid grid-cols-1 gap-2">
              {Array.from({ length: 4 }, (_, idx) => renderCell(idx))}
            </div>
          </div>
        </motion.div>
      )
    }
    return (
      <motion.div
        className="overflow-hidden rounded-md border border-gray-300 shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
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
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="mx-auto max-w-4xl p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          {/* Photo Selection Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
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

            <div className="hide-scrollbar grid max-h-[320px] grid-cols-2 gap-3 overflow-y-auto rounded-lg border p-2 sm:grid-cols-3">
              <AnimatePresence>
                {capturedImages.map((img, index) => {
                  const isSelected = selectedIndices.includes(index)
                  const selectionIndex = selectedIndices.indexOf(index) + 1

                  return (
                    <motion.div
                      key={index}
                      onClick={() => toggleSelect(index)}
                      className={`relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? 'z-10 border-gray-800 shadow-md'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: isSelected ? 1.05 : 1,
                        borderColor: isSelected ? '#1f2937' : '#e5e7eb',
                      }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <img
                        src={img || '/placeholder.svg'}
                        alt={`Photo ${index}`}
                        className="h-full w-full object-cover"
                      />
                      {isSelected && (
                        <motion.div
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-white"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {selectionIndex}
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Frame Color Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="mb-2 text-lg font-semibold">Frame Color</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {palette.map((color) => (
                <motion.button
                  key={color}
                  onClick={() => setFrameColor(color)}
                  style={{ backgroundColor: color }}
                  className={`h-8 w-8 rounded-full transition-all ${
                    frameColor === color
                      ? 'ring-2 ring-gray-500 ring-offset-1'
                      : 'border border-gray-300 hover:scale-105'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Select ${color} frame color`}
                ></motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Layout Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-3 text-lg font-semibold">Layout Preview</h2>
          <div className="mb-4">{renderPreview()}</div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function PhotoBoothApp() {
  const [step, setStep] = useState<'shoot' | 'layout'>('shoot')
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [layoutType, setLayoutType] = useState<number>(4) // Default to photo strip layout
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
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
  }, [step, capturedImages, layoutType, selectedIndices, isDownloading])

  return (
    <div className="min-h-screen overflow-hidden bg-gray-50">
      <Navbar />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <StepProgress currentStep={step === 'shoot' ? 1 : 2} />
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 'shoot' ? (
          <motion.div
            key="shoot"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PhotoShoot
              capturedImages={capturedImages}
              setCapturedImages={setCapturedImages}
            />
          </motion.div>
        ) : (
          <motion.div
            key="layout"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <LayoutSelection
              capturedImages={capturedImages}
              previewRef={previewRef}
              layoutType={layoutType}
              selectedIndices={selectedIndices}
              setSelectedIndices={setSelectedIndices}
              setLayoutType={setLayoutType}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="my-6 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        {step === 'shoot' ? (
          <AnimatePresence>
            {canProceedToLayout && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={() => setStep('layout')}
                  className="rounded-full px-5 py-2 font-medium"
                  variant="default"
                >
                  Continue
                  <ArrowRight className="ml-2 inline-block h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
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
      </motion.div>
    </div>
  )
}
