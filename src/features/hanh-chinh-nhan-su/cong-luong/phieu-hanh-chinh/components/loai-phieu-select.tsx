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
import { useQuery } from "@tanstack/react-query"
import { NhomPhieuHanhChinhAPI } from "../../nhom-phieu-hanh-chinh/services/nhom-phieu-hanh-chinh.api"
import { nhomPhieuHanhChinhQueryKeys } from "@/lib/react-query/query-keys"
import { Skeleton } from "@/components/ui/skeleton"

interface LoaiPhieuSelectProps {
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

/**
 * Component chọn loại phiếu từ module nhóm phiếu hành chính
 */
export function LoaiPhieuSelect({
    value,
    onChange,
    placeholder = "Chọn loại phiếu...",
    disabled = false,
    className,
}: LoaiPhieuSelectProps) {
    const [open, setOpen] = React.useState(false)
    
    // Fetch unique loại phiếu từ nhóm phiếu hành chính
    const { data: loaiPhieuList, isLoading } = useQuery({
        queryKey: [...nhomPhieuHanhChinhQueryKeys.all(), "loai-phieu"],
        queryFn: () => NhomPhieuHanhChinhAPI.getUniqueLoaiPhieu(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue)
        setOpen(false)
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange("")
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
                <div className="max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4">
                            <Skeleton className="h-8 w-full mb-2" />
                            <Skeleton className="h-8 w-full mb-2" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    ) : loaiPhieuList && loaiPhieuList.length > 0 ? (
                        <div className="p-1">
                            {loaiPhieuList.map((loai) => {
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
                    ) : (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                            Không có loại phiếu nào
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

