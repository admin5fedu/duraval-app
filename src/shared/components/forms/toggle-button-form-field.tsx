"use client"

import * as React from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { getEnumBadgeClass } from "@/shared/utils/enum-color-registry"

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
  return (
    <ToggleGroup
      type="single"
      value={value || ""}
      onValueChange={(newValue) => {
        if (!disabled) {
          onChange(newValue || "")
        }
      }}
      className={cn("w-full flex-wrap justify-start gap-2 bg-transparent", className)}
    >
      {options.map((option) => {
        const isSelected = value === option.value
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

