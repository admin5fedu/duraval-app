"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface MaskedInputProps extends Omit<React.ComponentProps<typeof Input>, "onChange"> {
    value?: string
    onChange?: (value: string) => void
    mask: string // e.g., "999-999-9999" or "99/99/9999"
    placeholder?: string
}

/**
 * MaskedInput component với pattern matching
 * 
 * @example
 * <MaskedInput
 *   mask="999-999-9999"
 *   placeholder="000-000-0000"
 *   value={phone}
 *   onChange={setPhone}
 * />
 */
export function MaskedInput({
    value = "",
    onChange,
    mask,
    placeholder,
    className,
    ...props
}: MaskedInputProps) {
    const maskChars = mask.split("")
    const placeholderChars = placeholder?.split("") || maskChars.map((char) => {
        if (char === "9") return "0"
        if (char === "a") return "_"
        if (char === "*") return "_"
        return char
    })

    const applyMask = (inputValue: string): string => {
        const inputChars = inputValue.replace(/[^\d\w]/g, "").split("")
        let result = ""
        let inputIndex = 0

        for (let i = 0; i < maskChars.length && inputIndex < inputChars.length; i++) {
            const maskChar = maskChars[i]

            if (maskChar === "9") {
                // Chỉ cho phép số
                if (/\d/.test(inputChars[inputIndex])) {
                    result += inputChars[inputIndex]
                    inputIndex++
                } else {
                    break
                }
            } else if (maskChar === "a") {
                // Chỉ cho phép chữ
                if (/[a-zA-Z]/.test(inputChars[inputIndex])) {
                    result += inputChars[inputIndex]
                    inputIndex++
                } else {
                    break
                }
            } else if (maskChar === "*") {
                // Cho phép cả số và chữ
                if (/[\d\w]/.test(inputChars[inputIndex])) {
                    result += inputChars[inputIndex]
                    inputIndex++
                } else {
                    break
                }
            } else {
                // Ký tự cố định (dấu phân cách)
                result += maskChar
            }
        }

        return result
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value
        const masked = applyMask(inputValue)
        onChange?.(masked)
    }

    const displayValue = value || ""
    const displayPlaceholder = placeholder || placeholderChars.join("")

    return (
        <Input
            type="text"
            value={displayValue}
            onChange={handleChange}
            placeholder={displayPlaceholder}
            maxLength={mask.length}
            className={cn(className)}
            {...props}
        />
    )
}

