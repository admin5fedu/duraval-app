"use client"

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
import { ToggleButtonFormField } from "./toggle-button-form-field"
import { InlineImageUpload } from "@/components/ui/inline-image-upload"
import { PhongBanSelect } from "@/components/ui/phong-ban-select"
import { CapBacSelectFormField } from "@/components/ui/cap-bac-select-form-field"
import { SPACING } from "@/shared/constants/spacing"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface FormFieldRendererProps {
    field: FormFieldConfig
    form: UseFormReturn<any>
}

/**
 * Component để render các field types khác nhau trong form
 * Tuân thủ pattern Shadcn/UI: FormItem -> FormLabel -> FormControl -> [Component]
 * FormControl sẽ tự động clone element con và truyền id, aria-describedby vào đó
 * Mobile-optimized: Larger touch targets, better spacing, full width on mobile
 */
export function FormFieldRenderer({ field, form }: FormFieldRendererProps) {
    const isMobile = useIsMobile()
    
    return (
        <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => {
                // Mobile: luôn full width, Desktop: theo colSpan
                const colSpanClass = isMobile 
                    ? "col-span-1" 
                    : field.colSpan 
                        ? `col-span-1 md:col-span-${Math.min(field.colSpan, 2)} lg:col-span-${field.colSpan}` 
                        : "col-span-1"
                
                return (
                    <FormItem className={colSpanClass}>
                        <div className={cn(
                            "flex flex-col w-full",
                            isMobile ? "gap-2" : SPACING.gap.sm
                        )}>
                            <FormLabel className={cn(
                                "flex items-center gap-1",
                                isMobile && "text-sm font-medium"
                            )}>
                                <span>{field.label}</span>
                                {field.required && (
                                    <span className={cn(
                                        "text-destructive",
                                        isMobile && "text-xs"
                                    )}>*</span>
                                )}
                            </FormLabel>
                            <FormControl>
                                {field.type === "image" ? (
                                    <InlineImageUpload
                                        value={formField.value}
                                        onChange={(url) => {
                                            if (field.disabled) return
                                            formField.onChange(url)
                                        }}
                                        disabled={field.disabled}
                                        folder={field.imageFolder}
                                        displayName={field.displayName || field.label}
                                        maxSize={field.imageMaxSize}
                                    />
                                ) : field.type === "combobox" ? (
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
                                ) : field.type === "toggle" ? (
                                    <ToggleButtonFormField
                                        value={formField.value ? String(formField.value) : ""}
                                        onChange={(value) => {
                                            if (field.disabled) return
                                            formField.onChange(value === "" ? null : value)
                                        }}
                                        options={field.options || []}
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
                                        <SelectTrigger 
                                            className={cn(
                                                "w-full",
                                                isMobile && "h-11 text-base"
                                            )}
                                        >
                                            <SelectValue placeholder={field.placeholder || "Chọn..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field.options
                                                ?.filter(option => option.value !== "")
                                                .map((option) => (
                                                    <SelectItem 
                                                        key={option.value} 
                                                        value={option.value}
                                                        className={isMobile ? "text-base py-3" : ""}
                                                    >
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
                                        rows={isMobile ? 5 : 4}
                                        className={cn(
                                            "resize-none",
                                            isMobile && "text-base"
                                        )}
                                        disabled={field.disabled}
                                    />
                                ) : field.type === "phong-ban-select" ? (
                                    <PhongBanSelect
                                        value={formField.value ? Number(formField.value) : null}
                                        onChange={(id) => {
                                            if (field.disabled) return
                                            formField.onChange(id)
                                        }}
                                        placeholder={field.placeholder || "Chọn phòng ban..."}
                                        searchPlaceholder={field.description || "Tìm kiếm theo tên hoặc mã phòng ban..."}
                                        disabled={field.disabled}
                                        excludeIds={field.excludeIds || []}
                                    />
                                ) : field.type === "cap-bac-select" ? (
                                    <CapBacSelectFormField
                                        field={formField}
                                        placeholder={field.placeholder || "Chọn cấp bậc..."}
                                        description={field.description || "Tìm kiếm theo tên hoặc mã cấp bậc..."}
                                        disabled={field.disabled}
                                        excludeIds={field.excludeIds || []}
                                    />
                                ) : field.type === "custom" && field.customComponent ? (
                                    <field.customComponent
                                        {...formField} // Truyền toàn bộ formField object (bao gồm ref, id, name, value, onChange, onBlur)
                                        name={field.name}
                                        label={field.label}
                                        disabled={field.disabled}
                                        placeholder={field.placeholder}
                                        description={field.description}
                                    />
                                ) : (
                                    <Input
                                        {...formField}
                                        type={field.type === "date" ? "date" : field.type === "email" ? "email" : field.type === "number" ? "number" : "text"}
                                        value={formField.value || ''}
                                        placeholder={field.placeholder}
                                        disabled={field.disabled}
                                        min={field.type === "number" && field.name === "so_luong_cho_phep_thang" ? 0 : undefined}
                                        className={cn(
                                            isMobile && "h-11 text-base"
                                        )}
                                        onChange={e => {
                                            if (field.disabled) return
                                            if (field.type === 'number') {
                                                const numValue = e.target.valueAsNumber
                                                if (field.name === "so_luong_cho_phep_thang" && numValue < 0) {
                                                    formField.onChange(0)
                                                } else {
                                                    formField.onChange(isNaN(numValue) ? null : numValue)
                                                }
                                            } else {
                                                formField.onChange(e.target.value)
                                            }
                                        }}
                                        onBlur={e => {
                                            if (field.type === 'number' && field.name === "so_luong_cho_phep_thang") {
                                                const numValue = e.target.valueAsNumber
                                                if (isNaN(numValue) || numValue < 0) {
                                                    formField.onChange(0)
                                                }
                                            }
                                        }}
                                    />
                                )}
                            </FormControl>
                            {field.description && (
                                <FormDescription className={cn(
                                    isMobile && "text-xs"
                                )}>
                                    {field.description}
                                </FormDescription>
                            )}
                            <FormMessage className={cn(
                                isMobile && "text-xs"
                            )} />
                        </div>
                    </FormItem>
                )
            }}
        />
    )
}
