/**
 * Hạng Mục Section Component
 * 
 * Component hiển thị danh sách hạng mục liên quan trong detail view loại phiếu.
 * Tham khảo RelativesSection để đảm bảo flow và quy tắc đúng.
 * 
 * Flow:
 * - Click dòng -> Mở popup detail (GenericDetailDialog)
 * - Click icon mắt -> Confirm dialog -> Redirect đến page detail module hạng mục
 * - Click icon sửa -> Mở popup form (GenericFormDialog)
 * - Click icon xóa -> Mở popup xác nhận xóa (GenericDeleteDialog)
 * - Click "Thêm Hạng Mục" -> Mở popup form (GenericFormDialog)
 */

"use client"

import { useState, useImperativeHandle, forwardRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useHangMucByLoaiPhieuId } from "../../hang-muc/hooks/use-hang-muc"
import { EmbeddedListSection, type EmbeddedListColumn } from "@/shared/components/data-display/embedded-list-section"
import { EmbeddedListFullViewDialog } from "@/shared/components/data-display/embedded-list-full-view-dialog"
import { GenericDetailDialog } from "@/shared/components/dialogs/generic-detail-dialog"
import { GenericFormDialog } from "@/shared/components/dialogs/generic-form-dialog"
import { GenericDeleteDialog } from "@/shared/components/dialogs/generic-delete-dialog"
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog"
import { HangMuc, hangMucSchema } from "../../hang-muc/schema"
import type { DetailSection } from "@/shared/components"
import type { FormSection } from "@/shared/components/forms/generic-form-view"
import { useCreateHangMuc, useUpdateHangMuc, useDeleteHangMuc } from "../../hang-muc/hooks/use-hang-muc-mutations"
import { Button } from "@/components/ui/button"
import { Tag, Maximize2 } from "lucide-react"
import { sectionTitleClass } from "@/shared/utils/section-styles"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { hangMucConfig } from "../../hang-muc/config"
import { useAuthStore } from "@/shared/stores/auth-store"

const VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY = "hang-muc-view-detail-skip-confirm"

interface HangMucSectionProps {
    loaiPhieuId: number
}

export interface HangMucSectionRef {
    openAddDialog: () => void
}

export const HangMucSection = forwardRef<HangMucSectionRef, HangMucSectionProps>(
function HangMucSection({ loaiPhieuId }, ref) {
    const { data: hangMucList, isLoading } = useHangMucByLoaiPhieuId(loaiPhieuId)
    const navigate = useNavigate()
    const { employee } = useAuthStore()
    
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [formDialogOpen, setFormDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
    const [selectedHangMuc, setSelectedHangMuc] = useState<HangMuc | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [hangMucToView, setHangMucToView] = useState<HangMuc | null>(null)
    const [expandDialogOpen, setExpandDialogOpen] = useState(false)

    const createMutation = useCreateHangMuc()
    const updateMutation = useUpdateHangMuc()
    const deleteMutation = useDeleteHangMuc()

    const handleAdd = useCallback(() => {
        setSelectedHangMuc(null)
        setIsEditMode(false)
        setFormDialogOpen(true)
    }, [])

    // Expose handleAdd to parent via ref
    useImperativeHandle(ref, () => ({
        openAddDialog: handleAdd
    }), [handleAdd])

    // Click dòng -> Mở popup detail
    const handleRowClick = (hangMuc: HangMuc) => {
        setSelectedHangMuc(hangMuc)
        setDetailDialogOpen(true)
    }

    // Click icon mắt -> Confirm dialog -> Redirect đến page detail
    const handleEyeClick = (hangMuc: HangMuc) => {
        if (!hangMuc.id) return

        const skipConfirm =
            typeof window !== "undefined" &&
            window.localStorage.getItem(VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY) === "true"

        if (skipConfirm) {
            navigate(`${hangMucConfig.routePath}/${hangMuc.id}`)
            return
        }

        setHangMucToView(hangMuc)
        setViewConfirmOpen(true)
    }

    const handleEdit = (hangMuc: HangMuc) => {
        setSelectedHangMuc(hangMuc)
        setIsEditMode(true)
        setFormDialogOpen(true)
    }

    const handleDelete = (hangMuc: HangMuc) => {
        setSelectedHangMuc(hangMuc)
        setDeleteDialogOpen(true)
    }

    const handleFormSubmit = async (data: Partial<HangMuc> & { ten_hang_muc: string; loai_phieu_id?: number | null }) => {
        // Sanitize data: convert empty strings to null for optional fields
        const sanitizedData = {
            ...data,
            mo_ta: data.mo_ta && data.mo_ta.trim() !== "" ? data.mo_ta : null,
            loai_phieu_id: data.loai_phieu_id || loaiPhieuId, // Use parent loaiPhieuId if not provided
        }

        if (isEditMode && selectedHangMuc) {
            const { id: _id, tg_tao: _tg_tao, nguoi_tao_id: _nguoi_tao_id, nguoi_tao_ten: _nguoi_tao_ten, ten_loai_phieu: _ten_loai_phieu, ...submitData } = sanitizedData
            void _id
            void _tg_tao
            void _nguoi_tao_id
            void _nguoi_tao_ten
            void _ten_loai_phieu
            await updateMutation.mutateAsync({
                id: selectedHangMuc.id!,
                input: submitData
            })
        } else {
            const { id: _id, tg_tao: _tg_tao, tg_cap_nhat: _tg_cap_nhat, nguoi_tao_id: _nguoi_tao_id, nguoi_tao_ten: _nguoi_tao_ten, ten_loai_phieu: _ten_loai_phieu, ...submitData } = sanitizedData
            void _id
            void _tg_tao
            void _tg_cap_nhat
            void _nguoi_tao_id
            void _nguoi_tao_ten
            void _ten_loai_phieu
            const nguoiTaoId = employee?.ma_nhan_vien || null
            await createMutation.mutateAsync({
                ...submitData,
                loai_phieu_id: loaiPhieuId,
                nguoi_tao_id: nguoiTaoId,
            })
        }
    }

    const handleDeleteConfirm = async () => {
        if (!selectedHangMuc?.id) return
        await deleteMutation.mutateAsync(selectedHangMuc.id)
    }

    const getDetailSections = (hangMuc: HangMuc): DetailSection[] => {
        const formatDate = (dateString: string | null | undefined) => {
            if (!dateString) return "-"
            try {
                return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
                return "-"
            }
        }

        return [
            {
                title: "Thông Tin Cơ Bản",
                fields: [
                    { label: "ID", key: "id", value: hangMuc.id, type: "number" },
                    { label: "Loại Phiếu", key: "ten_loai_phieu", value: hangMuc.ten_loai_phieu || "-" },
                    { label: "Tên Hạng Mục", key: "ten_hang_muc", value: hangMuc.ten_hang_muc },
                    { label: "Mô Tả", key: "mo_ta", value: hangMuc.mo_ta || "-", colSpan: 2 },
                ]
            },
            {
                title: "Thông Tin Hệ Thống",
                fields: [
                    { 
                        label: "Người Tạo", 
                        key: "nguoi_tao_id", 
                        value: hangMuc.nguoi_tao_id 
                            ? `${hangMuc.nguoi_tao_id}${hangMuc.nguoi_tao_ten ? ` - ${hangMuc.nguoi_tao_ten}` : ''}`
                            : "-" 
                    },
                    { label: "Thời Gian Tạo", key: "tg_tao", value: formatDate(hangMuc.tg_tao), type: "date" },
                    { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDate(hangMuc.tg_cap_nhat), type: "date" },
                ]
            }
        ]
    }

    // Prepare form sections
    const formSections: FormSection[] = [
        {
            title: "Thông Tin Cơ Bản",
            fields: [
                { 
                    name: "ten_hang_muc", 
                    label: "Tên Hạng Mục", 
                    required: true, 
                    placeholder: "Nhập tên hạng mục" 
                },
                { 
                    name: "mo_ta", 
                    label: "Mô Tả", 
                    type: "textarea",
                },
            ]
        }
    ]

    // Define columns for the table
    const columns: EmbeddedListColumn<HangMuc>[] = [
        {
            key: "ten_hang_muc",
            header: "Tên Hạng Mục",
            sortable: true,
            stickyLeft: true,
            stickyMinWidth: 200,
            render: (item) => (
                <span className="font-medium">{item.ten_hang_muc}</span>
            )
        },
        {
            key: "mo_ta",
            header: "Mô Tả",
            sortable: true,
            hideInCompact: true,
            render: (item) => (
                <div className="max-w-[300px] truncate" title={item.mo_ta || undefined}>
                    {item.mo_ta || <span className="text-muted-foreground">-</span>}
                </div>
            )
        },
        {
            key: "tg_tao",
            header: "Thời Gian Tạo",
            sortable: true,
            hideInCompact: true,
            render: (item) => {
                if (!item.tg_tao) return <span className="text-muted-foreground">-</span>
                try {
                    return format(new Date(item.tg_tao), "dd/MM/yyyy HH:mm", { locale: vi })
                } catch {
                    return <span className="text-muted-foreground">-</span>
                }
            }
        }
    ]

    return (
        <>
            {/* Custom Header for "Danh Sách Hạng Mục" */}
            <div className="space-y-3 sm:space-y-4 print:space-y-2 print:break-inside-avoid scroll-mt-28">
                <div className="flex items-center justify-between gap-2 sm:gap-2.5 px-1">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="p-1.5 rounded-md bg-primary/10 print:bg-transparent print:border print:border-primary">
                            <Tag className="h-4 w-4 text-primary shrink-0" />
                        </div>
                        <h3 className={sectionTitleClass("font-semibold tracking-tight text-primary")}>
                            Danh Sách Hạng Mục
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                        {(hangMucList || []).length > 0 && (
                            <Button
                                onClick={() => setExpandDialogOpen(true)}
                                size="sm"
                                variant="outline"
                            >
                                <Maximize2 className="mr-2 h-4 w-4" />
                                Xem tất cả
                            </Button>
                        )}
                        <Button onClick={handleAdd} size="sm">
                            Thêm Hạng Mục
                        </Button>
                    </div>
                </div>
                {/* Embedded List Section (without its own header) */}
                <div className="mt-4">
                    <EmbeddedListSection
                        title=""
                        data={hangMucList || []}
                        columns={columns}
                        isLoading={isLoading}
                        emptyMessage="Chưa có hạng mục nào"
                        onRowClick={handleRowClick}
                        onView={handleEyeClick}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        showActions={true}
                        getItemId={(item) => item.id!}
                        getItemName={(item) => item.ten_hang_muc}
                        compactMode={true}
                        compactRowCount={5}
                        showMoreIndicator={false}
                        enableExpandView={false}
                        defaultSortField="tg_tao"
                        defaultSortDirection="desc"
                    />
                </div>
            </div>

            {/* Custom Expand Dialog */}
            {expandDialogOpen && (
                <EmbeddedListFullViewDialog
                    open={expandDialogOpen}
                    onOpenChange={setExpandDialogOpen}
                    title="Danh Sách Đầy Đủ Hạng Mục"
                    data={hangMucList || []}
                    columns={columns}
                    onRowClick={handleRowClick}
                    onView={handleEyeClick}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    showActions={true}
                    getItemId={(item) => item.id!}
                    defaultSortField="tg_tao"
                    defaultSortDirection="desc"
                    enableSearch={true}
                    searchPlaceholder="Tìm kiếm hạng mục..."
                    searchFields={["ten_hang_muc", "mo_ta"]}
                />
            )}

            {/* Detail Dialog */}
            {selectedHangMuc && (
                <GenericDetailDialog
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                    dialogTitle={`Chi Tiết Thông Tin: ${selectedHangMuc.ten_hang_muc}`}
                    dialogSubtitle="Chi tiết thông tin hạng mục"
                    title={selectedHangMuc.ten_hang_muc}
                    subtitle={selectedHangMuc.ten_loai_phieu || undefined}
                    sections={getDetailSections(selectedHangMuc)}
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDetailDialogOpen(false)
                                    handleEdit(selectedHangMuc)
                                }}
                            >
                                Sửa
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setDetailDialogOpen(false)
                                    handleDelete(selectedHangMuc)
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
                        setSelectedHangMuc(null)
                        setIsEditMode(false)
                    }
                }}
                title={isEditMode ? `Sửa Thông Tin: ${selectedHangMuc?.ten_hang_muc}` : "Thêm Mới Hạng Mục"}
                subtitle={isEditMode ? "Cập nhật thông tin hạng mục" : "Thêm hạng mục mới cho loại phiếu này"}
                schema={hangMucSchema.omit({ 
                    id: true, 
                    loai_phieu_id: true,
                    ten_loai_phieu: true,
                    nguoi_tao_id: true, 
                    tg_tao: true, 
                    tg_cap_nhat: true,
                    nguoi_tao_ten: true
                })}
                defaultValues={isEditMode && selectedHangMuc 
                    ? {
                        ten_hang_muc: selectedHangMuc.ten_hang_muc,
                        mo_ta: selectedHangMuc.mo_ta || "",
                    }
                    : {
                        ten_hang_muc: "",
                        mo_ta: "",
                    }
                }
                sections={formSections}
                onSubmit={handleFormSubmit}
                submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
                successMessage={isEditMode ? "Cập nhật thông tin hạng mục thành công" : "Thêm mới thông tin hạng mục thành công"}
                errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật thông tin hạng mục" : "Có lỗi xảy ra khi thêm mới thông tin hạng mục"}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Delete Dialog */}
            {selectedHangMuc && (
                <GenericDeleteDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title="Xác nhận xóa hạng mục"
                    description="Bạn có chắc chắn muốn xóa hạng mục này không?"
                    entityName={selectedHangMuc.ten_hang_muc}
                    onConfirm={handleDeleteConfirm}
                    isLoading={deleteMutation.isPending}
                />
            )}

            {/* View Detail Confirm Dialog */}
            <ConfirmDialog
                open={viewConfirmOpen}
                onOpenChange={setViewConfirmOpen}
                title="Mở trang chi tiết hạng mục"
                description="Bạn có muốn mở trang chi tiết hạng mục trong module Hạng mục không?"
                confirmLabel="Mở trang chi tiết"
                cancelLabel="Hủy"
                skipConfirmStorageKey={VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY}
                skipConfirmLabel="Đừng hỏi lại lần sau"
                onConfirm={() => {
                    if (!hangMucToView?.id) return
                    navigate(`${hangMucConfig.routePath}/${hangMucToView.id}`)
                }}
            />
        </>
    )
})

HangMucSection.displayName = "HangMucSection"

