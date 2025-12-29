"use client"

import * as React from "react"
import { NhomLuongSelect } from "@/features/hanh-chinh-nhan-su/ole/nhom-luong/components/nhom-luong-select"

interface DiemCongTruNhomLuongSelectFormFieldProps {
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
    // Các props khác từ formField (ref, name, etc.)
    [key: string]: any
}

/**
 * Wrapper component để tích hợp NhomLuongSelect với react-hook-form
 * Sử dụng forwardRef để FormControl có thể truyền ref và id vào NhomLuongSelect
 */
export const DiemCongTruNhomLuongSelectFormField = React.forwardRef<HTMLButtonElement, DiemCongTruNhomLuongSelectFormFieldProps>(
function DiemCongTruNhomLuongSelectFormField({
    value,
    onChange,
    placeholder,
    description,
    disabled,
    excludeIds,
    ...formFieldProps // Nhận tất cả props còn lại từ formField (bao gồm ref, id, name, onBlur)
}, ref) {
    const handleChange = React.useCallback(
        (id: number | null) => {
            onChange(id)
        },
        [onChange]
    )

    return (
        <NhomLuongSelect
            ref={ref} // Forward ref từ FormControl
            value={value ? Number(value) : null}
            onChange={handleChange}
            placeholder={placeholder}
            searchPlaceholder={description}
            disabled={disabled}
            excludeIds={excludeIds || []}
            {...formFieldProps} // Truyền tất cả props từ formField (id, name, onBlur, etc.)
        />
    )
})

DiemCongTruNhomLuongSelectFormField.displayName = "DiemCongTruNhomLuongSelectFormField"

