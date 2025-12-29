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
import { useNhomDiemCongTru } from "../hooks/use-nhom-diem-cong-tru"
import { Skeleton } from "@/components/ui/skeleton"

interface NhomDiemCongTruSelectProps {
    value?: number | null // ID của nhóm điểm cộng trừ được chọn
    onChange: (id: number | null) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    excludeIds?: number[] // Danh sách ID cần loại trừ
}

/**
 * Component chọn nhóm điểm cộng trừ với ô search
 * Kiểu 1: Combobox với search theo hạng mục và nhóm
 */
export function NhomDiemCongTruSelect({
    value,
    onChange,
    placeholder = "Chọn nhóm điểm cộng trừ...",
    searchPlaceholder = "Tìm kiếm theo hạng mục hoặc nhóm...",
    emptyText = "Không tìm thấy nhóm điểm cộng trừ.",
    disabled = false,
    className,
    excludeIds = [],
}: NhomDiemCongTruSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Fetch danh sách nhóm điểm cộng trừ
    const { data: nhomDiemList, isLoading } = useNhomDiemCongTru()
    
    const searchInputId = React.useId()

    // Filter danh sách nhóm điểm: loại trừ các ID trong excludeIds
    const availableNhomDiem = React.useMemo(() => {
        if (!nhomDiemList) return []
        return nhomDiemList.filter((nd) => !excludeIds.includes(nd.id!))
    }, [nhomDiemList, excludeIds])

    // Tìm nhóm điểm được chọn
    const selectedNhomDiem = React.useMemo(() => {
        if (!value || !nhomDiemList) return null
        return nhomDiemList.find((nd) => nd.id === value)
    }, [value, nhomDiemList])

    // Filter options dựa trên search query (tìm theo hạng mục hoặc nhóm)
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) {
            return availableNhomDiem
        }
        
        const query = searchQuery.toLowerCase()
        return availableNhomDiem.filter((nd) => {
            const hangMuc = nd.hang_muc?.toLowerCase() || ""
            const nhom = nd.nhom?.toLowerCase() || ""
            return hangMuc.includes(query) || nhom.includes(query)
        })
    }, [availableNhomDiem, searchQuery])

    const handleSelect = (nhomDiemId: number) => {
        onChange(nhomDiemId)
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
                        !selectedNhomDiem && "text-muted-foreground",
                        className
                    )}
                >
                    {selectedNhomDiem ? (
                        <div className="flex items-center justify-between flex-1 min-w-0 mr-2">
                            <span className="truncate">
                                {selectedNhomDiem.hang_muc} - {selectedNhomDiem.nhom}
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
                                {filteredOptions.map((nd) => {
                                    const isSelected = value === nd.id
                                    
                                    return (
                                        <div
                                            key={nd.id}
                                            className={cn(
                                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                isSelected && "bg-accent text-accent-foreground"
                                            )}
                                            onClick={() => handleSelect(nd.id!)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium">{nd.hang_muc}</div>
                                                <div className="text-xs text-muted-foreground">Nhóm: {nd.nhom}</div>
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

