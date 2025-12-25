"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { Button, buttonVariants } from "./button"
import type { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export interface LoadingButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  /** Trạng thái loading của nút */
  isLoading?: boolean
  /** Text hiển thị khi loading (mặc định dùng children) */
  loadingText?: React.ReactNode
}

/**
 * Nút chuẩn hoá trạng thái loading:
 * - Tự động disable khi loading
 * - Hiển thị icon Loader2 xoay
 * - Thêm aria-busy để hỗ trợ accessibility
 */
export const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  LoadingButtonProps
>(function LoadingButton(
  { isLoading = false, loadingText, children, className, disabled, ...props },
  ref
) {
  return (
    <Button
      ref={ref}
      className={cn(isLoading && "cursor-wait", className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading && loadingText ? loadingText : children}
    </Button>
  )
})

