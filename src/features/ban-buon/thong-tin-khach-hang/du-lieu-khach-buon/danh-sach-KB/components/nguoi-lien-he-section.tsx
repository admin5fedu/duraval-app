/**
 * Người Liên Hệ Section Component
 * 
 * Component hiển thị danh sách người liên hệ trong detail view khách buôn.
 * Sử dụng EmbeddedListSection để chuẩn hóa theo quy tắc ERP.
 */

"use client"

import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { EmbeddedListSection, type EmbeddedListColumn, EmbeddedListFullViewDialog, GenericDetailDialog, GenericFormDialog, GenericDeleteDialog, ConfirmDialog, type DetailSection, type FormSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Users, Plus } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { sectionTitleClass } from "@/shared/utils/section-styles"
import type { NguoiLienHe } from "../../nguoi-lien-he/schema"
import { nguoiLienHeConfig } from "../../nguoi-lien-he/config"
import { nguoiLienHeBaseSchema } from "../../nguoi-lien-he/schema"
import type { CreateNguoiLienHeInput, UpdateNguoiLienHeInput } from "../../nguoi-lien-he/schema"
import { useNguoiLienHeById } from "../../nguoi-lien-he/hooks/use-nguoi-lien-he"
import { useCreateNguoiLienHe, useUpdateNguoiLienHe, useDeleteNguoiLienHe } from "../../nguoi-lien-he/hooks/use-nguoi-lien-he-mutations"
// import { useDanhSachKBById } from "../hooks/use-danh-sach-KB"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"

const VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY = "nguoi-lien-he-view-detail-skip-confirm"

interface NguoiLienHeSectionProps {
  khachBuonId: number
  nguoiLienHeList: NguoiLienHe[]
  isLoading?: boolean
  khachBuonName?: string // Tên khách buôn để hiển thị trong dialog
}

export function NguoiLienHeSection({
  khachBuonId,
  nguoiLienHeList,
  isLoading = false,
  khachBuonName,
}: NguoiLienHeSectionProps) {
  const navigate = useNavigate()
  
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
  const [expandDialogOpen, setExpandDialogOpen] = useState(false)
  const [selectedNguoiLienHe, setSelectedNguoiLienHe] = useState<NguoiLienHe | null>(null)
  const [nguoiLienHeToView, setNguoiLienHeToView] = useState<NguoiLienHe | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const createMutation = useCreateNguoiLienHe()
  const updateMutation = useUpdateNguoiLienHe()
  const deleteMutation = useDeleteNguoiLienHe()

  // Query for selected người liên hệ detail
  const nguoiLienHeQuery = useNguoiLienHeById(selectedNguoiLienHe?.id || 0, selectedNguoiLienHe || undefined)
  const viewState = useDetailViewStateFromQuery(nguoiLienHeQuery, selectedNguoiLienHe || undefined)

  // Load khách buôn data để pre-fill form (if needed in the future)
  // const { data: khachBuonData } = useDanhSachKBById(khachBuonId, undefined)

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
    } catch {
      return "-"
    }
  }

  // Click dòng -> Mở popup detail
  const handleRowClick = (nguoiLienHe: NguoiLienHe) => {
    setSelectedNguoiLienHe(nguoiLienHe)
    setDetailDialogOpen(true)
  }

  // Click icon mắt -> Confirm dialog -> Redirect đến page detail
  const handleEyeClick = (nguoiLienHe: NguoiLienHe) => {
    if (!nguoiLienHe.id) return

    const skipConfirm =
      typeof window !== "undefined" &&
      window.localStorage.getItem(VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY) === "true"

    if (skipConfirm) {
      navigate(`${nguoiLienHeConfig.routePath}/${nguoiLienHe.id}`)
      return
    }

    setNguoiLienHeToView(nguoiLienHe)
    setViewConfirmOpen(true)
  }

  // Handle add
  const handleAdd = () => {
    setSelectedNguoiLienHe(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
  }

  // Handle edit
  const handleEdit = (nguoiLienHe: NguoiLienHe) => {
    setSelectedNguoiLienHe(nguoiLienHe)
    setIsEditMode(true)
    setFormDialogOpen(true)
  }

  // Handle delete
  const handleDelete = (nguoiLienHe: NguoiLienHe) => {
    setSelectedNguoiLienHe(nguoiLienHe)
    setDeleteDialogOpen(true)
  }

  // Handle form submit
  const handleFormSubmit = async (data: any) => {
    // Transform form data to match schema
    const submitData: CreateNguoiLienHeInput | UpdateNguoiLienHeInput = {
      khach_buon_id: data.khach_buon_id?.id || data.khach_buon_id || khachBuonId,
      ten_lien_he: data.ten_lien_he,
      vai_tro: data.vai_tro,
      gioi_tinh: data.gioi_tinh,
      hinh_anh: data.hinh_anh || null,
      ngay_sinh: data.ngay_sinh || null,
      so_dien_thoai_1: data.so_dien_thoai_1 || null,
      so_dien_thoai_2: data.so_dien_thoai_2 || null,
      email: data.email || null,
      tinh_cach: data.tinh_cach || null,
      so_thich: data.so_thich || null,
      luu_y_khi_lam_viec: data.luu_y_khi_lam_viec || null,
      ghi_chu_khac: data.ghi_chu_khac || null,
    }

    if (isEditMode && selectedNguoiLienHe) {
      await updateMutation.mutateAsync({ 
        id: selectedNguoiLienHe.id!, 
        input: submitData as UpdateNguoiLienHeInput
      })
    } else {
      await createMutation.mutateAsync(submitData as CreateNguoiLienHeInput)
    }
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedNguoiLienHe?.id) return
    await deleteMutation.mutateAsync(selectedNguoiLienHe.id)
  }

  // Get detail sections for dialog
  const getDetailSections = (nguoiLienHe: NguoiLienHe): DetailSection[] => {
    return [
      {
        title: "Thông Tin Cơ Bản",
        fields: [
          { 
            label: "Khách Buôn", 
            key: "ten_khach_buon", 
            value: nguoiLienHe.ten_khach_buon || "-",
            colSpan: 2 as const
          },
          { 
            label: "Tên Liên Hệ", 
            key: "ten_lien_he", 
            value: nguoiLienHe.ten_lien_he || "-"
          },
          { 
            label: "Vai Trò", 
            key: "vai_tro", 
            value: nguoiLienHe.vai_tro || "-"
          },
          { 
            label: "Giới Tính", 
            key: "gioi_tinh", 
            value: nguoiLienHe.gioi_tinh || "-"
          },
          { 
            label: "Ngày Sinh", 
            key: "ngay_sinh", 
            value: nguoiLienHe.ngay_sinh || "-"
          },
        ]
      },
      {
        title: "Thông Tin Liên Hệ",
        fields: [
          { 
            label: "Số Điện Thoại 1", 
            key: "so_dien_thoai_1", 
            value: nguoiLienHe.so_dien_thoai_1 || "-"
          },
          { 
            label: "Số Điện Thoại 2", 
            key: "so_dien_thoai_2", 
            value: nguoiLienHe.so_dien_thoai_2 || "-"
          },
          { 
            label: "Email", 
            key: "email", 
            value: nguoiLienHe.email || "-",
            colSpan: 2 as const
          },
        ]
      },
      {
        title: "Thông Tin Khác",
        fields: [
          { 
            label: "Tính Cách", 
            key: "tinh_cach", 
            value: nguoiLienHe.tinh_cach || "-",
            colSpan: 2 as const
          },
          { 
            label: "Sở Thích", 
            key: "so_thich", 
            value: nguoiLienHe.so_thich || "-",
            colSpan: 2 as const
          },
          { 
            label: "Lưu Ý Khi Làm Việc", 
            key: "luu_y_khi_lam_viec", 
            value: nguoiLienHe.luu_y_khi_lam_viec || "-",
            colSpan: 2 as const
          },
          { 
            label: "Ghi Chú Khác", 
            key: "ghi_chu_khac", 
            value: nguoiLienHe.ghi_chu_khac || "-",
            colSpan: 2 as const
          },
        ]
      },
      {
        title: "Thông Tin Hệ Thống",
        fields: [
          { 
            label: "Thời Gian Tạo", 
            key: "tg_tao", 
            value: formatDate(nguoiLienHe.tg_tao)
          },
          { 
            label: "Thời Gian Cập Nhật", 
            key: "tg_cap_nhat", 
            value: formatDate(nguoiLienHe.tg_cap_nhat)
          },
        ]
      },
    ]
  }

  // Prepare form sections
  const formSections: FormSection[] = useMemo(() => {
    return [
      {
        title: "Thông Tin Cơ Bản",
        fields: [
          {
            name: "khach_buon_id",
            label: "Khách Buôn",
            type: "khach-buon-select",
            required: true,
            defaultValue: khachBuonId,
            disabled: true, // Disable vì đã chọn từ khách buôn cha
          },
          { name: "ten_lien_he", label: "Tên Liên Hệ", required: true },
          { 
            name: "vai_tro", 
            label: "Vai Trò",
            type: "combobox",
            required: true,
            options: [
              { label: "Chủ", value: "Chủ" },
              { label: "Con", value: "Con" },
              { label: "Vợ/chồng", value: "Vợ/chồng" },
              { label: "Người thân", value: "Người thân" },
              { label: "Nhân viên", value: "Nhân viên" },
            ],
            allowCustom: true,
          },
          { name: "hinh_anh", label: "Hình Ảnh", type: "image" },
          { 
            name: "gioi_tinh", 
            label: "Giới Tính",
            type: "toggle",
            required: true,
            options: [
              { label: "Nam", value: "Nam" },
              { label: "Nữ", value: "Nữ" },
              { label: "Khác", value: "Khác" },
            ]
          },
          { name: "ngay_sinh", label: "Ngày Sinh", type: "date" },
        ]
      },
      {
        title: "Thông Tin Liên Hệ",
        fields: [
          { name: "so_dien_thoai_1", label: "Số Điện Thoại 1" },
          { name: "so_dien_thoai_2", label: "Số Điện Thoại 2" },
          { name: "email", label: "Email", type: "email" },
        ]
      },
      {
        title: "Thông Tin Khác",
        fields: [
          { name: "tinh_cach", label: "Tính Cách", type: "textarea" },
          { name: "so_thich", label: "Sở Thích", type: "textarea" },
          { name: "luu_y_khi_lam_viec", label: "Lưu Ý Khi Làm Việc", type: "textarea" },
          { name: "ghi_chu_khac", label: "Ghi Chú Khác", type: "textarea", colSpan: 2 },
        ]
      },
    ]
  }, [khachBuonId])

  // Define columns for the table
  const columns: EmbeddedListColumn<NguoiLienHe>[] = [
    {
      key: "ten_lien_he",
      header: "Tên Liên Hệ",
      sortable: true,
      stickyLeft: true,
      stickyMinWidth: 150,
      render: (item) => (
        <div className="font-medium">{item.ten_lien_he || "-"}</div>
      ),
    },
    {
      key: "vai_tro",
      header: "Vai Trò",
      sortable: true,
      render: (item) => (
        <div className="text-sm">{item.vai_tro || "-"}</div>
      ),
    },
    {
      key: "gioi_tinh",
      header: "Giới Tính",
      sortable: true,
      render: (item) => (
        <div className="text-sm">{item.gioi_tinh || "-"}</div>
      ),
    },
    {
      key: "so_dien_thoai_1",
      header: "Số Điện Thoại 1",
      sortable: true,
      render: (item) => (
        <div className="text-sm font-mono">{item.so_dien_thoai_1 || "-"}</div>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      render: (item) => (
        <div className="text-sm">{item.email || "-"}</div>
      ),
    },
  ]

  return (
    <>
      <div className="space-y-3 sm:space-y-4 print:space-y-2 print:break-inside-avoid scroll-mt-28">
        <div className="flex items-center justify-between gap-2 sm:gap-2.5 px-1">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 rounded-md bg-primary/10 print:bg-transparent print:border print:border-primary">
              <Users className="h-4 w-4 text-primary shrink-0" />
            </div>
            <h3 className={sectionTitleClass("font-semibold tracking-tight text-primary")}>
              Danh Sách Người Liên Hệ
            </h3>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            {nguoiLienHeList.length > 0 && (
              <Button
                onClick={() => setExpandDialogOpen(true)}
                size="sm"
                variant="outline"
              >
                Xem tất cả
              </Button>
            )}
            <Button onClick={handleAdd} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Thêm Người Liên Hệ
            </Button>
          </div>
        </div>
        <EmbeddedListSection
          title=""
          data={nguoiLienHeList}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Chưa có người liên hệ nào"
          onRowClick={handleRowClick}
          onView={handleEyeClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          getItemId={(item) => item.id!}
          getItemName={(item) => item.ten_lien_he || `Người liên hệ #${item.id}`}
          compactMode={true}
          compactRowCount={5}
          showMoreIndicator={true}
          enableExpandView={false} // Disable default expand, use custom
          showItemCount={true}
          totalCount={nguoiLienHeList.length}
          defaultSortField="ten_lien_he"
          defaultSortDirection="asc"
        />
      </div>
      
      {/* Custom Expand Dialog */}
      {expandDialogOpen && (
        <EmbeddedListFullViewDialog
          open={expandDialogOpen}
          onOpenChange={setExpandDialogOpen}
          title={khachBuonName 
            ? `Danh Sách Đầy Đủ Người Liên Hệ - ${khachBuonName}`
            : "Danh Sách Đầy Đủ Người Liên Hệ"}
          data={nguoiLienHeList}
          columns={columns}
          onRowClick={handleRowClick}
          onView={handleEyeClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          getItemId={(item) => item.id!}
          defaultSortField="ten_lien_he"
          defaultSortDirection="asc"
          enableSearch={true}
          searchPlaceholder="Tìm kiếm theo tên, vai trò, số điện thoại..."
          searchFields={["ten_lien_he", "vai_tro", "so_dien_thoai_1", "so_dien_thoai_2", "email"]}
        />
      )}

      {/* Detail Dialog */}
      {selectedNguoiLienHe && (
        <GenericDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedNguoiLienHe.ten_lien_he || `Người liên hệ #${selectedNguoiLienHe.id}`}
          subtitle={selectedNguoiLienHe.vai_tro || undefined}
          sections={getDetailSections(selectedNguoiLienHe)}
          isLoading={viewState.isLoading}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDetailDialogOpen(false)
                  handleEdit(selectedNguoiLienHe)
                }}
              >
                Sửa
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDetailDialogOpen(false)
                  handleDelete(selectedNguoiLienHe)
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
        onOpenChange={setFormDialogOpen}
        title={isEditMode ? "Sửa Người Liên Hệ" : "Thêm Người Liên Hệ Mới"}
        schema={nguoiLienHeBaseSchema.omit({
          id: true,
          tg_tao: true,
          tg_cap_nhat: true,
          ten_khach_buon: true,
        })}
        sections={formSections}
        defaultValues={
          isEditMode && selectedNguoiLienHe
            ? {
                khach_buon_id: selectedNguoiLienHe.khach_buon_id,
                ten_lien_he: selectedNguoiLienHe.ten_lien_he || "",
                vai_tro: selectedNguoiLienHe.vai_tro || "",
                gioi_tinh: selectedNguoiLienHe.gioi_tinh || "",
                hinh_anh: selectedNguoiLienHe.hinh_anh || "",
                ngay_sinh: selectedNguoiLienHe.ngay_sinh || "",
                so_dien_thoai_1: selectedNguoiLienHe.so_dien_thoai_1 || "",
                so_dien_thoai_2: selectedNguoiLienHe.so_dien_thoai_2 || "",
                email: selectedNguoiLienHe.email || "",
                tinh_cach: selectedNguoiLienHe.tinh_cach || "",
                so_thich: selectedNguoiLienHe.so_thich || "",
                luu_y_khi_lam_viec: selectedNguoiLienHe.luu_y_khi_lam_viec || "",
                ghi_chu_khac: selectedNguoiLienHe.ghi_chu_khac || "",
              }
            : {
                khach_buon_id: khachBuonId,
              }
        }
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        submitLabel={isEditMode ? "Cập Nhật" : "Tạo Mới"}
      />

      {/* Delete Dialog */}
      {selectedNguoiLienHe && (
        <GenericDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Xóa Người Liên Hệ"
          description={`Bạn có chắc chắn muốn xóa người liên hệ "${selectedNguoiLienHe.ten_lien_he}"? Hành động này không thể hoàn tác.`}
          entityName={selectedNguoiLienHe.ten_lien_he || `Người liên hệ #${selectedNguoiLienHe.id}`}
          onConfirm={handleDeleteConfirm}
          isLoading={deleteMutation.isPending}
        />
      )}

      {/* View Confirm Dialog */}
      <ConfirmDialog
        open={viewConfirmOpen}
        onOpenChange={setViewConfirmOpen}
        title="Mở Trang Chi Tiết"
        description="Bạn muốn mở trang chi tiết của người liên hệ này trong tab mới?"
        confirmLabel="Mở Trang"
        cancelLabel="Hủy"
        onConfirm={() => {
          if (nguoiLienHeToView?.id) {
            navigate(`${nguoiLienHeConfig.routePath}/${nguoiLienHeToView.id}`)
          }
          setViewConfirmOpen(false)
        }}
        skipConfirmStorageKey={VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY}
      />
    </>
  )
}

