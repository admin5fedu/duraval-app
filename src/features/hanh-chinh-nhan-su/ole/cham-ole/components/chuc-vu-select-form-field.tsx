"use client"

import * as React from "react"
import { useChucVu } from "@/features/he-thong/so-do/chuc-vu/hooks/use-chuc-vu"
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

interface ChucVuSelectFormFieldProps {
    name: string
    label?: string
    value?: any
    onChange: (value: any) => void
    placeholder?: string
    description?: string
    disabled?: boolean
    id?: string
    onBlur?: () => void
    [key: string]: any
}

export const ChucVuSelectFormField = React.forwardRef<HTMLButtonElement, ChucVuSelectFormFieldProps>(
function ChucVuSelectFormField({
    value,
    onChange,
    placeholder = "Chọn chức vụ...",
    description,
    disabled,
    id,
    name,
    onBlur,
}, ref) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const { data: chucVuList, isLoading } = useChucVu()
    const searchInputId = React.useId()

    const selectedChucVu = React.useMemo(() => {
        if (!value || !chucVuList) return null
        return chucVuList.find((cv) => cv.id === Number(value))
    }, [value, chucVuList])

    const filteredOptions = React.useMemo(() => {
        if (!chucVuList) return []
        if (!searchQuery.trim()) {
            return chucVuList
        }
        const query = searchQuery.toLowerCase()
        return chucVuList.filter((cv) => {
            const tenChucVu = cv.ten_chuc_vu?.toLowerCase() || ""
            const maChucVu = cv.ma_chuc_vu?.toLowerCase() || ""
            return tenChucVu.includes(query) || maChucVu.includes(query)
        })
    }, [chucVuList, searchQuery])

    const handleSelect = React.useCallback((chucVuId: number) => {
        onChange(chucVuId)
        setOpen(false)
        setSearchQuery("")
    }, [onChange])

    const handleClear = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(null)
        setSearchQuery("")
    }, [onChange])

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
                        !selectedChucVu && "text-muted-foreground"
                    )}
                >
                    {selectedChucVu ? (
                        <div className="flex items-center justify-between flex-1 min-w-0 mr-2">
                            <span className="truncate">
                                {selectedChucVu.ten_chuc_vu}
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
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            id={searchInputId}
                            placeholder={description || "Tìm kiếm theo tên chức vụ..."}
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
                    <div className="max-h-[300px] overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-sm text-muted-foreground text-center">
                                Không tìm thấy chức vụ.
                            </div>
                        ) : (
                            <div className="p-1">
                                {filteredOptions.map((cv) => {
                                    const isSelected = value === cv.id
                                    return (
                                        <div
                                            key={cv.id}
                                            className={cn(
                                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                isSelected && "bg-accent text-accent-foreground"
                                            )}
                                            onClick={() => handleSelect(cv.id!)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium">{cv.ten_chuc_vu}</div>
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

ChucVuSelectFormField.displayName = "ChucVuSelectFormField"

