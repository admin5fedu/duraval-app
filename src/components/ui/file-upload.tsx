"use client"

import * as React from "react"
import { Upload, X, File, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { uploadImageToCloudinary } from "@/lib/cloudinary"

interface FileUploadProps {
    value?: string | null
    onChange?: (url: string | null) => void
    accept?: string
    maxSize?: number // in MB
    folder?: string
    disabled?: boolean
    className?: string
    multiple?: boolean
}

export function FileUpload({
    value,
    onChange,
    accept = "image/*",
    maxSize = 10,
    folder,
    disabled = false,
    className,
    multiple = false,
}: FileUploadProps) {
    const [isUploading, setIsUploading] = React.useState(false)
    const [isDragging, setIsDragging] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleUpload = async (file: File) => {
        // Validate file type
        if (accept && !file.type.match(accept.replace("*", ".*"))) {
            toast.error("Định dạng file không được hỗ trợ")
            return
        }

        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
            toast.error(`Kích thước file không được vượt quá ${maxSize}MB`)
            return
        }

        setIsUploading(true)

        try {
            // Upload to Cloudinary
            const result = await uploadImageToCloudinary(file, folder)
            onChange?.(result.secure_url)
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

        if (disabled) return

        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            handleUpload(files[0])
        }
    }

    const handleRemove = () => {
        onChange?.(null)
    }

    if (value) {
        return (
            <div className={cn("relative", className)}>
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm truncate">{value}</span>
                    {!disabled && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleRemove}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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
                multiple={multiple}
                className="hidden"
            />
            <div className="flex flex-col items-center gap-2 text-center">
                {isUploading ? (
                    <>
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Đang tải lên...</p>
                    </>
                ) : (
                    <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">
                                Kéo thả file vào đây hoặc click để chọn
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Tối đa {maxSize}MB
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled || isUploading}
                        >
                            Chọn File
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}

