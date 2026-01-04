"use client"

import * as React from "react"
import { MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export interface GPSLocationInputProps {
  value?: string | null
  onChange?: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  onBlur?: () => void
}

/**
 * Component input GPS location với button để lấy vị trí hiện tại
 * Format: "latitude, longitude" (ví dụ: "10.762622, 106.660172")
 */
export const GPSLocationInput = React.forwardRef<HTMLInputElement, GPSLocationInputProps>(
  function GPSLocationInput(
    {
      value,
      onChange,
      placeholder = "Ví dụ: 10.762622, 106.660172",
      disabled = false,
      className,
      id,
      onBlur,
    },
    ref
  ) {
    const [isGettingLocation, setIsGettingLocation] = React.useState(false)

    const handleGetCurrentLocation = React.useCallback(() => {
      if (!navigator.geolocation) {
        toast.error("Trình duyệt không hỗ trợ lấy vị trí")
        return
      }

      setIsGettingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const locationString = `${latitude}, ${longitude}`
          onChange?.(locationString)
          setIsGettingLocation(false)
          toast.success("Đã lấy vị trí thành công")
        },
        (error) => {
          setIsGettingLocation(false)
          let errorMessage = "Không thể lấy vị trí"
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Người dùng đã từ chối quyền truy cập vị trí"
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Thông tin vị trí không khả dụng"
              break
            case error.TIMEOUT:
              errorMessage = "Hết thời gian chờ lấy vị trí"
              break
          }
          toast.error(errorMessage)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    }, [onChange])

    return (
      <div className={cn("relative flex items-center gap-2", className)}>
        <Input
          ref={ref}
          id={id}
          type="text"
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value || null)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled || isGettingLocation}
          className="pr-20"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleGetCurrentLocation}
          disabled={disabled || isGettingLocation}
          className="absolute right-1 h-7 w-7 shrink-0"
          title="Lấy vị trí hiện tại"
        >
          {isGettingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>
      </div>
    )
  }
)

GPSLocationInput.displayName = "GPSLocationInput"

