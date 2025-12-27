"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ToggleGroupProps {
  type?: "single" | "multiple"
  value: string | string[]
  onValueChange: (value: string | string[]) => void
  children: React.ReactNode
  className?: string
}

interface ToggleGroupItemProps {
  value: string
  children: React.ReactNode
  className?: string
  "aria-label"?: string
}

const ToggleGroupContext = React.createContext<{
  value: string | string[]
  onValueChange: (value: string) => void
  type: "single" | "multiple"
} | null>(null)

export function ToggleGroup({ type = "single", value, onValueChange, children, className }: ToggleGroupProps) {
  const handleValueChange = React.useCallback((itemValue: string) => {
    if (type === "single") {
      onValueChange(itemValue === value ? "" : itemValue)
    } else {
      const currentValues = Array.isArray(value) ? value : []
      const newValues = currentValues.includes(itemValue)
        ? currentValues.filter((v) => v !== itemValue)
        : [...currentValues, itemValue]
      onValueChange(newValues)
    }
  }, [type, value, onValueChange])

  return (
    <ToggleGroupContext.Provider value={{ value, onValueChange: handleValueChange, type }}>
      <div className={cn("inline-flex items-center justify-center rounded-md gap-2", className)}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  )
}

export function ToggleGroupItem({ value, children, className, "aria-label": ariaLabel }: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext)
  if (!context) {
    throw new Error("ToggleGroupItem must be used within ToggleGroup")
  }

  const { value: groupValue, onValueChange, type } = context
  const isSelected = type === "single"
    ? groupValue === value
    : Array.isArray(groupValue) && groupValue.includes(value)

  return (
    <Button
      type="button"
      variant={isSelected ? "default" : "ghost"}
      size="sm"
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
        isSelected && "bg-background text-foreground shadow-sm",
        className
      )}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
    >
      {children}
    </Button>
  )
}
