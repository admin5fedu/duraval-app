"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X, Briefcase, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useChucVu } from "@/features/he-thong/so-do/chuc-vu/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useFormField } from "@/components/ui/form"

interface ChucVuMultiSelectProps {
    value?: number[] | null
    onChange?: (value: number[] | null) => void
    placeholder?: string
    description?: string
    disabled?: boolean
    id?: string
    name?: string
    label?: string
}

/**
 * Multi-select component for chức vụ
 * Can be used as custom component in GenericFormView
 */
export function ChucVuMultiSelect({
    value: valueProp,
    onChange: onChangeProp,
    placeholder = "Chọn chức vụ...",
    disabled: disabledProp = false,
    ...props
}: ChucVuMultiSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // value, onChange, disabled được truyền từ formField trong FormFieldRenderer
    // useFormField() chỉ trả về metadata (id, name, formItemId, error), không có value/onChange
    let formItemId: string | undefined = props.id
    let fieldName: string | undefined = props.name
    const value: number[] | null | undefined = valueProp
    const onChange: ((value: number[] | null) => void) | undefined = onChangeProp
    const disabled = disabledProp
    
    try {
        const formField = useFormField()
        formItemId = formField.formItemId
        fieldName = formField.name
    } catch {
        // Not in form context, use props or generate id
        if (!formItemId) {
            formItemId = React.useId()
        }
    }
    
    const { data: chucVuList, isLoading } = useChucVu()
    
    const selectedIds = (value as number[] | null) || []
    const allSelected = selectedIds.length === (chucVuList?.length || 0) && (chucVuList?.length || 0) > 0

    const filteredOptions = React.useMemo(() => {
        if (!chucVuList) return []
        if (!searchQuery.trim()) {
            return chucVuList
        }
        const query = searchQuery.toLowerCase()
        return chucVuList.filter(chucVu => 
            chucVu.ten_chuc_vu?.toLowerCase().includes(query) ||
            chucVu.ma_chuc_vu?.toLowerCase().includes(query)
        )
    }, [chucVuList, searchQuery])

    const handleChange = React.useCallback((newValue: number[] | null) => {
        if (onChange) {
            onChange(newValue)
        }
    }, [onChange])

    const handleSelect = React.useCallback((id: number) => {
        if (disabled) return
        const currentIds = selectedIds
        if (currentIds.includes(id)) {
            handleChange(currentIds.filter(i => i !== id))
        } else {
            handleChange([...currentIds, id])
        }
    }, [handleChange, selectedIds, disabled])

    const handleSelectAll = React.useCallback(() => {
        if (disabled || !chucVuList) return
        if (allSelected) {
            handleChange([])
        } else {
            handleChange(chucVuList.map(chucVu => chucVu.id!).filter(id => id !== undefined && id !== null))
        }
    }, [handleChange, allSelected, chucVuList, disabled])

    const handleRemove = React.useCallback((id: number, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (disabled) return
        handleChange(selectedIds.filter(i => i !== id))
    }, [handleChange, selectedIds, disabled])

    const selectedOptions = React.useMemo(() => {
        if (!chucVuList) return []
        return chucVuList.filter(chucVu => selectedIds.includes(chucVu.id!))
    }, [chucVuList, selectedIds])

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
                    type="button"
                    id={formItemId}
                    name={fieldName}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between h-auto min-h-[2.5rem] py-1.5",
                        !selectedIds.length && "text-muted-foreground"
                    )}
                >
                    <div className="flex flex-wrap gap-1 flex-1">
                        {selectedOptions.length === 0 ? (
                            <span className="text-muted-foreground">{placeholder}</span>
                        ) : selectedOptions.length === (chucVuList?.length || 0) ? (
                            <span className="text-sm">Tất cả chức vụ ({(chucVuList?.length || 0)})</span>
                        ) : (
                            selectedOptions.map((chucVu) => (
                                <Badge
                                    key={chucVu.id}
                                    variant="secondary"
                                    className="mr-1 mb-1"
                                >
                                    {chucVu.ten_chuc_vu}
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer inline-flex items-center"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault()
                                                handleRemove(chucVu.id!, e as any)
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                        onClick={(e) => handleRemove(chucVu.id!, e)}
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
            <PopoverContent className="w-[400px] p-0" align="start">
                <div className="p-3 border-b space-y-2">
                    <div className="flex items-center border rounded-md px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            type="search"
                            placeholder="Tìm kiếm chức vụ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Chọn chức vụ</span>
                            {selectedIds.length > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleChange([])}
                                    className="h-7 text-xs text-destructive hover:text-destructive"
                                >
                                    Hủy tất cả
                                </Button>
                            )}
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleSelectAll}
                            className="h-7 text-xs"
                        >
                            {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                        </Button>
                    </div>
                </div>
                <ScrollArea className="h-[400px]">
                    <div className="p-2">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                {searchQuery ? "Không tìm thấy chức vụ nào" : "Không có chức vụ nào"}
                            </div>
                        ) : (
                            filteredOptions.map((chucVu) => {
                                const isSelected = selectedIds.includes(chucVu.id!)
                                return (
                                    <div
                                        key={chucVu.id}
                                        className={cn(
                                            "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer",
                                            isSelected && "bg-accent"
                                        )}
                                        onClick={() => handleSelect(chucVu.id!)}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => handleSelect(chucVu.id!)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <Briefcase className="h-4 w-4 text-primary" />
                                        <span className="text-sm flex-1">{chucVu.ten_chuc_vu}</span>
                                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}

