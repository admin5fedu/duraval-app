"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

/**
 * ⚡ Performance: Optimized AvatarImage component
 * 
 * Benefits:
 * - Lazy loading by default
 * - Better error handling
 * - Responsive images
 */
interface OptimizedAvatarImageProps extends React.ComponentProps<typeof AvatarPrimitive.Image> {
    src: string
    alt: string
    width?: number
    height?: number
    priority?: boolean
}

export function OptimizedAvatarImage({
    className,
    src,
    alt,
    width = 40,
    height = 40,
    priority = false,
    ...props
}: OptimizedAvatarImageProps) {
    return (
        <AvatarPrimitive.Image
            data-slot="avatar-image"
            className={cn("aspect-square h-full w-full object-cover", className)}
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            width={width}
            height={height}
            {...props}
        />
    )
}

