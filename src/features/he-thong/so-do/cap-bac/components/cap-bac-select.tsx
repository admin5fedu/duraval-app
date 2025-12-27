"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useCapBac } from "../hooks/use-cap-bac"
import { Skeleton } from "@/components/ui/skeleton"

interface CapBacSelectProps {
    value?: number | null // ID của cấp bậc được chọn
    onChange: (id: number | null) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    excludeIds?: number[] // Danh sách ID cần loại trừ
}

/**
 * Component chọn cấp bậc với ô search
 * Kiểu 1: Combobox với search theo tên và mã cấp bậc
 */
export function CapBacSelect({
    value,
    onChange,
    placeholder = "Chọn cấp bậc...",
    searchPlaceholder = "Tìm kiếm theo tên hoặc mã cấp bậc...",
    emptyText = "Không tìm thấy cấp bậc.",
    disabled = false,
    className,
    excludeIds = [],
}: CapBacSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Fetch danh sách cấp bậc
    const { data: capBacList, isLoading } = useCapBac()
    
    const searchInputId = React.useId()

    // Filter danh sách cấp bậc: loại trừ các ID trong excludeIds
    const availableCapBac = React.useMemo(() => {
        if (!capBacList) return []
        return capBacList.filter((cb) => !excludeIds.includes(cb.id!))
    }, [capBacList, excludeIds])

    // Tìm cấp bậc được chọn
    const selectedCapBac = React.useMemo(() => {
        if (!value || !capBacList) return null
        return capBacList.find((cb) => cb.id === value)
    }, [value, capBacList])

    // Filter options dựa trên search query (tìm theo tên hoặc mã)
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) {
            return availableCapBac
        }
        
        const query = searchQuery.toLowerCase()
        return availableCapBac.filter((cb) => {
            const maCapBac = cb.ma_cap_bac?.toLowerCase() || ""
            const tenCapBac = cb.ten_cap_bac?.toLowerCase() || ""
            return maCapBac.includes(query) || tenCapBac.includes(query)
        })
    }, [availableCapBac, searchQuery])

    const handleSelect = (capBacId: number) => {
        onChange(capBacId)
        setOpen(false)
        setSearchQuery("")
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(null)
        setSearchQuery("")
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between",
                        !selectedCapBac && "text-muted-foreground",
                        className
                    )}
                >
                    {selectedCapBac ? (
                        <div className="flex items-center justify-between flex-1 min-w-0 mr-2">
                            <span className="truncate">
                                {selectedCapBac.ma_cap_bac} - {selectedCapBac.ten_cap_bac}
                                {selectedCapBac.bac ? ` (Bậc ${selectedCapBac.bac})` : ''}
                            </span>
                            {!disabled && (
                                <X
                                    className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                                    onClick={handleClear}
                                />
                            )}
                        </div>
                    ) : (
                        <span>{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <div className="flex flex-col">
                    {/* Search input */}
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            id={searchInputId}
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 focus-ring-0 focus:ring-0 focus-visible:ring-0"
                            onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                    setOpen(false)
                                }
                            }}
                        />
                    </div>

                    {/* Options list */}
                    <div className="max-h-[300px] overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4">
                                <Skeleton className="h-8 w-full mb-2" />
                                <Skeleton className="h-8 w-full mb-2" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="p-4 text-sm text-muted-foreground text-center">
                                {emptyText}
                            </div>
                        ) : (
                            <div className="p-1">
                                {filteredOptions.map((cb) => {
                                    const isSelected = value === cb.id
                                    const displayLabel = `${cb.ma_cap_bac} - ${cb.ten_cap_bac}${cb.bac ? ` (Bậc ${cb.bac})` : ''}`
                                    
                                    return (
                                        <div
                                            key={cb.id}
                                            className={cn(
                                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                isSelected && "bg-accent text-accent-foreground"
                                            )}
                                            onClick={() => handleSelect(cb.id!)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <span className="flex-1 truncate">{displayLabel}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

