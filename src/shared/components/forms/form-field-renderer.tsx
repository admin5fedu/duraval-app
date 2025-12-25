"use client"

import * as React from "react"
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { FormFieldConfig } from "./generic-form-view/"
import { ComboboxFormField } from "./combobox-form-field"
import { SPACING } from "@/shared/constants/spacing"
import { cn } from "@/lib/utils"

interface FormFieldRendererProps {
    field: FormFieldConfig
    form: UseFormReturn<any>
}

/**
 * Component để render các field types khác nhau trong form
 */
export function FormFieldRenderer({ field, form }: FormFieldRendererProps) {
    return (
        <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => {
                const colSpanClass = field.colSpan 
                    ? `col-span-1 md:col-span-${Math.min(field.colSpan, 2)} lg:col-span-${field.colSpan}` 
                    : "col-span-1"
                
                return (
                    <FormItem className={colSpanClass}>
                        <div className={cn("flex flex-col w-full", SPACING.gap.sm)}>
                            <FormLabel className="flex items-center justify-between gap-1">
                                <span>{field.label}</span>
                                {field.required && <span className="text-destructive">*</span>}
                            </FormLabel>
                            <FormControl>
                                {field.type === "combobox" ? (
                                    <ComboboxFormField
                                        value={String(formField.value || '')}
                                        onChange={(value) => {
                                            if (field.disabled) return
                                            formField.onChange(value)
                                        }}
                                        options={field.options || []}
                                        placeholder={field.placeholder || "Chọn..."}
                                        searchPlaceholder={field.description || "Tìm kiếm..."}
                                        disabled={field.disabled}
                                    />
                                ) : field.type === "select" ? (
                                    <Select 
                                        onValueChange={(value) => {
                                            if (field.disabled) return
                                            if (value === "" || value === "__empty__") {
                                                formField.onChange(null)
                                            } else {
                                                formField.onChange(value)
                                            }
                                        }} 
                                        value={formField.value && formField.value !== "" ? String(formField.value) : undefined}
                                        disabled={field.disabled}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={field.placeholder || "Chọn..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(field.options || [])
                                                .filter(option => option.value !== "")
                                                .map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                ) : field.type === "textarea" ? (
                                    <Textarea
                                        {...formField}
                                        value={formField.value || ''}
                                        placeholder={field.placeholder}
                                        rows={4}
                                        className="resize-none"
                                        disabled={field.disabled}
                                    />
                                ) : field.type === "custom" && field.customComponent ? (
                                    <field.customComponent
                                        value={formField.value}
                                        onChange={formField.onChange}
                                    />
                                ) : (
                                    <Input
                                        {...formField}
                                        type={field.type === "date" ? "date" : field.type === "email" ? "email" : field.type === "number" ? "number" : "text"}
                                        value={formField.value || ''}
                                        placeholder={field.placeholder}
                                        disabled={field.disabled}
                                        onChange={e => {
                                            if (field.disabled) return
                                            if (field.type === 'number') {
                                                const numValue = e.target.valueAsNumber
                                                formField.onChange(isNaN(numValue) ? null : numValue)
                                            } else {
                                                formField.onChange(e.target.value)
                                            }
                                        }}
                                    />
                                )}
                            </FormControl>
                            {field.description && <FormDescription>{field.description}</FormDescription>}
                            <FormMessage />
                        </div>
                    </FormItem>
                )
            }}
        />
    )
}

