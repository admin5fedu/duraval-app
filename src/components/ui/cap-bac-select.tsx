"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useCapBac } from "@/features/he-thong/so-do/cap-bac/hooks"
import { Skeleton } from "@/components/ui/skeleton"

export interface CapBacSelectProps {
    value?: number | null // ID của cấp bậc được chọn
    onChange: (id: number | null) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    excludeIds?: number[] // Danh sách ID cần loại trừ
    id?: string // ID từ FormControl
    name?: string // Name từ FormControl
    onBlur?: () => void // onBlur từ FormControl
}

/**
 * Component chọn cấp bậc với ô search
 * Reusable UI component - có thể dùng chung trong toàn bộ ứng dụng
 * Sử dụng forwardRef để FormControl có thể truyền id và các props khác
 */
export const CapBacSelect = React.forwardRef<HTMLButtonElement, CapBacSelectProps>(
function CapBacSelect({
    value,
    onChange,
    placeholder = "Chọn cấp bậc...",
    searchPlaceholder = "Tìm kiếm theo tên hoặc mã cấp bậc...",
    emptyText = "Không tìm thấy cấp bậc.",
    disabled = false,
    className,
    excludeIds = [],
    id,
    name,
    onBlur,
}, ref) {
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

    const handleSelect = React.useCallback((capBacId: number) => {
        if (disabled) return
        onChange(capBacId)
        setOpen(false)
        setSearchQuery("")
    }, [onChange, disabled])

    const handleClear = React.useCallback(() => {
        if (disabled) return
        onChange(null)
        setSearchQuery("")
    }, [onChange, disabled])

    // Reset search khi popover đóng
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
        }
    }, [open])

    // Display text cho selected value
    const displayText = selectedCapBac
        ? `${selectedCapBac.ma_cap_bac} - ${selectedCapBac.ten_cap_bac}${selectedCapBac.bac ? ` (Bậc ${selectedCapBac.bac})` : ''}`
        : placeholder

    if (isLoading) {
        return (
            <div className={cn("w-full", className)}>
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    return (
        <Popover open={open && !disabled} onOpenChange={(isOpen) => !disabled && setOpen(isOpen)}>
            <PopoverTrigger asChild>
                <Button
                    ref={ref}
                    id={id}
                    name={name}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    onBlur={onBlur}
                    className={cn(
                        "w-full justify-between",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <span className="truncate flex-1 text-left">{displayText}</span>
                    <div className="flex items-center gap-1 shrink-0">
                        {value && (
                            <span
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleClear()
                                }}
                                className="h-4 w-4 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer"
                                title="Bỏ chọn"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleClear()
                                    }
                                }}
                            >
                                <span className="text-xs">×</span>
                            </span>
                        )}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="flex flex-col">
                    {/* Search input */}
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            id={searchInputId}
                            type="search"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                    setOpen(false)
                                }
                            }}
                        />
                    </div>

                    {/* Options list */}
                    <div className="max-h-[300px] overflow-y-auto p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                {emptyText}
                            </div>
                        ) : (
                            <>
                                {/* Option để clear selection */}
                                {value && (
                                    <div
                                        onClick={handleClear}
                                        className={cn(
                                            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                                        )}
                                    >
                                        <span className="mr-2">×</span>
                                        Bỏ chọn
                                    </div>
                                )}
                                
                                {/* Danh sách cấp bậc */}
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
                                                    "mr-2 h-4 w-4 shrink-0",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <span className="flex-1 truncate">{displayLabel}</span>
                                        </div>
                                    )
                                })}
                            </>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
})

CapBacSelect.displayName = "CapBacSelect"

