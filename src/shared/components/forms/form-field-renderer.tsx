"use client"

import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    useFormField,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { NumberInput } from "@/components/ui/number-input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { FormFieldConfig } from "./generic-form-view/"
import { ComboboxFormField } from "./combobox-form-field"
import { ToggleButtonFormField } from "./toggle-button-form-field"
import { MultipleImageUploadFormField } from "./multiple-image-upload-form-field"
import { InlineImageUpload } from "@/components/ui/inline-image-upload"
import { PhongBanSelect } from "@/components/ui/phong-ban-select"
import { CapBacSelectFormField } from "@/components/ui/cap-bac-select-form-field"
import { LoaiPhieuSelect } from "@/components/ui/loai-phieu-select"
import { TinhThanhTSNSelect } from "@/components/ui/tinh-thanh-tsn-select"
import { QuanHuyenTSNSelect } from "@/components/ui/quan-huyen-tsn-select"
import { TinhThanhSSNSelect } from "@/components/ui/tinh-thanh-ssn-select"
import { SPACING } from "@/shared/constants/spacing"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface FormFieldRendererProps {
    field: FormFieldConfig
    form: UseFormReturn<any>
}

// Wrapper component để lấy formItemId và name từ useFormField và truyền vào ToggleButtonFormField
function ToggleButtonFormFieldWithId({
    value,
    onChange,
    options,
    disabled,
    onBlur,
}: {
    value: string
    onChange: (value: string) => void
    options: Array<{ label: string; value: string }>
    disabled?: boolean
    onBlur?: () => void
}) {
    const { formItemId, name } = useFormField()
    return (
        <ToggleButtonFormField
            id={formItemId}
            name={name}
            value={value}
            onChange={onChange}
            options={options}
            disabled={disabled}
            onBlur={onBlur}
        />
    )
}

// Wrapper component để lấy formItemId từ useFormField và truyền vào custom component
function CustomFormFieldWithId({
    component: Component,
    formField,
    field,
}: {
    component: React.ComponentType<any>
    formField: any
    field: FormFieldConfig
}) {
    const { formItemId } = useFormField()
    return (
        <Component
            {...formField}
            id={formItemId} // Override id với formItemId
            name={field.name}
            label={field.label}
            disabled={field.disabled}
            placeholder={field.placeholder}
            description={field.description}
        />
    )
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
                                {field.type === "image" && field.multiple ? (
                                    <div>
                                        <MultipleImageUploadFormField
                                            value={formField.value}
                                            onChange={(urls: string[]) => {
                                                if (field.disabled) return
                                                formField.onChange(urls)
                                            }}
                                            disabled={field.disabled}
                                            folder={field.imageFolder}
                                            displayName={field.displayName || field.label}
                                            maxSize={field.imageMaxSize}
                                        />
                                    </div>
                                ) : field.type === "image" ? (
                                    <div>
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
                                    </div>
                                ) : field.type === "multiple-image" ? (
                                    <div>
                                        <MultipleImageUploadFormField
                                            value={formField.value}
                                            onChange={(urls: string[]) => {
                                                if (field.disabled) return
                                                formField.onChange(urls)
                                            }}
                                            disabled={field.disabled}
                                            folder={field.imageFolder || "uploads"}
                                            maxSize={field.imageMaxSize || 10}
                                        />
                                    </div>
                                ) : field.type === "combobox" ? (
                                    <ComboboxFormField
                                        {...formField}
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
                                    <ToggleButtonFormFieldWithId
                                        value={formField.value ? String(formField.value) : ""}
                                        onChange={(value) => {
                                            if (field.disabled) return
                                            formField.onChange(value === "" ? null : value)
                                        }}
                                        options={field.options || []}
                                        disabled={field.disabled}
                                        onBlur={formField.onBlur}
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
                                            name={formField.name}
                                            onBlur={formField.onBlur}
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
                                        {...formField}
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
                                ) : field.type === "loai-phieu-select" ? (
                                    <LoaiPhieuSelect
                                        {...formField}
                                        value={formField.value ? Number(formField.value) : null}
                                        onChange={(id) => {
                                            if (field.disabled) return
                                            formField.onChange(id)
                                        }}
                                        placeholder={field.placeholder || "Chọn loại phiếu..."}
                                        searchPlaceholder={field.description || "Tìm kiếm theo tên loại phiếu..."}
                                        disabled={field.disabled}
                                        excludeIds={field.excludeIds || []}
                                    />
                                ) : field.type === "tinh-thanh-tsn-select" ? (
                                    <TinhThanhTSNSelect
                                        {...formField}
                                        value={formField.value?.tinh_thanh_id ? Number(formField.value.tinh_thanh_id) : null}
                                        onChange={(id, data) => {
                                            if (field.disabled) return
                                            if (id && data) {
                                                formField.onChange({
                                                    tinh_thanh_id: id,
                                                    ma_tinh_thanh: data.ma_tinh_thanh,
                                                    ten_tinh_thanh: data.ten_tinh_thanh,
                                                })
                                                // Auto-fill ma_tinh_thanh field with format "Mã - Tên"
                                                form.setValue("ma_tinh_thanh", `${data.ma_tinh_thanh} - ${data.ten_tinh_thanh}`, { shouldValidate: true })
                                            } else {
                                                formField.onChange(null)
                                                form.setValue("ma_tinh_thanh", "", { shouldValidate: true })
                                            }
                                        }}
                                        placeholder={field.placeholder || "Chọn tỉnh thành..."}
                                        searchPlaceholder={field.description || "Tìm kiếm theo tên hoặc mã tỉnh thành..."}
                                        disabled={field.disabled}
                                    />
                                ) : field.type === "tinh-thanh-ssn-select" ? (
                                    <TinhThanhSSNSelect
                                        {...formField}
                                        value={formField.value?.tinh_thanh_id ? Number(formField.value.tinh_thanh_id) : null}
                                        onChange={(id, data) => {
                                            if (field.disabled) return
                                            if (id && data) {
                                                formField.onChange({
                                                    tinh_thanh_id: id,
                                                    ma_tinh_thanh: data.ma_tinh_thanh,
                                                    ten_tinh_thanh: data.ten_tinh_thanh,
                                                })
                                                // Auto-fill ma_tinh_thanh field with format "Mã - Tên"
                                                form.setValue("ma_tinh_thanh", `${data.ma_tinh_thanh} - ${data.ten_tinh_thanh}`, { shouldValidate: true })
                                            } else {
                                                formField.onChange(null)
                                                form.setValue("ma_tinh_thanh", "", { shouldValidate: true })
                                            }
                                        }}
                                        placeholder={field.placeholder || "Chọn tỉnh thành..."}
                                        searchPlaceholder={field.description || "Tìm kiếm theo tên hoặc mã tỉnh thành..."}
                                        disabled={field.disabled}
                                    />
                                ) : field.type === "quan-huyen-tsn-select" ? (
                                    <QuanHuyenTSNSelect
                                        {...formField}
                                        value={formField.value?.quan_huyen_id ? Number(formField.value.quan_huyen_id) : null}
                                        onChange={(id, data) => {
                                            if (field.disabled) return
                                            if (id && data) {
                                                formField.onChange({
                                                    quan_huyen_id: id,
                                                    ma_quan_huyen: data.ma_quan_huyen,
                                                    ten_quan_huyen: data.ten_quan_huyen,
                                                    ma_tinh_thanh: data.ma_tinh_thanh,
                                                    ten_tinh_thanh: data.ten_tinh_thanh,
                                                    tinh_thanh_id: data.tinh_thanh_id || null,
                                                })
                                                // Auto-fill fields
                                                form.setValue("ma_quan_huyen", `${data.ma_quan_huyen} - ${data.ten_quan_huyen}`, { shouldValidate: true })
                                                if (data.ma_tinh_thanh && data.ten_tinh_thanh) {
                                                    form.setValue("ma_tinh_thanh", `${data.ma_tinh_thanh} - ${data.ten_tinh_thanh}`, { shouldValidate: true })
                                                }
                                            } else {
                                                formField.onChange(null)
                                                form.setValue("ma_quan_huyen", "", { shouldValidate: true })
                                                form.setValue("ma_tinh_thanh", "", { shouldValidate: true })
                                            }
                                        }}
                                        placeholder={field.placeholder || "Chọn quận huyện..."}
                                        searchPlaceholder={field.description || "Tìm kiếm theo tên hoặc mã quận huyện..."}
                                        disabled={field.disabled}
                                    />
                                ) : field.type === "custom" && field.customComponent ? (
                                    <CustomFormFieldWithId
                                        component={field.customComponent}
                                        formField={formField}
                                        field={field}
                                    />
                                ) : field.type === "number" && ((field.name === "diem" || field.name === "tien") || field.formatThousands || field.suffix) ? (
                                    <NumberInput
                                        {...formField}
                                        value={formField.value !== null && formField.value !== undefined ? formField.value : undefined}
                                        onChange={(value) => {
                                            if (field.disabled) return
                                            formField.onChange(value)
                                        }}
                                        placeholder={field.placeholder}
                                        disabled={field.disabled}
                                        min={field.min !== undefined ? field.min : 0}
                                        allowDecimals={field.allowDecimals !== undefined ? field.allowDecimals : false}
                                        formatThousands={field.formatThousands || true}
                                        formatOnBlur={true}
                                        suffix={field.suffix}
                                        className={cn(
                                            isMobile && "h-11 text-base"
                                        )}
                                    />
                                ) : (
                                    <Input
                                        {...formField}
                                        type={field.type === "date" ? "date" : field.type === "email" ? "email" : field.type === "number" ? "number" : "text"}
                                        value={formField.value !== null && formField.value !== undefined ? formField.value : ''}
                                        placeholder={field.placeholder}
                                        disabled={field.disabled}
                                        readOnly={field.disabled}
                                        min={field.type === "number" ? (field.min !== undefined ? field.min : (field.name === "so_luong_cho_phep_thang" || field.name === "diem" || field.name === "tien") ? 0 : undefined) : undefined}
                                        max={field.type === "number" ? field.max : undefined}
                                        className={cn(
                                            isMobile && "h-11 text-base",
                                            field.disabled && "bg-muted cursor-not-allowed"
                                        )}
                                        onChange={e => {
                                            if (field.disabled) return
                                            if (field.type === 'number') {
                                                const numValue = e.target.valueAsNumber
                                                // Validate min/max if specified
                                                if (field.min !== undefined && !isNaN(numValue) && numValue < field.min) {
                                                    formField.onChange(field.min)
                                                    return
                                                }
                                                if (field.max !== undefined && !isNaN(numValue) && numValue > field.max) {
                                                    formField.onChange(field.max)
                                                    return
                                                }
                                                if ((field.name === "so_luong_cho_phep_thang" || field.name === "diem" || field.name === "tien") && numValue < 0) {
                                                    formField.onChange(0)
                                                } else {
                                                    formField.onChange(isNaN(numValue) ? null : numValue)
                                                }
                                            } else {
                                                formField.onChange(e.target.value)
                                            }
                                        }}
                                        onBlur={e => {
                                            if (field.type === 'number') {
                                                const numValue = e.target.valueAsNumber
                                                // Validate min/max on blur
                                                if (field.min !== undefined && !isNaN(numValue) && numValue < field.min) {
                                                    formField.onChange(field.min)
                                                    return
                                                }
                                                if (field.max !== undefined && !isNaN(numValue) && numValue > field.max) {
                                                    formField.onChange(field.max)
                                                    return
                                                }
                                                if (field.name === "so_luong_cho_phep_thang") {
                                                    if (isNaN(numValue) || numValue < 0) {
                                                        formField.onChange(0)
                                                    }
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
