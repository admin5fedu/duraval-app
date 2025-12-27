/**
 * Hook factory để tái sử dụng logic cho embedded list sections
 * 
 * Giúp giảm code duplication khi tạo nhiều embedded lists (người thân, tài liệu, ...)
 * 
 * @example
 * ```tsx
 * const relativesSection = useEmbeddedListSection({
 *   fetchData: (parentId) => useNguoiThanByMaNhanVien(parentId),
 *   schema: nguoiThanSchema,
 *   mutations: {
 *     create: useCreateNguoiThan(),
 *     update: useUpdateNguoiThan(),
 *     delete: useDeleteNguoiThan(),
 *   },
 *   getDetailSections: (item) => getDetailSections(item),
 *   formSections: formSections,
 *   columns: columns,
 *   parentId: maNhanVien,
 * })
 * ```
 */

import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import type { z } from "zod"
import type { DetailSection } from "@/shared/components"
import type { FormSection } from "@/shared/components/forms/generic-form-view"

interface UseEmbeddedListSectionConfig<TData, TParentId> {
    /** Hook để fetch data */
    fetchData: (parentId: TParentId) => { data: TData[] | undefined; isLoading: boolean }
    /** Zod schema cho validation */
    schema: z.ZodType<any, any>
    /** Mutations cho CRUD operations */
    mutations: {
        create: {
            mutateAsync: (data: any) => Promise<TData>
            isPending: boolean
        }
        update: {
            mutateAsync: (params: { id: number; data: any }) => Promise<TData>
            isPending: boolean
        }
        delete: {
            mutateAsync: (id: number) => Promise<void>
            isPending: boolean
        }
    }
    /** Function để tạo detail sections */
    getDetailSections: (item: TData) => DetailSection[]
    /** Form sections cho create/edit */
    formSections: FormSection[]
    /** Columns definition */
    columns: any[]
    /** Parent ID (e.g., maNhanVien) */
    parentId: TParentId
    /** Route path để redirect khi click view */
    routePath: string
    /** Storage key cho skip confirm */
    skipConfirmStorageKey: string
    /** Function để get item ID */
    getItemId: (item: TData) => number
    /** Function để get item name */
    getItemName: (item: TData) => string
    /** Function để sanitize form data (optional) */
    sanitizeData?: (data: any) => any
}

export function useEmbeddedListSection<TData, TParentId>({
    fetchData,
    schema,
    mutations,
    getDetailSections,
    formSections,
    columns,
    parentId,
    routePath,
    skipConfirmStorageKey,
    getItemId,
    getItemName,
    sanitizeData,
}: UseEmbeddedListSectionConfig<TData, TParentId>) {
    const navigate = useNavigate()
    const { data, isLoading } = fetchData(parentId)

    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [formDialogOpen, setFormDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<TData | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [itemToView, setItemToView] = useState<TData | null>(null)

    // Handlers
    const handleRowClick = (item: TData) => {
        setSelectedItem(item)
        setDetailDialogOpen(true)
    }

    const handleEyeClick = (item: TData) => {
        const itemId = getItemId(item)
        if (!itemId) return

        const skipConfirm =
            typeof window !== "undefined" &&
            window.localStorage.getItem(skipConfirmStorageKey) === "true"

        if (skipConfirm) {
            navigate(`${routePath}/${itemId}`)
            return
        }

        setItemToView(item)
        setViewConfirmOpen(true)
    }

    const handleAdd = () => {
        setSelectedItem(null)
        setIsEditMode(false)
        setFormDialogOpen(true)
    }

    const handleEdit = (item: TData) => {
        setSelectedItem(item)
        setIsEditMode(true)
        setFormDialogOpen(true)
    }

    const handleDelete = (item: TData) => {
        setSelectedItem(item)
        setDeleteDialogOpen(true)
    }

    const handleFormSubmit = async (formData: any) => {
        const sanitized = sanitizeData ? sanitizeData(formData) : formData

        if (isEditMode && selectedItem) {
            const itemId = getItemId(selectedItem)
            await mutations.update.mutateAsync({
                id: itemId,
                data: sanitized,
            })
        } else {
            await mutations.create.mutateAsync({
                ...sanitized,
                // Add parentId to data
            })
        }
    }

    const handleDeleteConfirm = async () => {
        if (!selectedItem) return
        const itemId = getItemId(selectedItem)
        await mutations.delete.mutateAsync(itemId)
    }

    return {
        // Data
        data: data || [],
        isLoading,
        columns,
        // State
        detailDialogOpen,
        formDialogOpen,
        deleteDialogOpen,
        viewConfirmOpen,
        selectedItem,
        isEditMode,
        itemToView,
        // Handlers
        handleRowClick,
        handleEyeClick,
        handleAdd,
        handleEdit,
        handleDelete,
        handleFormSubmit,
        handleDeleteConfirm,
        // Setters
        setDetailDialogOpen,
        setFormDialogOpen,
        setDeleteDialogOpen,
        setViewConfirmOpen,
        setSelectedItem,
        setIsEditMode,
        // Helpers
        getDetailSections,
        formSections,
        schema,
        routePath,
        skipConfirmStorageKey,
        getItemId,
        getItemName,
        isLoading: mutations.create.isPending || mutations.update.isPending || mutations.delete.isPending,
    }
}

