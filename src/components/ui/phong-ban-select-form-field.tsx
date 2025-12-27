"use client"

import * as React from "react"
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form"
import { PhongBanSelect } from "./phong-ban-select"

interface PhongBanSelectFormFieldProps<TFieldValues extends FieldValues = FieldValues> {
    field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>
    placeholder?: string
    description?: string
    disabled?: boolean
    excludeIds?: number[]
}

/**
 * Wrapper component để tích hợp PhongBanSelect với react-hook-form
 */
export function PhongBanSelectFormField<TFieldValues extends FieldValues = FieldValues>({
    field,
    placeholder,
    description,
    disabled,
    excludeIds,
}: PhongBanSelectFormFieldProps<TFieldValues>) {
    const handleChange = React.useCallback(
        (id: number | null) => {
            field.onChange(id)
        },
        [field]
    )

    return (
        <PhongBanSelect
            value={field.value ? Number(field.value) : null}
            onChange={handleChange}
            placeholder={placeholder}
            searchPlaceholder={description}
            disabled={disabled}
            excludeIds={excludeIds || []}
        />
    )
}

