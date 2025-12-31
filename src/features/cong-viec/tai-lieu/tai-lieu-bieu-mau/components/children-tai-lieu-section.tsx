/**
 * Children Tai Lieu Section Component
 * 
 * Component hiển thị danh sách tài liệu con trong detail view tài liệu & biểu mẫu.
 * Sử dụng EmbeddedListSection với pattern chuẩn ERP (popup dialogs).
 * 
 * Flow:
 * - Click dòng -> Mở popup detail (GenericDetailDialog)
 * - Click icon mắt -> Confirm dialog -> Redirect đến page detail module tài liệu & biểu mẫu
 * - Click icon sửa -> Mở popup form (GenericFormDialog)
 * - Click icon xóa -> Mở popup xác nhận xóa (GenericDeleteDialog)
 * - Click "Thêm tài liệu con" -> Mở popup form (GenericFormDialog)
 */

"use client"

import { useMemo, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { EmbeddedListSection, type EmbeddedListColumn } from "@/shared/components/data-display/embedded-list-section"
import { GenericDetailDialog } from "@/shared/components/dialogs/generic-detail-dialog"
import { GenericFormDialog } from "@/shared/components/dialogs/generic-form-dialog"
import { GenericDeleteDialog } from "@/shared/components/dialogs/generic-delete-dialog"
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog"
import { FileText } from "lucide-react"
import { TaiLieuBieuMau, taiLieuBieuMauSchema } from "../schema"
import { taiLieuBieuMauConfig } from "../config"
import { useCreateTaiLieuBieuMau, useUpdateTaiLieuBieuMau, useDeleteTaiLieuBieuMau } from "../hooks"
import { formatDateTime } from "@/shared/utils/date-format"
import { getHangMucBadgeColor } from "../constants/badge-colors"
import type { DetailSection } from "@/shared/components"
import type { FormSection } from "@/shared/components/forms/generic-form-view"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLoaiTaiLieu } from "@/features/cong-viec/tai-lieu/loai-tai-lieu/hooks"
import { useDanhMucTaiLieu } from "@/features/cong-viec/tai-lieu/danh-muc-tai-lieu/hooks"
// import { useTaiLieuBieuMau } from "../hooks"
import { useAuthStore } from "@/shared/stores/auth-store"
import { cn } from "@/lib/utils"
import { z } from "zod"

const VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY = "children-tai-lieu-view-detail-skip-confirm"

interface ChildrenTaiLieuSectionProps {
    parentId: number
    parentHangMuc: string | null
    parentLoaiId: number | null
    children: TaiLieuBieuMau[]
    isLoading?: boolean
}

export function ChildrenTaiLieuSection({
    parentId,
    parentHangMuc,
    parentLoaiId,
    children,
    isLoading = false
}: ChildrenTaiLieuSectionProps) {
    const navigate = useNavigate()
    const createMutation = useCreateTaiLieuBieuMau()
    const updateMutation = useUpdateTaiLieuBieuMau()
    const deleteMutation = useDeleteTaiLieuBieuMau()
    const { employee: currentEmployee } = useAuthStore()
    const { data: loaiTaiLieuList = [] } = useLoaiTaiLieu()
    const { data: danhMucTaiLieuList = [] } = useDanhMucTaiLieu()
    // const { data: allTaiLieuBieuMauList = [] } = useTaiLieuBieuMau()

    // State management
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [formDialogOpen, setFormDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
    const [selectedChild, setSelectedChild] = useState<TaiLieuBieuMau | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [childToView, setChildToView] = useState<TaiLieuBieuMau | null>(null)

    // State for form field dependencies
    const [selectedHangMuc, setSelectedHangMuc] = useState<string | null>(parentHangMuc)
    const [selectedLoaiId, setSelectedLoaiId] = useState<number | null>(parentLoaiId)
    const [_selectedDanhMucId, setSelectedDanhMucId] = useState<number | null>(null)

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

    // Filter danh mục tài liệu options based on selectedHangMuc and selectedLoaiId
    const danhMucOptions = useMemo(() => {
        if (!selectedHangMuc || !selectedLoaiId) return []
        return danhMucTaiLieuList
            .filter(item => 
                item.id && 
                item.hang_muc === selectedHangMuc &&
                item.loai_id === selectedLoaiId
            )
            .map(item => ({
                label: item.ten_danh_muc || `ID: ${item.id}`,
                value: item.id!.toString()
            }))
    }, [danhMucTaiLieuList, selectedHangMuc, selectedLoaiId])

    // Click dòng -> Mở popup detail
    const handleRowClick = useCallback((child: TaiLieuBieuMau) => {
        setSelectedChild(child)
        setDetailDialogOpen(true)
    }, [])

    // Click icon mắt -> Confirm dialog -> Redirect đến page detail
    const handleEyeClick = useCallback((child: TaiLieuBieuMau) => {
        if (!child.id) return

        const skipConfirm =
            typeof window !== "undefined" &&
            window.localStorage.getItem(VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY) === "true"

        if (skipConfirm) {
            navigate(`${taiLieuBieuMauConfig.routePath}/${child.id}`)
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
        setSelectedDanhMucId(null)
        setFormDialogOpen(true)
    }, [parentHangMuc, parentLoaiId])

    // Click sửa -> Mở popup form
    const handleEdit = useCallback((child: TaiLieuBieuMau) => {
        setSelectedChild(child)
        setIsEditMode(true)
        setSelectedHangMuc(child.hang_muc || null)
        setSelectedLoaiId(child.loai_id || null)
        setSelectedDanhMucId(child.danh_muc_id || null)
        setFormDialogOpen(true)
    }, [])

    // Click xóa -> Mở popup confirm
    const handleDelete = useCallback((child: TaiLieuBieuMau) => {
        setSelectedChild(child)
        setDeleteDialogOpen(true)
    }, [])

    // Handle form submit
    const handleFormSubmit = useCallback(async (data: any) => {
        const nguoiTaoId = currentEmployee?.ma_nhan_vien
        if (!nguoiTaoId) {
            throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
        }

        // Auto-complete ten_loai from loai_id
        let tenLoai: string | null = null
        if (data.loai_id) {
            const loai = loaiTaiLieuList.find(item => item.id === Number(data.loai_id))
            tenLoai = loai?.loai || null
        }

        // Auto-complete ten_danh_muc from danh_muc_id (ten_danh_muc is text - tên danh mục)
        let tenDanhMuc: string | null = null
        if (data.danh_muc_id) {
            const danhMuc = danhMucTaiLieuList.find(item => item.id === Number(data.danh_muc_id))
            tenDanhMuc = danhMuc?.ten_danh_muc || null
        }

        // Auto-complete ten_danh_muc_cha from danh_muc_cha_id
        let tenDanhMucCha: string | null = null
        if (data.danh_muc_cha_id) {
            const danhMucCha = danhMucTaiLieuList.find(item => item.id === Number(data.danh_muc_cha_id))
            tenDanhMucCha = danhMucCha?.ten_danh_muc || null
        }

        if (isEditMode && selectedChild?.id) {
            await updateMutation.mutateAsync({
                id: selectedChild.id,
                input: {
                    hang_muc: data.hang_muc || null,
                    loai_id: data.loai_id ? Number(data.loai_id) : undefined,
                    ten_loai: tenLoai,
                    danh_muc_id: data.danh_muc_id ? Number(data.danh_muc_id) : undefined,
                    ten_danh_muc: tenDanhMuc,
                    danh_muc_cha_id: data.danh_muc_cha_id ? Number(data.danh_muc_cha_id) : null,
                    ten_danh_muc_cha: tenDanhMucCha,
                    ma_tai_lieu: data.ma_tai_lieu || null,
                    ten_tai_lieu: data.ten_tai_lieu || null,
                    mo_ta: data.mo_ta || null,
                    link_du_thao: data.link_du_thao || null,
                    link_ap_dung: data.link_ap_dung || null,
                    ghi_chu: data.ghi_chu || null,
                    trang_thai: data.trang_thai || null,
                    phan_phoi_pb_id: data.phan_phoi_pb_id ? Number(data.phan_phoi_pb_id) : null,
                    tai_lieu_cha_id: parentId,
                }
            })
        } else {
            await createMutation.mutateAsync({
                hang_muc: data.hang_muc || null,
                loai_id: data.loai_id ? Number(data.loai_id) : (data.loai_id as number),
                ten_loai: tenLoai,
                danh_muc_id: data.danh_muc_id ? Number(data.danh_muc_id) : (data.danh_muc_id as number),
                ten_danh_muc: tenDanhMuc,
                danh_muc_cha_id: data.danh_muc_cha_id ? Number(data.danh_muc_cha_id) : null,
                ten_danh_muc_cha: tenDanhMucCha,
                ma_tai_lieu: data.ma_tai_lieu || null,
                ten_tai_lieu: data.ten_tai_lieu || null,
                mo_ta: data.mo_ta || null,
                link_du_thao: data.link_du_thao || null,
                link_ap_dung: data.link_ap_dung || null,
                ghi_chu: data.ghi_chu || null,
                trang_thai: data.trang_thai || null,
                phan_phoi_pb_id: data.phan_phoi_pb_id ? Number(data.phan_phoi_pb_id) : null,
                tai_lieu_cha_id: parentId,
                nguoi_tao_id: nguoiTaoId,
            })
        }
    }, [isEditMode, selectedChild, currentEmployee, parentId, loaiTaiLieuList, danhMucTaiLieuList, createMutation, updateMutation])

    // Handle delete confirmation
    const handleDeleteConfirm = useCallback(async () => {
        if (!selectedChild?.id) return
        await deleteMutation.mutateAsync(selectedChild.id)
        setDeleteDialogOpen(false)
        setSelectedChild(null)
    }, [selectedChild, deleteMutation])

    // Get detail sections for dialog
    const getDetailSections = useCallback((child: TaiLieuBieuMau): DetailSection[] => {
        const hangMucBadgeClass = getHangMucBadgeColor(child.hang_muc)
        
        return [
            {
                title: "Thông Tin Cơ Bản",
                fields: [
                    { label: "Mã Tài Liệu", key: "ma_tai_lieu", value: child.ma_tai_lieu || "-" },
                    { label: "Tên Tài Liệu", key: "ten_tai_lieu", value: child.ten_tai_lieu || "-" },
                    { label: "Mô Tả", key: "mo_ta", value: child.mo_ta || "-" },
                    {
                        label: "Hạng Mục",
                        key: "hang_muc",
                        value: child.hang_muc || "-",
                        format: (val: any) => {
                            if (!val || val === "-") return "-"
                            return (
                                <Badge variant="outline" className={hangMucBadgeClass}>
                                    {val}
                                </Badge>
                            )
                        }
                    },
                    { label: "Trạng Thái", key: "trang_thai", value: child.trang_thai || "-" },
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
                        placeholder: "Chọn loại tài liệu",
                        disabled: !selectedHangMuc,
                    },
                    {
                        name: "danh_muc_id",
                        label: "Danh Mục",
                        type: "select",
                        options: danhMucOptions,
                        placeholder: "Chọn danh mục",
                        disabled: !selectedHangMuc || !selectedLoaiId,
                    },
                    {
                        name: "ma_tai_lieu",
                        label: "Mã Tài Liệu",
                        placeholder: "Nhập mã tài liệu"
                    },
                    {
                        name: "ten_tai_lieu",
                        label: "Tên Tài Liệu",
                        required: true,
                        placeholder: "Nhập tên tài liệu",
                    },
                    {
                        name: "mo_ta",
                        label: "Mô Tả",
                        type: "textarea",
                        placeholder: "Nhập mô tả",
                        colSpan: 2
                    },
                    {
                        name: "trang_thai",
                        label: "Trạng Thái",
                        placeholder: "Nhập trạng thái"
                    },
                ]
            },
        ]
    }, [loaiTaiLieuOptions, danhMucOptions, selectedHangMuc, selectedLoaiId])

    // Define columns for the table
    const columns: EmbeddedListColumn<TaiLieuBieuMau>[] = useMemo(() => [
        {
            key: "ten_tai_lieu",
            header: "Tên Tài Liệu",
            sortable: true,
            stickyLeft: true,
            stickyMinWidth: 200,
            render: (item) => (
                <span className={cn("font-medium")}>
                    {item.ten_tai_lieu || item.ma_tai_lieu || `ID: ${item.id}`}
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
            key: "trang_thai",
            header: "Trạng Thái",
            sortable: true,
            hideInCompact: true,
            render: (item) => (
                item.trang_thai ? (
                    <Badge variant="outline">{item.trang_thai}</Badge>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )
            )
        },
        {
            key: "nguoi_tao_id",
            header: "Người Tạo",
            sortable: true,
            hideInCompact: true,
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
            hideInCompact: true,
            render: (item) => (
                <span className="text-muted-foreground">
                    {formatDateTime(item.tg_tao)}
                </span>
            )
        }
    ], [])

    // Form schema
    const formSchema = useMemo(() => {
        return taiLieuBieuMauSchema.omit({
            id: true,
            tg_tao: true,
            tg_cap_nhat: true,
            nguoi_tao_id: true,
            nguoi_tao_ten: true,
            ten_loai: true,
            ten_danh_muc: true,
            ten_danh_muc_cha: true,
            tai_lieu_cha_id: true,
            trao_doi: true,
        }).extend({
            loai_id: z.union([z.string(), z.number(), z.null()]).optional().nullable().transform((val: string | number | null | undefined) => {
                if (val === "" || val === null || val === undefined) return null
                if (typeof val === "string") {
                    const num = Number(val)
                    return isNaN(num) ? null : num
                }
                return val
            }),
            danh_muc_id: z.union([z.string(), z.number(), z.null()]).optional().nullable().transform((val: string | number | null | undefined) => {
                if (val === "" || val === null || val === undefined) return null
                if (typeof val === "string") {
                    const num = Number(val)
                    return isNaN(num) ? null : num
                }
                return val
            }),
            link_du_thao: z.union([
                z.string().url("Link dự thảo phải là URL hợp lệ"),
                z.literal(""),
                z.null()
            ]).optional().nullable().transform((val) => val === "" ? null : val),
            link_ap_dung: z.union([
                z.string().url("Link áp dụng phải là URL hợp lệ"),
                z.literal(""),
                z.null()
            ]).optional().nullable().transform((val) => val === "" ? null : val),
            ten_tai_lieu: z.string().min(1, "Tên tài liệu là bắt buộc").nullable(),
        })
    }, [])

    // Form default values
    const formDefaultValues = useMemo(() => {
        if (isEditMode && selectedChild) {
            return {
                hang_muc: selectedChild.hang_muc || "",
                loai_id: selectedChild.loai_id ? selectedChild.loai_id.toString() : "",
                danh_muc_id: selectedChild.danh_muc_id ? selectedChild.danh_muc_id.toString() : "",
                ma_tai_lieu: selectedChild.ma_tai_lieu || "",
                ten_tai_lieu: selectedChild.ten_tai_lieu || "",
                mo_ta: selectedChild.mo_ta || "",
                trang_thai: selectedChild.trang_thai || "",
            }
        }
        // Create mode: pre-fill from parent
        return {
            hang_muc: parentHangMuc || "",
            loai_id: parentLoaiId ? parentLoaiId.toString() : "",
            danh_muc_id: "",
            ma_tai_lieu: "",
            ten_tai_lieu: "",
            mo_ta: "",
            trang_thai: "",
        }
    }, [isEditMode, selectedChild, parentHangMuc, parentLoaiId])

    return (
        <>
            <EmbeddedListSection
                title="Tài Liệu Con"
                titleIcon={FileText}
                titleClassName="text-primary"
                data={children}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="Chưa có tài liệu con nào"
                emptyStateIcon={FileText}
                onAdd={handleAdd}
                addLabel="Thêm tài liệu con"
                addButtonVariant="default"
                onRowClick={handleRowClick}
                onView={handleEyeClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showActions={true}
                getItemId={(item) => item.id!}
                getItemName={(item) => item.ten_tai_lieu || item.ma_tai_lieu || `ID: ${item.id}`}
                defaultSortField="tg_tao"
                defaultSortDirection="desc"
                maxHeight="500px"
                compactMode={true}
                compactRowCount={5}
                showMoreIndicator={true}
                enableExpandView={true}
                expandDialogTitle="Danh Sách Đầy Đủ Tài Liệu Con"
                showItemCount={true}
                totalCount={children.length}
                enableSearch={true}
                searchPlaceholder="Tìm kiếm tài liệu con..."
                searchFields={["ten_tai_lieu", "ma_tai_lieu", "mo_ta"]}
            />

            {/* Detail Dialog - Click dòng */}
            {selectedChild && (
                <GenericDetailDialog
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                    dialogTitle={`Chi Tiết: ${selectedChild.ten_tai_lieu || selectedChild.ma_tai_lieu || `ID: ${selectedChild.id}`}`}
                    dialogSubtitle="Chi tiết tài liệu & biểu mẫu"
                    title={selectedChild.ten_tai_lieu || selectedChild.ma_tai_lieu || `ID: ${selectedChild.id}`}
                    subtitle={selectedChild.mo_ta || "Tài liệu & biểu mẫu"}
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
                        setSelectedHangMuc(parentHangMuc)
                        setSelectedLoaiId(parentLoaiId)
                        setSelectedDanhMucId(null)
                    }
                }}
                title={isEditMode ? `Sửa Tài Liệu: ${selectedChild?.ten_tai_lieu || selectedChild?.ma_tai_lieu}` : "Thêm Mới Tài Liệu Con"}
                subtitle={isEditMode ? "Cập nhật thông tin tài liệu & biểu mẫu" : "Thêm tài liệu con mới"}
                schema={formSchema}
                defaultValues={formDefaultValues}
                sections={getFormSections()}
                onSubmit={handleFormSubmit}
                submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
                successMessage={isEditMode ? "Cập nhật tài liệu & biểu mẫu thành công" : "Thêm mới tài liệu & biểu mẫu thành công"}
                errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật tài liệu & biểu mẫu" : "Có lỗi xảy ra khi thêm mới tài liệu & biểu mẫu"}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Delete Dialog */}
            {selectedChild && (
                <GenericDeleteDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title="Xác nhận xóa tài liệu & biểu mẫu"
                    description="Bạn có chắc chắn muốn xóa tài liệu & biểu mẫu này không?"
                    entityName={selectedChild.ten_tai_lieu || selectedChild.ma_tai_lieu || `ID: ${selectedChild.id}`}
                    onConfirm={handleDeleteConfirm}
                    isLoading={deleteMutation.isPending}
                />
            )}

            {/* View Detail Confirm Dialog - Click icon mắt */}
            <ConfirmDialog
                open={viewConfirmOpen}
                onOpenChange={setViewConfirmOpen}
                title="Mở trang chi tiết tài liệu & biểu mẫu"
                description="Bạn có muốn mở trang chi tiết tài liệu & biểu mẫu trong module Tài Liệu & Biểu Mẫu không?"
                confirmLabel="Mở trang chi tiết"
                cancelLabel="Hủy"
                skipConfirmStorageKey={VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY}
                skipConfirmLabel="Đừng hỏi lại lần sau"
                onConfirm={() => {
                    if (!childToView?.id) return
                    navigate(`${taiLieuBieuMauConfig.routePath}/${childToView.id}`)
                }}
            />
        </>
    )
}

