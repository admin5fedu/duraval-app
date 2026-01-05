import { z } from "zod"

/**
 * Field type options for form fields
 */
export type FieldType = "text" | "number" | "email" | "date" | "select" | "combobox" | "multiselect-combobox" | "toggle" | "textarea" | "image" | "multiple-image" | "custom" | "phong-ban-select" | "cap-bac-select" | "loai-phieu-select" | "tinh-thanh-tsn-select" | "quan-huyen-tsn-select" | "phuong-xa-tsn-select" | "tinh-thanh-ssn-select" | "phuong-xa-snn-select" | "nhan-su-select" | "khach-buon-select" | "gps-location-input"

/**
 * Form field configuration
 */
export interface FormFieldConfig {
    name: string
    label: string
    type?: FieldType
    placeholder?: string
    description?: string
    options?: Array<{ label: string; value: string; disabled?: boolean }> // For select/toggle
    colSpan?: number // 1, 2, 3
    required?: boolean | ((formValues: any) => boolean)
    disabled?: boolean
    customComponent?: React.ComponentType<any> | React.ForwardRefExoticComponent<any>
    // For image type
    imageFolder?: string // Cloudinary folder
    imageMaxSize?: number // Max size in MB
    displayName?: string // For avatar fallback initials
    multiple?: boolean // For image type - allow multiple images
    // For multiple-image type
    // Uses same imageFolder and imageMaxSize as image type
    // For phong-ban-select and cap-bac-select type
    excludeIds?: number[] // IDs to exclude from selection
    // For number type
    min?: number // Minimum value
    max?: number // Maximum value
    formatThousands?: boolean // Format number with thousands separator
    allowDecimals?: boolean // Allow decimal values
    suffix?: string // Suffix text to display after the number (e.g., "%")
    // For combobox type
    allowCustom?: boolean // Allow entering custom values not in options
    // Conditional rendering
    hidden?: boolean | ((formValues: any) => boolean) // Hide field conditionally (can be a function that receives form values)
}

/**
 * Form section configuration
 */
export interface FormSection {
    title: string
    description?: string
    fields: FormFieldConfig[]
}

/**
 * Main props interface for GenericFormView component
 */
export interface GenericFormViewProps<T extends z.ZodType<any, any>> {
    title: string
    subtitle?: string
    schema: T
    defaultValues?: any
    sections: FormSection[]
    onSubmit: (data: z.infer<T>) => Promise<void>
    onSuccess?: () => void | Promise<void>
    onCancel?: () => void
    cancelUrl?: string
    submitLabel?: string
    successMessage?: string
    errorMessage?: string
    hideHeader?: boolean
    hideFooter?: boolean // Ẩn footer khi dùng trong dialog (để tránh duplicate với DialogFooter)
    children?: React.ReactNode // Optional children (e.g., field watchers)
}

/**
 * Props for FormFooterSection component
 */
export interface FormFooterSectionProps {
    onCancel: () => void
    submitLabel: string
    isSubmitting: boolean
}

