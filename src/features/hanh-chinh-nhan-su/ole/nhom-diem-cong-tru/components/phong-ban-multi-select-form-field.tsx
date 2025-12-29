"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X, Building2, Search } from "lucide-react"
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
import { usePhongBan } from "@/features/he-thong/so-do/phong-ban/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useFormField } from "@/components/ui/form"

interface PhongBanMultiSelectFormFieldProps {
    value?: number[] | null
    onChange: (value: number[] | null) => void
    placeholder?: string
    description?: string
    disabled?: boolean
}

/**
 * Multi-select component for phong ban (phòng ban) selection
 * Can be used as custom component in GenericFormView
 */
export function PhongBanMultiSelectFormField({
    value,
    onChange,
    placeholder = "Chọn phòng ban áp dụng...",
    disabled = false,
}: PhongBanMultiSelectFormFieldProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Get id and name from FormControl context - FormControl passes id via Slot
    // Slot will merge props including id, but we should use useFormField() to get the correct id
    let formItemId: string | undefined
    let fieldName: string | undefined
    try {
        const formField = useFormField()
        formItemId = formField.formItemId
        fieldName = formField.name
    } catch {
        // Not in FormControl context, generate a unique id
        formItemId = React.useId()
        fieldName = undefined
    }
    
    // Fetch danh sách phòng ban
    const { data: phongBanList, isLoading } = usePhongBan()
    
    const selectedIds = (value as number[] | null) || []
    const allSelected = selectedIds.length === (phongBanList?.length || 0) && (phongBanList?.length || 0) > 0

    // Filter options by search query
    const filteredOptions = React.useMemo(() => {
        if (!phongBanList) return []
        if (!searchQuery.trim()) {
            return phongBanList
        }
        const query = searchQuery.toLowerCase()
        return phongBanList.filter(pb => 
            pb.ma_phong_ban?.toLowerCase().includes(query) ||
            pb.ten_phong_ban?.toLowerCase().includes(query)
        )
    }, [phongBanList, searchQuery])

    const handleSelect = React.useCallback((id: number) => {
        if (disabled) return
        const currentIds = selectedIds
        if (currentIds.includes(id)) {
            onChange(currentIds.filter(i => i !== id))
        } else {
            onChange([...currentIds, id])
        }
    }, [onChange, selectedIds, disabled])

    const handleSelectAll = React.useCallback(() => {
        if (disabled || !phongBanList) return
        if (allSelected) {
            onChange([])
        } else {
            onChange(phongBanList.map(pb => pb.id!).filter(id => id !== undefined && id !== null))
        }
    }, [onChange, allSelected, phongBanList, disabled])

    const handleRemove = React.useCallback((id: number, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (disabled) return
        onChange(selectedIds.filter(i => i !== id))
    }, [onChange, selectedIds, disabled])

    const selectedOptions = React.useMemo(() => {
        if (!phongBanList) return []
        return phongBanList.filter(pb => selectedIds.includes(pb.id!))
    }, [phongBanList, selectedIds])

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
                        ) : selectedOptions.length === (phongBanList?.length || 0) ? (
                            <span className="text-sm">Tất cả phòng ban ({(phongBanList?.length || 0)})</span>
                        ) : (
                            selectedOptions.map((pb) => (
                                <Badge
                                    key={pb.id}
                                    variant="secondary"
                                    className="mr-1 mb-1"
                                >
                                    {pb.ma_phong_ban} - {pb.ten_phong_ban}
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer inline-flex items-center"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault()
                                                handleRemove(pb.id!, e as any)
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                        onClick={(e) => handleRemove(pb.id!, e)}
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
                            placeholder="Tìm kiếm phòng ban..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Chọn phòng ban</span>
                            {selectedIds.length > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onChange([])}
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
                                Không tìm thấy phòng ban nào
                            </div>
                        ) : (
                            filteredOptions.map((pb) => {
                                const isSelected = selectedIds.includes(pb.id!)
                                return (
                                    <div
                                        key={pb.id}
                                        className={cn(
                                            "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer",
                                            isSelected && "bg-accent"
                                        )}
                                        onClick={() => handleSelect(pb.id!)}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => handleSelect(pb.id!)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <Building2 className="h-4 w-4 text-primary" />
                                        <span className="text-sm flex-1">{pb.ma_phong_ban} - {pb.ten_phong_ban}</span>
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

