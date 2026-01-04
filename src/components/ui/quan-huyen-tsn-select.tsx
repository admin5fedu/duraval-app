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
import { useQuanHuyenTSNSearch, useQuanHuyenTSNByTinhThanhId } from "@/features/he-thong/khac/tinh-thanh-truoc-sat-nhap/quan-huyen-tsn/hooks"
import { useDebounce } from "@/shared/hooks/useDebounce"
// import { Skeleton } from "@/components/ui/skeleton" // Not used

export interface QuanHuyenTSNSelectProps {
    value?: number | null // ID của quận huyện được chọn
    onChange: (id: number | null, data?: { ma_quan_huyen: string; ten_quan_huyen: string; ma_tinh_thanh: string; ten_tinh_thanh: string; tinh_thanh_id?: number | null }) => void
    tinhThanhId?: number | null // ID của tỉnh thành để filter quận huyện
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    id?: string // ID từ FormControl
    onBlur?: () => void // onBlur từ FormControl
}

/**
 * Component chọn quận huyện TSN với ô search
 * Reusable UI component - có thể dùng chung trong toàn bộ ứng dụng
 */
export const QuanHuyenTSNSelect = React.forwardRef<HTMLButtonElement, QuanHuyenTSNSelectProps>(
function QuanHuyenTSNSelect({
    value,
    onChange,
    tinhThanhId,
    placeholder = "Chọn quận huyện...",
    searchPlaceholder = "Tìm kiếm theo tên hoặc mã quận huyện...",
    emptyText = "Không tìm thấy quận huyện.",
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

    // Load tất cả quận huyện theo tỉnh thành khi có tinhThanhId
    const { data: allQuanHuyenByTinhThanh, isLoading: isLoadingAll } = useQuanHuyenTSNByTinhThanhId(
        tinhThanhId || undefined
    )

    // Async search - chỉ load khi có search query và tinhThanhId
    // Filter được thực hiện ở server-side (API) để đảm bảo cascade dependency
    const { data: searchResult, isLoading: isSearching } = useQuanHuyenTSNSearch(
        debouncedSearchQuery,
        1,
        50,
        open && debouncedSearchQuery.trim().length > 0 && !!tinhThanhId,
        tinhThanhId || undefined
    )

    // Options từ search result (khi có search query) hoặc từ allQuanHuyenByTinhThanh (khi không có search)
    const allOptions = React.useMemo(() => {
        if (debouncedSearchQuery.trim() && searchResult?.data) {
            // Khi có search query, dùng kết quả search
            return searchResult.data
        } else if (allQuanHuyenByTinhThanh) {
            // Khi không có search query, dùng tất cả quận huyện của tỉnh thành
            return allQuanHuyenByTinhThanh
        }
        return []
    }, [debouncedSearchQuery, searchResult?.data, allQuanHuyenByTinhThanh])

    // Filter options dựa trên search query (client-side filter khi đã có allOptions)
    const filteredOptions = React.useMemo(() => {
        if (!debouncedSearchQuery.trim()) {
            // Không có search query, hiển thị tất cả
            return allOptions
        }
        // Có search query, filter client-side từ allOptions
        const query = debouncedSearchQuery.toLowerCase()
        return allOptions.filter((qh) => {
            const maQuanHuyen = qh.ma_quan_huyen?.toLowerCase() || ""
            const tenQuanHuyen = qh.ten_quan_huyen?.toLowerCase() || ""
            return maQuanHuyen.includes(query) || tenQuanHuyen.includes(query)
        })
    }, [allOptions, debouncedSearchQuery])

    // Tìm quận huyện được chọn
    const selectedQuanHuyen = React.useMemo(() => {
        if (!value) return null
        // Tìm trong filteredOptions
        const found = filteredOptions.find((qh) => qh.id === value)
        if (found) return found
        // Nếu không tìm thấy trong filteredOptions, có thể đã bị filter ra, nhưng vẫn cần hiển thị
        // Tìm trong allOptions
        const foundInAll = allOptions.find((qh) => qh.id === value)
        return foundInAll || null
    }, [value, filteredOptions, allOptions])

    const handleSelect = React.useCallback((selectedId: number) => {
        if (disabled) return
        const selected = allOptions.find((qh) => qh.id === selectedId)
        if (selected) {
            onChange(selectedId, {
                ma_quan_huyen: selected.ma_quan_huyen,
                ten_quan_huyen: selected.ten_quan_huyen,
                ma_tinh_thanh: selected.ma_tinh_thanh || "",
                ten_tinh_thanh: selected.ten_tinh_thanh || "",
                tinh_thanh_id: selected.tinh_thanh_id || null,
            })
        } else {
            onChange(selectedId)
        }
        setOpen(false)
        setSearchQuery("")
    }, [onChange, disabled, allOptions])

    // handleClear is available for future use
    // const handleClear = React.useCallback(() => {
    //     if (disabled) return
    //     onChange(null)
    //     setSearchQuery("")
    // }, [onChange, disabled])

    // Reset search khi popover đóng
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
        }
    }, [open])

    // Reset value khi tinhThanhId thay đổi (cascade dependency)
    React.useEffect(() => {
        if (tinhThanhId && value && selectedQuanHuyen && selectedQuanHuyen.tinh_thanh_id !== tinhThanhId) {
            onChange(null)
        } else if (!tinhThanhId && value) {
            // Reset khi tinhThanhId bị xóa
            onChange(null)
        }
    }, [tinhThanhId, value, selectedQuanHuyen, onChange])

    // Display text cho selected value
    const displayText = React.useMemo(() => {
        if (!selectedQuanHuyen) return placeholder
        return `${selectedQuanHuyen.ma_quan_huyen} - ${selectedQuanHuyen.ten_quan_huyen}`
    }, [selectedQuanHuyen, placeholder])

    // Loading state
    const isLoading = isLoadingAll || (isSearching && debouncedSearchQuery.trim().length > 0)

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
                        !selectedQuanHuyen && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled || !tinhThanhId}
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
                                {debouncedSearchQuery.trim() ? emptyText : "Không có quận huyện nào"}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredOptions.map((qh) => (
                                    <button
                                        key={qh.id}
                                        type="button"
                                        onClick={() => handleSelect(qh.id!)}
                                        className={cn(
                                            "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            "focus:bg-accent focus:text-accent-foreground",
                                            selectedQuanHuyen?.id === qh.id && "bg-accent text-accent-foreground"
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 shrink-0",
                                                selectedQuanHuyen?.id === qh.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="truncate">
                                            <span className="font-mono text-xs text-muted-foreground">{qh.ma_quan_huyen}</span>
                                            <span className="mx-1.5 text-muted-foreground">-</span>
                                            <span className="font-medium">{qh.ten_quan_huyen}</span>
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

QuanHuyenTSNSelect.displayName = "QuanHuyenTSNSelect"

