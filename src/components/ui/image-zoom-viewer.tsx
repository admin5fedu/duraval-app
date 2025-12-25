"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCw, X, Download, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageZoomViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string | null
  alt?: string
}

export function ImageZoomViewer({
  open,
  onOpenChange,
  imageUrl,
  alt = "Image preview",
}: ImageZoomViewerProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setScale(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
      setIsFullscreen(false)
    }
  }, [open])

  // Handle zoom in
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 5))
  }

  // Handle zoom out
  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  // Handle reset zoom
  const handleResetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // Handle rotation
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // Handle download
  const handleDownload = () => {
    if (!imageUrl) return
    
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `image-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setScale((prev) => Math.max(0.5, Math.min(5, prev + delta)))
    }
  }

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  // Handle drag
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  if (!imageUrl) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Xem ảnh phóng to</DialogTitle>
        <DialogDescription className="sr-only">
          Sử dụng các nút điều khiển để zoom, xoay, và tải xuống ảnh
        </DialogDescription>
        <div
          ref={containerRef}
          className="relative w-full h-[85vh] bg-black/95 flex items-center justify-center overflow-hidden"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt={alt}
            className={cn(
              "max-w-full max-h-full object-contain transition-transform duration-200 select-none",
              isDragging && "cursor-grabbing",
              !isDragging && scale > 1 && "cursor-grab"
            )}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            }}
            draggable={false}
          />

          {/* Controls Overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            {/* Left Controls */}
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="text-white hover:bg-white/20 h-9 w-9"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-white text-sm font-medium min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={scale >= 5}
                className="text-white hover:bg-white/20 h-9 w-9"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-white/20 mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRotate}
                className="text-white hover:bg-white/20 h-9 w-9"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleResetZoom}
                className="text-white hover:bg-white/20 h-9 w-9"
                title="Reset zoom"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 h-9 w-9"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="text-white hover:bg-white/20 h-9 w-9"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/20 h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Instructions */}
          {scale === 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-white text-xs text-center">
                Scroll để zoom • Kéo để di chuyển khi zoom • Click để đóng
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

