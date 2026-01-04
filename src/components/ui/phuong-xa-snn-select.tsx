"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { usePhuongXaSNNSearch, usePhuongXaSNNByTinhThanhId } from "@/features/he-thong/khac/tinh-thanh-sau-sat-nhap/phuong-xa-snn/hooks"
import { useDebounce } from "@/shared/hooks/useDebounce"
// import { Skeleton } from "@/components/ui/skeleton" // Not used

export interface PhuongXaSNNSelectProps {
    value?: number | null // ID của phường xã được chọn
    onChange: (id: number | null, data?: { ma_phuong_xa: string; ten_phuong_xa: string; ma_tinh_thanh: string; ten_tinh_thanh: string; tinh_thanh_id?: number | null }) => void
    tinhThanhId?: number | null // ID của tỉnh thành để filter phường xã
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    id?: string // ID từ FormControl
    onBlur?: () => void // onBlur từ FormControl
}

/**
 * Component chọn phường xã SSN với ô search
 * Phụ thuộc vào tinhThanhId để filter danh sách
 */
export const PhuongXaSNNSelect = React.forwardRef<HTMLButtonElement, PhuongXaSNNSelectProps>(
function PhuongXaSNNSelect({
    value,
    onChange,
    tinhThanhId,
    placeholder = "Chọn phường xã...",
    searchPlaceholder = "Tìm kiếm theo tên hoặc mã phường xã...",
    emptyText = "Không tìm thấy phường xã.",
    disabled = false,
    className,
    id,
    onBlur,
}, ref) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Debounce search query để tránh gọi API quá nhiều
    const debouncedSearchQuery = useDebounce(searchQuery, 300)
    
    const searchInputId = React.useId()

    // Load tất cả phường xã theo tỉnh thành khi có tinhThanhId
    const { data: allPhuongXaByTinhThanh, isLoading: isLoadingAll } = usePhuongXaSNNByTinhThanhId(
        tinhThanhId || undefined
    )

    // Async search - chỉ load khi có search query và tinhThanhId
    // Filter được thực hiện ở server-side (API) để đảm bảo cascade dependency
    const { data: searchResult, isLoading: isSearching } = usePhuongXaSNNSearch(
        debouncedSearchQuery,
        1,
        50,
        open && debouncedSearchQuery.trim().length > 0 && !!tinhThanhId,
        tinhThanhId || undefined
    )

    // Options từ search result (khi có search query) hoặc từ allPhuongXaByTinhThanh (khi không có search)
    const allOptions = React.useMemo(() => {
        if (debouncedSearchQuery.trim() && searchResult?.data) {
            // Khi có search query, dùng kết quả search
            return searchResult.data
        } else if (allPhuongXaByTinhThanh) {
            // Khi không có search query, dùng tất cả phường xã của tỉnh thành
            return allPhuongXaByTinhThanh
        }
        return []
    }, [debouncedSearchQuery, searchResult?.data, allPhuongXaByTinhThanh])

    // Filter options dựa trên search query (client-side filter khi đã có allOptions)
    const filteredOptions = React.useMemo(() => {
        if (!debouncedSearchQuery.trim()) {
            // Không có search query, hiển thị tất cả
            return allOptions
        }
        // Có search query, filter client-side từ allOptions
        const query = debouncedSearchQuery.toLowerCase()
        return allOptions.filter((px) => {
            const maPhuongXa = px.ma_phuong_xa?.toLowerCase() || ""
            const tenPhuongXa = px.ten_phuong_xa?.toLowerCase() || ""
            return maPhuongXa.includes(query) || tenPhuongXa.includes(query)
        })
    }, [allOptions, debouncedSearchQuery])

    // Tìm phường xã được chọn
    const selectedPhuongXa = React.useMemo(() => {
        if (value === null || value === undefined) return null
        let valueId: number | null = null
        if (typeof value === 'number') {
            valueId = value
        } else if (typeof value === 'object' && value !== null && 'id' in value) {
            valueId = typeof (value as any).id === 'number' ? (value as any).id : null
        }
        if (valueId === null || typeof valueId !== 'number') return null
        // Tìm trong filteredOptions
        const found = filteredOptions.find((px) => px.id === valueId)
        if (found) return found
        // Nếu không tìm thấy trong filteredOptions, có thể đã bị filter ra, nhưng vẫn cần hiển thị
        // Tìm trong allOptions
        const foundInAll = allOptions.find((px) => px.id === valueId)
        return foundInAll || null
    }, [value, filteredOptions, allOptions])

    const handleSelect = React.useCallback((selectedId: number) => {
        if (disabled) return
        const selected = allOptions.find((px) => px.id === selectedId)
        if (selected) {
            onChange(selectedId, {
                ma_phuong_xa: selected.ma_phuong_xa,
                ten_phuong_xa: selected.ten_phuong_xa,
                ma_tinh_thanh: selected.ma_tinh_thanh || "",
                ten_tinh_thanh: selected.ten_tinh_thanh || "",
                tinh_thanh_id: (selected.tinh_thanh_id && typeof selected.tinh_thanh_id === 'number') ? selected.tinh_thanh_id : null,
            })
        } else {
            onChange(selectedId, undefined)
        }
        setOpen(false)
        setSearchQuery("")
    }, [onChange, disabled, allOptions])

    // Reset search khi popover đóng
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
        }
    }, [open])

    // Reset value khi tinhThanhId thay đổi (cascade dependency)
    React.useEffect(() => {
        if (tinhThanhId && typeof value === 'number' && selectedPhuongXa && selectedPhuongXa.tinh_thanh_id !== tinhThanhId) {
            onChange(null)
        } else if (!tinhThanhId && typeof value === 'number') {
            // Reset khi tinhThanhId bị xóa
            onChange(null)
        }
    }, [tinhThanhId, value, selectedPhuongXa, onChange])

    // Display text cho selected value
    const displayText = React.useMemo(() => {
        if (!selectedPhuongXa) return placeholder
        return `${selectedPhuongXa.ma_phuong_xa} - ${selectedPhuongXa.ten_phuong_xa}`
    }, [selectedPhuongXa, placeholder])

    // Loading state
    const isLoading = isLoadingAll || (isSearching && debouncedSearchQuery.trim().length > 0)

    // Nếu không có tinhThanhId, disable select
    const isDisabled = disabled || !tinhThanhId

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
                        !selectedPhuongXa && "text-muted-foreground",
                        className
                    )}
                    disabled={isDisabled}
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
                        {!tinhThanhId ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Vui lòng chọn tỉnh thành trước
                            </div>
                        ) : isLoading ? (
                            <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Đang tải...
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                {debouncedSearchQuery.trim() ? emptyText : "Không có phường xã nào"}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredOptions.map((px) => (
                                    <button
                                        key={px.id}
                                        type="button"
                                        onClick={() => handleSelect(px.id!)}
                                        className={cn(
                                            "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            "focus:bg-accent focus:text-accent-foreground",
                                            selectedPhuongXa?.id === px.id && "bg-accent text-accent-foreground"
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 shrink-0",
                                                selectedPhuongXa?.id === px.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="truncate">
                                            <span className="font-mono text-xs text-muted-foreground">{px.ma_phuong_xa}</span>
                                            <span className="mx-1.5 text-muted-foreground">-</span>
                                            <span className="font-medium">{px.ten_phuong_xa}</span>
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

PhuongXaSNNSelect.displayName = "PhuongXaSNNSelect"

