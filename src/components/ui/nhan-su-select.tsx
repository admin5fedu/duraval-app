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
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks/use-nhan-su"
import { Skeleton } from "@/components/ui/skeleton"

export interface NhanSuSelectProps {
    value?: number | null // ID của nhân sự được chọn
    onChange: (id: number | null, data?: { ten_nhan_su: string; ma_nhan_su?: string }) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    id?: string // ID từ FormControl
    onBlur?: () => void // onBlur từ FormControl
}

/**
 * Component chọn nhân sự từ var_nhan_su với ô search
 * Reusable UI component - có thể dùng chung trong toàn bộ ứng dụng
 */
export const NhanSuSelect = React.forwardRef<HTMLButtonElement, NhanSuSelectProps>(
function NhanSuSelect({
    value,
    onChange,
    placeholder = "Chọn nhân sự...",
    searchPlaceholder = "Tìm kiếm theo tên hoặc mã nhân sự...",
    emptyText = "Không tìm thấy nhân sự.",
    disabled = false,
    className,
    id,
    onBlur,
}, ref) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Fetch danh sách nhân sự
    const { data: nhanSuList, isLoading } = useNhanSu(undefined)
    
    const searchInputId = React.useId()

    // Tìm nhân sự được chọn
    const selectedNhanSu = React.useMemo(() => {
        if (!value || !nhanSuList) return null
        return nhanSuList.find((ns) => ns.ma_nhan_vien === value)
    }, [value, nhanSuList])

    // Filter options dựa trên search query (tìm theo tên hoặc mã)
    const filteredOptions = React.useMemo(() => {
        if (!nhanSuList) return []
        if (!searchQuery.trim()) {
            return nhanSuList
        }
        const query = searchQuery.toLowerCase()
        return nhanSuList.filter((ns) => {
            const maNhanSu = String(ns.ma_nhan_vien).toLowerCase()
            const tenNhanSu = ns.ho_ten?.toLowerCase() || ""
            return maNhanSu.includes(query) || tenNhanSu.includes(query)
        })
    }, [nhanSuList, searchQuery])

    const handleSelect = React.useCallback((selectedId: number) => {
        if (disabled) return
        const selected = nhanSuList?.find((ns) => ns.ma_nhan_vien === selectedId)
        if (selected) {
            onChange(selectedId, {
                ten_nhan_su: selected.ho_ten,
                ma_nhan_su: String(selected.ma_nhan_vien),
            })
        } else {
            onChange(selectedId)
        }
        setOpen(false)
        setSearchQuery("")
    }, [onChange, disabled, nhanSuList])

    // Reset search khi popover đóng
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
        }
    }, [open])

    // Display text cho selected value (mã - tên)
    const displayText = React.useMemo(() => {
        if (!selectedNhanSu) return placeholder
        const ma = String(selectedNhanSu.ma_nhan_vien || "")
        const ten = selectedNhanSu.ho_ten || ""
        if (ma && ten) {
            return `${ma} - ${ten}`
        }
        return ten || ma || placeholder
    }, [selectedNhanSu, placeholder])

    if (isLoading) {
        return (
            <Skeleton className={cn("h-10 w-full", className)} />
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={ref}
                    id={id}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={searchInputId}
                    className={cn(
                        "w-full justify-between",
                        !selectedNhanSu && "text-muted-foreground",
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
                                {filteredOptions.map((ns) => (
                                    <button
                                        key={ns.ma_nhan_vien}
                                        type="button"
                                        onClick={() => handleSelect(ns.ma_nhan_vien!)}
                                        className={cn(
                                            "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                                            "hover:bg-accent hover:text-accent-foreground",
                                            "focus:bg-accent focus:text-accent-foreground",
                                            selectedNhanSu?.ma_nhan_vien === ns.ma_nhan_vien && "bg-accent text-accent-foreground"
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 shrink-0",
                                                selectedNhanSu?.ma_nhan_vien === ns.ma_nhan_vien ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="truncate">
                                            <span className="font-mono text-xs text-muted-foreground mr-1.5">{ns.ma_nhan_vien}</span>
                                            <span className="font-medium">{ns.ho_ten}</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
})

NhanSuSelect.displayName = "NhanSuSelect"
