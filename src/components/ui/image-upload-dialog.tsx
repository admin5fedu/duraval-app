"use client"

import * as React from "react"
import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, Camera, Loader2, Image as ImageIcon, ZoomIn, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { uploadImageToCloudinary } from "@/lib/cloudinary"
import { ImageZoomViewer } from "./image-zoom-viewer"

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentImageUrl?: string | null
  onUploadComplete: (url: string) => void
  folder?: string
  maxSize?: number // in MB
}

export function ImageUploadDialog({
  open,
  onOpenChange,
  currentImageUrl,
  onUploadComplete,
  folder = "avatars",
  maxSize = 10,
}: ImageUploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const [zoomViewerOpen, setZoomViewerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Reset preview when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setPreview(currentImageUrl || null)
    }
  }, [open, currentImageUrl])

  const handleUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File phải là định dạng ảnh")
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Kích thước file không được vượt quá ${maxSize}MB`)
      return
    }

    setIsUploading(true)

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)

    try {
      const result = await uploadImageToCloudinary(file, folder)
      setPreview(result.secure_url)
      onUploadComplete(result.secure_url)
      toast.success("Tải ảnh lên thành công!")
      // Don't close dialog automatically - let user confirm
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Lỗi khi tải ảnh lên")
      setPreview(currentImageUrl || null)
    } finally {
      setIsUploading(false)
      // Clean up preview URL
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
    // Reset input
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ""
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set dragging to false if we're actually leaving the drop zone
    const rect = dropZoneRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX
      const y = e.clientY
      if (
        x < rect.left ||
        x > rect.right ||
        y < rect.top ||
        y > rect.bottom
      ) {
        setIsDragging(false)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onUploadComplete("")
    toast.success("Đã xóa ảnh")
  }

  const handleConfirm = () => {
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tải ảnh lên</DialogTitle>
            <DialogDescription>
              Kéo thả ảnh vào đây, chọn từ máy tính hoặc chụp ảnh mới
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview Area */}
            {preview && (
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-border bg-muted/50 group">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm font-medium text-foreground">Đang tải lên...</p>
                    </div>
                  </div>
                )}
                {!isUploading && (
                  <>
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-10 w-10 bg-white/90 hover:bg-white"
                        onClick={() => setZoomViewerOpen(true)}
                      >
                        <ZoomIn className="h-5 w-5" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-10 w-10 bg-white/90 hover:bg-white"
                        onClick={handleRemove}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                    {/* Top Right Badge */}
                    <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                      Đã tải lên
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Upload Area */}
            {!preview && (
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-12 transition-all duration-200",
                  isDragging
                    ? "border-primary bg-primary/10 scale-[1.02] shadow-lg"
                    : "border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/50",
                  "cursor-pointer"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  disabled={isUploading}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-4 text-center">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <div>
                        <p className="text-base font-medium text-foreground">Đang tải lên...</p>
                        <p className="text-sm text-muted-foreground mt-1">Vui lòng đợi</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-full bg-primary/10 p-6 group-hover:bg-primary/20 transition-colors">
                        <ImageIcon className="h-10 w-10 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-foreground">
                          {isDragging ? "Thả ảnh vào đây" : "Kéo thả ảnh vào đây hoặc click để chọn"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Hỗ trợ: JPG, PNG, GIF, WebP • Tối đa {maxSize}MB
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {!preview ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Chọn ảnh
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Chụp ảnh
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                    disabled={isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Thay đổi
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      cameraInputRef.current?.click()
                    }}
                    disabled={isUploading}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Chụp mới
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    className="flex-1"
                    onClick={handleConfirm}
                    disabled={isUploading}
                  >
                    Xác nhận
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Zoom Viewer */}
      {preview && (
        <ImageZoomViewer
          open={zoomViewerOpen}
          onOpenChange={setZoomViewerOpen}
          imageUrl={preview}
          alt="Image preview"
        />
      )}
    </>
  )
}
