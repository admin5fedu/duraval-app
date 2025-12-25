"use client"

import * as React from "react"
import { Calendar } from "lucide-react"
import { Column } from "@tanstack/react-table"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { responsiveTextClass, mediumTextClass, smallTextClass } from "@/shared/utils/text-styles"
import { BADGE_TYPOGRAPHY } from "@/shared/constants/typography"
import { standardPaddingClass } from "@/shared/utils/spacing-styles"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface DateRangeFilterProps<TData, TValue> {
    column?: Column<TData, TValue>
    title?: string
}

/**
 * Date Range Filter Component
 * 
 * Allows filtering by date range (from - to)
 */
export function DateRangeFilter<TData, TValue>({
    column,
    title = "Ngày",
}: DateRangeFilterProps<TData, TValue>) {
    const [isOpen, setIsOpen] = React.useState(false)
    
    const filterValue = column?.getFilterValue() as { from?: Date; to?: Date } | undefined
    const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>({
        from: filterValue?.from,
        to: filterValue?.to,
    })

    React.useEffect(() => {
        if (filterValue) {
            setDateRange(filterValue)
        }
    }, [filterValue])

    const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
        setDateRange(range || {})
        if (range?.from || range?.to) {
            column?.setFilterValue(range)
        } else {
            column?.setFilterValue(undefined)
        }
    }

    const handleClear = () => {
        setDateRange({})
        column?.setFilterValue(undefined)
    }

    const hasFilter = dateRange.from || dateRange.to

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed shrink-0">
                    <Calendar className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className={responsiveTextClass()}>{title}</span>
                    {hasFilter && (
                        <>
                            <Separator orientation="vertical" className="mx-1.5 md:mx-2 h-4" />
                            <Badge
                                variant="secondary"
                                className={cn("rounded-sm px-1", smallTextClass(), BADGE_TYPOGRAPHY.default.fontWeight)}
                            >
                                {dateRange.from && dateRange.to
                                    ? `${format(dateRange.from, "dd/MM/yyyy", { locale: vi })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: vi })}`
                                    : dateRange.from
                                    ? `Từ ${format(dateRange.from, "dd/MM/yyyy", { locale: vi })}`
                                    : dateRange.to
                                    ? `Đến ${format(dateRange.to, "dd/MM/yyyy", { locale: vi })}`
                                    : ""}
                            </Badge>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className={standardPaddingClass()}>
                    <div className="space-y-2">
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
                        <CalendarComponent
                            mode="range"
                            selected={{
                                from: dateRange.from,
                                to: dateRange.to,
                            }}
                            onSelect={(range) => {
                                if (range) {
                                    handleDateRangeChange(range)
                                }
                            }}
                            numberOfMonths={2}
                            locale={vi}
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

