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
import { useNhomApDoanhSo } from "@/features/he-thong/so-do/nhom-ap-doanh-so/hooks"
import { Skeleton } from "@/components/ui/skeleton"

export interface NhomApDoanhSoSelectProps {
    value?: number | null // id của nhóm áp doanh số được chọn
    onChange: (id: number | null) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    excludeIds?: number[] // Danh sách ID cần loại trừ
}

/**
 * Component chọn nhóm áp doanh số với ô search
 * Reusable UI component - có thể dùng chung trong toàn bộ ứng dụng
 */
export function NhomApDoanhSoSelect({
    value,
    onChange,
    placeholder = "Chọn nhóm áp doanh số...",
    searchPlaceholder = "Tìm kiếm theo mã hoặc tên nhóm áp...",
    emptyText = "Không tìm thấy nhóm áp doanh số.",
    disabled = false,
    className,
    excludeIds = [],
}: NhomApDoanhSoSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Fetch danh sách nhóm áp doanh số
    const { data: nhomApDoanhSoList, isLoading } = useNhomApDoanhSo()
    
    const searchInputId = React.useId()

    // Filter danh sách: loại trừ các ID trong excludeIds
    const availableList = React.useMemo(() => {
        if (!nhomApDoanhSoList) return []
        return nhomApDoanhSoList.filter((item) => !excludeIds.includes(item.id!))
    }, [nhomApDoanhSoList, excludeIds])

    // Tìm item được chọn
    const selectedItem = React.useMemo(() => {
        if (!value || !nhomApDoanhSoList) return null
        return nhomApDoanhSoList.find((item) => item.id === value)
    }, [value, nhomApDoanhSoList])

    // Filter options dựa trên search query (tìm theo mã hoặc tên)
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) {
            return availableList
        }
        
        const query = searchQuery.toLowerCase()
        return availableList.filter((item) => {
            const maNhomAp = item.ma_nhom_ap?.toLowerCase() || ""
            const tenNhomAp = item.ten_nhom_ap?.toLowerCase() || ""
            return maNhomAp.includes(query) || tenNhomAp.includes(query)
        })
    }, [availableList, searchQuery])

    const handleSelect = React.useCallback((id: number) => {
        if (disabled) return
        onChange(id)
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
    const displayText = selectedItem
        ? `${selectedItem.ma_nhom_ap} - ${selectedItem.ten_nhom_ap}`
        : placeholder

    if (isLoading) {
        return <Skeleton className="h-10 w-full" />
    }

    return (
        <Popover open={open && !disabled} onOpenChange={(isOpen) => !disabled && setOpen(isOpen)}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <span className="truncate flex-1 text-left">{displayText}</span>
                    <div className="flex items-center gap-1 shrink-0">
                        {value && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleClear()
                                }}
                                className="h-4 w-4 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive"
                                title="Bỏ chọn"
                            >
                                <span className="text-xs">×</span>
                            </button>
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
                                
                                {/* Danh sách nhóm áp doanh số */}
                                {filteredOptions.map((item) => {
                                    const isSelected = value === item.id
                                    const displayLabel = `${item.ma_nhom_ap} - ${item.ten_nhom_ap}`
                                    
                                    return (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                isSelected && "bg-accent text-accent-foreground"
                                            )}
                                            onClick={() => handleSelect(item.id!)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4 shrink-0",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="flex-1 truncate font-medium">{displayLabel}</span>
                                                {item.mo_ta && (
                                                    <span className="text-xs text-muted-foreground truncate">
                                                        {item.mo_ta}
                                                    </span>
                                                )}
                                            </div>
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
}

