"use client"

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { PhongBanSelect } from "./phong-ban-select"

interface PhongBanSelectFormFieldProps {
    form: UseFormReturn<any>
    name: string
    label?: string
    placeholder?: string
    searchPlaceholder?: string
    description?: string
    disabled?: boolean
    excludeIds?: number[]
    required?: boolean
}

/**
 * PhongBanSelect field wrapper để sử dụng với react-hook-form
 */
export function PhongBanSelectFormField({
    form,
    name,
    label,
    placeholder,
    searchPlaceholder,
    description,
    disabled,
    excludeIds,
    required,
}: PhongBanSelectFormFieldProps) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel>{label}{required && <span className="text-destructive ml-1">*</span>}</FormLabel>}
                    <FormControl>
                        <PhongBanSelect
                            value={field.value ? Number(field.value) : null}
                            onChange={(id) => {
                                field.onChange(id)
                            }}
                            placeholder={placeholder}
                            searchPlaceholder={searchPlaceholder}
                            disabled={disabled}
                            excludeIds={excludeIds}
                        />
                    </FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

