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
import { usePhuongXaTSNSearch, usePhuongXaTSNByQuanHuyenId } from "@/features/he-thong/khac/tinh-thanh-truoc-sat-nhap/phuong-xa-tsn/hooks"
import { useDebounce } from "@/shared/hooks/useDebounce"
// import { Skeleton } from "@/components/ui/skeleton" // Not used

export interface PhuongXaTSNSelectProps {
    value?: number | null // ID của phường xã được chọn
    onChange: (id: number | null, data?: { ma_phuong_xa: string; ten_phuong_xa: string; ma_quan_huyen: string; ten_quan_huyen: string; quan_huyen_id?: number | null }) => void
    quanHuyenId?: number | null // ID của quận huyện để filter phường xã
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    id?: string // ID từ FormControl
    onBlur?: () => void // onBlur từ FormControl
}

/**
 * Component chọn phường xã TSN với ô search
 * Phụ thuộc vào quanHuyenId để filter danh sách
 */
export const PhuongXaTSNSelect = React.forwardRef<HTMLButtonElement, PhuongXaTSNSelectProps>(
function PhuongXaTSNSelect({
    value,
    onChange,
    quanHuyenId,
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

    // Load tất cả phường xã theo quận huyện khi có quanHuyenId
    const { data: allPhuongXaByQuanHuyen, isLoading: isLoadingAll } = usePhuongXaTSNByQuanHuyenId(
        quanHuyenId || undefined
    )

    // Async search - chỉ load khi có search query và quanHuyenId
    // Filter được thực hiện ở server-side (API) để đảm bảo cascade dependency
    const { data: searchResult, isLoading: isSearching } = usePhuongXaTSNSearch(
        debouncedSearchQuery,
        1,
        50,
        open && debouncedSearchQuery.trim().length > 0 && !!quanHuyenId,
        quanHuyenId || undefined
    )

    // Options từ search result (khi có search query) hoặc từ allPhuongXaByQuanHuyen (khi không có search)
    const allOptions = React.useMemo(() => {
        if (debouncedSearchQuery.trim() && searchResult?.data) {
            // Khi có search query, dùng kết quả search
            return searchResult.data
        } else if (allPhuongXaByQuanHuyen) {
            // Khi không có search query, dùng tất cả phường xã của quận huyện
            return allPhuongXaByQuanHuyen
        }
        return []
    }, [debouncedSearchQuery, searchResult?.data, allPhuongXaByQuanHuyen])

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
        if (!value) return null
        // Tìm trong filteredOptions
        const found = filteredOptions.find((px) => px.id === value)
        if (found) return found
        // Nếu không tìm thấy trong filteredOptions, có thể đã bị filter ra, nhưng vẫn cần hiển thị
        // Tìm trong allOptions
        const foundInAll = allOptions.find((px) => px.id === value)
        return foundInAll || null
    }, [value, filteredOptions, allOptions])

    const handleSelect = React.useCallback((selectedId: number) => {
        if (disabled) return
        const selected = allOptions.find((px) => px.id === selectedId)
        if (selected) {
            onChange(selectedId, {
                ma_phuong_xa: selected.ma_phuong_xa,
                ten_phuong_xa: selected.ten_phuong_xa,
                ma_quan_huyen: selected.ma_quan_huyen || "",
                ten_quan_huyen: selected.ten_quan_huyen || "",
                quan_huyen_id: selected.quan_huyen_id || null,
            })
        } else {
            onChange(selectedId)
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

    // Reset value khi quanHuyenId thay đổi (cascade dependency)
    React.useEffect(() => {
        if (quanHuyenId && value && selectedPhuongXa && selectedPhuongXa.quan_huyen_id !== quanHuyenId) {
            onChange(null)
        } else if (!quanHuyenId && value) {
            // Reset khi quanHuyenId bị xóa
            onChange(null)
        }
    }, [quanHuyenId, value, selectedPhuongXa, onChange])

    // Display text cho selected value
    const displayText = React.useMemo(() => {
        if (!selectedPhuongXa) return placeholder
        return `${selectedPhuongXa.ma_phuong_xa} - ${selectedPhuongXa.ten_phuong_xa}`
    }, [selectedPhuongXa, placeholder])

    // Loading state
    const isLoading = isLoadingAll || (isSearching && debouncedSearchQuery.trim().length > 0)

    // Nếu không có quanHuyenId, disable select
    const isDisabled = disabled || !quanHuyenId

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
                        {!quanHuyenId ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Vui lòng chọn quận huyện trước
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

PhuongXaTSNSelect.displayName = "PhuongXaTSNSelect"

