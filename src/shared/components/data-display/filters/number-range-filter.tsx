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
import { NumberInput } from "@/components/ui/number-input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface NumberRangeFilterProps<TData, TValue> {
    column?: Column<TData, TValue>
    columnId?: string // Column ID for lookup when column is not provided
    title?: string
    min?: number
    max?: number
    step?: number
    formatThousands?: boolean // Format với dấu phẩy phân tách hàng nghìn
    suffix?: string // Suffix text (e.g., "%")
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
    formatThousands = false,
    suffix,
}: NumberRangeFilterProps<TData, TValue>) {
    const [isOpen, setIsOpen] = React.useState(false)
    
    const filterValue = column?.getFilterValue() as { min?: number; max?: number } | undefined
    const [range, setRange] = React.useState<{ min?: number; max?: number }>({
        min: filterValue?.min,
        max: filterValue?.max,
    })

    React.useEffect(() => {
        // ⚠️ CRITICAL: Reset range when filterValue is cleared (undefined)
        // This ensures the component syncs with table filter state when filters are cleared
        if (filterValue === undefined || filterValue === null) {
            setRange({})
        } else {
            setRange(filterValue)
        }
    }, [filterValue])

    const handleRangeChange = (field: 'min' | 'max', value: number | null) => {
        const numValue = value === null || value === undefined ? undefined : value
        const newRange = { ...range, [field]: numValue }
        setRange(newRange)
        
        if (newRange.min !== undefined || newRange.max !== undefined) {
            column?.setFilterValue(newRange)
        } else {
            column?.setFilterValue(undefined)
        }
    }
    
    const handleRangeChangeString = (field: 'min' | 'max', value: string) => {
        const numValue = value === '' ? undefined : Number(value)
        handleRangeChange(field, numValue === undefined ? null : numValue)
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
                            {formatThousands ? (
                                <NumberInput
                                    id="min-value"
                                    name="min-value"
                                    placeholder="Min"
                                    value={range.min}
                                    onChange={(value) => handleRangeChange('min', value)}
                                    min={min}
                                    max={max}
                                    step={step}
                                    allowDecimals={step < 1}
                                    formatThousands={formatThousands}
                                    suffix={suffix}
                                    className="h-8 text-xs"
                                />
                            ) : (
                                <Input
                                    id="min-value"
                                    name="min-value"
                                    type="number"
                                    placeholder="Min"
                                    value={range.min ?? ''}
                                    onChange={(e) => handleRangeChangeString('min', e.target.value)}
                                    min={min}
                                    max={max}
                                    step={step}
                                    className="h-8 text-xs"
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max-value" className="text-xs">
                                Đến
                            </Label>
                            {formatThousands ? (
                                <NumberInput
                                    id="max-value"
                                    name="max-value"
                                    placeholder="Max"
                                    value={range.max}
                                    onChange={(value) => handleRangeChange('max', value)}
                                    min={min}
                                    max={max}
                                    step={step}
                                    allowDecimals={step < 1}
                                    formatThousands={formatThousands}
                                    suffix={suffix}
                                    className="h-8 text-xs"
                                />
                            ) : (
                                <Input
                                    id="max-value"
                                    name="max-value"
                                    type="number"
                                    placeholder="Max"
                                    value={range.max ?? ''}
                                    onChange={(e) => handleRangeChangeString('max', e.target.value)}
                                    min={min}
                                    max={max}
                                    step={step}
                                    className="h-8 text-xs"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

