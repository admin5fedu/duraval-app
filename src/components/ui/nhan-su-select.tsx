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
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks"
import { Skeleton } from "@/components/ui/skeleton"

export interface NhanSuSelectProps {
    value?: number | null // ma_nhan_vien của nhân viên được chọn
    onChange: (maNhanVien: number | null) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    excludeMaNhanVien?: number[] // Danh sách mã nhân viên cần loại trừ
}

/**
 * Component chọn nhân viên với ô search
 * Reusable UI component - có thể dùng chung trong toàn bộ ứng dụng
 */
export function NhanSuSelect({
    value,
    onChange,
    placeholder = "Chọn nhân viên...",
    searchPlaceholder = "Tìm kiếm theo tên hoặc mã nhân viên...",
    emptyText = "Không tìm thấy nhân viên.",
    disabled = false,
    className,
    excludeMaNhanVien = [],
}: NhanSuSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Fetch danh sách nhân viên
    const { data: nhanSuList, isLoading } = useNhanSu()
    
    const searchInputId = React.useId()

    // Filter danh sách nhân viên: loại trừ các mã nhân viên trong excludeMaNhanVien
    const availableNhanSu = React.useMemo(() => {
        if (!nhanSuList) return []
        return nhanSuList.filter((ns) => !excludeMaNhanVien.includes(ns.ma_nhan_vien))
    }, [nhanSuList, excludeMaNhanVien])

    // Tìm nhân viên được chọn
    const selectedNhanSu = React.useMemo(() => {
        if (!value || !nhanSuList) return null
        return nhanSuList.find((ns) => ns.ma_nhan_vien === value)
    }, [value, nhanSuList])

    // Filter options dựa trên search query (tìm theo tên hoặc mã)
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) {
            return availableNhanSu
        }
        
        const query = searchQuery.toLowerCase()
        return availableNhanSu.filter((ns) => {
            const maNhanVien = String(ns.ma_nhan_vien).toLowerCase()
            const hoTen = ns.ho_ten?.toLowerCase() || ""
            return maNhanVien.includes(query) || hoTen.includes(query)
        })
    }, [availableNhanSu, searchQuery])

    const handleSelect = React.useCallback((maNhanVien: number) => {
        if (disabled) return
        onChange(maNhanVien)
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
    const displayText = selectedNhanSu
        ? `${selectedNhanSu.ma_nhan_vien} - ${selectedNhanSu.ho_ten}`
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
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between font-normal",
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
                                
                                {/* Danh sách nhân viên */}
                                {filteredOptions.map((ns) => {
                                    const isSelected = value === ns.ma_nhan_vien
                                    const displayLabel = `${ns.ma_nhan_vien} - ${ns.ho_ten}`
                                    
                                    return (
                                        <div
                                            key={ns.ma_nhan_vien}
                                            className={cn(
                                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                isSelected && "bg-accent text-accent-foreground"
                                            )}
                                            onClick={() => handleSelect(ns.ma_nhan_vien)}
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
}

