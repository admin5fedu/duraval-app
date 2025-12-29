"use client"

import * as React from "react"
import { PlusCircle, Search } from "lucide-react"
import { Column } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { responsiveTextClass, mediumTextClass, smallTextClass, bodyTextClass } from "@/shared/utils/text-styles"
import { BADGE_TYPOGRAPHY } from "@/shared/constants/typography"
import { compactPaddingClass } from "@/shared/utils/spacing-styles"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DataTableFacetedFilterProps<TData, TValue> {
    column?: Column<TData, TValue>
    title?: string
    options: {
        label: string
        value: string
        icon?: React.ComponentType<{ className?: string }>
    }[]
}

export function DataTableFacetedFilter<TData, TValue>({
    column,
    title,
    options,
}: DataTableFacetedFilterProps<TData, TValue>) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // ⚡ Performance: Lazy load faceted values - chỉ tính toán khi popover mở
    // Tránh tính toán phức tạp mỗi lần render
    const facets = React.useMemo(() => {
        if (!isOpen || !column) return undefined
        return column.getFacetedUniqueValues()
    }, [isOpen, column])
    
    const filterValue = column?.getFilterValue() as string[] | undefined
    const selectedValues = new Set(filterValue || [])

    // ⚡ Professional: Filter options based on search query (tìm theo cả label và value)
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) {
            return options
        }
        const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        return options.filter((option) => {
            // Tìm theo cả label và value, bỏ dấu tiếng Việt để tìm kiếm dễ hơn
            const labelNormalized = option.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            const valueNormalized = option.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            return labelNormalized.includes(query) || valueNormalized.includes(query)
        })
    }, [options, searchQuery])

    // Reset search when popover closes
    React.useEffect(() => {
        if (!isOpen) {
            setSearchQuery("")
        }
    }, [isOpen])

    const handleSelect = (value: string) => {
        const newSelectedValues = new Set(selectedValues)
        if (newSelectedValues.has(value)) {
            newSelectedValues.delete(value)
        } else {
            newSelectedValues.add(value)
        }
        const filterValues = Array.from(newSelectedValues)
        column?.setFilterValue(filterValues.length ? filterValues : undefined)
    }

    const handleClear = () => {
        column?.setFilterValue(undefined)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed shrink-0">
                    <PlusCircle className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className={responsiveTextClass()}>{title}</span>
                    {/* Ẩn badges trên mobile - chỉ hiển thị trên desktop */}
                    {selectedValues?.size > 0 && (
                        <div className="hidden md:flex items-center">
                            <Separator orientation="vertical" className="mx-1.5 md:mx-2 h-4" />
                            {selectedValues.size > 2 ? (
                                <Badge
                                    variant="secondary"
                                    className={cn("rounded-sm px-1", smallTextClass(), BADGE_TYPOGRAPHY.default.fontWeight)}
                                >
                                    {selectedValues.size} đã chọn
                                </Badge>
                            ) : (
                                options
                                    .filter((option) => selectedValues.has(option.value))
                                    .map((option) => (
                                        <Badge
                                            variant="secondary"
                                            key={option.value}
                                            className={cn("rounded-sm px-1", smallTextClass(), BADGE_TYPOGRAPHY.default.fontWeight)}
                                        >
                                            {option.label}
                                        </Badge>
                                    ))
                            )}
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0" align="start">
                <div className="flex flex-col">
                    {/* Header with title */}
                    <div className={cn(compactPaddingClass(), "border-b")}>
                        <p className={mediumTextClass()}>{title}</p>
                    </div>
                    
                    {/* ⚡ Professional: Search Input - Style như ComboboxFormField */}
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            placeholder="Tìm kiếm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
                            autoComplete="off"
                        />
                    </div>

                    {/* Options List */}
                    <ScrollArea className="h-[200px]">
                        <div className={cn(compactPaddingClass(), "space-y-1")}>
                            {filteredOptions.length === 0 ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    Không tìm thấy
                                </div>
                            ) : (
                                filteredOptions.map((option) => {
                                    const isSelected = selectedValues.has(option.value)
                                    return (
                                        <div
                                            key={option.value}
                                            className={cn(
                                                "flex items-center space-x-2 rounded-md px-2 py-1.5 cursor-pointer hover:bg-accent",
                                                isSelected && "bg-accent"
                                            )}
                                            onClick={() => handleSelect(option.value)}
                                        >
                                            <Checkbox
                                                id={`filter-checkbox-${column?.id || 'unknown'}-${option.value}`}
                                                name={`filter-${column?.id || 'unknown'}-${option.value}`}
                                                checked={isSelected}
                                                className="pointer-events-none"
                                            />
                                            {option.icon && (
                                                <option.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                            )}
                                            <span className={cn("flex-1 truncate", bodyTextClass())}>{option.label}</span>
                                            {/* ⚡ Professional: Giữ nguyên faceted count khi filter */}
                                            {facets?.get(option.value) && (
                                                <span className={cn("text-muted-foreground tabular-nums shrink-0", smallTextClass())}>
                                                    {facets.get(option.value)}
                                                </span>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </ScrollArea>
                </div>
                {selectedValues.size > 0 && (
                    <div className={cn(compactPaddingClass(), "border-t")}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-8"
                            onClick={handleClear}
                        >
                            Xóa bộ lọc
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}

