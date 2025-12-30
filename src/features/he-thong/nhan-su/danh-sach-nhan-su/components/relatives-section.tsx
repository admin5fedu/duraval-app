/**
 * Relatives Section Component
 * 
 * Component hiển thị danh sách người thân trong detail view nhân sự.
 * Tham khảo app-tham-khao để đảm bảo flow và quy tắc đúng.
 * 
 * Flow:
 * - Click dòng -> Mở popup detail (GenericDetailDialog)
 * - Click icon mắt -> Confirm dialog -> Redirect đến page detail module người thân
 * - Click icon sửa -> Mở popup form (GenericFormDialog)
 * - Click icon xóa -> Mở popup xác nhận xóa (GenericDeleteDialog)
 * - Click "Thêm Người Thân" -> Mở popup form (GenericFormDialog)
 */

"use client"

import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useNguoiThanByMaNhanVien } from "../../nguoi-than/hooks/use-nguoi-than"
import { EmbeddedListSection, type EmbeddedListColumn } from "@/shared/components/data-display/embedded-list-section"
import { GenericDetailDialog } from "@/shared/components/dialogs/generic-detail-dialog"
import { GenericFormDialog } from "@/shared/components/dialogs/generic-form-dialog"
import { GenericDeleteDialog } from "@/shared/components/dialogs/generic-delete-dialog"
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog"
import { NguoiThan, nguoiThanSchema } from "../../nguoi-than/schema"
import type { DetailSection } from "@/shared/components"
import type { FormSection } from "@/shared/components/forms/generic-form-view"
import { useCreateNguoiThan, useUpdateNguoiThan, useDeleteNguoiThan } from "../../nguoi-than/hooks/use-nguoi-than-mutations"
import { useNhanSu } from "../hooks/use-nhan-su"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserRound } from "lucide-react"
import { getEnumBadgeClass } from "@/shared/utils/enum-color-registry"
import { nguoiThanConfig } from "../../nguoi-than/config"

const VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY = "relatives-view-detail-skip-confirm"

interface RelativesSectionProps {
    maNhanVien: number
}

export function RelativesSection({ maNhanVien }: RelativesSectionProps) {
    const { data: relatives, isLoading } = useNguoiThanByMaNhanVien(maNhanVien)
    const { data: employees } = useNhanSu()
    const navigate = useNavigate()
    
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [formDialogOpen, setFormDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
    const [selectedRelative, setSelectedRelative] = useState<NguoiThan | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [relativeToView, setRelativeToView] = useState<NguoiThan | null>(null)

    const createMutation = useCreateNguoiThan()
    const updateMutation = useUpdateNguoiThan()
    const deleteMutation = useDeleteNguoiThan()

    // Create employee map for quick lookup
    const employeeMap = useMemo(() => {
        if (!employees) return new Map<number, { ma_nhan_vien: number; ho_ten: string }>()
        const map = new Map<number, { ma_nhan_vien: number; ho_ten: string }>()
        employees.forEach(emp => {
            map.set(emp.ma_nhan_vien, { ma_nhan_vien: emp.ma_nhan_vien, ho_ten: emp.ho_ten })
        })
        return map
    }, [employees])

    // Click dòng -> Mở popup detail
    const handleRowClick = (relative: NguoiThan) => {
        setSelectedRelative(relative)
        setDetailDialogOpen(true)
    }

    // Click icon mắt -> Confirm dialog -> Redirect đến page detail
    const handleEyeClick = (relative: NguoiThan) => {
        if (!relative.id) return

        const skipConfirm =
            typeof window !== "undefined" &&
            window.localStorage.getItem(VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY) === "true"

        if (skipConfirm) {
            navigate(`${nguoiThanConfig.routePath}/${relative.id}`)
            return
        }

        setRelativeToView(relative)
        setViewConfirmOpen(true)
    }

    const handleAdd = () => {
        setSelectedRelative(null)
        setIsEditMode(false)
        setFormDialogOpen(true)
    }

    const handleEdit = (relative: NguoiThan) => {
        setSelectedRelative(relative)
        setIsEditMode(true)
        setFormDialogOpen(true)
    }

    const handleDelete = (relative: NguoiThan) => {
        setSelectedRelative(relative)
        setDeleteDialogOpen(true)
    }

    const handleFormSubmit = async (data: Partial<NguoiThan> & { ho_va_ten: string; moi_quan_he: string }) => {
        // Sanitize data: convert empty strings to null for optional fields
        const sanitizedData = {
            ...data,
            ngay_sinh: data.ngay_sinh && data.ngay_sinh.trim() !== "" ? data.ngay_sinh : null,
            so_dien_thoai: data.so_dien_thoai && data.so_dien_thoai.trim() !== "" ? data.so_dien_thoai : null,
            ghi_chu: data.ghi_chu && data.ghi_chu.trim() !== "" ? data.ghi_chu : null,
        }

        if (isEditMode && selectedRelative) {
            const { id: _id, tg_tao: _tg_tao, ma_nhan_vien: _ma_nhan_vien, ...submitData } = sanitizedData
            void _id
            void _tg_tao
            void _ma_nhan_vien
            await updateMutation.mutateAsync({
                id: selectedRelative.id!,
                input: submitData
            })
        } else {
            const { id: _id, tg_tao: _tg_tao, tg_cap_nhat: _tg_cap_nhat, ma_nhan_vien: _ma_nhan_vien, ...submitData } = sanitizedData
            void _id
            void _tg_tao
            void _tg_cap_nhat
            void _ma_nhan_vien
            await createMutation.mutateAsync({
                ...submitData,
                ma_nhan_vien: maNhanVien
            })
        }
    }

    const handleDeleteConfirm = async () => {
        if (!selectedRelative?.id) return
        await deleteMutation.mutateAsync(selectedRelative.id)
    }

    const getDetailSections = (relative: NguoiThan): DetailSection[] => {
        const employee = employeeMap.get(relative.ma_nhan_vien)
        const employeeDisplay = employee 
            ? `${employee.ma_nhan_vien} - ${employee.ho_ten}`
            : String(relative.ma_nhan_vien)
        
        return [
            {
                title: "Thông Tin Cơ Bản",
                fields: [
                    { label: "ID", key: "id", value: relative.id, type: "number" },
                    { 
                        label: "Mã Nhân Viên", 
                        key: "ma_nhan_vien", 
                        value: employeeDisplay,
                        type: "url",
                        link: `/he-thong/danh-sach-nhan-su/${relative.ma_nhan_vien}`
                    },
                { label: "Họ và Tên", key: "ho_va_ten", value: relative.ho_va_ten },
                { label: "Mối Quan Hệ", key: "moi_quan_he", value: relative.moi_quan_he, type: "badge" },
                { label: "Ngày Sinh", key: "ngay_sinh", value: relative.ngay_sinh, type: "date" },
                { label: "Số Điện Thoại", key: "so_dien_thoai", value: relative.so_dien_thoai, type: "phone" },
            ]
        },
        {
            title: "Ghi Chú & Khác",
            fields: [
                { label: "Ghi Chú", key: "ghi_chu", value: relative.ghi_chu || "-", colSpan: 3 },
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
                    name: "ho_va_ten", 
                    label: "Họ và Tên", 
                    required: true, 
                    placeholder: "Nguyễn Văn A" 
                },
                { 
                    name: "moi_quan_he", 
                    label: "Mối Quan Hệ", 
                    required: true,
                    type: "toggle",
                    options: [
                        { label: "Cha", value: "Cha" },
                        { label: "Mẹ", value: "Mẹ" },
                        { label: "Vợ/Chồng", value: "Vợ/Chồng" },
                        { label: "Con", value: "Con" },
                        { label: "Anh/Chị/Em", value: "Anh/Chị/Em" },
                        { label: "Khác", value: "Khác" },
                    ]
                },
                { name: "ngay_sinh", label: "Ngày Sinh", type: "date" },
                { name: "so_dien_thoai", label: "Số Điện Thoại" },
            ]
        },
        {
            title: "Ghi Chú",
            fields: [
                { name: "ghi_chu", label: "Ghi Chú", type: "textarea" },
            ]
        }
    ]

    // Define columns for the table
    const columns: EmbeddedListColumn<NguoiThan>[] = [
        {
            key: "ho_va_ten",
            header: "Họ và Tên",
            sortable: true,
            stickyLeft: true, // Cố định cột tên khi scroll ngang
            stickyMinWidth: 180,
            render: (item) => (
                <span className="font-medium">{item.ho_va_ten}</span>
            )
        },
        {
            key: "moi_quan_he",
            header: "Mối Quan Hệ",
            sortable: true,
            render: (item) => {
                const colorClass = getEnumBadgeClass("moi_quan_he", item.moi_quan_he)
                return (
                    <Badge variant="outline" className={colorClass}>
                        {item.moi_quan_he}
                    </Badge>
                )
            }
        },
        {
            key: "ngay_sinh",
            header: "Ngày Sinh",
            sortable: true,
            hideInCompact: true, // Ẩn trong compact mode, chỉ hiện trong expand view
            render: (item) => (
                item.ngay_sinh 
                    ? new Date(item.ngay_sinh).toLocaleDateString("vi-VN")
                    : <span className="text-muted-foreground">-</span>
            )
        },
        {
            key: "so_dien_thoai",
            header: "Số Điện Thoại",
            sortable: true,
            hideInCompact: true, // Ẩn trong compact mode, chỉ hiện trong expand view
            render: (item) => (
                item.so_dien_thoai || <span className="text-muted-foreground">-</span>
            )
        }
    ]

    return (
        <>
            <EmbeddedListSection
                title="Danh Sách Người Thân"
                titleIcon={UserRound}
                titleClassName="text-primary"
                data={relatives || []}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="Chưa có thông tin người thân"
                onAdd={handleAdd}
                addLabel="Thêm Người Thân"
                onRowClick={handleRowClick}   // click dòng -> popup detail
                onView={handleEyeClick}       // click mắt -> confirm + redirect
                onEdit={handleEdit}
                onDelete={handleDelete}
                getItemId={(item) => item.id!}
                getItemName={(item) => item.ho_va_ten}
                // Compact mode: chỉ hiển thị 5 dòng đầu
                compactMode={true}
                compactRowCount={5}
                showMoreIndicator={true}
                // Expand view: mở dialog fullscreen
                enableExpandView={true}
                expandDialogTitle="Danh Sách Đầy Đủ Người Thân"
                // Item count
                showItemCount={true}
                totalCount={relatives?.length || 0}
                // Search trong expand dialog
                enableSearch={true}
                searchPlaceholder="Tìm kiếm người thân..."
                searchFields={["ho_va_ten", "so_dien_thoai"]}
            />

            {/* Detail Dialog - Click dòng hoặc từ actions */}
            {selectedRelative && (
                <GenericDetailDialog
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                    dialogTitle={`Chi Tiết Thông Tin: ${selectedRelative.ho_va_ten}`}
                    dialogSubtitle="Chi tiết thông tin người thân"
                    title={selectedRelative.ho_va_ten}
                    subtitle={selectedRelative.moi_quan_he}
                    sections={getDetailSections(selectedRelative)}
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setDetailDialogOpen(false)
                                    handleEdit(selectedRelative)
                                }}
                            >
                                Sửa
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setDetailDialogOpen(false)
                                    handleDelete(selectedRelative)
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
                        setSelectedRelative(null)
                        setIsEditMode(false)
                    }
                }}
                title={isEditMode ? `Sửa Thông Tin: ${selectedRelative?.ho_va_ten}` : "Thêm Mới Người Thân"}
                subtitle={isEditMode ? "Cập nhật thông tin người thân" : "Thêm thông tin người thân của nhân viên"}
                schema={nguoiThanSchema.omit({ 
                    id: true, 
                    ma_nhan_vien: true, 
                    tg_tao: true, 
                    tg_cap_nhat: true,
                    nguoi_tao: true
                })}
                defaultValues={isEditMode && selectedRelative 
                    ? {
                        ho_va_ten: selectedRelative.ho_va_ten,
                        moi_quan_he: selectedRelative.moi_quan_he,
                        ngay_sinh: selectedRelative.ngay_sinh || "",
                        so_dien_thoai: selectedRelative.so_dien_thoai || "",
                        ghi_chu: selectedRelative.ghi_chu || "",
                    }
                    : {
                        ho_va_ten: "",
                        moi_quan_he: "",
                        ngay_sinh: "",
                        so_dien_thoai: "",
                        ghi_chu: "",
                    }
                }
                sections={formSections}
                onSubmit={handleFormSubmit}
                submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
                successMessage={isEditMode ? "Cập nhật thông tin người thân thành công" : "Thêm mới thông tin người thân thành công"}
                errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật thông tin người thân" : "Có lỗi xảy ra khi thêm mới thông tin người thân"}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Delete Dialog */}
            {selectedRelative && (
                <GenericDeleteDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title="Xác nhận xóa thông tin người thân"
                    description="Bạn có chắc chắn muốn xóa thông tin người thân này không?"
                    entityName={selectedRelative.ho_va_ten}
                    onConfirm={handleDeleteConfirm}
                    isLoading={deleteMutation.isPending}
                />
            )}

            {/* View Detail Confirm Dialog - Click icon mắt */}
            <ConfirmDialog
                open={viewConfirmOpen}
                onOpenChange={setViewConfirmOpen}
                title="Mở trang chi tiết người thân"
                description="Bạn có muốn mở trang chi tiết người thân trong module Người thân không?"
                confirmLabel="Mở trang chi tiết"
                cancelLabel="Hủy"
                skipConfirmStorageKey={VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY}
                skipConfirmLabel="Đừng hỏi lại lần sau"
                onConfirm={() => {
                    if (!relativeToView?.id) return
                    navigate(`${nguoiThanConfig.routePath}/${relativeToView.id}`)
                }}
            />
        </>
    )
}

