"use client"

import * as React from "react"
import { PhongBanSelect } from "@/components/ui/phong-ban-select"

interface PhongBanSelectFormFieldProps {
    name: string
    label?: string
    value?: any
    onChange: (value: any) => void
    placeholder?: string
    description?: string
    disabled?: boolean
    excludeIds?: number[]
    id?: string // ID từ FormControl
    onBlur?: () => void // onBlur từ FormControl
}

/**
 * Wrapper component để tích hợp PhongBanSelect với react-hook-form
 * FormControl sẽ tự động truyền id, name, onBlur vào PhongBanSelect qua forwardRef
 */
export function PhongBanSelectFormField({
    value,
    onChange,
    placeholder,
    description,
    disabled,
    excludeIds,
    id,
    onBlur,
}: PhongBanSelectFormFieldProps) {
    const handleChange = React.useCallback(
        (id: number | null) => {
            onChange(id)
        },
        [onChange]
    )

    return (
        <PhongBanSelect
            id={id}
            onBlur={onBlur}
            value={value ? Number(value) : null}
            onChange={handleChange}
            placeholder={placeholder}
            searchPlaceholder={description}
            disabled={disabled}
            excludeIds={excludeIds || []}
        />
    )
}
