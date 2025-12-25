"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PhoneInputProps extends Omit<React.ComponentProps<typeof Input>, "type" | "onChange"> {
    value?: string
    onChange?: (value: string) => void
    countryCode?: string
}

export function PhoneInput({
    value = "",
    onChange,
    countryCode = "+84",
    className,
    ...props
}: PhoneInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value.replace(/\D/g, "") // Chỉ giữ số

        // Giới hạn 10 số (cho số điện thoại Việt Nam)
        if (inputValue.length > 10) {
            inputValue = inputValue.slice(0, 10)
        }

        // Format: 0xxx xxx xxx
        let formatted = inputValue
        if (inputValue.length > 4) {
            formatted = `${inputValue.slice(0, 4)} ${inputValue.slice(4)}`
        }
        if (inputValue.length > 7) {
            formatted = `${inputValue.slice(0, 4)} ${inputValue.slice(4, 7)} ${inputValue.slice(7)}`
        }

        onChange?.(formatted || "")
    }

    return (
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {countryCode}
            </span>
            <Input
                type="tel"
                value={value}
                onChange={handleChange}
                className={cn("pl-12", className)}
                placeholder="0xxx xxx xxx"
                maxLength={14}
                {...props}
            />
        </div>
    )
}

