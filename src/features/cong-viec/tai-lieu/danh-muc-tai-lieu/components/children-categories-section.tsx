/**
 * Children Categories Section Component
 * 
 * Component hiển thị danh sách danh mục con trong detail view danh mục tài liệu.
 * Sử dụng EmbeddedListSection với pattern chuẩn ERP (popup dialogs).
 * 
 * Flow:
 * - Click dòng -> Mở popup detail (GenericDetailDialog)
 * - Click icon mắt -> Confirm dialog -> Redirect đến page detail module danh mục tài liệu
 * - Click icon sửa -> Mở popup form (GenericFormDialog)
 * - Click icon xóa -> Mở popup xác nhận xóa (GenericDeleteDialog)
 * - Click "Thêm danh mục con" -> Mở popup form (GenericFormDialog)
 */

"use client"

import { useMemo, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { EmbeddedListSection, type EmbeddedListColumn } from "@/shared/components/data-display/embedded-list-section"
import { EmbeddedListFullViewDialog } from "@/shared/components/data-display/embedded-list-full-view-dialog"
import { GenericDetailDialog } from "@/shared/components/dialogs/generic-detail-dialog"
import { GenericFormDialog } from "@/shared/components/dialogs/generic-form-dialog"
import { GenericDeleteDialog } from "@/shared/components/dialogs/generic-delete-dialog"
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog"
import { FolderTree, Maximize2 } from "lucide-react"
import { sectionTitleClass } from "@/shared/utils/section-styles"
import { DanhMucTaiLieu, danhMucTaiLieuSchema } from "../schema"
import { danhMucTaiLieuConfig } from "../config"
import { useCreateDanhMucTaiLieu, useUpdateDanhMucTaiLieu, useDeleteDanhMucTaiLieu } from "../hooks"
import { formatDateTime } from "@/shared/utils/date-format"
import { getHangMucBadgeColor, getCapBadgeColor } from "../constants/badge-colors"
import type { DetailSection } from "@/shared/components"
import type { FormSection } from "@/shared/components/forms/generic-form-view"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLoaiTaiLieu } from "@/features/cong-viec/tai-lieu/loai-tai-lieu/hooks"
import { useDanhMucTaiLieu } from "../hooks"
import { useAuthStore } from "@/shared/stores/auth-store"
import { cn } from "@/lib/utils"
import { z } from "zod"

const VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY = "children-categories-view-detail-skip-confirm"

interface ChildrenCategoriesSectionProps {
    parentId: number
    parentHangMuc: string
    parentLoaiId: number
    children: DanhMucTaiLieu[]
    isLoading?: boolean
}

export function ChildrenCategoriesSection({
    parentId,
    parentHangMuc,
    parentLoaiId,
    children,
    isLoading = false
}: ChildrenCategoriesSectionProps) {
    const navigate = useNavigate()
    const createMutation = useCreateDanhMucTaiLieu()
    const updateMutation = useUpdateDanhMucTaiLieu()
    const deleteMutation = useDeleteDanhMucTaiLieu()
    const { employee: currentEmployee } = useAuthStore()
    const { data: loaiTaiLieuList = [] } = useLoaiTaiLieu()
    const { data: allDanhMucTaiLieuList = [] } = useDanhMucTaiLieu()

    // State management
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [formDialogOpen, setFormDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
    const [selectedChild, setSelectedChild] = useState<DanhMucTaiLieu | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [childToView, setChildToView] = useState<DanhMucTaiLieu | null>(null)
    const [expandDialogOpen, setExpandDialogOpen] = useState(false)

    // State for form field dependencies
    const [selectedHangMuc, setSelectedHangMuc] = useState<string | null>(null)
    const [selectedLoaiId, setSelectedLoaiId] = useState<number | null>(null)

    // Filter loai tài liệu options based on selectedHangMuc
    const loaiTaiLieuOptions = useMemo(() => {
        if (!selectedHangMuc) return []
        return loaiTaiLieuList
            .filter(item => item.id && item.hang_muc === selectedHangMuc)
            .map(item => ({
                label: item.loai || item.hang_muc || `ID: ${item.id}`,
                value: item.id!.toString()
            }))
    }, [loaiTaiLieuList, selectedHangMuc])

    // Filter danh mục cha options (only level 1, same hang_muc and loai_id)
    const danhMucChaOptions = useMemo(() => {
        if (!selectedHangMuc || !selectedLoaiId) return []
        return allDanhMucTaiLieuList
            .filter(item =>
                item.id &&
                item.cap === 1 &&
                item.hang_muc === selectedHangMuc &&
                item.loai_id === selectedLoaiId &&
                (isEditMode && selectedChild ? item.id !== selectedChild.id : true)
            )
            .map(item => ({
                label: item.ten_danh_muc || `ID: ${item.id}`,
                value: item.id!.toString()
            }))
    }, [allDanhMucTaiLieuList, selectedHangMuc, selectedLoaiId, isEditMode, selectedChild])

    // Click dòng -> Mở popup detail
    const handleRowClick = useCallback((child: DanhMucTaiLieu) => {
        setSelectedChild(child)
        setDetailDialogOpen(true)
    }, [])

    // Click icon mắt -> Confirm dialog -> Redirect đến page detail
    const handleEyeClick = useCallback((child: DanhMucTaiLieu) => {
        if (!child.id) return

        const skipConfirm =
            typeof window !== "undefined" &&
            window.localStorage.getItem(VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY) === "true"

        if (skipConfirm) {
            navigate(`${danhMucTaiLieuConfig.routePath}/${child.id}`)
            return
        }

        setChildToView(child)
        setViewConfirmOpen(true)
    }, [navigate])

    // Click thêm -> Mở popup form
    const handleAdd = useCallback(() => {
        setSelectedChild(null)
        setIsEditMode(false)
        setSelectedHangMuc(parentHangMuc)
        setSelectedLoaiId(parentLoaiId)
        setFormDialogOpen(true)
    }, [parentHangMuc, parentLoaiId])

    // Click sửa -> Mở popup form
    const handleEdit = useCallback((child: DanhMucTaiLieu) => {
        setSelectedChild(child)
        setIsEditMode(true)
        setSelectedHangMuc(child.hang_muc || null)
        setSelectedLoaiId(child.loai_id || null)
        setFormDialogOpen(true)
    }, [])

    // Click xóa -> Mở popup confirm
    const handleDelete = useCallback((child: DanhMucTaiLieu) => {
        setSelectedChild(child)
        setDeleteDialogOpen(true)
    }, [])

    // Handle form submit
    const handleFormSubmit = useCallback(async (data: any) => {
        const nguoiTaoId = currentEmployee?.ma_nhan_vien
        if (!nguoiTaoId) {
            throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
        }

        // Find ten_danh_muc_cha from danh_muc_cha_id
        let tenDanhMucCha: string | null = null
        if (data.danh_muc_cha_id) {
            const danhMucCha = allDanhMucTaiLieuList.find(
                item => item.id === Number(data.danh_muc_cha_id)
            )
            tenDanhMucCha = danhMucCha?.ten_danh_muc || null
        }

        // Auto-calculate cap
        const cap = data.danh_muc_cha_id ? 2 : 1

        if (isEditMode && selectedChild?.id) {
            await updateMutation.mutateAsync({
                id: selectedChild.id,
                input: {
                    hang_muc: data.hang_muc,
                    loai_id: Number(data.loai_id),
                    cap: cap,
                    danh_muc_cha_id: data.danh_muc_cha_id ? Number(data.danh_muc_cha_id) : null,
                    ten_danh_muc_cha: tenDanhMucCha,
                    ten_danh_muc: data.ten_danh_muc,
                    mo_ta: data.mo_ta || null,
                }
            })
        } else {
            await createMutation.mutateAsync({
                hang_muc: data.hang_muc,
                loai_id: Number(data.loai_id),
                cap: cap,
                danh_muc_cha_id: data.danh_muc_cha_id ? Number(data.danh_muc_cha_id) : parentId,
                ten_danh_muc_cha: tenDanhMucCha || (parentId ? allDanhMucTaiLieuList.find(d => d.id === parentId)?.ten_danh_muc || null : null),
                ten_danh_muc: data.ten_danh_muc,
                mo_ta: data.mo_ta || null,
                nguoi_tao_id: nguoiTaoId,
            })
        }
    }, [isEditMode, selectedChild, currentEmployee, allDanhMucTaiLieuList, parentId, createMutation, updateMutation])

    // Handle delete confirmation
    const handleDeleteConfirm = useCallback(async () => {
        if (!selectedChild?.id) return
        await deleteMutation.mutateAsync(selectedChild.id)
        setDeleteDialogOpen(false)
        setSelectedChild(null)
    }, [selectedChild, deleteMutation])

    // Get detail sections for dialog
    const getDetailSections = useCallback((child: DanhMucTaiLieu): DetailSection[] => {
        return [
            {
                title: "Thông Tin Cơ Bản",
                fields: [
                    {
                        label: "Hạng Mục",
                        key: "hang_muc",
                        value: child.hang_muc || "-",
                        format: (val: any) => {
                            if (!val || val === "-") return "-"
                            const badgeClass = getHangMucBadgeColor(val)
                            return (
                                <Badge variant="outline" className={badgeClass}>
                                    {val}
                                </Badge>
                            )
                        }
                    },
                    { label: "Tên Danh Mục", key: "ten_danh_muc", value: child.ten_danh_muc || "-" },
                    { label: "Loại Tài Liệu", key: "loai_tai_lieu", value: child.loai_tai_lieu || "-" },
                    {
                        label: "Cấp",
                        key: "cap",
                        value: child.cap !== null && child.cap !== undefined ? child.cap.toString() : "-",
                        format: (val: any) => {
                            if (!val || val === "-") return "-"
                            const cap = Number(val)
                            if (isNaN(cap)) return val
                            const badgeClass = getCapBadgeColor(cap)
                            return (
                                <Badge variant="outline" className={badgeClass}>
                                    Cấp {cap}
                                </Badge>
                            )
                        }
                    },
                    { label: "Mô Tả", key: "mo_ta", value: child.mo_ta || "-" },
                ]
            },
            {
                title: "Thông Tin Hệ Thống",
                fields: [
                    {
                        label: "Người Tạo",
                        key: "nguoi_tao_id",
                        value: child.nguoi_tao_id
                            ? `${child.nguoi_tao_id}${child.nguoi_tao_ten ? ` - ${child.nguoi_tao_ten}` : ''}`
                            : "-"
                    },
                    { label: "Thời Gian Tạo", key: "tg_tao", value: formatDateTime(child.tg_tao) },
                    { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDateTime(child.tg_cap_nhat) },
                ]
            }
        ]
    }, [])

    // Get form sections
    const getFormSections = useCallback((): FormSection[] => {
        return [
            {
                title: "Thông Tin Cơ Bản",
                fields: [
                    {
                        name: "hang_muc",
                        label: "Hạng Mục",
                        type: "toggle",
                        required: true,
                        options: [
                            { label: "Biểu mẫu & Kế hoạch", value: "Biểu mẫu & Kế hoạch" },
                            { label: "Văn bản hệ thống", value: "Văn bản hệ thống" },
                        ],
                    },
                    {
                        name: "loai_id",
                        label: "Loại Tài Liệu",
                        type: "select",
                        options: loaiTaiLieuOptions,
                        required: true,
                        placeholder: "Chọn loại tài liệu",
                        disabled: !selectedHangMuc,
                    },
                    {
                        name: "ten_danh_muc",
                        label: "Tên Danh Mục",
                        required: true,
                        placeholder: "Nhập tên danh mục",
                    },
                    {
                        name: "danh_muc_cha_id",
                        label: "Danh Mục Cha",
                        type: "select",
                        options: danhMucChaOptions,
                        placeholder: "Chọn danh mục cha",
                        disabled: !selectedHangMuc || !selectedLoaiId,
                    },
                    {
                        name: "mo_ta",
                        label: "Mô Tả",
                        type: "textarea",
                        placeholder: "Nhập mô tả",
                    },
                ]
            },
        ]
    }, [loaiTaiLieuOptions, danhMucChaOptions, selectedHangMuc, selectedLoaiId])

    // Define columns for the table
    const columns: EmbeddedListColumn<DanhMucTaiLieu>[] = useMemo(() => [
        {
            key: "ten_danh_muc",
            header: "Tên Danh Mục",
            sortable: true,
            stickyLeft: true, // Cố định cột tên khi scroll ngang
            stickyMinWidth: 200,
            render: (item) => (
                <span className={cn("italic text-muted-foreground")}>
                    {item.ten_danh_muc || "-"}
                </span>
            )
        },
        {
            key: "mo_ta",
            header: "Mô Tả",
            sortable: true,
            render: (item) => (
                <span className="text-muted-foreground">
                    {item.mo_ta || "-"}
                </span>
            )
        },
        {
            key: "nguoi_tao_id",
            header: "Người Tạo",
            sortable: true,
            hideInCompact: true, // Ẩn trong compact mode, chỉ hiện trong expand view
            render: (item) => (
                <span className="text-muted-foreground">
                    {item.nguoi_tao_ten
                        ? `${item.nguoi_tao_id} - ${item.nguoi_tao_ten}`
                        : item.nguoi_tao_id?.toString() || "-"}
                </span>
            )
        },
        {
            key: "tg_tao",
            header: "Thời Gian Tạo",
            sortable: true,
            hideInCompact: true, // Ẩn trong compact mode, chỉ hiện trong expand view
            render: (item) => (
                <span className="text-muted-foreground">
                    {formatDateTime(item.tg_tao)}
                </span>
            )
        }
    ], [])

    // Form schema
    const formSchema = useMemo(() => {
        return danhMucTaiLieuSchema.omit({
            id: true,
            tg_tao: true,
            tg_cap_nhat: true,
            nguoi_tao_id: true,
            nguoi_tao_ten: true,
            loai_tai_lieu: true,
            cap: true, // Auto-calculated
            ten_danh_muc_cha: true, // Auto-filled
        }).extend({
            loai_id: z.union([z.string().min(1, "Loại tài liệu là bắt buộc"), z.number()]).transform((val: string | number) => {
                if (typeof val === "string") {
                    const num = Number(val)
                    if (isNaN(num) || num < 1) {
                        throw new Error("Loại tài liệu không hợp lệ")
                    }
                    return num
                }
                return val
            }),
            danh_muc_cha_id: z.union([z.string(), z.number(), z.null()]).optional().nullable().transform((val: string | number | null | undefined) => {
                if (val === "" || val === null || val === undefined) return null
                if (typeof val === "string") {
                    const num = Number(val)
                    return isNaN(num) ? null : num
                }
                return val
            }),
        })
    }, [])

    // Form default values
    const formDefaultValues = useMemo(() => {
        if (isEditMode && selectedChild) {
            return {
                hang_muc: selectedChild.hang_muc || "",
                loai_id: selectedChild.loai_id ? selectedChild.loai_id.toString() : "",
                danh_muc_cha_id: selectedChild.danh_muc_cha_id ? selectedChild.danh_muc_cha_id.toString() : "",
                ten_danh_muc: selectedChild.ten_danh_muc || "",
                mo_ta: selectedChild.mo_ta || "",
            }
        }
        // Create mode: pre-fill from parent
        return {
            hang_muc: parentHangMuc || "",
            loai_id: parentLoaiId ? parentLoaiId.toString() : "",
            danh_muc_cha_id: parentId.toString(),
            ten_danh_muc: "",
            mo_ta: "",
        }
    }, [isEditMode, selectedChild, parentHangMuc, parentLoaiId, parentId])

    return (
        <>
            {/* Custom Header for "Danh Mục Con" */}
            <div className="space-y-3 sm:space-y-4 print:space-y-2 print:break-inside-avoid scroll-mt-28">
                <div className="flex items-center justify-between gap-2 sm:gap-2.5 px-1">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="p-1.5 rounded-md bg-primary/10 print:bg-transparent print:border print:border-primary">
                            <FolderTree className="h-4 w-4 text-primary shrink-0" />
                        </div>
                        <h3 className={sectionTitleClass("font-semibold tracking-tight text-primary")}>
                            Danh Mục Con
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                        {children.length > 0 && (
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
                            Thêm danh mục con
                        </Button>
                    </div>
                </div>
                {/* Embedded List Section (without its own header) */}
                <div className="mt-4">
                    <EmbeddedListSection
                        title=""
                        data={children}
                        columns={columns}
                        isLoading={isLoading}
                        emptyMessage="Chưa có danh mục con nào"
                        emptyStateIcon={FolderTree}
                        onRowClick={handleRowClick}
                        onView={handleEyeClick}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        showActions={true}
                        getItemId={(item) => item.id!}
                        getItemName={(item) => item.ten_danh_muc || `ID: ${item.id}`}
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
                    title="Danh Sách Đầy Đủ Danh Mục Con"
                    data={children}
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
                    searchPlaceholder="Tìm kiếm danh mục con..."
                    searchFields={["ten_danh_muc", "mo_ta"]}
                />
            )}

            {/* Detail Dialog - Click dòng */}
            {selectedChild && (
                <GenericDetailDialog
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                    dialogTitle={`Chi Tiết: ${selectedChild.ten_danh_muc || `ID: ${selectedChild.id}`}`}
                    dialogSubtitle="Chi tiết danh mục tài liệu"
                    title={selectedChild.ten_danh_muc || `ID: ${selectedChild.id}`}
                    subtitle={selectedChild.mo_ta || "Danh mục tài liệu"}
                    sections={getDetailSections(selectedChild)}
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDetailDialogOpen(false)
                                    handleEdit(selectedChild)
                                }}
                            >
                                Sửa
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setDetailDialogOpen(false)
                                    handleDelete(selectedChild)
                                }}
                            >
                                Xóa
                            </Button>
                        </>
                    }
                />
            )}

            {/* Form Dialog - Thêm mới hoặc Sửa */}
            <GenericFormDialog
                open={formDialogOpen}
                onOpenChange={(open) => {
                    setFormDialogOpen(open)
                    if (!open) {
                        setSelectedChild(null)
                        setIsEditMode(false)
                        setSelectedHangMuc(null)
                        setSelectedLoaiId(null)
                    }
                }}
                title={isEditMode ? `Sửa Danh Mục: ${selectedChild?.ten_danh_muc}` : "Thêm Mới Danh Mục Con"}
                subtitle={isEditMode ? "Cập nhật thông tin danh mục tài liệu" : "Thêm danh mục con mới"}
                schema={formSchema}
                defaultValues={formDefaultValues}
                sections={getFormSections()}
                onSubmit={handleFormSubmit}
                submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
                successMessage={isEditMode ? "Cập nhật danh mục tài liệu thành công" : "Thêm mới danh mục tài liệu thành công"}
                errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật danh mục tài liệu" : "Có lỗi xảy ra khi thêm mới danh mục tài liệu"}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Delete Dialog */}
            {selectedChild && (
                <GenericDeleteDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title="Xác nhận xóa danh mục tài liệu"
                    description="Bạn có chắc chắn muốn xóa danh mục tài liệu này không?"
                    entityName={selectedChild.ten_danh_muc || `ID: ${selectedChild.id}`}
                    onConfirm={handleDeleteConfirm}
                    isLoading={deleteMutation.isPending}
                />
            )}

            {/* View Detail Confirm Dialog - Click icon mắt */}
            <ConfirmDialog
                open={viewConfirmOpen}
                onOpenChange={setViewConfirmOpen}
                title="Mở trang chi tiết danh mục tài liệu"
                description="Bạn có muốn mở trang chi tiết danh mục tài liệu trong module Danh Mục Tài Liệu không?"
                confirmLabel="Mở trang chi tiết"
                cancelLabel="Hủy"
                skipConfirmStorageKey={VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY}
                skipConfirmLabel="Đừng hỏi lại lần sau"
                onConfirm={() => {
                    if (!childToView?.id) return
                    navigate(`${danhMucTaiLieuConfig.routePath}/${childToView.id}`)
                }}
            />
        </>
    )
}
