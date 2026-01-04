"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxFormFieldWithCustomProps {
    value: string
    onChange: (value: string) => void
    options: Array<{ label: string; value: string }>
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    className?: string
    disabled?: boolean
    id?: string
    name?: string
    onBlur?: () => void
    allowCustom?: boolean
}

/**
 * Combobox với khả năng cho phép người dùng nhập giá trị tùy chỉnh
 * Khi allowCustom = true, người dùng có thể nhập giá trị mới nếu không tìm thấy trong options
 */
export const ComboboxFormFieldWithCustom = React.forwardRef<HTMLButtonElement, ComboboxFormFieldWithCustomProps>(
function ComboboxFormFieldWithCustom({
    value,
    onChange,
    options,
    placeholder = "Chọn hoặc nhập...",
    searchPlaceholder = "Tìm kiếm hoặc nhập mới...",
    emptyText = "Không tìm thấy. Nhấn Enter để thêm mới.",
    className,
    disabled = false,
    id,
    name,
    onBlur,
    allowCustom = false,
}, ref) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    const searchInputId = React.useId()

    const selectedOption = options.find((option) => option.value === value)
    const displayValue = selectedOption ? selectedOption.label : value

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

    // Check if search query is a custom value (not in options)
    const isCustomValue = allowCustom && searchQuery.trim() && !filteredOptions.some(opt => opt.value.toLowerCase() === searchQuery.trim().toLowerCase())

    const handleSelect = React.useCallback((selectedValue: string) => {
        if (disabled) return
        onChange(selectedValue)
        setOpen(false)
        setSearchQuery("")
    }, [onChange, disabled])

    const handleCreateCustom = React.useCallback(() => {
        if (disabled || !allowCustom || !searchQuery.trim()) return
        onChange(searchQuery.trim())
        setOpen(false)
        setSearchQuery("")
    }, [onChange, disabled, allowCustom, searchQuery])

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && isCustomValue) {
            e.preventDefault()
            handleCreateCustom()
        }
    }, [isCustomValue, handleCreateCustom])

    // Reset search when popover closes
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
        }
    }, [open])

    return (
        <Popover open={open && !disabled} onOpenChange={(open) => !disabled && setOpen(open)}>
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
                        "w-full justify-between font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <span className="truncate">{displayValue || placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                            onKeyDown={handleKeyDown}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            autoFocus
                        />
                    </div>

                    {/* Options List */}
                    <div className="max-h-[300px] overflow-y-auto p-1">
                        {filteredOptions.length === 0 && !isCustomValue ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                {emptyText}
                            </div>
                        ) : (
                            <>
                                {filteredOptions.map((option) => {
                                    const isSelected = value === option.value
                                    return (
                                        <div
                                            key={option.value}
                                            onClick={() => handleSelect(option.value)}
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
                                            {option.label}
                                        </div>
                                    )
                                })}
                                {isCustomValue && (
                                    <div
                                        onClick={handleCreateCustom}
                                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground bg-accent/50"
                                    >
                                        <Plus className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="font-medium">Thêm &quot;{searchQuery.trim()}&quot;</span>
                                        <span className="ml-auto text-xs text-muted-foreground">Enter</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
})

ComboboxFormFieldWithCustom.displayName = "ComboboxFormFieldWithCustom"

