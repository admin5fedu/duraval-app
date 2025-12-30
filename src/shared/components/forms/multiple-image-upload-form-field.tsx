"use client"

import * as React from "react"
import { useState, useRef, useCallback } from "react"
import { Upload, Camera, X, Loader2, Image as ImageIcon, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { uploadImageToCloudinary, transformCloudinaryUrl } from "@/lib/cloudinary"
import { ImageZoomViewer } from "@/components/ui/image-zoom-viewer"

interface MultipleImageUploadFormFieldProps {
    name?: string
    label?: string
    disabled?: boolean
    folder?: string
    maxSize?: number
    className?: string
    value?: string[] | null
    onChange?: (value: string[] | null) => void
    onBlur?: () => void
    id?: string
    [key: string]: any // Allow additional props from formField
}

/**
 * Component để upload multiple images với drag & drop, camera capture
 * Hỗ trợ: kéo thả, chọn file, chụp ảnh
 * 
 * @example
 * ```tsx
 * <MultipleImageUploadFormField
 *   value={images}
 *   onChange={setImages}
 *   folder="my-module"
 *   maxSize={10}
 * />
 * ```
 */
export const MultipleImageUploadFormField = React.forwardRef<any, MultipleImageUploadFormFieldProps>(({
    disabled = false,
    folder = "uploads",
    maxSize = 10,
    className,
    value: propValue,
    onChange: propOnChange,
}, _ref) => {
    // Use prop value if provided
    const value = propValue !== undefined ? propValue : []
    const [isUploading, setIsUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [zoomViewerOpen, setZoomViewerOpen] = useState(false)
    const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const dropZoneRef = useRef<HTMLDivElement>(null)

    // Ensure value is always an array
    const imageUrls = Array.isArray(value) ? value : (value ? [value] : [])

    const handleUpload = useCallback(async (file: File) => {
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
            if (propOnChange) {
                // If using controlled mode (props)
                const currentUrls = Array.isArray(value) ? value : []
                propOnChange([...currentUrls, result.secure_url])
            }
            toast.success("Tải ảnh lên thành công!")
        } catch (error) {
            console.error("Upload error:", error)
            toast.error(error instanceof Error ? error.message : "Lỗi khi tải ảnh lên")
        } finally {
            setIsUploading(false)
        }
    }, [folder, maxSize, propOnChange, value])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            // Handle multiple files
            Array.from(files).forEach(file => {
                handleUpload(file)
            })
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

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!disabled) {
            setIsDragging(true)
        }
    }, [disabled])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
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
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (disabled || isUploading) return

        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            Array.from(files).forEach(file => {
                if (file.type.startsWith("image/")) {
                    handleUpload(file)
                }
            })
        }
    }, [disabled, isUploading, handleUpload])

    const handleRemove = (e: React.MouseEvent, index: number) => {
        e.stopPropagation()
        if (propOnChange) {
            // If using controlled mode (props)
            const currentUrls = Array.isArray(value) ? value : []
            const newUrls = currentUrls.filter((_: any, i: number) => i !== index)
            propOnChange(newUrls)
        }
        toast.success("Đã xóa ảnh")
    }

    const handleZoom = (url: string) => {
        setZoomImageUrl(url)
        setZoomViewerOpen(true)
    }

    return (
        <>
            <div className={cn("space-y-3", className)}>
                {/* Image Grid */}
                {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {imageUrls.map((url: string, index: number) => (
                            <div key={index} className="relative group aspect-square">
                                <div className="relative w-full h-full rounded-lg border overflow-hidden bg-muted">
                                    <img
                                        src={transformCloudinaryUrl(url) || url}
                                        alt={`Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {!disabled && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleRemove(e, index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="absolute bottom-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    onClick={() => handleZoom(url)}
                                >
                                    <ZoomIn className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Zone */}
                <div
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "relative border-2 border-dashed rounded-lg p-6 transition-colors",
                        isDragging && !disabled ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                        disabled && "opacity-50 cursor-not-allowed",
                        !disabled && "cursor-pointer hover:border-primary/50"
                    )}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        disabled={disabled || isUploading}
                        className="hidden"
                    />
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleCameraCapture}
                        disabled={disabled || isUploading}
                        className="hidden"
                    />

                    {isUploading ? (
                        <div className="flex flex-col items-center justify-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Đang tải ảnh lên...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div className="p-3 rounded-full bg-primary/10">
                                <ImageIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium mb-1">
                                    Kéo thả ảnh vào đây hoặc click để chọn
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Hỗ trợ: JPG, PNG, GIF, WebP (tối đa {maxSize}MB mỗi ảnh)
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        fileInputRef.current?.click()
                                    }}
                                    disabled={disabled}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Chọn ảnh
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
                                    disabled={disabled}
                                >
                                    <Camera className="mr-2 h-4 w-4" />
                                    Chụp ảnh
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Zoom Viewer */}
            {zoomImageUrl && (
                <ImageZoomViewer
                    open={zoomViewerOpen}
                    onOpenChange={setZoomViewerOpen}
                    imageUrl={zoomImageUrl}
                    alt="Image preview"
                />
            )}
        </>
    )
})

