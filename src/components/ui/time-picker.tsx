"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface TimePickerProps {
  value?: string // Format: "HH:mm"
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Chọn giờ",
  disabled = false,
  className,
  error = false,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Parse value to hour and minute
  const parseTime = (timeStr?: string): { hour: number; minute: number } => {
    if (!timeStr || !timeStr.includes(':')) {
      return { hour: 0, minute: 0 }
    }
    const [hour, minute] = timeStr.split(':').map(Number)
    return {
      hour: isNaN(hour) ? 0 : Math.max(0, Math.min(23, hour)),
      minute: isNaN(minute) ? 0 : Math.max(0, Math.min(59, minute))
    }
  }

  const { hour, minute } = parseTime(value)
  
  // Format time to HH:mm
  const formatTime = (h: number, m: number): string => {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const handleHourChange = (newHour: string) => {
    const h = parseInt(newHour)
    if (!isNaN(h) && h >= 0 && h <= 23) {
      onChange?.(formatTime(h, minute))
    }
  }

  const handleMinuteChange = (newMinute: string) => {
    const m = parseInt(newMinute)
    if (!isNaN(m) && m >= 0 && m <= 59) {
      onChange?.(formatTime(hour, m))
    }
  }

  // Generate options for hours (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: String(i),
    label: String(i).padStart(2, '0')
  }))

  // Generate options for minutes (0-59, step 1)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    value: String(i),
    label: String(i).padStart(2, '0')
  }))

  const displayValue = value ? formatTime(hour, minute) : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            error && "border-destructive",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayValue ? (
            <span>{displayValue}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex items-center gap-2">
          {/* Hour Select */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground text-center">Giờ</label>
            <Select
              value={String(hour)}
              onValueChange={handleHourChange}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {hourOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end pb-2">
            <span className="text-lg font-semibold">:</span>
          </div>

          {/* Minute Select */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground text-center">Phút</label>
            <Select
              value={String(minute)}
              onValueChange={handleMinuteChange}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {minuteOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick time buttons */}
        <div className="mt-3 pt-3 border-t flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              onChange?.(formatTime(9, 0))
              setOpen(false)
            }}
          >
            09:00
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              onChange?.(formatTime(10, 0))
              setOpen(false)
            }}
          >
            10:00
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              onChange?.(formatTime(14, 0))
              setOpen(false)
            }}
          >
            14:00
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Alternative: TimeInput with direct typing support
interface TimeInputProps extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> {
  value?: string // Format: "HH:mm"
  onChange?: (value: string) => void
  error?: boolean
}

export function TimeInput({
  value,
  onChange,
  error,
  className,
  ...props
}: TimeInputProps) {
  const [displayValue, setDisplayValue] = React.useState(value || '')

  React.useEffect(() => {
    setDisplayValue(value || '')
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, '') // Remove non-digits
    
    // Limit to 4 digits
    if (inputValue.length > 4) {
      inputValue = inputValue.slice(0, 4)
    }
    
    // Format as HH:mm while typing
    let formatted = inputValue
    if (inputValue.length > 2) {
      formatted = inputValue.slice(0, 2) + ':' + inputValue.slice(2, 4)
    }
    
    setDisplayValue(formatted)
    
    // Only call onChange if valid format
    if (formatted.length === 5) {
      const [hour, minute] = formatted.split(':').map(Number)
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        onChange?.(formatted)
      }
    } else if (formatted.length === 0) {
      onChange?.('')
    }
  }

  const handleBlur = () => {
    // Validate and fix on blur
    if (displayValue) {
      const [hourStr, minuteStr] = displayValue.split(':')
      const hour = parseInt(hourStr || '0')
      const minute = parseInt(minuteStr || '0')
      
      const validHour = Math.max(0, Math.min(23, isNaN(hour) ? 0 : hour))
      const validMinute = Math.max(0, Math.min(59, isNaN(minute) ? 0 : minute))
      
      const fixedValue = `${String(validHour).padStart(2, '0')}:${String(validMinute).padStart(2, '0')}`
      setDisplayValue(fixedValue)
      onChange?.(fixedValue)
    }
  }

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="HH:mm"
      maxLength={5}
      className={cn(
        error && "border-destructive",
        className
      )}
      {...props}
    />
  )
}

