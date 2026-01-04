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
import { useTinhThanhSSNForReference } from "@/features/he-thong/khac/tinh-thanh-sau-sat-nhap/tinh-thanh-ssn/hooks"
import { Skeleton } from "@/components/ui/skeleton"

export interface TinhThanhSSNSelectProps {
    value?: number | null // ID của tỉnh thành được chọn
    onChange: (id: number | null, data?: { ma_tinh_thanh: string; ten_tinh_thanh: string }) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    id?: string // ID từ FormControl
    onBlur?: () => void // onBlur từ FormControl
}

/**
 * Component chọn tỉnh thành SSN với ô search
 * Reusable UI component - có thể dùng chung trong toàn bộ ứng dụng
 */
export const TinhThanhSSNSelect = React.forwardRef<HTMLButtonElement, TinhThanhSSNSelectProps>(
function TinhThanhSSNSelect({
    value,
    onChange,
    placeholder = "Chọn tỉnh thành...",
    searchPlaceholder = "Tìm kiếm theo tên hoặc mã tỉnh thành...",
    emptyText = "Không tìm thấy tỉnh thành.",
    disabled = false,
    className,
    id,
    onBlur,
}, ref) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Fetch danh sách tỉnh thành SSN (reference data - cached for 30 minutes)
    const { data: tinhThanhList, isLoading } = useTinhThanhSSNForReference()
    
    const searchInputId = React.useId()

    // Tìm tỉnh thành được chọn
    const selectedTinhThanh = React.useMemo(() => {
        if (!value || !tinhThanhList) return null
        return tinhThanhList.find((tt) => tt.id === value)
    }, [value, tinhThanhList])

    // Filter options dựa trên search query (tìm theo tên hoặc mã)
    const filteredOptions = React.useMemo(() => {
        if (!tinhThanhList) return []
        if (!searchQuery.trim()) {
            return tinhThanhList
        }
        const query = searchQuery.toLowerCase()
        return tinhThanhList.filter((tt) => {
            const maTinhThanh = tt.ma_tinh_thanh?.toLowerCase() || ""
            const tenTinhThanh = tt.ten_tinh_thanh?.toLowerCase() || ""
            return maTinhThanh.includes(query) || tenTinhThanh.includes(query)
        })
    }, [tinhThanhList, searchQuery])

    const handleSelect = React.useCallback((selectedId: number) => {
        if (disabled) return
        const selected = tinhThanhList?.find((tt) => tt.id === selectedId)
        if (selected) {
            onChange(selectedId, {
                ma_tinh_thanh: selected.ma_tinh_thanh,
                ten_tinh_thanh: selected.ten_tinh_thanh,
            })
        } else {
            onChange(selectedId)
        }
        setOpen(false)
        setSearchQuery("")
    }, [onChange, disabled, tinhThanhList])

    // Reset search khi popover đóng
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
        }
    }, [open])

    // Display text cho selected value
    const displayText = React.useMemo(() => {
        if (!selectedTinhThanh) return placeholder
        return `${selectedTinhThanh.ma_tinh_thanh} - ${selectedTinhThanh.ten_tinh_thanh}`
    }, [selectedTinhThanh, placeholder])

    if (isLoading) {
        return (
            <Skeleton className={cn("h-10 w-full", className)} />
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={ref}
                    id={id}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={searchInputId}
                    className={cn(
                        "w-full justify-between",
                        !selectedTinhThanh && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                    onBlur={onBlur}
                >
                    <span className="truncate">{displayText}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="flex flex-col">
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            id={searchInputId}
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 border-0 focus-visible:ring-0"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-[300px] overflow-auto p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                {emptyText}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredOptions.map((tt) => (
                                    <button
                                        key={tt.id}
                                        type="button"
                                        onClick={() => handleSelect(tt.id!)}
                                        className={cn(
                                            "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            "focus:bg-accent focus:text-accent-foreground",
                                            selectedTinhThanh?.id === tt.id && "bg-accent text-accent-foreground"
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 shrink-0",
                                                selectedTinhThanh?.id === tt.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="truncate">
                                            <span className="font-mono text-xs text-muted-foreground">{tt.ma_tinh_thanh}</span>
                                            <span className="mx-1.5 text-muted-foreground">-</span>
                                            <span className="font-medium">{tt.ten_tinh_thanh}</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
})

TinhThanhSSNSelect.displayName = "TinhThanhSSNSelect"

