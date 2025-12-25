"use client"

import * as React from "react"
import Zoom from "react-medium-image-zoom"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Import CSS for react-medium-image-zoom
import "react-medium-image-zoom/dist/styles.css"

interface ZoomableAvatarProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  src?: string | null
  alt?: string
  fallback?: React.ReactNode
  zoomable?: boolean // Cho phép tắt zoom nếu cần
}

/**
 * Avatar component với khả năng zoom khi click vào ảnh
 * Sử dụng react-medium-image-zoom để hiển thị ảnh phóng to
 */
export function ZoomableAvatar({
  src,
  alt = "Avatar",
  fallback,
  zoomable = true,
  className,
  children,
  ...props
}: ZoomableAvatarProps) {
  // Nếu không có src hoặc zoomable = false, render Avatar bình thường
  if (!src || !zoomable) {
    return (
      <Avatar className={className} {...props}>
        {src && <AvatarImage src={src} alt={alt} />}
        {fallback && <AvatarFallback>{fallback}</AvatarFallback>}
        {children}
      </Avatar>
    )
  }

  return (
    <Avatar className={cn("cursor-pointer", className)} {...props}>
      <Zoom>
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
          style={{ display: "block" }}
        />
      </Zoom>
      {fallback && <AvatarFallback>{fallback}</AvatarFallback>}
      {children}
    </Avatar>
  )
}

