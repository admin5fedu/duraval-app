"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface ToggleButtonGroupProps {
    value?: string | number
    onChange: (value: string | number) => void
    options: Array<{ label: string; value: string | number }>
    disabled?: boolean
    className?: string
}

/**
 * Toggle Button Group Component với UI dễ nhìn hơn
 * Hiển thị rõ ràng option nào đang được chọn với:
 * - Background màu primary khi được chọn
 * - Border dày hơn khi được chọn
 * - Icon check khi được chọn
 * - Shadow để nổi bật
 */
export function ToggleButtonGroup({
    value,
    onChange,
    options,
    disabled = false,
    className,
}: ToggleButtonGroupProps) {
    // Normalize value for comparison (handle both string and number)
    const normalizedValue = React.useMemo(() => {
        if (value === undefined || value === null) return undefined
        return value
    }, [value])

    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {options.map((option) => {
                // Compare values (handle number vs string)
                const isSelected = normalizedValue !== undefined && (
                    normalizedValue === option.value ||
                    String(normalizedValue) === String(option.value) ||
                    Number(normalizedValue) === Number(option.value)
                )
                
                return (
                    <button
                        key={option.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                            "h-8 px-3 py-2",
                            "transition-all duration-200 relative",
                            isSelected
                                ? "bg-primary text-primary-foreground shadow-lg font-semibold border-2 border-primary hover:bg-primary/90"
                                : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground border-2 border-input",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
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
}

