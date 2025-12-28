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
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

interface ChucVuOption {
    id: number
    ma_chuc_vu: string
    ten_chuc_vu: string
    ma_phong_ban?: string | null
    ma_phong?: string | null
    phong_ban_id?: number | null
    ten_phong_ban?: string | null // Tên phòng ban (cấp 1)
    ten_phong?: string | null // Tên phòng (cấp 2)
}

interface ChucVuMultiSelectProps {
    options: ChucVuOption[]
    value?: number[] | null
    onChange: (value: number[] | null) => void
    disabled?: boolean
    placeholder?: string
}

export function ChucVuMultiSelect({
    options,
    value = [],
    onChange,
    disabled = false,
    placeholder = "Chọn chức vụ áp dụng..."
}: ChucVuMultiSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const selectedIds = value || []
    const allSelected = selectedIds.length === options.length && options.length > 0

    // Filter options by search query
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery.trim()) {
            return options
        }
        const query = searchQuery.toLowerCase()
        return options.filter(opt => 
            opt.ten_chuc_vu?.toLowerCase().includes(query) ||
            opt.ma_chuc_vu?.toLowerCase().includes(query) ||
            opt.ten_phong_ban?.toLowerCase().includes(query) ||
            opt.ten_phong?.toLowerCase().includes(query)
        )
    }, [options, searchQuery])

    // Group options by ma_phong (cấp 1) -> phong_ban_id (cấp 2)
    const groupedByPhong = React.useMemo(() => {
        const groups: Record<string, {
            tenPhong: string
            phongBans: Record<number, { options: ChucVuOption[], tenPhongBan: string }>
        }> = {}
        
        filteredOptions.forEach(opt => {
            const maPhong = opt.ma_phong || "Khác"
            const phongBanId = opt.phong_ban_id || 0
            
            if (!groups[maPhong]) {
                groups[maPhong] = {
                    tenPhong: opt.ten_phong || maPhong,
                    phongBans: {}
                }
            }
            
            if (!groups[maPhong].phongBans[phongBanId]) {
                groups[maPhong].phongBans[phongBanId] = {
                    options: [],
                    tenPhongBan: opt.ten_phong_ban || `Phòng ban ${phongBanId}`
                }
            }
            
            groups[maPhong].phongBans[phongBanId].options.push(opt)
        })
        
        return groups
    }, [filteredOptions])

    const phongKeys = React.useMemo(() => {
        return Object.keys(groupedByPhong).sort((a, b) => {
            const nameA = groupedByPhong[a].tenPhong
            const nameB = groupedByPhong[b].tenPhong
            return nameA.localeCompare(nameB, 'vi')
        })
    }, [groupedByPhong])

    // Reset search when popover closes
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
        }
    }, [open])

    const handleSelectAll = () => {
        // Select all filtered options when searching, or all options when not searching
        const optionsToSelect = searchQuery.trim() ? filteredOptions : options
        const allFilteredSelected = optionsToSelect.every(opt => selectedIds.includes(opt.id))
        
        if (allFilteredSelected) {
            // Deselect filtered options
            const filteredIds = optionsToSelect.map(opt => opt.id)
            const newValue = selectedIds.filter(id => !filteredIds.includes(id))
            onChange(newValue.length > 0 ? newValue : null)
        } else {
            // Select filtered options
            const filteredIds = optionsToSelect.map(opt => opt.id)
            const newValue = [...new Set([...selectedIds, ...filteredIds])]
            onChange(newValue)
        }
    }

    // Check if all filtered options are selected
    const allFilteredSelected = React.useMemo(() => {
        if (searchQuery.trim()) {
            return filteredOptions.length > 0 && filteredOptions.every(opt => selectedIds.includes(opt.id))
        }
        return allSelected
    }, [searchQuery, filteredOptions, selectedIds, allSelected])

    const handleSelectByPhong = (maPhong: string) => {
        const phongGroup = groupedByPhong[maPhong]
        if (!phongGroup) return
        
        const allOptions: ChucVuOption[] = []
        Object.values(phongGroup.phongBans).forEach(phongBan => {
            allOptions.push(...phongBan.options)
        })
        
        const allIds = allOptions.map(opt => opt.id)
        const allSelected = allIds.every(id => selectedIds.includes(id))
        
        if (allSelected) {
            const newValue = selectedIds.filter(id => !allIds.includes(id))
            onChange(newValue.length > 0 ? newValue : null)
        } else {
            const newValue = [...new Set([...selectedIds, ...allIds])]
            onChange(newValue)
        }
    }

    const handleSelectByPhongBan = (maPhong: string, phongBanId: number) => {
        const phongGroup = groupedByPhong[maPhong]
        if (!phongGroup) return
        
        const phongBanGroup = phongGroup.phongBans[phongBanId]
        if (!phongBanGroup) return
        
        const phongBanOptions = phongBanGroup.options
        const phongBanIds = phongBanOptions.map(opt => opt.id)
        const allPhongBanSelected = phongBanIds.every(id => selectedIds.includes(id))
        
        if (allPhongBanSelected) {
            const newValue = selectedIds.filter(id => !phongBanIds.includes(id))
            onChange(newValue.length > 0 ? newValue : null)
        } else {
            const newValue = [...new Set([...selectedIds, ...phongBanIds])]
            onChange(newValue)
        }
    }

    const handleToggle = (id: number) => {
        const newValue = selectedIds.includes(id)
            ? selectedIds.filter(v => v !== id)
            : [...selectedIds, id]
        onChange(newValue.length > 0 ? newValue : null)
    }

    const handleRemove = (id: number, e: React.MouseEvent) => {
        e.stopPropagation()
        const newValue = selectedIds.filter(v => v !== id)
        onChange(newValue.length > 0 ? newValue : null)
    }

    const selectedOptions = options.filter(opt => selectedIds.includes(opt.id))

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between min-h-9 h-auto"
                    disabled={disabled}
                >
                    <div className="flex flex-wrap gap-1 flex-1">
                        {selectedOptions.length === 0 ? (
                            <span className="text-muted-foreground">{placeholder}</span>
                        ) : selectedOptions.length === options.length ? (
                            <span className="text-sm">Tất cả chức vụ ({options.length})</span>
                        ) : (
                            selectedOptions.map((option) => (
                                <Badge
                                    key={option.id}
                                    variant="secondary"
                                    className="mr-1 mb-1"
                                >
                                    {option.ten_chuc_vu}
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer inline-flex items-center"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault()
                                                handleRemove(option.id, e as any)
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                        onClick={(e) => handleRemove(option.id, e)}
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
                    {/* Search Input */}
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
                                    onClick={() => onChange(null)}
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
                            {allFilteredSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                        </Button>
                    </div>
                </div>
                <ScrollArea className="h-[400px]">
                    <div className="p-2">
                        {phongKeys.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Không tìm thấy chức vụ nào
                            </div>
                        ) : (
                            phongKeys.map((maPhong, phongIndex) => {
                            const phongGroup = groupedByPhong[maPhong]
                            if (!phongGroup) return null
                            
                            // Tính tổng số chức vụ trong phòng
                            const allPhongOptions: ChucVuOption[] = []
                            Object.values(phongGroup.phongBans).forEach(phongBan => {
                                allPhongOptions.push(...phongBan.options)
                            })
                            const allPhongIds = allPhongOptions.map(opt => opt.id)
                            const allPhongSelected = allPhongIds.length > 0 && allPhongIds.every(id => selectedIds.includes(id))
                            
                            const phongBanIds = Object.keys(phongGroup.phongBans)
                                .map(id => Number(id))
                                .sort((a, b) => {
                                    const nameA = phongGroup.phongBans[a].tenPhongBan
                                    const nameB = phongGroup.phongBans[b].tenPhongBan
                                    return nameA.localeCompare(nameB, 'vi')
                                })

                            return (
                                <div key={maPhong}>
                                    {phongIndex > 0 && <Separator className="my-3" />}
                                    
                                    {/* Cấp 1: Phòng */}
                                    <div className="space-y-1 mb-2">
                                        <div
                                            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer bg-muted/50"
                                            onClick={() => handleSelectByPhong(maPhong)}
                                        >
                                            <Checkbox
                                                checked={allPhongSelected}
                                                onCheckedChange={() => handleSelectByPhong(maPhong)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <Building2 className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-semibold flex-1">{phongGroup.tenPhong}</span>
                                            <span className="text-xs text-muted-foreground">
                                                ({allPhongOptions.length})
                                            </span>
                                        </div>
                                        
                                        {/* Cấp 2: Phòng ban */}
                                        <div className="pl-8 space-y-1">
                                            {phongBanIds.map((phongBanId, phongBanIndex) => {
                                                const phongBanGroup = phongGroup.phongBans[phongBanId]
                                                if (!phongBanGroup) return null
                                                
                                                const phongBanOptions = phongBanGroup.options
                                                const phongBanIds = phongBanOptions.map(opt => opt.id)
                                                const allPhongBanSelected = phongBanIds.length > 0 && phongBanIds.every(id => selectedIds.includes(id))

                                                return (
                                                    <div key={phongBanId}>
                                                        {phongBanIndex > 0 && <Separator className="my-1.5" />}
                                                        <div className="space-y-0.5">
                                                            <div
                                                                className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent cursor-pointer"
                                                                onClick={() => handleSelectByPhongBan(maPhong, phongBanId)}
                                                            >
                                                                <Checkbox
                                                                    checked={allPhongBanSelected}
                                                                    onCheckedChange={() => handleSelectByPhongBan(maPhong, phongBanId)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span className="text-sm font-medium flex-1">{phongBanGroup.tenPhongBan}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    ({phongBanOptions.length})
                                                                </span>
                                                            </div>
                                                            
                                                            {/* Cấp 3: Chức vụ */}
                                                            <div className="pl-8 space-y-0.5">
                                                                {phongBanOptions.map((option) => {
                                                                    const isSelected = selectedIds.includes(option.id)
                                                                    return (
                                                                        <div
                                                                            key={option.id}
                                                                            className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent cursor-pointer"
                                                                            onClick={() => handleToggle(option.id)}
                                                                        >
                                                                            <Checkbox
                                                                                checked={isSelected}
                                                                                onCheckedChange={() => handleToggle(option.id)}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            />
                                                                            <span className="text-sm flex-1">{option.ten_chuc_vu}</span>
                                                                            {isSelected && (
                                                                                <Check className="h-4 w-4 text-primary" />
                                                                            )}
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
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


