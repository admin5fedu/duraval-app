import * as React from "react"

/**
 * Detail field configuration
 */
export interface DetailField {
    label: string
    key: string
    value: string | number | null | undefined
    type?: "text" | "badge" | "date" | "status" | "email" | "phone" | "number" | "currency" | "url" | "image"
    colSpan?: 1 | 2 | 3
    format?: (value: any) => string | React.ReactNode
    link?: string
    displayName?: string // For image type - avatar fallback initials
}

/**
 * Detail section configuration
 */
export interface DetailSection {
    title: string
    description?: string
    fields: DetailField[]
    icon?: React.ComponentType<{ className?: string }>
}

/**
 * Generic detail view configuration
 */
export interface GenericDetailConfig {
    backPath: string
    editPath?: string
    onDelete?: (id: string | number) => Promise<void> | void
    idField?: string
    titleField?: string
    subtitleField?: string
    avatarField?: string
    fieldMappings?: Record<string, {
        label: string
        type?: DetailField["type"]
        colSpan?: DetailField["colSpan"]
        format?: DetailField["format"]
        hide?: (value: any) => boolean
    }>
    sections?: DetailSection[]
    renderActions?: (data: any, id: string | number) => React.ReactNode
}

/**
 * Main props interface for GenericDetailView component
 */
export interface GenericDetailViewProps<T = Record<string, any>> {
    data: T
    id: string | number
    config: GenericDetailConfig
    isLoading?: boolean
}

/**
 * Return type for useGenericDetailState hook
 */
export interface UseGenericDetailStateReturn {
    title: string
    subtitle: string | undefined
    avatarUrl: string | null | undefined
    sections: DetailSection[]
    deleteConfirmOpen: boolean
    setDeleteConfirmOpen: (open: boolean) => void
    isDeleting: boolean
    setIsDeleting: (deleting: boolean) => void
    handleBack: () => void
    handleEdit: () => void
    handleDelete: () => Promise<void>
}

/**
 * Props for DetailHeaderSection component
 */
export interface DetailHeaderSectionProps {
    title: string
    subtitle?: string
    avatarUrl?: string | null
    onBack: () => void
    actions: React.ReactNode | null
}

/**
 * Props for DetailSections component
 */
export interface DetailSectionsProps {
    sections: DetailSection[]
}

/**
 * Props for DetailDeleteDialog component
 */
export interface DetailDeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onDelete: () => Promise<void>
    isDeleting: boolean
}

/**
 * Props for DetailLoadingState component
 */
export interface DetailLoadingStateProps {
    // No props needed
}

/**
 * Props for DetailEmptyState component
 */
export interface DetailEmptyStateProps {
    onBack: () => void
}

