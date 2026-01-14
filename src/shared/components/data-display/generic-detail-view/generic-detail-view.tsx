"use client"

import * as React from "react"
import { Edit, Trash2 } from "lucide-react"
import type { GenericDetailViewProps } from "./types"
import { useGenericDetailState } from "./hooks/use-generic-detail-state"
import { DetailHeaderSection } from "./sections/detail-header-section"
import { DetailSections } from "./sections/detail-sections"
import { DetailDeleteDialog } from "./sections/detail-delete-dialog"
import { DetailLoadingState } from "./sections/detail-loading-state"
import { DetailEmptyState } from "./sections/detail-empty-state"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { ActionGroup } from "@/shared/components/actions"

/**
 * GenericDetailView Component
 * 
 * A comprehensive detail view component for React ERP applications.
 * Displays data in a structured format with sections, fields, and actions.
 * 
 * @example
 * ```tsx
 * <GenericDetailView
 *   data={userData}
 *   id={userId}
 *   config={{
 *     backPath: "/users",
 *     editPath: "/users/{id}/edit",
 *     titleField: "name",
 *     fieldMappings: {
 *       email: { label: "Email", type: "email" },
 *       phone: { label: "Phone", type: "phone" },
 *     },
 *   }}
 * />
 * ```
 */
export function GenericDetailView<T extends Record<string, any>>({
    data,
    id,
    config,
    isLoading = false,
    mode = "page",
}: GenericDetailViewProps<T>) {
    // 1. Manage state and handlers
    const {
        title,
        subtitle,
        avatarUrl,
        sections,
        deleteConfirmOpen,
        setDeleteConfirmOpen,
        isDeleting,
        handleBack,
        handleEdit,
        handleDelete,
    } = useGenericDetailState(data, id, config)

    const isMobile = useIsMobile()

    // 2. Render actions (moved from hook to component to avoid JSX in .ts file)
    const renderActions = React.useCallback(() => {
        if (config.renderActions) {
            return config.renderActions(data, id)
        }

        const actions = []

        if (config.editPath) {
            actions.push({
                label: "Sửa",
                onClick: handleEdit,
                level: "primary" as const,
                icon: Edit,
            })
        }

        if (config.onDelete) {
            actions.push({
                label: "Xóa",
                onClick: () => setDeleteConfirmOpen(true),
                variant: "destructive" as const,
                icon: Trash2,
            })
        }

        if (actions.length === 0) return null

        return (
            <ActionGroup
                actions={actions}
                className={cn(isMobile && "[&_button]:h-10 [&_button]:text-base")}
            />
        )
    }, [config.renderActions, config.editPath, config.onDelete, data, id, handleEdit, setDeleteConfirmOpen, isMobile])

    // 3. Render loading state
    if (isLoading) {
        return <DetailLoadingState />
    }

    // 4. Render empty state
    if (!sections || sections.length === 0) {
        return <DetailEmptyState onBack={handleBack} />
    }

    // 5. Render main content
    return (
        <>
            <DetailHeaderSection
                title={title}
                subtitle={subtitle}
                avatarUrl={avatarUrl}
                onBack={handleBack}
                actions={renderActions()}
            />

            <DetailSections sections={sections} mode={mode} />

            <DetailDeleteDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onDelete={handleDelete}
                isDeleting={isDeleting}
            />
        </>
    )
}

