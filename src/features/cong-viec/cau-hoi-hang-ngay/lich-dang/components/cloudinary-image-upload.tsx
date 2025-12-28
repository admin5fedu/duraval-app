"use client"

import * as React from "react"
import { useCallback, useState } from "react"
import { Upload, X, Camera, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { uploadImageToCloudinary } from "@/lib/cloudinary"

interface CloudinaryImageUploadProps {
    value?: string | null
    onChange: (url: string | null) => void
    disabled?: boolean
    className?: string
}

export function CloudinaryImageUpload({
    value,
    onChange,
    disabled = false,
    className
}: CloudinaryImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const cameraInputRef = React.useRef<HTMLInputElement>(null)

    const handleUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('File phải là định dạng ảnh')
            return
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Kích thước file không được vượt quá 10MB')
            return
        }

        setIsUploading(true)

        try {
            const result = await uploadImageToCloudinary(file, 'lich-dang')
            onChange(result.secure_url)
            toast.success('Tải ảnh lên thành công')
        } catch (error) {
            console.error('Upload error:', error)
            toast.error(error instanceof Error ? error.message : 'Lỗi khi tải ảnh lên')
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
            fileInputRef.current.value = ''
        }
    }

    const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleUpload(file)
        }
        // Reset input
        if (cameraInputRef.current) {
            cameraInputRef.current.value = ''
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
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (disabled || isUploading) return

        const file = e.dataTransfer.files?.[0]
        if (file) {
            handleUpload(file)
        }
    }, [disabled, isUploading])

    const handleRemove = () => {
        onChange(null)
    }

    return (
        <div className={cn("space-y-2", className)}>
            {value ? (
                <div className="relative group">
                    <div className="relative w-full h-48 rounded-lg border overflow-hidden bg-muted">
                        <img
                            src={value}
                            alt="Uploaded image"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    {!disabled && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleRemove}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ) : (
                <div
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
                        onChange={handleFileSelect}
                        disabled={disabled || isUploading}
                        className="hidden"
                        id="image-upload"
                    />
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleCameraCapture}
                        disabled={disabled || isUploading}
                        className="hidden"
                        id="camera-capture"
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
                                    Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 10MB)
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={disabled}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Chọn ảnh
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => cameraInputRef.current?.click()}
                                    disabled={disabled}
                                >
                                    <Camera className="mr-2 h-4 w-4" />
                                    Chụp ảnh
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

