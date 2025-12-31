"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { useEffect } from "react"
import type { GenericFormViewProps } from "../types"

/**
 * Hook to manage form state and default values sync
 */
export function useGenericFormState<T extends z.ZodType<any, any>>({
    schema,
    defaultValues,
}: Pick<GenericFormViewProps<T>, "schema" | "defaultValues">): UseFormReturn<z.infer<T>> {
    const form = useForm<z.infer<T>>({
        resolver: zodResolver(schema),
        defaultValues: defaultValues || {},
        mode: "onBlur", // ⚡ Performance: Validate on blur instead of every keystroke
        reValidateMode: "onChange", // Re-validate on change after first submit
    })

    // Update form values when defaultValues change (for dynamic defaults)
    useEffect(() => {
        if (defaultValues && typeof defaultValues === 'object' && defaultValues !== null) {
            Object.entries(defaultValues).forEach(([key, value]) => {
                try {
                const currentValue = form.getValues(key as any)
                // Only update if value is different to avoid unnecessary re-renders
                // For select fields, compare as strings
                const currentStr = currentValue?.toString() || ''
                const newStr = value?.toString() || ''
                if (currentStr !== newStr) {
                    form.setValue(key as any, value as any, { shouldValidate: false, shouldDirty: false })
                    }
                } catch (error) {
                    // Silently handle errors when field doesn't exist yet
                    console.warn(`Failed to update form field "${key}":`, error)
                }
            })
        }
    }, [defaultValues, form])

    return form
}

