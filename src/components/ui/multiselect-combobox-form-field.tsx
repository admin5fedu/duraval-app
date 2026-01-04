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
import { Badge } from "@/components/ui/badge"
// import { useFormField } from "@/components/ui/form" // Not used

export interface MultiselectComboboxFormFieldProps {
    value?: string[] // Array of selected values
    onChange: (values: string[]) => void
    options: Array<{ label: string; value: string; disabled?: boolean }>
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    className?: string
    disabled?: boolean
    id?: string // ID từ FormControl
    name?: string // Name từ FormControl
    onBlur?: () => void // onBlur từ FormControl
}

/**
 * Component multiselect combobox với search
 * Hỗ trợ nhiều lựa chọn và hiển thị dưới dạng badges
 */
export const MultiselectComboboxFormField = React.forwardRef<HTMLButtonElement, MultiselectComboboxFormFieldProps>(
function MultiselectComboboxFormField({
    value = [],
    onChange,
    options,
    placeholder = "Chọn...",
    searchPlaceholder = "Tìm kiếm...",
    emptyText = "Không tìm thấy.",
    className,
    disabled = false,
    id,
    // name, // Not used but kept for interface compatibility
    onBlur,
}, ref) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    const searchInputId = React.useId()
    const selectedValues = value || []

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

    const handleSelect = React.useCallback((selectedValue: string) => {
        if (disabled) return
        const newValues = selectedValues.includes(selectedValue)
            ? selectedValues.filter((v) => v !== selectedValue)
            : [...selectedValues, selectedValue]
        onChange(newValues)
        setSearchQuery("")
    }, [onChange, disabled, selectedValues])

    const handleRemove = React.useCallback((valueToRemove: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (disabled) return
        onChange(selectedValues.filter((v) => v !== valueToRemove))
    }, [onChange, disabled, selectedValues])

    // Reset search when popover closes
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
        }
    }, [open])

    // Get selected options for display
    const selectedOptions = React.useMemo(() => {
        return options.filter((opt) => selectedValues.includes(opt.value))
    }, [options, selectedValues])

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
                        "w-full justify-between min-h-10 h-auto py-2",
                        selectedValues.length === 0 && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                    onBlur={onBlur}
                >
                    <div className="flex flex-wrap gap-1 flex-1 text-left">
                        {selectedOptions.length === 0 ? (
                            <span>{placeholder}</span>
                        ) : (
                            selectedOptions.map((option) => (
                                <Badge
                                    key={option.value}
                                    variant="secondary"
                                    className="mr-1 mb-1"
                                >
                                    {option.label}
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault()
                                                handleRemove(option.value, e as any)
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                        onClick={(e) => handleRemove(option.value, e)}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </span>
                                </Badge>
                            ))
                        )}
                    </div>
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
                                {filteredOptions.map((option) => {
                                    const isSelected = selectedValues.includes(option.value)
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSelect(option.value)}
                                            disabled={option.disabled}
                                            className={cn(
                                                "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                                                "hover:bg-accent hover:text-accent-foreground",
                                                "focus:bg-accent focus:text-accent-foreground",
                                                isSelected && "bg-accent text-accent-foreground",
                                                option.disabled && "cursor-not-allowed opacity-50"
                                            )}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4 shrink-0",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <span className="truncate">{option.label}</span>
                                        </button>
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

MultiselectComboboxFormField.displayName = "MultiselectComboboxFormField"

