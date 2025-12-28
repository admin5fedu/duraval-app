"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useNhomPhieuHanhChinh } from "../hooks/use-nhom-phieu-hanh-chinh"
import { Skeleton } from "@/components/ui/skeleton"

interface NhomPhieuHanhChinhSelectProps {
    value?: number | null // ID của nhóm phiếu hành chính được chọn
    onChange: (id: number | null) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    excludeIds?: number[] // Danh sách ID cần loại trừ
}

/**
 * Component chọn nhóm phiếu hành chính với ô search
 * Kiểu 1: Combobox với search theo tên và mã nhóm phiếu
 */
export function NhomPhieuHanhChinhSelect({
    value,
    onChange,
    placeholder = "Chọn nhóm phiếu hành chính...",
    searchPlaceholder = "Tìm kiếm theo tên hoặc mã nhóm phiếu...",
    emptyText = "Không tìm thấy nhóm phiếu hành chính.",
    disabled = false,
    className,
    excludeIds = [],
}: NhomPhieuHanhChinhSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Fetch danh sách nhóm phiếu hành chính
    const { data: nhomPhieuList, isLoading } = useNhomPhieuHanhChinh()
    
    const searchInputId = React.useId()

    // Filter danh sách nhóm phiếu: loại trừ các ID trong excludeIds
    const availableNhomPhieu = React.useMemo(() => {
        if (!nhomPhieuList) return []
        return nhomPhieuList.filter((np) => !excludeIds.includes(np.id!))
    }, [nhomPhieuList, excludeIds])

    // Tìm nhóm phiếu được chọn
    const selectedNhomPhieu = React.useMemo(() => {
        if (!value || !nhomPhieuList) return null
        return nhomPhieuList.find((np) => np.id === value)
    }, [value, nhomPhieuList])

    // Filter options dựa trên search query (tìm theo tên hoặc mã)
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) {
            return availableNhomPhieu
        }
        
        const query = searchQuery.toLowerCase()
        return availableNhomPhieu.filter((np) => {
            const maNhomPhieu = np.ma_nhom_phieu?.toLowerCase() || ""
            const tenNhomPhieu = np.ten_nhom_phieu?.toLowerCase() || ""
            return maNhomPhieu.includes(query) || tenNhomPhieu.includes(query)
        })
    }, [availableNhomPhieu, searchQuery])

    const handleSelect = (nhomPhieuId: number) => {
        onChange(nhomPhieuId)
        setOpen(false)
        setSearchQuery("")
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(null)
        setSearchQuery("")
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between",
                        !selectedNhomPhieu && "text-muted-foreground",
                        className
                    )}
                >
                    {selectedNhomPhieu ? (
                        <div className="flex items-center justify-between flex-1 min-w-0 mr-2">
                            <span className="truncate">
                                {selectedNhomPhieu.ma_nhom_phieu} - {selectedNhomPhieu.ten_nhom_phieu}
                            </span>
                            {!disabled && (
                                <X
                                    className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                                    onClick={handleClear}
                                />
                            )}
                        </div>
                    ) : (
                        <span>{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <div className="flex flex-col">
                    {/* Search input */}
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            id={searchInputId}
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 focus-ring-0 focus:ring-0 focus-visible:ring-0"
                            onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                    setOpen(false)
                                }
                            }}
                        />
                    </div>

                    {/* Options list */}
                    <div className="max-h-[300px] overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4">
                                <Skeleton className="h-8 w-full mb-2" />
                                <Skeleton className="h-8 w-full mb-2" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="p-4 text-sm text-muted-foreground text-center">
                                {emptyText}
                            </div>
                        ) : (
                            <div className="p-1">
                                {filteredOptions.map((np) => {
                                    const isSelected = value === np.id
                                    const displayLabel = `${np.ma_nhom_phieu} - ${np.ten_nhom_phieu}`
                                    
                                    return (
                                        <div
                                            key={np.id}
                                            className={cn(
                                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                isSelected && "bg-accent text-accent-foreground"
                                            )}
                                            onClick={() => handleSelect(np.id!)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <span className="flex-1 truncate">{displayLabel}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

