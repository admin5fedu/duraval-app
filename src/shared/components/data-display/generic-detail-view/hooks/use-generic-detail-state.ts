"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import type {
    GenericDetailConfig,
    DetailSection,
    DetailField,
    UseGenericDetailStateReturn,
} from "../types"

/**
 * Hook to manage state and handlers for GenericDetailView
 */
export function useGenericDetailState<T extends Record<string, any>>(
    data: T,
    id: string | number,
    config: GenericDetailConfig
): UseGenericDetailStateReturn {
    const navigate = useNavigate()
    const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)

    // Extract fields from config
    const idField = config.idField || "id"
    const titleField = config.titleField || "name" || "ten"
    const subtitleField = config.subtitleField
    const avatarField = config.avatarField || "avatar_url" || "avatar"

    // Extract values from data
    const title = (data[titleField] as string) || String(id)
    const subtitle = subtitleField ? (data[subtitleField] as string | undefined) : undefined
    const avatarUrl = avatarField ? (data[avatarField] as string | null | undefined) : null

    // Generate sections
    const sections: DetailSection[] = React.useMemo(() => {
        if (config.sections) {
            return config.sections
        } else if (config.fieldMappings) {
            const fields: DetailField[] = Object.entries(config.fieldMappings)
                .filter(([key]) => {
                    const mapping = config.fieldMappings![key]
                    if (mapping.hide && mapping.hide(data[key])) {
                        return false
                    }
                    return true
                })
                .map(([key, mapping]) => ({
                    label: mapping.label,
                    key,
                    value: data[key],
                    type: mapping.type,
                    colSpan: mapping.colSpan,
                    format: mapping.format,
                }))

            return [{
                title: "Thông Tin Chi Tiết",
                fields,
            }]
        }
        return []
    }, [config.sections, config.fieldMappings, data])

    // Handlers
    const handleBack = React.useCallback(() => {
        navigate(config.backPath)
    }, [navigate, config.backPath])

    const handleEdit = React.useCallback(() => {
        if (config.editPath) {
            const editPath = config.editPath.replace("{id}", String(id))
            // Thêm query param returnTo=detail để form biết quay về detail khi hủy
            const separator = editPath.includes("?") ? "&" : "?"
            navigate(`${editPath}${separator}returnTo=detail`)
        }
    }, [navigate, config.editPath, id])

    const handleDelete = React.useCallback(async () => {
        if (!config.onDelete) return

        setIsDeleting(true)
        try {
            await config.onDelete(id)
            toast.success("Xóa thành công")
            navigate(config.backPath)
        } catch (error: any) {
            toast.error(error?.message || "Có lỗi xảy ra khi xóa")
        } finally {
            setIsDeleting(false)
            setDeleteConfirmOpen(false)
        }
    }, [config.onDelete, config.backPath, id, navigate])

    return {
        title,
        subtitle,
        avatarUrl,
        sections,
        deleteConfirmOpen,
        setDeleteConfirmOpen,
        isDeleting,
        setIsDeleting,
        handleBack,
        handleEdit,
        handleDelete,
    }
}

