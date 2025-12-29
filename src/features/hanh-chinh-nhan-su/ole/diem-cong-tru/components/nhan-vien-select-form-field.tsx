"use client"

import * as React from "react"
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks/use-nhan-su"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"

interface NhanVienSelectFormFieldProps {
    name: string
    label?: string
    value?: any
    onChange: (value: any) => void
    placeholder?: string
    description?: string
    disabled?: boolean
    id?: string // ID từ FormControl
    onBlur?: () => void // onBlur từ FormControl
    // Các props khác từ formField
    [key: string]: any
}

/**
 * Wrapper component để tích hợp Nhân Viên Select với react-hook-form
 * Sử dụng forwardRef để FormControl có thể truyền id và các props khác
 */
export const NhanVienSelectFormField = React.forwardRef<HTMLButtonElement, NhanVienSelectFormFieldProps>(
function NhanVienSelectFormField({
    value,
    onChange,
    placeholder = "Chọn nhân viên...",
    description,
    disabled,
    id,
    name,
    onBlur,
}, ref) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const { data: nhanSuList, isLoading } = useNhanSu()
    const searchInputId = React.useId()

    // Tìm nhân viên được chọn (value là ma_nhan_vien)
    const selectedNhanVien = React.useMemo(() => {
        if (!value || !nhanSuList) return null
        return nhanSuList.find((ns) => ns.ma_nhan_vien === Number(value))
    }, [value, nhanSuList])

    // Filter options dựa trên search query
    const filteredOptions = React.useMemo(() => {
        if (!nhanSuList) return []
        if (!searchQuery.trim()) {
            return nhanSuList
        }
        const query = searchQuery.toLowerCase()
        return nhanSuList.filter((ns) => {
            const maNhanVien = ns.ma_nhan_vien?.toString() || ""
            const hoTen = ns.ho_ten?.toLowerCase() || ""
            return maNhanVien.includes(query) || hoTen.includes(query)
        })
    }, [nhanSuList, searchQuery])

    const handleSelect = React.useCallback((maNhanVien: number) => {
        onChange(maNhanVien)
        setOpen(false)
        setSearchQuery("")
    }, [onChange])

    const handleClear = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(null)
        setSearchQuery("")
    }, [onChange])

    // Reset search when popover closes
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
        }
    }, [open])

    if (isLoading) {
        return <Skeleton className="h-10 w-full" />
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
                    disabled={disabled}
                    onBlur={onBlur}
                    className={cn(
                        "w-full justify-between",
                        !selectedNhanVien && "text-muted-foreground"
                    )}
                >
                    {selectedNhanVien ? (
                        <div className="flex items-center justify-between flex-1 min-w-0 mr-2">
                            <span className="truncate">
                                {selectedNhanVien.ma_nhan_vien} - {selectedNhanVien.ho_ten}
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
                            placeholder={description || "Tìm kiếm theo mã hoặc tên nhân viên..."}
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
                                Không tìm thấy nhân viên.
                            </div>
                        ) : (
                            <div className="p-1">
                                {filteredOptions.map((ns) => {
                                    const isSelected = value === ns.ma_nhan_vien
                                    
                                    return (
                                        <div
                                            key={ns.ma_nhan_vien}
                                            className={cn(
                                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                isSelected && "bg-accent text-accent-foreground"
                                            )}
                                            onClick={() => handleSelect(ns.ma_nhan_vien!)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium">{ns.ma_nhan_vien} - {ns.ho_ten}</div>
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
})

NhanVienSelectFormField.displayName = "NhanVienSelectFormField"

