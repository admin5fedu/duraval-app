"use client"

import * as React from "react"
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form"
import { NhomLuongSelect } from "./nhom-luong-select"

interface NhomLuongSelectFormFieldProps<TFieldValues extends FieldValues = FieldValues> {
    field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>
    placeholder?: string
    description?: string
    disabled?: boolean
    excludeIds?: number[]
}

/**
 * Wrapper component để tích hợp NhomLuongSelect với react-hook-form
 */
export function NhomLuongSelectFormField<TFieldValues extends FieldValues = FieldValues>({
    field,
    placeholder,
    description,
    disabled,
    excludeIds,
}: NhomLuongSelectFormFieldProps<TFieldValues>) {
    const handleChange = React.useCallback(
        (id: number | null) => {
            field.onChange(id)
        },
        [field]
    )

    return (
        <NhomLuongSelect
            value={field.value ? Number(field.value) : null}
            onChange={handleChange}
            placeholder={placeholder}
            searchPlaceholder={description}
            disabled={disabled}
            excludeIds={excludeIds || []}
        />
    )
}

