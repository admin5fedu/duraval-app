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
    formatThousands?: boolean
    suffix?: string
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
function NumberInput({
    value = "",
    onChange,
    min,
    max,
    step = 1,
    allowDecimals = true,
    formatThousands = false,
    suffix,
    className,
    ...props
}, ref) {
    
    // 1. Hàm format hiển thị
    // ⚠️ CRITICAL: When formatThousands=true, use 'en-US' locale (comma as thousand separator)
    // When formatThousands=false, use 'vi-VN' locale (dot as thousand separator)
    const formatValue = (num: number | null | undefined): string => {
        if (num === null || num === undefined || isNaN(num)) return ""
        
        // Choose locale based on formatThousands
        const locale = formatThousands ? 'en-US' : 'vi-VN'
        
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: 0,
            // ⚠️ CRITICAL: Don't force maximumFractionDigits to 0 - preserve exact value
            // Use high limit to prevent rounding (e.g., 100000 should not become 100)
            maximumFractionDigits: allowDecimals ? 20 : 0,
            useGrouping: formatThousands || true // Always show grouping for readability
        }).format(num)
    }

    // 2. Hàm parse chuỗi vi-VN về số thuần túy để tính toán
    // ⚠️ CRITICAL: Handle both formatThousands modes correctly
    // - formatThousands=true: comma (,) is thousand separator (English style)
    // - formatThousands=false: dot (.) is thousand separator (vi-VN style)
    const parseViNumber = (str: string): number => {
        if (!str || str.trim() === '') return NaN
        
        let cleanStr = str.trim()
        
        if (formatThousands) {
            // formatThousands=true: comma (,) is thousand separator, dot (.) is decimal
            // Example: "100,000" -> "100000", "100,000.5" -> "100000.5"
            // Remove all commas (thousand separators)
            cleanStr = cleanStr.replace(/,/g, '')
            // Dot (.) is already decimal separator, no need to replace
        } else {
            // formatThousands=false: dot (.) is thousand separator, comma (,) is decimal (vi-VN)
            // Example: "50.000" -> "50000", "50.000,5" -> "50000.5"
            // Remove all dots (thousand separators)
            cleanStr = cleanStr.replace(/\./g, '')
            // Replace comma (decimal separator in vi-VN) with dot (for parseFloat)
            cleanStr = cleanStr.replace(',', '.')
        }
        
        // Parse to number
        const result = parseFloat(cleanStr)
        return isNaN(result) ? NaN : result
    }

    const [displayValue, setDisplayValue] = React.useState("")
    const [isFocused, setIsFocused] = React.useState(false)

    // Cập nhật display khi value từ props thay đổi
    React.useEffect(() => {
        if (!isFocused) {
            const num = typeof value === 'string' ? parseFloat(value) : value
            setDisplayValue(formatValue(num))
        }
    }, [value, isFocused])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value
        
        // ⚠️ CRITICAL: Allow different characters based on formatThousands
        // formatThousands=true: allow comma (,) as thousand separator, dot (.) as decimal
        // formatThousands=false: allow dot (.) as thousand separator, comma (,) as decimal (vi-VN)
        const regex = formatThousands
            ? (allowDecimals ? /[^0-9,.]/g : /[^0-9,]/g)  // English style: comma for thousands
            : (allowDecimals ? /[^0-9.,]/g : /[^0-9.]/g)  // vi-VN style: dot for thousands
        val = val.replace(regex, "")

        // Parse để lấy giá trị thực
        const numericValue = parseViNumber(val)
        
        if (!isNaN(numericValue)) {
            let finalValue = numericValue
            if (min !== undefined && finalValue < min) finalValue = min
            if (max !== undefined && finalValue > max) finalValue = max
            
            // Format lại ngay khi đang gõ để hiển thị phân tách hàng nghìn
            const formatted = formatValue(finalValue)
            setDisplayValue(formatted)
            
            onChange?.(finalValue)
        } else if (val === "") {
            setDisplayValue("")
            onChange?.(null)
        } else {
            // Nếu parse fail nhưng vẫn có ký tự hợp lệ, giữ nguyên để user tiếp tục gõ
            setDisplayValue(val)
        }
    }

    const handleBlur = () => {
        setIsFocused(false)
        const numericValue = parseViNumber(displayValue)
        
        if (!isNaN(numericValue)) {
            // Apply min/max constraints
            let finalValue = numericValue
            if (min !== undefined && finalValue < min) finalValue = min
            if (max !== undefined && finalValue > max) finalValue = max
            
            // Format lại đúng chuẩn vi-VN khi rời ô nhập
            setDisplayValue(formatValue(finalValue))
            
            // Call onChange with final value
            onChange?.(finalValue)
        } else {
            // If parsing fails, clear the value
            setDisplayValue("")
            onChange?.(null)
        }
    }

    const handleFocus = () => {
        setIsFocused(true)
        
        // Khi focus, hiển thị số thuần túy (không có dấu ngăn cách hàng nghìn) để user dễ sửa
        const numericValue = parseViNumber(displayValue)
        
        if (!isNaN(numericValue)) {
            // Hiển thị số thuần túy: không có dấu ngăn cách hàng nghìn
            const numStr = numericValue.toString()
            
            if (formatThousands) {
                // formatThousands=true: dot (.) is decimal separator
                // Keep as is (e.g., "100000" or "100000.5")
                setDisplayValue(numStr)
            } else {
                // formatThousands=false: vi-VN style, comma (,) is decimal separator
                // Replace dot with comma for decimal part
                if (numStr.includes('.') && !numStr.includes('e') && !numStr.includes('E')) {
                    setDisplayValue(numStr.replace('.', ','))
                } else {
                    setDisplayValue(numStr)
                }
            }
        } else if (displayValue) {
            // Nếu parse fail nhưng có displayValue, xóa thousand separators để user có thể sửa
            if (formatThousands) {
                // Remove commas (thousand separators in English style)
                const cleaned = displayValue.replace(/,/g, '')
                setDisplayValue(cleaned)
            } else {
                // Remove dots (thousand separators in vi-VN)
                const cleaned = displayValue.replace(/\./g, '')
                setDisplayValue(cleaned)
            }
        }
    }

    return (
        <div className="relative w-full">
            <Input
                ref={ref}
                type="text"
                value={displayValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={cn(suffix && "pr-8", className)}
                {...props}
            />
            {suffix && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    {suffix}
                </span>
            )}
        </div>
    )
})

NumberInput.displayName = "NumberInput"