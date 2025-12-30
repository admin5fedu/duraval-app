import { z } from "zod"

/**
 * Field type options for form fields
 */
export type FieldType = "text" | "number" | "email" | "date" | "select" | "combobox" | "toggle" | "textarea" | "image" | "custom" | "phong-ban-select" | "cap-bac-select"

/**
 * Form field configuration
 */
export interface FormFieldConfig {
    name: string
    label: string
    type?: FieldType
    placeholder?: string
    description?: string
    options?: { label: string; value: string }[] // For select
    colSpan?: number // 1, 2, 3
    required?: boolean
    disabled?: boolean
    customComponent?: React.ComponentType<any> | React.ForwardRefExoticComponent<any>
    // For image type
    imageFolder?: string // Cloudinary folder
    imageMaxSize?: number // Max size in MB
    displayName?: string // For avatar fallback initials
    // For phong-ban-select and cap-bac-select type
    excludeIds?: number[] // IDs to exclude from selection
    // For number type
    min?: number // Minimum value
    max?: number // Maximum value
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

