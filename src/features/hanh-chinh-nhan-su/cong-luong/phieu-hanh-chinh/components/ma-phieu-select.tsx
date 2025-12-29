"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useNhomPhieuHanhChinh } from "../../nhom-phieu-hanh-chinh/hooks/use-nhom-phieu-hanh-chinh"
import { Skeleton } from "@/components/ui/skeleton"

interface MaPhieuSelectProps {
    loaiPhieu?: string
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

/**
 * Component chọn mã phiếu từ module nhóm phiếu hành chính, phụ thuộc vào loại phiếu
 */
export function MaPhieuSelect({
    loaiPhieu,
    value,
    onChange,
    placeholder = "Chọn mã phiếu...",
    disabled = false,
    className,
}: MaPhieuSelectProps) {
    const [open, setOpen] = React.useState(false)
    
    // Fetch danh sách nhóm phiếu hành chính
    const { data: nhomPhieuList, isLoading } = useNhomPhieuHanhChinh()

    // Filter theo loại phiếu
    const filteredNhomPhieu = React.useMemo(() => {
        if (!nhomPhieuList || !loaiPhieu) return []
        return nhomPhieuList.filter((np) => np.loai_phieu === loaiPhieu)
    }, [nhomPhieuList, loaiPhieu])

    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue)
        setOpen(false)
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange("")
    }

    // Find selected nhom phieu to display "mã - tên"
    const selectedNhomPhieu = React.useMemo(() => {
        if (!value || !filteredNhomPhieu) return null
        return filteredNhomPhieu.find((np) => np.ma_nhom_phieu === value) || null
    }, [value, filteredNhomPhieu])

    // Format display text: "mã - tên" if ten_nhom_phieu exists
    const displayText = React.useMemo(() => {
        if (!selectedNhomPhieu) return value || ""
        const maPhieu = selectedNhomPhieu.ma_nhom_phieu
        const tenNhomPhieu = selectedNhomPhieu.ten_nhom_phieu
        return tenNhomPhieu 
            ? `${maPhieu} - ${tenNhomPhieu}`
            : maPhieu
    }, [selectedNhomPhieu, value])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled || !loaiPhieu}
                    className={cn(
                        "w-full justify-between",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    {value ? (
                        <div className="flex items-center justify-between flex-1 min-w-0 mr-2">
                            <span className="truncate">{displayText}</span>
                            {!disabled && (
                                <X
                                    className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                                    onClick={handleClear}
                                />
                            )}
                        </div>
                    ) : (
                        <span>{loaiPhieu ? placeholder : "Vui lòng chọn loại phiếu trước"}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <div className="max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4">
                            <Skeleton className="h-8 w-full mb-2" />
                            <Skeleton className="h-8 w-full mb-2" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    ) : !loaiPhieu ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                            Vui lòng chọn loại phiếu trước
                        </div>
                    ) : filteredNhomPhieu.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                            Không có mã phiếu nào cho loại phiếu này
                        </div>
                    ) : (
                        <div className="p-1">
                            {filteredNhomPhieu.map((np) => {
                                const maPhieu = np.ma_nhom_phieu
                                const isSelected = value === maPhieu
                                
                                return (
                                    <div
                                        key={np.id}
                                        className={cn(
                                            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                            isSelected && "bg-accent text-accent-foreground"
                                        )}
                                        onClick={() => handleSelect(maPhieu)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                isSelected ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="flex-1 truncate">{maPhieu} - {np.ten_nhom_phieu}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

