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
import { UseFormReturn, useWatch } from "react-hook-form"
import { FormFieldConfig } from "./generic-form-view/"
import { ComboboxFormField } from "./combobox-form-field"
import { ComboboxFormFieldWithCustom } from "./combobox-form-field-with-custom"
import { ToggleButtonFormField } from "./toggle-button-form-field"
import { MultipleImageUploadFormField } from "./multiple-image-upload-form-field"
import { InlineImageUpload } from "@/components/ui/inline-image-upload"
import { FileUploadSupabase } from "@/components/ui/file-upload-supabase"
import { PhongBanSelect } from "@/components/ui/phong-ban-select"
import { CapBacSelectFormField } from "@/components/ui/cap-bac-select-form-field"
import { LoaiPhieuSelect } from "@/components/ui/loai-phieu-select"
import { TinhThanhTSNSelect } from "@/components/ui/tinh-thanh-tsn-select"
import { QuanHuyenTSNSelect } from "@/components/ui/quan-huyen-tsn-select"
import { PhuongXaTSNSelect } from "@/components/ui/phuong-xa-tsn-select"
import { TinhThanhSSNSelect } from "@/components/ui/tinh-thanh-ssn-select"
import { PhuongXaSNNSelect } from "@/components/ui/phuong-xa-snn-select"
import { NhanSuSelect } from "@/components/ui/nhan-su-select"
import { KhachBuonSelect } from "@/components/ui/khach-buon-select"
import { MucDangKySelect } from "@/components/ui/muc-dang-ky-select"
import { MultiselectComboboxFormField } from "@/components/ui/multiselect-combobox-form-field"
import { GPSLocationInput } from "@/components/ui/gps-location-input"
import { SPACING } from "@/shared/constants/spacing"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface FormFieldRendererProps {
    field: FormFieldConfig
    form: UseFormReturn<any>
}

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

function MultiselectComboboxFormFieldWithId({
    value,
    onChange,
    options,
    disabled,
    onBlur,
}: {
    value: string[]
    onChange: (values: string[]) => void
    options: Array<{ label: string; value: string; disabled?: boolean }>
    disabled?: boolean
    onBlur?: () => void
}) {
    const { formItemId, name } = useFormField()
    return (
        <MultiselectComboboxFormField
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

function ComboboxFormFieldWithId({
    value,
    onChange,
    options,
    placeholder,
    searchPlaceholder,
    disabled,
    onBlur,
}: {
    value: string
    onChange: (value: string) => void
    options: Array<{ label: string; value: string }>
    placeholder?: string
    searchPlaceholder?: string
    disabled?: boolean
    onBlur?: () => void
}) {
    const { formItemId, name } = useFormField()
    return (
        <ComboboxFormField
            id={formItemId}
            name={name}
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
            disabled={disabled}
            onBlur={onBlur}
        />
    )
}

function ComboboxFormFieldWithCustomWithId({
    value,
    onChange,
    options,
    placeholder,
    searchPlaceholder,
    disabled,
    onBlur,
    allowCustom,
}: {
    value: string
    onChange: (value: string) => void
    options: Array<{ label: string; value: string }>
    placeholder?: string
    searchPlaceholder?: string
    disabled?: boolean
    onBlur?: () => void
    allowCustom?: boolean
}) {
    const { formItemId, name } = useFormField()
    return (
        <ComboboxFormFieldWithCustom
            id={formItemId}
            name={name}
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
            disabled={disabled}
            onBlur={onBlur}
            allowCustom={allowCustom}
        />
    )
}

function KhachBuonSelectWithId({
    value,
    onChange,
    placeholder,
    searchPlaceholder,
    disabled,
    onBlur,
}: {
    value: number | null
    onChange: (id: number | null) => void
    placeholder?: string
    searchPlaceholder?: string
    disabled?: boolean
    onBlur?: () => void
}) {
    const { formItemId } = useFormField()
    return (
        <KhachBuonSelect
            id={formItemId}
            value={value}
            onChange={(id) => onChange(id)}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
            disabled={disabled}
            onBlur={onBlur}
        />
    )
}

function MucDangKySelectWithId({
    value,
    onChange,
    placeholder,
    searchPlaceholder,
    disabled,
    onBlur,
}: {
    value: number | null
    onChange: (id: number | null, data?: { ten_hang: string; ma_hang?: string }) => void
    placeholder?: string
    searchPlaceholder?: string
    disabled?: boolean
    onBlur?: () => void
}) {
    const { formItemId } = useFormField()
    return (
        <MucDangKySelect
            id={formItemId}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
            disabled={disabled}
            onBlur={onBlur}
        />
    )
}

// Wrapper component để auto-fill ten_muc_dang_ky khi chọn mức đăng ký
function MucDangKySelectWrapper({
    form,
    formField,
    field,
}: {
    form: UseFormReturn<any>
    formField: any
    field: FormFieldConfig
}) {
    return (
        <MucDangKySelectWithId
            value={formField.value ? Number(formField.value) : null}
            onChange={(id, data) => {
                if (field.disabled) return
                formField.onChange(id)
                // Auto-fill ten_muc_dang_ky field
                if (id && data) {
                    form.setValue("ten_muc_dang_ky", data.ten_hang || "", { shouldValidate: false })
                } else {
                    form.setValue("ten_muc_dang_ky", "", { shouldValidate: false })
                }
            }}
            placeholder={field.placeholder || "Chọn mức đăng ký..."}
            searchPlaceholder={field.description || "Tìm kiếm theo tên hoặc mã hạng..."}
            disabled={field.disabled}
            onBlur={formField.onBlur}
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
            ref={formField.ref} // Forward ref from formField
            id={formItemId} // Override id với formItemId
            name={field.name}
            label={field.label}
            disabled={field.disabled}
            placeholder={field.placeholder}
            description={field.description}
        />
    )
}

// Wrapper component để reactively watch tsn_tinh_thanh_id và truyền vào QuanHuyenTSNSelect
function QuanHuyenTSNSelectWrapper({
    form,
    formField,
    field,
}: {
    form: UseFormReturn<any>
    formField: any
    field: FormFieldConfig
}) {
    // Reactively watch tsn_tinh_thanh_id để component tự động update khi tỉnh thành thay đổi
    const tinhThanhId = useWatch({
        control: form.control,
        name: "tsn_tinh_thanh_id",
    })

    return (
        <QuanHuyenTSNSelect
            {...formField}
            value={formField.value ? Number(formField.value) : null}
            tinhThanhId={tinhThanhId ? Number(tinhThanhId) : null}
            onChange={(id, data) => {
                if (field.disabled) return
                if (id && data) {
                    formField.onChange(id)
                    // Auto-fill tsn_ten_quan_huyen field
                    form.setValue("tsn_ten_quan_huyen", data.ten_quan_huyen || "", { shouldValidate: false })
                    // Also update tsn_ten_tinh_thanh if provided
                    if (data.ten_tinh_thanh) {
                        form.setValue("tsn_ten_tinh_thanh", data.ten_tinh_thanh, { shouldValidate: false })
                    }
                    // Reset phuong xa when quan huyen changes
                    form.setValue("tsn_phuong_xa_id", null, { shouldValidate: false })
                    form.setValue("tsn_ten_phuong_xa", "", { shouldValidate: false })
                } else {
                    formField.onChange(null)
                    form.setValue("tsn_ten_quan_huyen", "", { shouldValidate: false })
                    form.setValue("tsn_phuong_xa_id", null, { shouldValidate: false })
                    form.setValue("tsn_ten_phuong_xa", "", { shouldValidate: false })
                }
            }}
            placeholder={field.placeholder || "Chọn quận huyện..."}
            searchPlaceholder={field.description || "Tìm kiếm theo tên hoặc mã quận huyện..."}
            disabled={field.disabled}
        />
    )
}

// Wrapper component để reactively watch tsn_quan_huyen_id và truyền vào PhuongXaTSNSelect
function PhuongXaTSNSelectWrapper({
    form,
    formField,
    field,
}: {
    form: UseFormReturn<any>
    formField: any
    field: FormFieldConfig
}) {
    // Reactively watch tsn_quan_huyen_id để component tự động update khi quận huyện thay đổi
    const quanHuyenId = useWatch({
        control: form.control,
        name: "tsn_quan_huyen_id",
    })

    return (
        <PhuongXaTSNSelect
            {...formField}
            value={formField.value ? Number(formField.value) : null}
            quanHuyenId={quanHuyenId ? Number(quanHuyenId) : null}
            onChange={(id, data) => {
                if (field.disabled) return
                if (id && data) {
                    formField.onChange(id)
                    // Auto-fill tsn_ten_phuong_xa field
                    form.setValue("tsn_ten_phuong_xa", data.ten_phuong_xa || "", { shouldValidate: false })
                    // Also update tsn_ten_quan_huyen if provided
                    if (data.ten_quan_huyen) {
                        form.setValue("tsn_ten_quan_huyen", data.ten_quan_huyen, { shouldValidate: false })
                    }
                } else {
                    formField.onChange(null)
                    form.setValue("tsn_ten_phuong_xa", "", { shouldValidate: false })
                }
            }}
            placeholder={field.placeholder || "Chọn phường xã..."}
            searchPlaceholder={field.description || "Tìm kiếm theo tên hoặc mã phường xã..."}
            disabled={field.disabled}
        />
    )
}

// Wrapper component để reactively watch ssn_tinh_thanh_id và truyền vào PhuongXaSNNSelect
function PhuongXaSNNSelectWrapper({
    form,
    formField,
    field,
}: {
    form: UseFormReturn<any>
    formField: any
    field: FormFieldConfig
}) {
    // Reactively watch ssn_tinh_thanh_id để component tự động update khi tỉnh thành thay đổi
    const tinhThanhId = useWatch({
        control: form.control,
        name: "ssn_tinh_thanh_id",
    })

    const valueId = formField.value 
        ? (typeof formField.value === 'number' ? formField.value : (typeof formField.value === 'object' && formField.value !== null && 'id' in formField.value ? (formField.value as any).id : Number(formField.value)))
        : null
    
    return (
        <PhuongXaSNNSelect
            {...formField}
            value={valueId}
            tinhThanhId={tinhThanhId ? Number(tinhThanhId) : null}
            onChange={(id, data) => {
                if (field.disabled) return
                if (id && data) {
                    formField.onChange(id)
                    // Auto-fill ssn_ten_phuong_xa field
                    form.setValue("ssn_ten_phuong_xa", data.ten_phuong_xa || "", { shouldValidate: false })
                    // Also update ssn_ten_tinh_thanh if provided
                    if (data.ten_tinh_thanh) {
                        form.setValue("ssn_ten_tinh_thanh", data.ten_tinh_thanh, { shouldValidate: false })
                    }
                } else {
                    formField.onChange(null)
                    form.setValue("ssn_ten_phuong_xa", "", { shouldValidate: false })
                }
            }}
            placeholder={field.placeholder || "Chọn phường xã..."}
            searchPlaceholder={field.description || "Tìm kiếm theo tên hoặc mã phường xã..."}
            disabled={field.disabled}
        />
    )
}

export function FormFieldRenderer({ field, form }: FormFieldRendererProps) {
    const isMobile = useIsMobile()
    
    // Watch form values for conditional required
    const formValues = useWatch({ control: form.control })
    
    // Determine if field is required (support both boolean and function)
    const isRequired = typeof field.required === 'function' 
        ? field.required(formValues) 
        : field.required === true
    
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
                                {isRequired && (
                                    <span className={cn(
                                        "text-destructive",
                                        isMobile && "text-xs"
                                    )}>*</span>
                                )}
                            </FormLabel>
                            {field.description && (
                                <FormDescription className={cn(
                                    isMobile && "text-xs"
                                )}>
                                    {field.description}
                                </FormDescription>
                            )}
                            <FormControl>
                                {field.type === "textarea" ? (
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
                                ) : field.type === "combobox" ? (
                                    (field as any).allowCustom ? (
                                        <ComboboxFormFieldWithCustomWithId
                                            value={String(formField.value || '')}
                                            onChange={(value) => {
                                                if (field.disabled) return
                                                formField.onChange(value)
                                            }}
                                            options={field.options || []}
                                            placeholder={field.placeholder || "Chọn hoặc nhập..."}
                                            searchPlaceholder={field.description || "Tìm kiếm hoặc nhập mới..."}
                                            disabled={field.disabled}
                                            allowCustom={true}
                                            onBlur={formField.onBlur}
                                        />
                                    ) : (
                                        <ComboboxFormFieldWithId
                                            value={String(formField.value || '')}
                                            onChange={(value) => {
                                                if (field.disabled) return
                                                formField.onChange(value)
                                            }}
                                            options={field.options || []}
                                            placeholder={field.placeholder || "Chọn..."}
                                            searchPlaceholder={field.description || "Tìm kiếm..."}
                                            disabled={field.disabled}
                                            onBlur={formField.onBlur}
                                        />
                                    )
                                ) : field.type === "multiselect-combobox" ? (
                                    <MultiselectComboboxFormFieldWithId
                                        value={Array.isArray(formField.value) ? formField.value : (formField.value ? String(formField.value).split(',').filter(Boolean) : [])}
                                        onChange={(values) => {
                                            if (field.disabled) return
                                            // Store as comma-separated string
                                            formField.onChange(values.length > 0 ? values.join(',') : null)
                                        }}
                                        options={field.options || []}
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
                                ) : field.type === "date" ? (
                                    <Input
                                        {...formField}
                                        type="date"
                                        value={formField.value || ''}
                                        placeholder={field.placeholder}
                                        disabled={field.disabled}
                                        className={cn(
                                            isMobile && "h-11 text-base"
                                        )}
                                    />
                                ) : field.type === "email" ? (
                                    <Input
                                        {...formField}
                                        type="email"
                                        value={formField.value || ''}
                                        placeholder={field.placeholder}
                                        disabled={field.disabled}
                                        className={cn(
                                            isMobile && "h-11 text-base"
                                        )}
                                    />
                                ) : field.type === "gps-location-input" ? (
                                    <GPSLocationInput
                                        {...formField}
                                        value={formField.value || ''}
                                        onChange={(value) => {
                                            if (field.disabled) return
                                            formField.onChange(value)
                                        }}
                                        placeholder={field.placeholder}
                                        disabled={field.disabled}
                                        onBlur={formField.onBlur}
                                    />
                                ) : field.type === "image" ? (
                                    <InlineImageUpload
                                        {...formField}
                                        value={formField.value || ''}
                                        onChange={(url) => {
                                            if (field.disabled) return
                                            formField.onChange(url)
                                        }}
                                        folder={field.imageFolder || "uploads"}
                                        maxSize={field.imageMaxSize || 5}
                                        displayName={field.displayName}
                                        disabled={field.disabled}
                                    />
                                ) : field.type === "multiple-image" ? (
                                    <MultipleImageUploadFormField
                                        {...formField}
                                        value={Array.isArray(formField.value) ? formField.value : (formField.value ? [formField.value] : [])}
                                        onChange={(urls: string[]) => {
                                            if (field.disabled) return
                                            formField.onChange(urls)
                                        }}
                                        folder={field.imageFolder || "uploads"}
                                        maxSize={field.imageMaxSize || 5}
                                        disabled={field.disabled}
                                    />
                                ) : field.type === "file" || field.type === "file-supabase" ? (
                                    <FileUploadSupabase
                                        {...formField}
                                        value={formField.value || ''}
                                        onChange={(url) => {
                                            if (field.disabled) return
                                            formField.onChange(url)
                                        }}
                                        accept={field.accept || "*/*"}
                                        maxSize={field.maxSize || 50}
                                        folder={field.folder}
                                        bucket={field.bucket || "duraval_file"}
                                        displayName={field.displayName || "file"}
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
                                        value={formField.value ? Number(formField.value) : null}
                                        onChange={(id, data) => {
                                            if (field.disabled) return
                                            if (id && data) {
                                                formField.onChange(id)
                                                // Auto-fill tsn_ten_tinh_thanh field
                                                form.setValue("tsn_ten_tinh_thanh", data.ten_tinh_thanh || "", { shouldValidate: false })
                                                // Reset quan huyen and phuong xa when tinh thanh changes
                                                form.setValue("tsn_quan_huyen_id", null, { shouldValidate: false })
                                                form.setValue("tsn_ten_quan_huyen", "", { shouldValidate: false })
                                                form.setValue("tsn_phuong_xa_id", null, { shouldValidate: false })
                                                form.setValue("tsn_ten_phuong_xa", "", { shouldValidate: false })
                                            } else {
                                                formField.onChange(null)
                                                form.setValue("tsn_ten_tinh_thanh", "", { shouldValidate: false })
                                                form.setValue("tsn_quan_huyen_id", null, { shouldValidate: false })
                                                form.setValue("tsn_ten_quan_huyen", "", { shouldValidate: false })
                                                form.setValue("tsn_phuong_xa_id", null, { shouldValidate: false })
                                                form.setValue("tsn_ten_phuong_xa", "", { shouldValidate: false })
                                            }
                                        }}
                                        placeholder={field.placeholder || "Chọn tỉnh thành..."}
                                        searchPlaceholder={field.description || "Tìm kiếm theo tên hoặc mã tỉnh thành..."}
                                        disabled={field.disabled}
                                    />
                                ) : field.type === "tinh-thanh-ssn-select" ? (
                                    <TinhThanhSSNSelect
                                        {...formField}
                                        value={formField.value ? Number(formField.value) : null}
                                        onChange={(id, data) => {
                                            if (field.disabled) return
                                            if (id && data) {
                                                formField.onChange(id)
                                                // Auto-fill ssn_ten_tinh_thanh field
                                                form.setValue("ssn_ten_tinh_thanh", data.ten_tinh_thanh || "", { shouldValidate: false })
                                                // Reset phuong xa when tinh thanh changes
                                                form.setValue("ssn_phuong_xa_id", null, { shouldValidate: false })
                                                form.setValue("ssn_ten_phuong_xa", "", { shouldValidate: false })
                                            } else {
                                                formField.onChange(null)
                                                form.setValue("ssn_ten_tinh_thanh", "", { shouldValidate: false })
                                                form.setValue("ssn_phuong_xa_id", null, { shouldValidate: false })
                                                form.setValue("ssn_ten_phuong_xa", "", { shouldValidate: false })
                                            }
                                        }}
                                        placeholder={field.placeholder || "Chọn tỉnh thành..."}
                                        searchPlaceholder={field.description || "Tìm kiếm theo tên hoặc mã tỉnh thành..."}
                                        disabled={field.disabled}
                                    />
                                ) : field.type === "quan-huyen-tsn-select" ? (
                                    <QuanHuyenTSNSelectWrapper
                                        form={form}
                                        formField={formField}
                                        field={field}
                                    />
                                ) : field.type === "phuong-xa-tsn-select" ? (
                                    <PhuongXaTSNSelectWrapper
                                        form={form}
                                        formField={formField}
                                        field={field}
                                    />
                                ) : field.type === "phuong-xa-snn-select" ? (
                                    <PhuongXaSNNSelectWrapper
                                        form={form}
                                        formField={formField}
                                        field={field}
                                    />
                                ) : field.type === "nhan-su-select" ? (
                                    <NhanSuSelect
                                        {...formField}
                                        value={formField.value ? Number(formField.value) : null}
                                        onChange={(id, data) => {
                                            if (field.disabled) return
                                            formField.onChange(id)
                                            // Auto-fill corresponding name field based on field name
                                            if (id && data) {
                                                if (field.name === "tele_sale_id") {
                                                    form.setValue("ten_tele_sale", data.ten_nhan_su || "", { shouldValidate: false })
                                                } else if (field.name === "thi_truong_id") {
                                                    form.setValue("ten_thi_truong", data.ten_nhan_su || "", { shouldValidate: false })
                                                }
                                            } else {
                                                if (field.name === "tele_sale_id") {
                                                    form.setValue("ten_tele_sale", "", { shouldValidate: false })
                                                } else if (field.name === "thi_truong_id") {
                                                    form.setValue("ten_thi_truong", "", { shouldValidate: false })
                                                }
                                            }
                                        }}
                                        placeholder={field.placeholder || "Chọn nhân sự..."}
                                        searchPlaceholder={field.description || "Tìm kiếm theo tên hoặc mã nhân sự..."}
                                        disabled={field.disabled}
                                    />
                                ) : field.type === "khach-buon-select" ? (
                                    <KhachBuonSelectWithId
                                        value={formField.value ? Number(formField.value) : null}
                                        onChange={(id) => {
                                            if (field.disabled) return
                                            formField.onChange(id)
                                        }}
                                        placeholder={field.placeholder || "Chọn khách buôn..."}
                                        searchPlaceholder={field.description || "Tìm kiếm theo tên hoặc mã khách buôn..."}
                                        disabled={field.disabled}
                                        onBlur={formField.onBlur}
                                    />
                                ) : field.type === "muc-dang-ky-select" ? (
                                    <MucDangKySelectWrapper
                                        form={form}
                                        formField={formField}
                                        field={field}
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
                                        suffix={field.suffix}
                                        className={cn(
                                            isMobile && "h-11 text-base"
                                        )}
                                    />
                                ) : (
                                    <Input
                                        {...formField}
                                        value={formField.value || ''}
                                        placeholder={field.placeholder}
                                        disabled={field.disabled}
                                        type={field.type === "number" ? "number" : "text"}
                                        className={cn(
                                            isMobile && "h-11 text-base"
                                        )}
                                    />
                                )}
                            </FormControl>
                            <FormMessage className={cn(isMobile && "text-xs")} />
                        </div>
                    </FormItem>
                )
            }}
        />
    )
}
