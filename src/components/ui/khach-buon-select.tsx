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
import { useDanhSachKB } from "@/features/ban-buon/thong-tin-khach-hang/du-lieu-khach-buon/danh-sach-KB/hooks/use-danh-sach-KB"
import { Skeleton } from "@/components/ui/skeleton"

export interface KhachBuonSelectProps {
    value?: number | null // ID của khách buôn được chọn
    onChange: (id: number | null, data?: { ten_khach_buon: string; ma_so?: string }) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    id?: string // ID từ FormControl
    onBlur?: () => void // onBlur từ FormControl
}

/**
 * Component chọn khách buôn từ bb_khach_buon với ô search
 * Reusable UI component - có thể dùng chung trong toàn bộ ứng dụng
 */
export const KhachBuonSelect = React.forwardRef<HTMLButtonElement, KhachBuonSelectProps>(
function KhachBuonSelect({
    value,
    onChange,
    placeholder = "Chọn khách buôn...",
    searchPlaceholder = "Tìm kiếm theo tên hoặc mã khách buôn...",
    emptyText = "Không tìm thấy khách buôn.",
    disabled = false,
    className,
    id,
    onBlur,
}, ref) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Fetch danh sách khách buôn
    const { data: khachBuonList, isLoading } = useDanhSachKB(undefined)
    
    const searchInputId = React.useId()

    // Tìm khách buôn được chọn
    const selectedKhachBuon = React.useMemo(() => {
        if (!value || !khachBuonList) return null
        return khachBuonList.find((kb) => kb.id === value)
    }, [value, khachBuonList])

    // Filter options dựa trên search query (tìm theo tên hoặc mã)
    const filteredOptions = React.useMemo(() => {
        if (!khachBuonList) return []
        if (!searchQuery.trim()) {
            return khachBuonList
        }
        const query = searchQuery.toLowerCase()
        return khachBuonList.filter((kb) => {
            const maSo = kb.ma_so?.toLowerCase() || ""
            const tenKhachBuon = kb.ten_khach_buon?.toLowerCase() || ""
            return maSo.includes(query) || tenKhachBuon.includes(query)
        })
    }, [khachBuonList, searchQuery])

    const handleSelect = React.useCallback((selectedId: number) => {
        if (disabled) return
        const selected = khachBuonList?.find((kb) => kb.id === selectedId)
        if (selected) {
            onChange(selectedId, {
                ten_khach_buon: selected.ten_khach_buon,
                ma_so: selected.ma_so || undefined,
            })
        } else {
            onChange(selectedId)
        }
        setOpen(false)
        setSearchQuery("")
    }, [onChange, disabled, khachBuonList])

    // Reset search khi popover đóng
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
        }
    }, [open])

    // Display text cho selected value
    const displayText = React.useMemo(() => {
        if (!selectedKhachBuon) return placeholder
        const parts: string[] = []
        if (selectedKhachBuon.ma_so) parts.push(selectedKhachBuon.ma_so)
        parts.push(selectedKhachBuon.ten_khach_buon)
        return parts.join(" - ")
    }, [selectedKhachBuon, placeholder])

    if (isLoading) {
        return (
            <Skeleton className={cn("h-10 w-full", className)} />
        )
    }

    return (
        <>
            {/* Hidden input để label có thể trỏ đến (FormControl inject id vào Popover, nhưng label cần input) */}
            <input
                type="hidden"
                id={id}
                value={value || ""}
                aria-hidden="true"
                tabIndex={-1}
                readOnly
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        ref={ref}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-controls={searchInputId}
                        className={cn(
                            "w-full justify-between",
                            !selectedKhachBuon && "text-muted-foreground",
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
                                {filteredOptions.map((kb) => (
                                    <button
                                        key={kb.id}
                                        type="button"
                                        onClick={() => handleSelect(kb.id!)}
                                        className={cn(
                                            "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            "focus:bg-accent focus:text-accent-foreground",
                                            selectedKhachBuon?.id === kb.id && "bg-accent text-accent-foreground"
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 shrink-0",
                                                selectedKhachBuon?.id === kb.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="truncate">
                                            {kb.ma_so && (
                                                <>
                                                    <span className="font-mono text-xs text-muted-foreground">{kb.ma_so}</span>
                                                    <span className="mx-1.5 text-muted-foreground">-</span>
                                                </>
                                            )}
                                            <span className="font-medium">{kb.ten_khach_buon}</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
        </>
    )
})

KhachBuonSelect.displayName = "KhachBuonSelect"

