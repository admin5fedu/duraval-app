/**
 * Template Component cho EmbeddedListSection
 * Copy file này và customize theo module của bạn
 * 
 * Usage:
 * 1. Copy file này vào module của bạn
 * 2. Rename component và file
 * 3. Update imports, types, schemas
 * 4. Customize columns, detail sections, form sections
 * 5. Update handlers nếu cần
 */

"use client"

import { useMemo, useCallback } from "react"
import { EmbeddedListSection, type EmbeddedListColumn } from "@/shared/components/data-display/embedded-list-section"
import { GenericDetailDialog } from "@/shared/components/dialogs/generic-detail-dialog"
import { GenericFormDialog } from "@/shared/components/dialogs/generic-form-dialog"
import { GenericDeleteDialog } from "@/shared/components/dialogs/generic-delete-dialog"
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog"
import { useEmbeddedListSection } from "@/shared/hooks/use-embedded-list-section"
import type { DetailSection } from "@/shared/components"
import type { FormSection } from "@/shared/components/forms/generic-form-view"
import { Button } from "@/components/ui/button"
// TODO: Import your entity type, schema, config, hooks
// import { YourEntity, yourEntitySchema } from "../schema"
// import { yourEntityConfig } from "../config"
// import { useCreateYourEntity, useUpdateYourEntity, useDeleteYourEntity } from "../hooks"

const VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY = "your-module-view-detail-skip-confirm"

interface YourEmbeddedSectionProps {
    // TODO: Define props based on your needs
    parentId: number
    items: any[] // TODO: Replace with your entity type
    isLoading?: boolean
}

export function YourEmbeddedSection({
    parentId,
    items,
    isLoading = false
}: YourEmbeddedSectionProps) {
    // TODO: Replace with your mutations
    // const createMutation = useCreateYourEntity()
    // const updateMutation = useUpdateYourEntity()
    // const deleteMutation = useDeleteYourEntity()
    
    // TODO: Replace with your config
    const moduleConfig = {
        routePath: "/your-module-path" // TODO: Update
    }
    
    // Get detail sections
    const getDetailSections = useCallback((item: any): DetailSection[] => {
        // TODO: Customize based on your entity
        return [
            {
                title: "Thông Tin Cơ Bản",
                fields: [
                    { label: "Tên", key: "ten", value: item.ten || "-" },
                    // TODO: Add more fields
                ]
            }
        ]
    }, [])
    
    // Get form sections
    const getFormSections = useCallback((): FormSection[] => {
        // TODO: Customize based on your entity
        return [
            {
                title: "Thông Tin Cơ Bản",
                fields: [
                    {
                        name: "ten",
                        label: "Tên",
                        required: true,
                        placeholder: "Nhập tên",
                    },
                    // TODO: Add more fields
                ]
            }
        ]
    }, [])
    
    // Get form default values
    const getFormDefaultValues = useCallback((selectedItem: any | null, isEditMode: boolean): any => {
        if (isEditMode && selectedItem) {
            // TODO: Return edit values
            return {
                ten: selectedItem.ten || "",
                // TODO: Add more fields
            }
        }
        // TODO: Return create values (pre-filled from parent if needed)
        return {
            ten: "",
            // TODO: Add more fields
        }
    }, [])
    
    // Handle form submit
    const handleFormSubmit = useCallback(async (_data: any, selectedItem: any | null, isEditMode: boolean) => {
        // TODO: Implement your submit logic
        if (isEditMode && selectedItem?.id) {
            // await updateMutation.mutateAsync({ id: selectedItem.id, input: _data })
        } else {
            // await createMutation.mutateAsync({ ..._data, parentId })
        }
    }, [])
    
    // Handle delete confirmation
    const handleDeleteConfirm = useCallback(async (item: any) => {
        if (!item?.id) return
        // await deleteMutation.mutateAsync(item.id)
    }, []) // TODO: Add deleteMutation
    
    // Use hook
    const {
        detailDialogOpen,
        formDialogOpen,
        deleteDialogOpen,
        viewConfirmOpen,
        selectedItem,
        isEditMode,
        setDetailDialogOpen,
        setFormDialogOpen,
        setDeleteDialogOpen,
        setViewConfirmOpen,
        setSelectedItem,
        setIsEditMode,
        handleRowClick,
        handleEyeClick,
        handleAdd,
        handleEdit,
        handleDelete,
        handleFormSubmit: handleFormSubmitFromHook,
        handleViewConfirm,
        handleDeleteConfirm: handleDeleteConfirmFromHook,
        detailSections,
        formSections,
        formDefaultValues,
    } = useEmbeddedListSection({
        moduleConfig,
        viewDetailSkipConfirmStorageKey: VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY,
        getDetailSections,
        getFormSections,
        formSchema: null as any, // TODO: Replace with your schema
        getFormDefaultValues,
        handleFormSubmit,
        getItemId: (item) => item.id!,
        parentData: { parentId },
        handleDeleteConfirm,
    })
    
    // Define columns
    const columns: EmbeddedListColumn<any>[] = useMemo(() => [
        {
            key: "ten",
            header: "Tên",
            sortable: true,
            render: (item) => (
                <span>{item.ten || "-"}</span>
            )
        },
        // TODO: Add more columns
    ], [])
    
    return (
        <>
            <EmbeddedListSection
                title="Your Section Title" // TODO: Update
                data={items}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="Chưa có dữ liệu" // TODO: Update
                onAdd={handleAdd}
                addLabel="Thêm mới" // TODO: Update
                addButtonVariant="default"
                onRowClick={handleRowClick}
                onView={handleEyeClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showActions={true}
                getItemId={(item) => item.id!}
                getItemName={(item) => item.ten || `ID: ${item.id}`}
                defaultSortField="tg_tao" // TODO: Update if needed
                defaultSortDirection="desc"
                maxHeight="500px"
            />
            
            {/* Detail Dialog */}
            {selectedItem && (
                <GenericDetailDialog
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                    dialogTitle={`Chi Tiết: ${selectedItem.ten || `ID: ${selectedItem.id}`}`}
                    dialogSubtitle="Chi tiết" // TODO: Update
                    title={selectedItem.ten || `ID: ${selectedItem.id}`}
                    subtitle="" // TODO: Update
                    sections={detailSections}
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDetailDialogOpen(false)
                                    handleEdit(selectedItem)
                                }}
                            >
                                Sửa
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setDetailDialogOpen(false)
                                    handleDelete(selectedItem)
                                }}
                            >
                                Xóa
                            </Button>
                        </>
                    }
                />
            )}
            
            {/* Form Dialog */}
            <GenericFormDialog
                open={formDialogOpen}
                onOpenChange={(open) => {
                    setFormDialogOpen(open)
                    if (!open) {
                        setSelectedItem(null)
                        setIsEditMode(false)
                    }
                }}
                title={isEditMode ? `Sửa: ${selectedItem?.ten}` : "Thêm Mới"} // TODO: Update
                subtitle={isEditMode ? "Cập nhật thông tin" : "Thêm mới"} // TODO: Update
                schema={null as any} // TODO: Replace with your schema
                defaultValues={formDefaultValues}
                sections={formSections}
                onSubmit={handleFormSubmitFromHook}
                submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
                successMessage={isEditMode ? "Cập nhật thành công" : "Thêm mới thành công"} // TODO: Update
                errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật" : "Có lỗi xảy ra khi thêm mới"} // TODO: Update
                isLoading={false} // TODO: Replace with mutation.isPending
            />
            
            {/* Delete Dialog */}
            {selectedItem && (
                <GenericDeleteDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title="Xác nhận xóa" // TODO: Update
                    description="Bạn có chắc chắn muốn xóa không?" // TODO: Update
                    entityName={selectedItem.ten || `ID: ${selectedItem.id}`}
                    onConfirm={handleDeleteConfirmFromHook}
                    isLoading={false} // TODO: Replace with deleteMutation.isPending
                />
            )}
            
            {/* View Detail Confirm Dialog */}
            <ConfirmDialog
                open={viewConfirmOpen}
                onOpenChange={setViewConfirmOpen}
                title="Mở trang chi tiết" // TODO: Update
                description="Bạn có muốn mở trang chi tiết không?" // TODO: Update
                confirmLabel="Mở trang chi tiết"
                cancelLabel="Hủy"
                skipConfirmStorageKey={VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY}
                skipConfirmLabel="Đừng hỏi lại lần sau"
                onConfirm={handleViewConfirm}
            />
        </>
    )
}

