"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface NumberInputProps extends Omit<React.ComponentProps<typeof Input>, "type" | "onChange"> {
    value?: number | string
    onChange?: (value: number | null) => void
    min?: number
    max?: number
    step?: number
    allowDecimals?: boolean
    formatOnBlur?: boolean
}

export function NumberInput({
    value = "",
    onChange,
    min,
    max,
    step = 1,
    allowDecimals = true,
    formatOnBlur = true,
    className,
    ...props
}: NumberInputProps) {
    const [displayValue, setDisplayValue] = React.useState<string>(
        value !== null && value !== undefined ? String(value) : ""
    )

    React.useEffect(() => {
        setDisplayValue(value !== null && value !== undefined ? String(value) : "")
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value

        // Remove non-numeric characters except decimal point
        if (!allowDecimals) {
            inputValue = inputValue.replace(/\D/g, "")
        } else {
            inputValue = inputValue.replace(/[^\d.]/g, "")
            // Only allow one decimal point
            const parts = inputValue.split(".")
            if (parts.length > 2) {
                inputValue = parts[0] + "." + parts.slice(1).join("")
            }
        }

        setDisplayValue(inputValue)

        // Convert to number and validate
        if (inputValue === "" || inputValue === ".") {
            onChange?.(null)
            return
        }

        const numValue = parseFloat(inputValue)
        if (!isNaN(numValue)) {
            let finalValue = numValue

            // Apply min/max constraints
            if (min !== undefined && finalValue < min) {
                finalValue = min
            }
            if (max !== undefined && finalValue > max) {
                finalValue = max
            }

            onChange?.(finalValue)
        }
    }

    const handleBlur = () => {
        if (formatOnBlur && displayValue) {
            const numValue = parseFloat(displayValue)
            if (!isNaN(numValue)) {
                // Format with appropriate decimal places
                const formatted = allowDecimals
                    ? numValue.toFixed(step < 1 ? 2 : 0)
                    : Math.round(numValue).toString()
                setDisplayValue(formatted)
            }
        }
    }

    return (
        <Input
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(className)}
            {...props}
        />
    )
}

