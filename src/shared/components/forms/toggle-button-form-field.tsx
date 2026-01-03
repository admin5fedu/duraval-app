"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface ToggleButtonFormFieldProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  onBlur?: () => void
}

/**
 * Toggle Button Form Field Component
 * 
 * Quy chuẩn toggle button với:
 * - Background màu primary khi được chọn
 * - Border dày hơn khi được chọn
 * - Icon check khi được chọn
 * - Shadow để nổi bật
 * 
 * Tham khảo từ module phiếu hành chính (cột ca)
 */
export const ToggleButtonFormField = React.forwardRef<HTMLDivElement, ToggleButtonFormFieldProps>(
function ToggleButtonFormField({
  value,
  onChange,
  options,
  disabled = false,
  className,
  id,
  name,
  onBlur,
}, ref) {
  // Normalize value to ensure it matches option values exactly
  const normalizedValue = React.useMemo(() => {
    const stringValue = value ? String(value) : ""
    if (!stringValue) return ""
    // Find matching option (case-sensitive)
    const matchingOption = options.find(opt => opt.value === stringValue)
    return matchingOption ? matchingOption.value : ""
  }, [value, options])

  return (
    <div 
      ref={ref}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {/* Hidden input để browser có thể associate với label và form autofill */}
      <input
        type="hidden"
        id={id}
        name={name}
        value={normalizedValue}
        aria-hidden="true"
        tabIndex={-1}
        readOnly
      />
      
      {options.map((option) => {
        const isSelected = normalizedValue === option.value
        
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => {
              onChange(option.value)
              // Trigger onBlur after selection
              if (onBlur) {
                setTimeout(() => onBlur(), 0)
              }
            }}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "h-8 px-3 py-2",
              "transition-all duration-200 relative",
              isSelected
                ? "bg-primary text-primary-foreground shadow-lg font-semibold border-2 border-primary hover:bg-primary/90"
                : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground border-2 border-input",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            aria-pressed={isSelected}
            aria-label={`${option.label}${isSelected ? ' (đã chọn)' : ''}`}
          >
            {isSelected && (
              <Check className="h-3.5 w-3.5" />
            )}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
})

ToggleButtonFormField.displayName = "ToggleButtonFormField"

