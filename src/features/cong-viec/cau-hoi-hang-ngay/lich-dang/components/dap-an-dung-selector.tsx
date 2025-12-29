"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DapAnDungSelectorProps {
    value?: number | null
    onChange: (value: number) => void
    error?: string
    disabled?: boolean
}

export function DapAnDungSelector({
    value,
    onChange,
    error,
    disabled = false
}: DapAnDungSelectorProps) {
    const options = [1, 2, 3, 4]

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                {options.map((option) => (
                    <Button
                        key={option}
                        type="button"
                        variant={value === option ? "default" : "outline"}
                        size="default"
                        onClick={() => onChange(option)}
                        disabled={disabled}
                        className={cn(
                            "flex-1",
                            error && value !== option && "border-destructive"
                        )}
                    >
                        {option}
                    </Button>
                ))}
            </div>
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    )
}

