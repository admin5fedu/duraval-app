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
    suffix?: string // Suffix text to display after the number (e.g., "%")
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
function NumberInput({
    value = "",
    onChange,
    min,
    max,
    step = 1,
    allowDecimals = true,
    formatOnBlur = true,
    formatThousands = false,
    suffix,
    className,
    ...props
}, ref) {
    // Helper function để format số với dấu phẩy phân tách hàng nghìn
    const formatWithThousands = (num: number): string => {
        if (isNaN(num)) return ""
        if (allowDecimals) {
            // Nếu có suffix (như %), luôn hiển thị 2 chữ số thập phân với dấu phẩy
            if (suffix) {
                return num.toLocaleString('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })
            }
            return num.toLocaleString('vi-VN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: step < 1 ? 2 : 0
            })
        }
        return Math.round(num).toLocaleString('vi-VN')
    }

    // Helper function để parse số từ string có dấu phẩy
    const parseFormattedNumber = (str: string): number => {
        // If suffix exists (like %), comma is decimal separator in Vietnamese locale
        // For example: "6,00" should become "6.00"
        if (suffix && str.includes(',')) {
            // Replace comma with dot for decimal parsing
            // In Vietnamese locale with percentage, comma is always decimal separator
            const cleaned = str.replace(/,/g, '.')
            return parseFloat(cleaned)
        }
        // Otherwise, remove commas (thousand separators) and spaces
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
                } else if (allowDecimals && suffix) {
                    // Format với dấu phẩy cho phần thập phân khi có suffix (như %)
                    setDisplayValue(num.toLocaleString('vi-VN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }))
                } else {
                    setDisplayValue(String(value))
                }
            } else {
                setDisplayValue("")
            }
        } else {
            setDisplayValue("")
        }
    }, [value, formatThousands, allowDecimals, suffix])

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
            } else if (allowDecimals && suffix) {
                // Format với dấu phẩy cho phần thập phân khi có suffix (như %)
                setDisplayValue(finalValue.toLocaleString('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }))
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
                } else if (allowDecimals && suffix) {
                    // Format với dấu phẩy cho phần thập phân khi có suffix (như %)
                    setDisplayValue(numValue.toLocaleString('vi-VN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }))
                } else {
                    // Format with appropriate decimal places
                    const formatted = allowDecimals
                        ? numValue.toFixed(step < 1 ? 2 : 0)
                        : Math.round(numValue).toString()
                    setDisplayValue(formatted)
                }
                // Ensure onChange is called with the parsed number value on blur
                onChange?.(numValue)
            }
        }
    }

    if (suffix) {
        return (
            <div className="relative">
                <Input
                    ref={ref}
                    type="text"
                    inputMode="numeric"
                    value={displayValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn("pr-8", className)}
                    {...props}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    {suffix}
                </span>
            </div>
        )
    }

    return (
        <Input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(className)}
            {...props}
        />
    )
})

NumberInput.displayName = "NumberInput"

