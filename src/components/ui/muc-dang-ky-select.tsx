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
import { useMucDangKy } from "@/features/ban-buon/thiet-lap-khach-buon/muc-dang-ky/hooks/use-muc-dang-ky"
import { Skeleton } from "@/components/ui/skeleton"

export interface MucDangKySelectProps {
    value?: number | null // ID của mức đăng ký được chọn
    onChange: (id: number | null, data?: { ten_hang: string; ma_hang?: string }) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    id?: string // ID từ FormControl
    onBlur?: () => void // onBlur từ FormControl
}

/**
 * Component chọn mức đăng ký từ bb_muc_dang_ky với ô search
 * Reusable UI component - có thể dùng chung trong toàn bộ ứng dụng
 */
export const MucDangKySelect = React.forwardRef<HTMLButtonElement, MucDangKySelectProps>(
function MucDangKySelect({
    value,
    onChange,
    placeholder = "Chọn mức đăng ký...",
    searchPlaceholder = "Tìm kiếm theo tên hoặc mã hạng...",
    emptyText = "Không tìm thấy mức đăng ký.",
    disabled = false,
    className,
    id,
    onBlur,
}, ref) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Fetch danh sách mức đăng ký
    const { data: mucDangKyList, isLoading } = useMucDangKy(undefined)
    
    const searchInputId = React.useId()

    // Tìm mức đăng ký được chọn
    const selectedMucDangKy = React.useMemo(() => {
        if (!value || !mucDangKyList) return null
        return mucDangKyList.find((mdk) => mdk.id === value)
    }, [value, mucDangKyList])

    // Filter options dựa trên search query (tìm theo tên hoặc mã)
    const filteredOptions = React.useMemo(() => {
        if (!mucDangKyList) return []
        if (!searchQuery.trim()) {
            return mucDangKyList
        }
        const query = searchQuery.toLowerCase()
        return mucDangKyList.filter((mdk) => {
            const maHang = mdk.ma_hang?.toLowerCase() || ""
            const tenHang = mdk.ten_hang?.toLowerCase() || ""
            return maHang.includes(query) || tenHang.includes(query)
        })
    }, [mucDangKyList, searchQuery])

    const handleSelect = React.useCallback((selectedId: number) => {
        if (disabled) return
        const selected = mucDangKyList?.find((mdk) => mdk.id === selectedId)
        if (selected) {
            onChange(selectedId, {
                ten_hang: selected.ten_hang,
                ma_hang: selected.ma_hang || undefined,
            })
        } else {
            onChange(selectedId)
        }
        setOpen(false)
        setSearchQuery("")
    }, [onChange, disabled, mucDangKyList])

    // Reset search khi popover đóng
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
        }
    }, [open])

    // Display text cho selected value
    const displayText = React.useMemo(() => {
        if (!selectedMucDangKy) return placeholder
        const parts: string[] = []
        if (selectedMucDangKy.ma_hang) parts.push(selectedMucDangKy.ma_hang)
        parts.push(selectedMucDangKy.ten_hang)
        return parts.join(" - ")
    }, [selectedMucDangKy, placeholder])

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
                            !selectedMucDangKy && "text-muted-foreground",
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
                                {filteredOptions.map((mdk) => (
                                    <button
                                        key={mdk.id}
                                        type="button"
                                        onClick={() => handleSelect(mdk.id!)}
                                        className={cn(
                                            "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            "focus:bg-accent focus:text-accent-foreground",
                                            selectedMucDangKy?.id === mdk.id && "bg-accent text-accent-foreground"
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 shrink-0",
                                                selectedMucDangKy?.id === mdk.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="truncate">
                                            {mdk.ma_hang && (
                                                <>
                                                    <span className="font-mono text-xs text-muted-foreground">{mdk.ma_hang}</span>
                                                    <span className="mx-1.5 text-muted-foreground">-</span>
                                                </>
                                            )}
                                            <span className="font-medium">{mdk.ten_hang}</span>
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

MucDangKySelect.displayName = "MucDangKySelect"

