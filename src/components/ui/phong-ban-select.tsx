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
import { usePhongBan } from "@/features/he-thong/so-do/phong-ban/hooks"
import { Skeleton } from "@/components/ui/skeleton"

export interface PhongBanSelectProps {
    value?: number | null // ID của phòng ban được chọn
    onChange: (id: number | null) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    excludeIds?: number[] // Danh sách ID cần loại trừ (ví dụ: loại trừ chính nó khi edit)
    id?: string // ID từ FormControl
    onBlur?: () => void // onBlur từ FormControl
}

/**
 * Component chọn phòng ban với ô search
 * Reusable UI component - có thể dùng chung trong toàn bộ ứng dụng
 * Sử dụng forwardRef để FormControl có thể truyền id và các props khác
 */
export const PhongBanSelect = React.forwardRef<HTMLButtonElement, PhongBanSelectProps>(
function PhongBanSelect({
    value,
    onChange,
    placeholder = "Chọn phòng ban...",
    searchPlaceholder = "Tìm kiếm theo tên hoặc mã phòng ban...",
    emptyText = "Không tìm thấy phòng ban.",
    disabled = false,
    className,
    excludeIds = [],
    id,
    onBlur,
}, ref) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Fetch danh sách phòng ban
    const { data: phongBanList, isLoading } = usePhongBan()
    
    const searchInputId = React.useId()

    // Filter danh sách phòng ban: loại trừ các ID trong excludeIds
    const availablePhongBan = React.useMemo(() => {
        if (!phongBanList) return []
        return phongBanList.filter((pb) => !excludeIds.includes(pb.id!))
    }, [phongBanList, excludeIds])

    // Tìm phòng ban được chọn
    const selectedPhongBan = React.useMemo(() => {
        if (!value || !phongBanList) return null
        return phongBanList.find((pb) => pb.id === value)
    }, [value, phongBanList])

    // Filter options dựa trên search query (tìm theo tên hoặc mã)
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) {
            return availablePhongBan
        }
        const query = searchQuery.toLowerCase()
        return availablePhongBan.filter((pb) => {
            const maPhongBan = pb.ma_phong_ban?.toLowerCase() || ""
            const tenPhongBan = pb.ten_phong_ban?.toLowerCase() || ""
            return maPhongBan.includes(query) || tenPhongBan.includes(query)
        })
    }, [availablePhongBan, searchQuery])

    const handleSelect = React.useCallback((selectedId: number) => {
        if (disabled) return
        onChange(selectedId)
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
    const displayText = selectedPhongBan
        ? `${selectedPhongBan.ma_phong_ban} - ${selectedPhongBan.ten_phong_ban}`
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
                    ref={ref}
                    id={id}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    onBlur={onBlur}
                    className={cn(
                        "w-full justify-between",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <span className="truncate flex-1 text-left">{displayText}</span>
                    <div className="flex items-center gap-1 shrink-0">
                        {value && (
                            <span
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleClear()
                                }}
                                className="h-4 w-4 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive cursor-pointer"
                                title="Bỏ chọn"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleClear()
                                    }
                                }}
                            >
                                <span className="text-xs">×</span>
                            </span>
                        )}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="flex flex-col">
                    {/* Search Input */}
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
                        />
                    </div>

                    {/* Options List */}
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
                                
                                {/* Danh sách phòng ban */}
                                {filteredOptions.map((pb) => {
                                    const isSelected = value === pb.id
                                    const displayLabel = `${pb.ma_phong_ban} - ${pb.ten_phong_ban}`
                                    
                                    return (
                                        <div
                                            key={pb.id}
                                            onClick={() => handleSelect(pb.id!)}
                                            className={cn(
                                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                isSelected && "bg-accent text-accent-foreground"
                                            )}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4 shrink-0",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <span className="truncate">{displayLabel}</span>
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
})

PhongBanSelect.displayName = "PhongBanSelect"

