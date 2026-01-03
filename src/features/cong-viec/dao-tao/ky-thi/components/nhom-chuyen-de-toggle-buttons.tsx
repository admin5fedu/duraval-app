"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNhomChuyenDe } from "../../nhom-chuyen-de/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { useFormField } from "@/components/ui/form"

interface NhomChuyenDeToggleButtonsProps {
    value?: number[] | null
    onChange?: (value: number[] | null) => void
    disabled?: boolean
    id?: string
    name?: string
    label?: string
}

/**
 * Toggle buttons component for selecting multiple nhóm chuyên đề
 * Each nhóm chuyên đề is displayed as a toggle button
 */
export function NhomChuyenDeToggleButtons({
    value: valueProp,
    onChange: onChangeProp,
    disabled: disabledProp = false,
    ...props
}: NhomChuyenDeToggleButtonsProps) {
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
    
    const { data: nhomChuyenDeList, isLoading } = useNhomChuyenDe()
    
    const selectedIds = (value as number[] | null) || []

    const handleToggle = React.useCallback((id: number) => {
        if (disabled || !onChange) return
        const currentIds = selectedIds
        if (currentIds.includes(id)) {
            // Remove from selection
            const newIds = currentIds.filter(i => i !== id)
            onChange(newIds.length > 0 ? newIds : [])
        } else {
            // Add to selection
            onChange([...currentIds, id])
        }
    }, [onChange, selectedIds, disabled])

    if (isLoading) {
        return <Skeleton className="h-10 w-full" />
    }

    if (!nhomChuyenDeList || nhomChuyenDeList.length === 0) {
        return (
            <div className="text-sm text-muted-foreground">
                Không có nhóm chuyên đề nào
            </div>
        )
    }

    return (
        <div 
            className="flex flex-wrap gap-2"
        >
            {/* Hidden input để browser có thể associate với label và form autofill */}
            <input
                type="hidden"
                id={formItemId}
                name={fieldName}
                value={JSON.stringify(selectedIds)}
                aria-hidden="true"
                tabIndex={-1}
                readOnly
            />
            
            {nhomChuyenDeList.map((nhom) => {
                const isSelected = selectedIds.includes(nhom.id!)
                
                return (
                    <button
                        key={nhom.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleToggle(nhom.id!)}
                        className={cn(
                            "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                            "h-8 px-3 py-2",
                            "transition-all duration-200 relative",
                            isSelected
                                ? "bg-primary text-primary-foreground shadow-lg font-semibold border-2 border-primary hover:bg-primary/90"
                                : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground border-2 border-input",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                        aria-pressed={isSelected}
                        aria-label={`${nhom.ten_nhom}${isSelected ? ' (đã chọn)' : ''}`}
                    >
                        {isSelected && (
                            <Check className="h-3.5 w-3.5" />
                        )}
                        <span>{nhom.ten_nhom}</span>
                    </button>
                )
            })}
        </div>
    )
}

