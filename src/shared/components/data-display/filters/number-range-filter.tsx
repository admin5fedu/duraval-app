"use client"

import * as React from "react"
import { SlidersHorizontal } from "lucide-react"
import { Column } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { responsiveTextClass, mediumTextClass, smallTextClass } from "@/shared/utils/text-styles"
import { BADGE_TYPOGRAPHY } from "@/shared/constants/typography"
import { standardPaddingClass } from "@/shared/utils/spacing-styles"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface NumberRangeFilterProps<TData, TValue> {
    column?: Column<TData, TValue>
    title?: string
    min?: number
    max?: number
    step?: number
}

/**
 * Number Range Filter Component
 * 
 * Allows filtering by number range (min - max)
 */
export function NumberRangeFilter<TData, TValue>({
    column,
    title = "Số",
    min,
    max,
    step = 1,
}: NumberRangeFilterProps<TData, TValue>) {
    const [isOpen, setIsOpen] = React.useState(false)
    
    const filterValue = column?.getFilterValue() as { min?: number; max?: number } | undefined
    const [range, setRange] = React.useState<{ min?: number; max?: number }>({
        min: filterValue?.min,
        max: filterValue?.max,
    })

    React.useEffect(() => {
        if (filterValue) {
            setRange(filterValue)
        }
    }, [filterValue])

    const handleRangeChange = (field: 'min' | 'max', value: string) => {
        const numValue = value === '' ? undefined : Number(value)
        const newRange = { ...range, [field]: numValue }
        setRange(newRange)
        
        if (newRange.min !== undefined || newRange.max !== undefined) {
            column?.setFilterValue(newRange)
        } else {
            column?.setFilterValue(undefined)
        }
    }

    const handleClear = () => {
        setRange({})
        column?.setFilterValue(undefined)
    }

    const hasFilter = range.min !== undefined || range.max !== undefined

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed shrink-0">
                    <SlidersHorizontal className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className={responsiveTextClass()}>{title}</span>
                    {hasFilter && (
                        <>
                            <Separator orientation="vertical" className="mx-1.5 md:mx-2 h-4" />
                            <Badge
                                variant="secondary"
                                className={cn("rounded-sm px-1", smallTextClass(), BADGE_TYPOGRAPHY.default.fontWeight)}
                            >
                                {range.min !== undefined && range.max !== undefined
                                    ? `${range.min} - ${range.max}`
                                    : range.min !== undefined
                                    ? `≥ ${range.min}`
                                    : range.max !== undefined
                                    ? `≤ ${range.max}`
                                    : ""}
                            </Badge>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className={cn("w-80", standardPaddingClass())} align="start">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className={mediumTextClass()}>{title}</p>
                        {hasFilter && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={handleClear}
                            >
                                Xóa
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="min-value" className="text-xs">
                                Từ
                            </Label>
                            <Input
                                id="min-value"
                                type="number"
                                placeholder="Min"
                                value={range.min ?? ''}
                                onChange={(e) => handleRangeChange('min', e.target.value)}
                                min={min}
                                max={max}
                                step={step}
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max-value" className="text-xs">
                                Đến
                            </Label>
                            <Input
                                id="max-value"
                                type="number"
                                placeholder="Max"
                                value={range.max ?? ''}
                                onChange={(e) => handleRangeChange('max', e.target.value)}
                                min={min}
                                max={max}
                                step={step}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

