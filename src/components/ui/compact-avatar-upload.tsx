"use client"

import * as React from "react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Upload, X, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageUploadDialog } from "./image-upload-dialog"
import { ImageZoomViewer } from "./image-zoom-viewer"
import { transformCloudinaryUrl } from "@/lib/cloudinary"

interface CompactAvatarUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  folder?: string
  displayName?: string
}

const sizeMap = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-20 w-20",
}

const buttonSizeMap = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-7 w-7",
}

export function CompactAvatarUpload({
  value,
  onChange,
  disabled = false,
  size = "md",
  className,
  folder = "avatars",
  displayName = "User",
}: CompactAvatarUploadProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [zoomViewerOpen, setZoomViewerOpen] = useState(false)

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  const handleUploadComplete = (url: string) => {
    onChange(url || null)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  const handleAvatarClick = () => {
    if (disabled) {
      // In read-only mode, open zoom viewer
      if (value) {
        setZoomViewerOpen(true)
      }
    } else {
      // In edit mode, open upload dialog
      setUploadDialogOpen(true)
    }
  }

  // Transform URL for avatar display (optimized size)
  const avatarUrl = transformCloudinaryUrl(value)

  return (
    <>
      <div className={cn("relative inline-flex group", className)}>
        <div
          className={cn(
            "relative cursor-pointer transition-transform hover:scale-105",
            disabled && "cursor-pointer opacity-100"
          )}
          onClick={handleAvatarClick}
        >
          <Avatar className={cn(sizeMap[size], "border-2 border-border shadow-md")}>
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Hover Overlay */}
          {!disabled && (
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  buttonSizeMap[size],
                  "text-white hover:text-white hover:bg-white/20"
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  setUploadDialogOpen(true)
                }}
                title="Tải ảnh lên"
              >
                <Upload className="h-3.5 w-3.5" />
              </Button>
              {value && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      buttonSizeMap[size],
                      "text-white hover:text-white hover:bg-white/20"
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      setZoomViewerOpen(true)
                    }}
                    title="Xem phóng to"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      buttonSizeMap[size],
                      "text-white hover:text-white hover:bg-white/20"
                    )}
                    onClick={handleRemove}
                    title="Xóa ảnh"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Read-only indicator */}
          {disabled && value && (
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      {!disabled && (
        <ImageUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          currentImageUrl={value || null}
          onUploadComplete={handleUploadComplete}
          folder={folder}
        />
      )}

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
