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
import { HangMucAPI } from "@/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/hang-muc/services/hang-muc.api"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"

export interface HangMucSelectFormFieldProps {
    loaiPhieuId?: number | null
    value?: number | null
    onChange: (id: number | null) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    id?: string
    name?: string
    onBlur?: () => void
    [key: string]: any
}

/**
 * Component chọn hạng mục với dependency từ loai_phieu_id
 */
export const HangMucSelectFormField = React.forwardRef<HTMLButtonElement, HangMucSelectFormFieldProps>(
function HangMucSelectFormField({
    loaiPhieuId,
    value,
    onChange,
    placeholder = "Chọn hạng mục...",
    searchPlaceholder = "Tìm kiếm theo tên hạng mục...",
    emptyText = "Không tìm thấy hạng mục.",
    disabled = false,
    className,
    id,
    name,
    onBlur,
}, ref) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Fetch danh sách hạng mục theo loai_phieu_id
    const { data: hangMucList, isLoading } = useQuery({
        queryKey: ["hang-muc-by-loai-phieu", loaiPhieuId],
        queryFn: async () => {
            if (!loaiPhieuId) return []
            return await HangMucAPI.getByLoaiPhieuId(loaiPhieuId)
        },
        enabled: !!loaiPhieuId,
    })

    // Filter và sort options
    const options = React.useMemo(() => {
        if (!hangMucList) return []
        
        return hangMucList
            .map((item) => ({
                id: item.id!,
                label: item.ten_hang_muc || `ID: ${item.id}`,
                value: String(item.id),
            }))
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [hangMucList])

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) {
            return options
        }
        const query = searchQuery.toLowerCase()
        return options.filter((option) => {
            const searchText = `${option.value} ${option.label}`.toLowerCase()
            return searchText.includes(query)
        })
    }, [options, searchQuery])

    const selectedOption = options.find((option) => option.id === value)

    const handleSelect = React.useCallback((selectedId: number) => {
        if (disabled) return
        onChange(selectedId)
        setOpen(false)
        setSearchQuery("")
    }, [onChange, disabled])

    // Reset search when popover closes
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
        }
    }, [open])

    // Clear value when loai_phieu_id changes
    React.useEffect(() => {
        if (!loaiPhieuId) {
            onChange(null)
        }
    }, [loaiPhieuId, onChange])

    if (isLoading) {
        return <Skeleton className="h-10 w-full" />
    }

    if (!loaiPhieuId) {
        return (
            <Button
                ref={ref}
                id={id}
                name={name}
                type="button"
                variant="outline"
                disabled={true}
                className={cn(
                    "w-full justify-between",
                    "text-muted-foreground",
                    className
                )}
                onBlur={onBlur}
            >
                <span className="truncate">Vui lòng chọn loại phiếu trước</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={ref}
                    id={id}
                    name={name}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled || !loaiPhieuId}
                    className={cn(
                        "w-full justify-between",
                        !selectedOption && "text-muted-foreground",
                        disabled && "cursor-not-allowed opacity-50",
                        className
                    )}
                    onBlur={onBlur}
                >
                    <span className="truncate">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                {/* Search Input */}
                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                        type="search"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                {/* Options List */}
                <div className="max-h-[300px] overflow-y-auto p-1">
                    {filteredOptions.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            {emptyText}
                        </div>
                    ) : (
                        filteredOptions.map((option) => {
                            const isSelected = value === option.id
                            return (
                                <div
                                    key={option.id}
                                    onClick={() => handleSelect(option.id)}
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
                                    <span className="truncate">{option.label}</span>
                                </div>
                            )
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
})

HangMucSelectFormField.displayName = "HangMucSelectFormField"

