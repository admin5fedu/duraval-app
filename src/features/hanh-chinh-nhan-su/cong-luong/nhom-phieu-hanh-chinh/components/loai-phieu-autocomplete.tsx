"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useQuery } from "@tanstack/react-query"
import { NhomPhieuHanhChinhAPI } from "../services/nhom-phieu-hanh-chinh.api"
import { nhomPhieuHanhChinhQueryKeys } from "@/lib/react-query/query-keys"
import { Skeleton } from "@/components/ui/skeleton"

interface LoaiPhieuAutocompleteProps {
    name?: string
    label?: string
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    description?: string
    disabled?: boolean
    className?: string
}

/**
 * Autocomplete component for loại phiếu with create new option
 */
export function LoaiPhieuAutocomplete({
    value,
    onChange,
    placeholder = "Chọn hoặc nhập loại phiếu...",
    description,
    disabled = false,
    className,
}: LoaiPhieuAutocompleteProps) {
    const searchPlaceholder = description || "Tìm kiếm hoặc nhập mới..."
    const emptyText = "Không tìm thấy. Nhấn Enter để thêm mới."
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Fetch unique loại phiếu values
    const { data: loaiPhieuList, isLoading } = useQuery({
        queryKey: [...nhomPhieuHanhChinhQueryKeys.all(), "loai-phieu"],
        queryFn: () => NhomPhieuHanhChinhAPI.getUniqueLoaiPhieu(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
    
    const searchInputId = React.useId()

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
        if (!loaiPhieuList) return []
        
        if (!searchQuery.trim()) {
            return loaiPhieuList
        }
        
        const query = searchQuery.toLowerCase()
        return loaiPhieuList.filter((loai) => 
            loai.toLowerCase().includes(query)
        )
    }, [loaiPhieuList, searchQuery])

    // Check if search query is a new value (not in existing list)
    const isNewValue = React.useMemo(() => {
        if (!searchQuery.trim()) return false
        if (!loaiPhieuList) return true
        return !loaiPhieuList.some(
            (loai) => loai.toLowerCase() === searchQuery.toLowerCase()
        )
    }, [searchQuery, loaiPhieuList])

    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue)
        setOpen(false)
        setSearchQuery("")
        // setIsCreating(false) // Removed: variable not defined
    }

    const handleCreateNew = () => {
        if (searchQuery.trim()) {
            handleSelect(searchQuery.trim())
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && isNewValue && searchQuery.trim()) {
            e.preventDefault()
            handleCreateNew()
        } else if (e.key === "Escape") {
            setOpen(false)
        }
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange("")
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
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    {value ? (
                        <div className="flex items-center justify-between flex-1 min-w-0 mr-2">
                            <span className="truncate">{value}</span>
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
                        <Input
                            id={searchInputId}
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="border-0 focus-ring-0 focus:ring-0 focus-visible:ring-0"
                            autoFocus
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
                        ) : (
                            <>
                                {/* Create new option */}
                                {isNewValue && searchQuery.trim() && (
                                    <div
                                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground bg-blue-50 border-b"
                                        onClick={handleCreateNew}
                                    >
                                        <Plus className="mr-2 h-4 w-4 text-blue-600" />
                                        <span className="flex-1 truncate">
                                            Thêm mới: <strong>{searchQuery}</strong>
                                        </span>
                                    </div>
                                )}

                                {/* Existing options */}
                                {filteredOptions.length === 0 && !isNewValue ? (
                                    <div className="p-4 text-sm text-muted-foreground text-center">
                                        {emptyText}
                                    </div>
                                ) : (
                                    <div className="p-1">
                                        {filteredOptions.map((loai) => {
                                            const isSelected = value === loai
                                            
                                            return (
                                                <div
                                                    key={loai}
                                                    className={cn(
                                                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                        isSelected && "bg-accent text-accent-foreground"
                                                    )}
                                                    onClick={() => handleSelect(loai)}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            isSelected ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <span className="flex-1 truncate">{loai}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

