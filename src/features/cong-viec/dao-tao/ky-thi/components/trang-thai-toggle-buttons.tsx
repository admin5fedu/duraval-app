"use client"

import * as React from "react"
import { ToggleButtonFormField } from "@/shared/components/forms/toggle-button-form-field"
import { useFormField } from "@/components/ui/form"

interface TrangThaiToggleButtonsProps {
    value?: string
    onChange?: (value: string) => void
    disabled?: boolean
    id?: string
    name?: string
    label?: string
    onBlur?: () => void
}

/**
 * Toggle buttons component for trang thai
 */
export function TrangThaiToggleButtons({
    value: valueProp,
    onChange: onChangeProp,
    disabled: disabledProp = false,
    onBlur: onBlurProp,
    ...props
}: TrangThaiToggleButtonsProps) {
    // value, onChange, disabled, onBlur được truyền từ formField trong FormFieldRenderer
    // useFormField() chỉ trả về metadata (id, name, formItemId, error), không có value/onChange
    let formItemId: string | undefined = props.id
    let fieldName: string | undefined = props.name
    const value: string | undefined = valueProp
    const onChange: ((value: string) => void) | undefined = onChangeProp
    const disabled = disabledProp
    const onBlur = onBlurProp
    
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

    const options = [
        { label: "Mở", value: "Mở" },
        { label: "Đóng", value: "Đóng" },
    ]

    return (
        <ToggleButtonFormField
            id={formItemId}
            name={fieldName}
            value={value || ""}
            onChange={onChange || (() => {})}
            options={options}
            disabled={disabled}
            onBlur={onBlur}
        />
    )
}

