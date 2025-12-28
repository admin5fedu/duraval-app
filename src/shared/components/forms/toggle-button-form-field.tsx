"use client"

import * as React from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { getEnumBadgeClass } from "@/shared/utils/enum-color-registry"
import { useFormField } from "@/components/ui/form"

interface ToggleButtonFormFieldProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  disabled?: boolean
  className?: string
}

export function ToggleButtonFormField({
  value,
  onChange,
  options,
  disabled = false,
  className,
}: ToggleButtonFormFieldProps) {
  // Get id from FormControl context if available
  let formItemId: string | undefined
  try {
    const formField = useFormField()
    formItemId = formField.formItemId
  } catch {
    // Not in FormControl context, generate a unique id
    formItemId = React.useId()
  }
  
  // Normalize value to ensure it matches option values exactly
  const normalizedValue = React.useMemo(() => {
    const stringValue = value ? String(value) : ""
    if (!stringValue) return ""
    // Find matching option (case-sensitive)
    const matchingOption = options.find(opt => opt.value === stringValue)
    return matchingOption ? matchingOption.value : ""
  }, [value, options])

  return (
    <ToggleGroup
      type="single"
      value={normalizedValue}
      onValueChange={(newValue) => {
        if (disabled) return
        // ToggleGroup returns empty string when clicking selected item (deselect)
        // For required fields, prevent deselection. For optional fields, allow it.
        if (newValue === "" && normalizedValue !== "") {
          // Prevent deselection - keep current value
          return
        }
        // Only update if newValue is a valid option value
        const isValidOption = options.some(opt => opt.value === newValue)
        if (isValidOption) {
          onChange(newValue)
        }
      }}
      id={formItemId}
      role="radiogroup"
      className={cn("w-full flex-wrap justify-start gap-2 bg-transparent", className)}
    >
      {options.map((option) => {
        const isSelected = normalizedValue === option.value
        const colorClass = getEnumBadgeClass("moi_quan_he", option.value)
        
        return (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            disabled={disabled}
            className={cn(
              "h-auto px-4 py-2 text-sm font-medium transition-all border",
              isSelected && colorClass,
              !isSelected && "hover:bg-muted/50 border-border"
            )}
            aria-label={option.label}
          >
            {option.label}
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}

