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
import { useNhomLuong } from "../hooks/use-nhom-luong"
import { Skeleton } from "@/components/ui/skeleton"

interface NhomLuongSelectProps {
    value?: number | null // ID của nhóm lương được chọn
    onChange: (id: number | null) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    excludeIds?: number[] // Danh sách ID cần loại trừ
}

/**
 * Component chọn nhóm lương với ô search
 * Kiểu 1: Combobox với search theo tên nhóm
 */
export function NhomLuongSelect({
    value,
    onChange,
    placeholder = "Chọn nhóm lương...",
    searchPlaceholder = "Tìm kiếm theo tên nhóm...",
    emptyText = "Không tìm thấy nhóm lương.",
    disabled = false,
    className,
    excludeIds = [],
}: NhomLuongSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Fetch danh sách nhóm lương
    const { data: nhomLuongList, isLoading } = useNhomLuong()
    
    const searchInputId = React.useId()

    // Filter danh sách nhóm lương: loại trừ các ID trong excludeIds
    const availableNhomLuong = React.useMemo(() => {
        if (!nhomLuongList) return []
        return nhomLuongList.filter((nl) => !excludeIds.includes(nl.id!))
    }, [nhomLuongList, excludeIds])

    // Tìm nhóm lương được chọn
    const selectedNhomLuong = React.useMemo(() => {
        if (!value || !nhomLuongList) return null
        return nhomLuongList.find((nl) => nl.id === value)
    }, [value, nhomLuongList])

    // Filter options dựa trên search query (tìm theo tên nhóm)
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) {
            return availableNhomLuong
        }
        
        const query = searchQuery.toLowerCase()
        return availableNhomLuong.filter((nl) => {
            const tenNhom = nl.ten_nhom?.toLowerCase() || ""
            const moTa = nl.mo_ta?.toLowerCase() || ""
            return tenNhom.includes(query) || moTa.includes(query)
        })
    }, [availableNhomLuong, searchQuery])

    const handleSelect = (nhomLuongId: number) => {
        onChange(nhomLuongId)
        setOpen(false)
        setSearchQuery("")
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(null)
        setSearchQuery("")
    }

    // Reset search when popover closes
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
        }
    }, [open])

    if (isLoading) {
        return (
            <Skeleton className={cn("h-10 w-full", className)} />
        )
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
                        !selectedNhomLuong && "text-muted-foreground",
                        className
                    )}
                >
                    {selectedNhomLuong ? (
                        <div className="flex items-center justify-between flex-1 min-w-0 mr-2">
                            <span className="truncate">
                                {selectedNhomLuong.ten_nhom}
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
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-sm text-muted-foreground text-center">
                                {emptyText}
                            </div>
                        ) : (
                            <div className="p-1">
                                {filteredOptions.map((nl) => {
                                    const isSelected = value === nl.id
                                    
                                    return (
                                        <div
                                            key={nl.id}
                                            className={cn(
                                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                isSelected && "bg-accent text-accent-foreground"
                                            )}
                                            onClick={() => handleSelect(nl.id!)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium">{nl.ten_nhom}</div>
                                                {nl.mo_ta && (
                                                    <div className="text-xs text-muted-foreground truncate">{nl.mo_ta}</div>
                                                )}
                                            </div>
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

