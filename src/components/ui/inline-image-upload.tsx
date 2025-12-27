"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Upload, Camera, X, Loader2, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { uploadImageToCloudinary, transformCloudinaryUrl } from "@/lib/cloudinary"
import { ImageZoomViewer } from "./image-zoom-viewer"
import { useFormField } from "@/components/ui/form"

interface InlineImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  disabled?: boolean
  folder?: string
  displayName?: string
  maxSize?: number
  className?: string
}

export function InlineImageUpload({
  value,
  onChange,
  disabled = false,
  folder = "avatars",
  displayName = "User",
  maxSize = 10,
  className,
}: InlineImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [zoomViewerOpen, setZoomViewerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  
  // Get id from FormControl context if available
  let formItemId: string | undefined
  try {
    const formField = useFormField()
    formItemId = formField.formItemId
  } catch {
    // Not in FormControl context, generate a unique id
    formItemId = React.useId()
  }
  
  const fileInputId = `${formItemId}-file-input`
  const cameraInputId = `${formItemId}-camera-input`

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

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

    try {
      const result = await uploadImageToCloudinary(file, folder)
      onChange(result.secure_url)
      toast.success("Tải ảnh lên thành công!")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Lỗi khi tải ảnh lên")
    } finally {
      setIsUploading(false)
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
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
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

    if (disabled) return

    const file = e.dataTransfer.files[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    toast.success("Đã xóa ảnh")
  }

  // Transform URL for avatar display (optimized size)
  const avatarUrl = transformCloudinaryUrl(value)

  return (
    <>
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border-2 border-dashed transition-all",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {/* Avatar Preview */}
        <div className="relative shrink-0">
          <Avatar className="h-16 w-16 border-2 border-border shadow-sm">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
          {value && !disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full"
              onClick={handleRemove}
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          )}
          {value && (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full shadow-sm"
              onClick={() => setZoomViewerOpen(true)}
            >
              <ZoomIn className="h-2.5 w-2.5" />
            </Button>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <input
              ref={fileInputRef}
              id={fileInputId}
              name={`${formItemId}-file`}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              id={cameraInputId}
              name={`${formItemId}-camera`}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              disabled={disabled || isUploading}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              disabled={disabled || isUploading}
              className="flex-1 text-xs"
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              {value ? "Thay đổi" : "Chọn ảnh"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                cameraInputRef.current?.click()
              }}
              disabled={disabled || isUploading}
              className="flex-1 text-xs"
            >
              <Camera className="mr-1.5 h-3.5 w-3.5" />
              Chụp ảnh
            </Button>
          </div>
          <p className="text-xs text-muted-foreground leading-tight">
            Kéo thả ảnh vào đây • JPG, PNG, GIF, WebP • Tối đa {maxSize}MB
          </p>
        </div>
      </div>

      {/* Zoom Viewer */}
      {value && (
        <ImageZoomViewer
          open={zoomViewerOpen}
          onOpenChange={setZoomViewerOpen}
          imageUrl={value}
          alt={displayName}
        />
      )}
    </>
  )
}

