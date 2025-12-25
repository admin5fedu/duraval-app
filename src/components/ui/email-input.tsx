"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface EmailInputProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
    value?: string
    onChange?: (value: string) => void
}

export function EmailInput({
    value = "",
    onChange,
    className,
    ...props
}: EmailInputProps) {
    const [isValid, setIsValid] = React.useState(true)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value
        onChange?.(email)

        // Validate email format
        if (email && email.length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            setIsValid(emailRegex.test(email))
        } else {
            setIsValid(true)
        }
    }

    return (
        <Input
            type="email"
            value={value}
            onChange={handleChange}
            className={cn(
                !isValid && value && "border-destructive focus-visible:ring-destructive",
                className
            )}
            {...props}
        />
    )
}

