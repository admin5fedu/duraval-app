/**
 * Hook để quản lý state và handlers cho EmbeddedListSection
 * Giảm duplicate code khi tạo embedded sections
 */

import { useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import type { DetailSection } from "@/shared/components"
import type { FormSection } from "@/shared/components/forms/generic-form-view"

export interface UseEmbeddedListSectionConfig<T> {
    /** Module config để navigate */
    moduleConfig: {
        routePath: string
    }
    /** Storage key để skip confirm dialog (optional) */
    viewDetailSkipConfirmStorageKey?: string
    /** Get detail sections function */
    getDetailSections: (item: T) => DetailSection[]
    /** Get form sections function */
    getFormSections: (selectedItem: T | null, isEditMode: boolean) => FormSection[]
    /** Form schema (Zod) */
    formSchema: any
    /** Get form default values */
    getFormDefaultValues: (selectedItem: T | null, isEditMode: boolean, parentData?: any) => any
    /** Handle form submit */
    handleFormSubmit: (data: any, selectedItem: T | null, isEditMode: boolean) => Promise<void>
    /** Get item ID */
    getItemId: (item: T) => string | number
    /** Get item name for display */
    getItemName?: (item: T) => string
    /** Parent data (optional, for pre-filling form) */
    parentData?: any
    /** Handle delete confirmation */
    handleDeleteConfirm?: (item: T) => Promise<void>
}

export interface UseEmbeddedListSectionReturn<T> {
    // State
    detailDialogOpen: boolean
    formDialogOpen: boolean
    deleteDialogOpen: boolean
    viewConfirmOpen: boolean
    selectedItem: T | null
    isEditMode: boolean
    itemToView: T | null
    
    // Setters
    setDetailDialogOpen: (open: boolean) => void
    setFormDialogOpen: (open: boolean) => void
    setDeleteDialogOpen: (open: boolean) => void
    setViewConfirmOpen: (open: boolean) => void
    setSelectedItem: (item: T | null) => void
    setIsEditMode: (mode: boolean) => void
    setItemToView: (item: T | null) => void
    
    // Handlers
    handleRowClick: (item: T) => void
    handleEyeClick: (item: T) => void
    handleAdd: () => void
    handleEdit: (item: T) => void
    handleDelete: (item: T) => void
    handleFormSubmit: (data: any) => Promise<void>
    handleDeleteConfirm: () => Promise<void>
    handleViewConfirm: () => void
    
    // Computed
    detailSections: DetailSection[]
    formSections: FormSection[]
    formDefaultValues: any
}

export function useEmbeddedListSection<T>({
    moduleConfig,
    viewDetailSkipConfirmStorageKey,
    getDetailSections,
    getFormSections,
    formSchema: _formSchema,
    getFormDefaultValues,
    handleFormSubmit: handleFormSubmitConfig,
    getItemId,
    getItemName: _getItemName,
    parentData,
    handleDeleteConfirm: handleDeleteConfirmConfig,
}: UseEmbeddedListSectionConfig<T>): UseEmbeddedListSectionReturn<T> {
    const navigate = useNavigate()

    // State management
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [formDialogOpen, setFormDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<T | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [itemToView, setItemToView] = useState<T | null>(null)

    // Click dòng -> Mở popup detail
    const handleRowClick = useCallback((item: T) => {
        setSelectedItem(item)
        setDetailDialogOpen(true)
    }, [])

    // Click icon mắt -> Confirm dialog -> Redirect đến page detail
    const handleEyeClick = useCallback((item: T) => {
        const itemId = getItemId(item)
        if (!itemId) return

        const skipConfirm =
            viewDetailSkipConfirmStorageKey &&
            typeof window !== "undefined" &&
            window.localStorage.getItem(viewDetailSkipConfirmStorageKey) === "true"

        if (skipConfirm) {
            navigate(`${moduleConfig.routePath}/${itemId}`)
            return
        }

        setItemToView(item)
        setViewConfirmOpen(true)
    }, [navigate, moduleConfig.routePath, getItemId, viewDetailSkipConfirmStorageKey])

    // Click thêm -> Mở popup form
    const handleAdd = useCallback(() => {
        setSelectedItem(null)
        setIsEditMode(false)
        setFormDialogOpen(true)
    }, [])

    // Click sửa -> Mở popup form
    const handleEdit = useCallback((item: T) => {
        setSelectedItem(item)
        setIsEditMode(true)
        setFormDialogOpen(true)
    }, [])

    // Click xóa -> Mở popup confirm
    const handleDelete = useCallback((item: T) => {
        setSelectedItem(item)
        setDeleteDialogOpen(true)
    }, [])
    
    // Handle form submit
    const handleFormSubmit = useCallback(async (data: any) => {
        await handleFormSubmitConfig(data, selectedItem, isEditMode)
        setFormDialogOpen(false)
        setSelectedItem(null)
        setIsEditMode(false)
    }, [selectedItem, isEditMode, handleFormSubmitConfig])
    
    // Handle view confirm
    const handleViewConfirm = useCallback(() => {
        if (!itemToView) return
        const itemId = getItemId(itemToView)
        if (!itemId) return
        navigate(`${moduleConfig.routePath}/${itemId}`)
    }, [itemToView, navigate, moduleConfig.routePath, getItemId])

    // Handle delete confirm
    const handleDeleteConfirm = useCallback(async () => {
        if (!selectedItem || !handleDeleteConfirmConfig) return
        await handleDeleteConfirmConfig(selectedItem)
        setDeleteDialogOpen(false)
        setSelectedItem(null)
    }, [selectedItem, handleDeleteConfirmConfig])
    
    // Computed values
    const detailSections = useMemo(() => {
        if (!selectedItem) return []
        return getDetailSections(selectedItem)
    }, [selectedItem, getDetailSections])
    
    const formSections = useMemo(() => {
        return getFormSections(selectedItem, isEditMode)
    }, [selectedItem, isEditMode, getFormSections])
    
    const formDefaultValues = useMemo(() => {
        return getFormDefaultValues(selectedItem, isEditMode, parentData)
    }, [selectedItem, isEditMode, parentData, getFormDefaultValues])

    return {
        // State
        detailDialogOpen,
        formDialogOpen,
        deleteDialogOpen,
        viewConfirmOpen,
        selectedItem,
        isEditMode,
        itemToView,
        
        // Setters
        setDetailDialogOpen,
        setFormDialogOpen,
        setDeleteDialogOpen,
        setViewConfirmOpen,
        setSelectedItem,
        setIsEditMode,
        setItemToView,
        
        // Handlers
        handleRowClick,
        handleEyeClick,
        handleAdd,
        handleEdit,
        handleDelete,
        handleFormSubmit,
        handleViewConfirm,
        handleDeleteConfirm,
        
        // Computed
        detailSections,
        formSections,
        formDefaultValues,
    }
}
