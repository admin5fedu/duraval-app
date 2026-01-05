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
  quickOptions?: Array<{ label: string; hour: number; minute: number }> // Custom quick time options
}

export function TimePicker({
  value,
  onChange,
  placeholder = "HH:mm",
  disabled = false,
  className,
  error = false,
  quickOptions = [
    { label: "09:00", hour: 9, minute: 0 },
    { label: "10:00", hour: 10, minute: 0 },
    { label: "14:00", hour: 14, minute: 0 },
  ],
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value || '')
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  // Sync input value with prop value
  React.useEffect(() => {
    setInputValue(value || '')
  }, [value])
  
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

  // Auto-correction: Fix single digit to double digit, clamp invalid hours
  const autoCorrectTime = (h: number, m: number): { hour: number; minute: number } => {
    // Clamp hour to 0-23
    const validHour = Math.max(0, Math.min(23, h))
    // Clamp minute to 0-59
    const validMinute = Math.max(0, Math.min(59, m))
    return { hour: validHour, minute: validMinute }
  }

  const handleHourChange = (newHour: string) => {
    const h = parseInt(newHour)
    if (!isNaN(h) && h >= 0 && h <= 23) {
      const { hour: validHour, minute: validMinute } = autoCorrectTime(h, minute)
      const newValue = formatTime(validHour, validMinute)
      setInputValue(newValue)
      onChange?.(newValue)
    }
  }

  const handleMinuteChange = (newMinute: string) => {
    const m = parseInt(newMinute)
    if (!isNaN(m) && m >= 0 && m <= 59) {
      const { hour: validHour, minute: validMinute } = autoCorrectTime(hour, m)
      const newValue = formatTime(validHour, validMinute)
      setInputValue(newValue)
      onChange?.(newValue)
    }
  }

  // Handle direct input with smart formatting and keyboard navigation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    let inputVal = input.value.replace(/\D/g, '') // Remove non-digits
    
    // Limit to 4 digits
    if (inputVal.length > 4) {
      inputVal = inputVal.slice(0, 4)
    }
    
    // Format as HH:mm while typing
    let formatted = inputVal
    const shouldAutoInsertColon = inputVal.length === 2 && !inputValue.includes(':')
    
    if (inputVal.length > 2) {
      formatted = inputVal.slice(0, 2) + ':' + inputVal.slice(2, 4)
    }
    
    setInputValue(formatted)
    
    // Auto-advance cursor when user types 2 digits (auto-insert colon)
    if (shouldAutoInsertColon) {
      // User typed 2 digits, auto-insert colon and move cursor
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(3, 3) // Position after colon
        }
      }, 0)
    }
    
    // Only call onChange if valid format
    if (formatted.length === 5) {
      const [hourStr, minuteStr] = formatted.split(':')
      const hour = parseInt(hourStr || '0')
      const minute = parseInt(minuteStr || '0')
      
      const { hour: validHour, minute: validMinute } = autoCorrectTime(hour, minute)
      const validValue = formatTime(validHour, validMinute)
      
      if (validValue !== formatted) {
        setInputValue(validValue)
        onChange?.(validValue)
      } else if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        onChange?.(formatted)
      }
    } else if (formatted.length === 0) {
      onChange?.('')
    }
  }

  // Handle keyboard navigation (Arrow Right and Colon key)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const cursorPosition = input.selectionStart || 0
    
    // If cursor is at position 2 (after 2 digits) or user presses ':' or Arrow Right
    if ((cursorPosition === 2 && e.key !== 'Backspace') || e.key === ':' || e.key === 'ArrowRight') {
      if (inputValue.length >= 2 && !inputValue.includes(':')) {
        e.preventDefault()
        const digits = inputValue.replace(/\D/g, '')
        if (digits.length >= 2) {
          const newValue = digits.slice(0, 2) + ':' + digits.slice(2, 4)
          setInputValue(newValue)
          setTimeout(() => {
            input.setSelectionRange(3, 3) // Position after colon
          }, 0)
        }
      } else if (inputValue.includes(':') && cursorPosition < 3) {
        // Jump to minute part
        e.preventDefault()
        input.setSelectionRange(3, 3)
      }
    }
  }

  const handleInputBlur = () => {
    // Validate and auto-correct on blur
    if (inputValue) {
      const [hourStr, minuteStr] = inputValue.split(':')
      let hour = parseInt(hourStr || '0')
      let minute = parseInt(minuteStr || '0')
      
      // Auto-correction: single digit hour -> double digit
      if (hourStr && hourStr.length === 1) {
        hour = parseInt(hourStr)
      }
      
      // Auto-correction: invalid hour -> clamp to 23
      if (hour > 23) {
        hour = 23
      }
      
      // Auto-correction: single digit minute -> double digit
      if (minuteStr && minuteStr.length === 1) {
        minute = parseInt(minuteStr)
      }
      
      const { hour: validHour, minute: validMinute } = autoCorrectTime(hour, minute)
      const fixedValue = formatTime(validHour, validMinute)
      
      setInputValue(fixedValue)
      onChange?.(fixedValue)
    } else if (value) {
      // If input is empty but value exists, restore value
      setInputValue(value)
    }
  }

  // Generate options for hours (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: String(i),
    label: String(i).padStart(2, '0')
  }))

  // Generate options for minutes with 15-minute steps (00, 15, 30, 45)
  const minuteOptions = [
    { value: "0", label: "00" },
    { value: "15", label: "15" },
    { value: "30", label: "30" },
    { value: "45", label: "45" },
  ]

  const handleQuickTimeClick = (h: number, m: number) => {
    const newValue = formatTime(h, m)
    setInputValue(newValue)
    onChange?.(newValue)
    setOpen(false)
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={5}
          className={cn(
            "pr-10",
            error && "border-destructive",
            className
          )}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "absolute right-0 top-0 h-full px-3 hover:bg-transparent",
                disabled && "cursor-not-allowed opacity-50"
              )}
              disabled={disabled}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!disabled) {
                  setOpen(!open)
                }
              }}
            >
              <Clock className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-3" 
            align="end"
            side="bottom"
            sideOffset={4}
            avoidCollisions={true}
            collisionPadding={8}
          >
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
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className={cn(
                          option.value === String(hour) && "bg-accent"
                        )}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end pb-2">
                <span className="text-lg font-semibold">:</span>
              </div>

              {/* Minute Select - Only show 15-minute intervals */}
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
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className={cn(
                          option.value === String(minute) && "bg-accent"
                        )}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick time buttons - Dynamic from props */}
            {quickOptions.length > 0 && (
              <div className="mt-3 pt-3 border-t flex gap-2">
                {quickOptions.map((option, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleQuickTimeClick(option.hour, option.minute)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
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
