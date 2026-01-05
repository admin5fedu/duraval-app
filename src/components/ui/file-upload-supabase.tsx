"use client"

import * as React from "react"
import { Upload, X, File, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { uploadFileToSupabase } from "@/lib/supabase-storage"

interface FileUploadSupabaseProps {
  value?: string | null
  onChange?: (url: string | null) => void
  accept?: string
  maxSize?: number // in MB
  folder?: string
  bucket?: string
  className?: string
  disabled?: boolean
  displayName?: string
}

export function FileUploadSupabase({
  value,
  onChange,
  accept = "*/*", // Mặc định cho phép mọi loại file
  maxSize = 50,
  folder,
  bucket = "duraval_file",
  disabled = false,
  className,
  displayName = "File",
}: FileUploadSupabaseProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    // Validate file type
    if (accept && accept !== "*/*") {
      const acceptPattern = accept.replace(/\*/g, ".*")
      const regex = new RegExp(`^${acceptPattern}$`)
      if (!regex.test(file.type)) {
        toast.error("Định dạng file không được hỗ trợ")
        return
      }
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Kích thước file không được vượt quá ${maxSize}MB`)
      return
    }

    setIsUploading(true)

    try {
      const result = await uploadFileToSupabase(file, bucket, folder)
      onChange?.(result.publicUrl)
      toast.success("Tải file lên thành công")
    } catch (error: any) {
      console.error("Upload error:", error)
      toast.error(error?.message || "Lỗi khi tải file lên")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleUpload(files[0])
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || isUploading) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleUpload(files[0])
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  // Extract filename from URL
  const getFileName = (url: string | null | undefined): string => {
    if (!url) return ""
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split("/")
      return pathParts[pathParts.length - 1] || "File"
    } catch {
      return url.split("/").pop() || "File"
    }
  }

  if (value) {
    return (
      <div className={cn("relative", className)}>
        <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
          <div className="p-2 rounded-md bg-primary/10">
            <File className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{getFileName(value)}</p>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Xem file
            </a>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {!disabled && (
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
          />
        )}
      </div>
    )
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        "relative border-2 border-dashed rounded-lg p-6 transition-colors",
        isDragging && !disabled ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "cursor-pointer hover:border-primary/50",
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-2 text-center">
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Đang tải lên...</p>
          </>
        ) : (
          <>
            <div className="p-3 rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Kéo thả {displayName} vào đây hoặc click để chọn
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tối đa {maxSize}MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

