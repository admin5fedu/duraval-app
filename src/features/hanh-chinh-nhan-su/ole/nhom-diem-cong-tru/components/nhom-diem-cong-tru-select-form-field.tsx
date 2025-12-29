"use client"

import * as React from "react"
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form"
import { NhomDiemCongTruSelect } from "./nhom-diem-cong-tru-select"

interface NhomDiemCongTruSelectFormFieldProps<TFieldValues extends FieldValues = FieldValues> {
    field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>
    placeholder?: string
    description?: string
    disabled?: boolean
    excludeIds?: number[]
}

/**
 * Wrapper component để tích hợp NhomDiemCongTruSelect với react-hook-form
 */
export function NhomDiemCongTruSelectFormField<TFieldValues extends FieldValues = FieldValues>({
    field,
    placeholder,
    description,
    disabled,
    excludeIds,
}: NhomDiemCongTruSelectFormFieldProps<TFieldValues>) {
    const handleChange = React.useCallback(
        (id: number | null) => {
            field.onChange(id)
        },
        [field]
    )

    return (
        <NhomDiemCongTruSelect
            value={field.value ? Number(field.value) : null}
            onChange={handleChange}
            placeholder={placeholder}
            searchPlaceholder={description}
            disabled={disabled}
            excludeIds={excludeIds || []}
        />
    )
}

