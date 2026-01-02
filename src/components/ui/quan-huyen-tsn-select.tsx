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
import { useQuanHuyenTSN } from "@/features/he-thong/khac/tinh-thanh-truoc-sat-nhap/quan-huyen-tsn/hooks"
import { Skeleton } from "@/components/ui/skeleton"

export interface QuanHuyenTSNSelectProps {
    value?: number | null // ID của quận huyện được chọn
    onChange: (id: number | null, data?: { ma_quan_huyen: string; ten_quan_huyen: string; ma_tinh_thanh: string; ten_tinh_thanh: string; tinh_thanh_id?: number | null }) => void
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
    
    // Fetch danh sách quận huyện TSN
    const { data: quanHuyenList, isLoading } = useQuanHuyenTSN()
    
    const searchInputId = React.useId()

    // Tìm quận huyện được chọn
    const selectedQuanHuyen = React.useMemo(() => {
        if (!value || !quanHuyenList) return null
        return quanHuyenList.find((qh) => qh.id === value)
    }, [value, quanHuyenList])

    // Filter options dựa trên search query (tìm theo tên hoặc mã)
    const filteredOptions = React.useMemo(() => {
        if (!quanHuyenList) return []
        if (!searchQuery.trim()) {
            return quanHuyenList
        }
        const query = searchQuery.toLowerCase()
        return quanHuyenList.filter((qh) => {
            const maQuanHuyen = qh.ma_quan_huyen?.toLowerCase() || ""
            const tenQuanHuyen = qh.ten_quan_huyen?.toLowerCase() || ""
            return maQuanHuyen.includes(query) || tenQuanHuyen.includes(query)
        })
    }, [quanHuyenList, searchQuery])

    const handleSelect = React.useCallback((selectedId: number) => {
        if (disabled) return
        const selected = quanHuyenList?.find((qh) => qh.id === selectedId)
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
    }, [onChange, disabled, quanHuyenList])

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

    // Display text cho selected value
    const displayText = React.useMemo(() => {
        if (!selectedQuanHuyen) return placeholder
        return `${selectedQuanHuyen.ma_quan_huyen} - ${selectedQuanHuyen.ten_quan_huyen}`
    }, [selectedQuanHuyen, placeholder])

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
                        !selectedQuanHuyen && "text-muted-foreground",
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

