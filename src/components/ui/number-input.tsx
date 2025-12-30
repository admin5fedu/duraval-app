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
    formatThousands?: boolean // Format với dấu phẩy phân tách hàng nghìn
}

export function NumberInput({
    value = "",
    onChange,
    min,
    max,
    step = 1,
    allowDecimals = true,
    formatOnBlur = true,
    formatThousands = false,
    className,
    ...props
}: NumberInputProps) {
    // Helper function để format số với dấu phẩy phân tách hàng nghìn
    const formatWithThousands = (num: number): string => {
        if (isNaN(num)) return ""
        if (allowDecimals) {
            return num.toLocaleString('vi-VN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: step < 1 ? 2 : 0
            })
        }
        return Math.round(num).toLocaleString('vi-VN')
    }

    // Helper function để parse số từ string có dấu phẩy
    const parseFormattedNumber = (str: string): number => {
        // Remove all commas and spaces
        const cleaned = str.replace(/[,\s]/g, '')
        return parseFloat(cleaned)
    }

    const [displayValue, setDisplayValue] = React.useState<string>(() => {
        if (value !== null && value !== undefined) {
            const num = typeof value === 'string' ? parseFloat(value) : value
            if (!isNaN(num) && formatThousands) {
                return formatWithThousands(num)
            }
            return String(value)
        }
        return ""
    })

    React.useEffect(() => {
        if (value !== null && value !== undefined) {
            const num = typeof value === 'string' ? parseFloat(value) : value
            if (!isNaN(num)) {
                if (formatThousands) {
                    setDisplayValue(formatWithThousands(num))
                } else {
                    setDisplayValue(String(value))
                }
            } else {
                setDisplayValue("")
            }
        } else {
            setDisplayValue("")
        }
    }, [value, formatThousands])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value

        // Nếu có format thousands, remove commas trước khi xử lý
        if (formatThousands) {
            inputValue = inputValue.replace(/[,\s]/g, '')
        }

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

        // Convert to number
        if (inputValue === "" || inputValue === ".") {
            setDisplayValue("")
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

            // Format display value với thousand separator nếu cần
            if (formatThousands) {
                setDisplayValue(formatWithThousands(finalValue))
            } else {
                setDisplayValue(inputValue)
            }

            onChange?.(finalValue)
        }
    }

    const handleBlur = () => {
        if (displayValue) {
            const numValue = parseFormattedNumber(displayValue)
            if (!isNaN(numValue)) {
                if (formatThousands) {
                    setDisplayValue(formatWithThousands(numValue))
                } else {
                    // Format with appropriate decimal places
                    const formatted = allowDecimals
                        ? numValue.toFixed(step < 1 ? 2 : 0)
                        : Math.round(numValue).toString()
                    setDisplayValue(formatted)
                }
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

