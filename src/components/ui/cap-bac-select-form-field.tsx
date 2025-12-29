"use client"

import * as React from "react"
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form"
import { CapBacSelect } from "./cap-bac-select"

interface CapBacSelectFormFieldProps<TFieldValues extends FieldValues = FieldValues> {
    field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>
    placeholder?: string
    description?: string
    disabled?: boolean
    excludeIds?: number[]
}

/**
 * Wrapper component để tích hợp CapBacSelect với react-hook-form
 * FormControl sẽ tự động truyền id, name, onBlur vào CapBacSelect qua forwardRef
 */
export function CapBacSelectFormField<TFieldValues extends FieldValues = FieldValues>({
    field,
    placeholder,
    description,
    disabled,
    excludeIds,
}: CapBacSelectFormFieldProps<TFieldValues>) {
    const handleChange = React.useCallback(
        (id: number | null) => {
            field.onChange(id)
        },
        [field]
    )

    return (
        <CapBacSelect
            value={field.value ? Number(field.value) : null}
            onChange={handleChange}
            placeholder={placeholder}
            searchPlaceholder={description}
            disabled={disabled}
            excludeIds={excludeIds || []}
            id={field.name} // FormControl sẽ override id này
            name={field.name}
            onBlur={field.onBlur}
        />
    )
}

