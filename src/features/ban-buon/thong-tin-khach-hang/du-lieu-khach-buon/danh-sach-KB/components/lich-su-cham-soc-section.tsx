/**
 * Lịch Sử Chăm Sóc Section Component
 * 
 * Component hiển thị danh sách lịch sử chăm sóc trong detail view khách buôn.
 * Sử dụng EmbeddedListSection để chuẩn hóa theo quy tắc ERP.
 */

"use client"

import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { EmbeddedListSection, type EmbeddedListColumn, EmbeddedListFullViewDialog, GenericDetailDialog, GenericFormDialog, GenericDeleteDialog, ConfirmDialog, type DetailSection, type FormSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { History, Plus } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { sectionTitleClass } from "@/shared/utils/section-styles"
import type { ChamSocKhachBuon } from "@/features/ban-buon/cham-soc/cham-soc-khach-buon/schema"
import { chamSocKhachBuonConfig } from "@/features/ban-buon/cham-soc/cham-soc-khach-buon/config"
import { chamSocKhachBuonBaseSchema } from "@/features/ban-buon/cham-soc/cham-soc-khach-buon/schema"
import type { CreateChamSocKhachBuonInput, UpdateChamSocKhachBuonInput } from "@/features/ban-buon/cham-soc/cham-soc-khach-buon/schema"
import { useChamSocKhachBuonById } from "@/features/ban-buon/cham-soc/cham-soc-khach-buon/hooks/use-cham-soc-khach-buon"
import { useCreateChamSocKhachBuon, useUpdateChamSocKhachBuon, useDeleteChamSocKhachBuon } from "@/features/ban-buon/cham-soc/cham-soc-khach-buon/hooks/use-cham-soc-khach-buon"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { formatDate } from "@/shared/utils/date-format"
import { useAuthStore } from "@/shared/stores/auth-store"

const VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY = "lich-su-cham-soc-view-detail-skip-confirm"

interface LichSuChamSocSectionProps {
  khachBuonId: number
  chamSocKhachBuonList: ChamSocKhachBuon[]
  isLoading?: boolean
  khachBuonName?: string // Tên khách buôn để hiển thị trong dialog
}

export function LichSuChamSocSection({
  khachBuonId,
  chamSocKhachBuonList,
  isLoading = false,
  khachBuonName,
}: LichSuChamSocSectionProps) {
  const navigate = useNavigate()
  const { employee } = useAuthStore()
  
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
  const [expandDialogOpen, setExpandDialogOpen] = useState(false)
  const [selectedChamSocKhachBuon, setSelectedChamSocKhachBuon] = useState<ChamSocKhachBuon | null>(null)
  const [chamSocKhachBuonToView, setChamSocKhachBuonToView] = useState<ChamSocKhachBuon | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const createMutation = useCreateChamSocKhachBuon()
  const updateMutation = useUpdateChamSocKhachBuon()
  const deleteMutation = useDeleteChamSocKhachBuon()

  // Query for selected chăm sóc khách buôn detail
  const chamSocKhachBuonQuery = useChamSocKhachBuonById(selectedChamSocKhachBuon?.id || 0, selectedChamSocKhachBuon || undefined)
  const viewState = useDetailViewStateFromQuery(chamSocKhachBuonQuery, selectedChamSocKhachBuon || undefined)

  const formatDateString = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
    } catch {
      return "-"
    }
  }

  // Click dòng -> Mở popup detail
  const handleRowClick = (chamSocKhachBuon: ChamSocKhachBuon) => {
    setSelectedChamSocKhachBuon(chamSocKhachBuon)
    setDetailDialogOpen(true)
  }

  // Click icon mắt -> Confirm dialog -> Redirect đến page detail
  const handleEyeClick = (chamSocKhachBuon: ChamSocKhachBuon) => {
    if (!chamSocKhachBuon.id) return

    const skipConfirm =
      typeof window !== "undefined" &&
      window.localStorage.getItem(VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY) === "true"

    if (skipConfirm) {
      navigate(`${chamSocKhachBuonConfig.routePath}/${chamSocKhachBuon.id}`)
      return
    }

    setChamSocKhachBuonToView(chamSocKhachBuon)
    setViewConfirmOpen(true)
  }

  // Handle add
  const handleAdd = () => {
    setSelectedChamSocKhachBuon(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
  }

  // Handle edit
  const handleEdit = (chamSocKhachBuon: ChamSocKhachBuon) => {
    setSelectedChamSocKhachBuon(chamSocKhachBuon)
    setIsEditMode(true)
    setFormDialogOpen(true)
  }

  // Handle delete
  const handleDelete = (chamSocKhachBuon: ChamSocKhachBuon) => {
    setSelectedChamSocKhachBuon(chamSocKhachBuon)
    setDeleteDialogOpen(true)
  }

  // Handle form submit
  const handleFormSubmit = async (data: any) => {
    // Transform form data to match schema (giống form view)
    const submitData: CreateChamSocKhachBuonInput | UpdateChamSocKhachBuonInput = {
      ngay: data.ngay || null,
      nhan_vien_id: data.nhan_vien_id?.id || data.nhan_vien_id ? Number(data.nhan_vien_id?.id || data.nhan_vien_id) : null,
      khach_buon_id: data.khach_buon_id?.id || data.khach_buon_id ? Number(data.khach_buon_id?.id || data.khach_buon_id) : Number(khachBuonId),
      hinh_thuc: data.hinh_thuc || null,
      muc_tieu: data.muc_tieu || null,
      ket_qua: data.ket_qua || null,
      hanh_dong_tiep_theo: data.hanh_dong_tiep_theo || null,
      hen_cs_lai: data.hen_cs_lai || null,
      gps: data.gps || null,
      hinh_anh: data.hinh_anh || null,
      nguoi_tao_id: employee?.ma_nhan_vien || null,
    }

    if (isEditMode && selectedChamSocKhachBuon) {
      await updateMutation.mutateAsync({ 
        id: selectedChamSocKhachBuon.id!, 
        input: submitData as UpdateChamSocKhachBuonInput
      })
    } else {
      await createMutation.mutateAsync(submitData as CreateChamSocKhachBuonInput)
    }
  }

  // Handle form success - đóng dialog sau khi submit thành công
  const handleFormSuccess = () => {
    setFormDialogOpen(false)
    setSelectedChamSocKhachBuon(null)
    setIsEditMode(false)
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedChamSocKhachBuon?.id) return
    await deleteMutation.mutateAsync(selectedChamSocKhachBuon.id)
    setDeleteDialogOpen(false)
    setSelectedChamSocKhachBuon(null)
  }

  // Get detail sections for dialog
  const getDetailSections = (chamSocKhachBuon: ChamSocKhachBuon): DetailSection[] => {
    return [
      {
        title: "Thông Tin Cơ Bản",
        fields: [
          { 
            label: "Ngày", 
            key: "ngay", 
            value: chamSocKhachBuon.ngay ? formatDate(chamSocKhachBuon.ngay) : "-"
          },
          { 
            label: "Nhân Viên", 
            key: "ten_nhan_vien", 
            value: chamSocKhachBuon.ten_nhan_vien || "-"
          },
          { 
            label: "Khách Buôn", 
            key: "ten_khach_buon", 
            value: chamSocKhachBuon.ten_khach_buon || "-",
            colSpan: 2 as const
          },
          { 
            label: "Hình Thức", 
            key: "hinh_thuc", 
            value: chamSocKhachBuon.hinh_thuc || "-"
          },
        ]
      },
      {
        title: "Nội Dung Chăm Sóc",
        fields: [
          { 
            label: "Mục Tiêu", 
            key: "muc_tieu", 
            value: chamSocKhachBuon.muc_tieu || "-",
            colSpan: 2 as const
          },
          { 
            label: "Kết Quả", 
            key: "ket_qua", 
            value: chamSocKhachBuon.ket_qua || "-",
            colSpan: 2 as const
          },
          { 
            label: "Hành Động Tiếp Theo", 
            key: "hanh_dong_tiep_theo", 
            value: chamSocKhachBuon.hanh_dong_tiep_theo || "-",
            colSpan: 2 as const
          },
        ]
      },
      {
        title: "Thông Tin Bổ Sung",
        fields: [
          { 
            label: "Hẹn CS Lại", 
            key: "hen_cs_lai", 
            value: chamSocKhachBuon.hen_cs_lai ? formatDate(chamSocKhachBuon.hen_cs_lai) : "-"
          },
          { 
            label: "GPS", 
            key: "gps", 
            value: chamSocKhachBuon.gps || "-"
          },
          { 
            label: "Hình Ảnh", 
            key: "hinh_anh", 
            value: chamSocKhachBuon.hinh_anh || "-",
            type: "image",
            colSpan: 2 as const
          },
        ]
      },
      {
        title: "Thông Tin Hệ Thống",
        fields: [
          { 
            label: "Người Tạo", 
            key: "ten_nguoi_tao", 
            value: chamSocKhachBuon.ten_nguoi_tao || "-"
          },
          { 
            label: "Thời Gian Tạo", 
            key: "tg_tao", 
            value: formatDateString(chamSocKhachBuon.tg_tao)
          },
          { 
            label: "Thời Gian Cập Nhật", 
            key: "tg_cap_nhat", 
            value: formatDateString(chamSocKhachBuon.tg_cap_nhat)
          },
        ]
      },
    ]
  }

  // Prepare form sections (giống form view)
  const formSections: FormSection[] = useMemo(() => {
    return [
      {
        title: "Thông Tin Cơ Bản",
        fields: [
          { name: "ngay", label: "Ngày", type: "date" },
          {
            name: "nhan_vien_id",
            label: "Nhân Viên",
            type: "nhan-su-select",
          },
          {
            name: "khach_buon_id",
            label: "Khách Buôn",
            type: "khach-buon-select",
            required: true,
            defaultValue: khachBuonId,
            disabled: true, // Disable vì đã chọn từ khách buôn cha
          },
          {
            name: "hinh_thuc",
            label: "Hình Thức",
            type: "toggle",
            required: true,
            options: [
              { label: "Thị trường", value: "Thị trường" },
              { label: "Chăm sóc Online", value: "Chăm sóc Online" },
            ],
          },
        ]
      },
      {
        title: "Nội Dung Chăm Sóc",
        fields: [
          { name: "muc_tieu", label: "Mục Tiêu", type: "textarea", colSpan: 2, required: true },
          { name: "ket_qua", label: "Kết Quả", type: "textarea", colSpan: 2, required: true },
          { name: "hanh_dong_tiep_theo", label: "Hành Động Tiếp Theo", type: "textarea", colSpan: 2 },
        ]
      },
      {
        title: "Thông Tin Bổ Sung",
        fields: [
          { name: "hen_cs_lai", label: "Hẹn CS Lại", type: "date" },
          {
            name: "gps",
            label: "GPS",
            type: "gps-location-input",
            required: (formValues: any) => formValues?.hinh_thuc === "Thị trường",
            hidden: (formValues: any) => formValues?.hinh_thuc !== "Thị trường",
          },
          {
            name: "hinh_anh",
            label: "Hình Ảnh",
            type: "image",
            colSpan: 2,
            required: (formValues: any) => formValues?.hinh_thuc === "Thị trường",
            hidden: (formValues: any) => formValues?.hinh_thuc !== "Thị trường",
          },
        ]
      },
    ]
  }, [khachBuonId])

  // Prepare default values for form (giống form view)
  const defaultValues = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    
    if (isEditMode && selectedChamSocKhachBuon) {
      return {
        ngay: selectedChamSocKhachBuon.ngay ? String(selectedChamSocKhachBuon.ngay) : today,
        nhan_vien_id: selectedChamSocKhachBuon.nhan_vien_id ? String(selectedChamSocKhachBuon.nhan_vien_id) : null,
        khach_buon_id: selectedChamSocKhachBuon.khach_buon_id ? String(selectedChamSocKhachBuon.khach_buon_id) : String(khachBuonId),
        hinh_thuc: selectedChamSocKhachBuon.hinh_thuc ? String(selectedChamSocKhachBuon.hinh_thuc) : "Thị trường",
        muc_tieu: selectedChamSocKhachBuon.muc_tieu ? String(selectedChamSocKhachBuon.muc_tieu) : "",
        ket_qua: selectedChamSocKhachBuon.ket_qua ? String(selectedChamSocKhachBuon.ket_qua) : "",
        hanh_dong_tiep_theo: selectedChamSocKhachBuon.hanh_dong_tiep_theo ? String(selectedChamSocKhachBuon.hanh_dong_tiep_theo) : "",
        hen_cs_lai: selectedChamSocKhachBuon.hen_cs_lai ? String(selectedChamSocKhachBuon.hen_cs_lai) : null,
        gps: selectedChamSocKhachBuon.gps ? String(selectedChamSocKhachBuon.gps) : "",
        hinh_anh: selectedChamSocKhachBuon.hinh_anh ? String(selectedChamSocKhachBuon.hinh_anh) : null,
      }
    }

    return {
      ngay: today,
      nhan_vien_id: employee?.ma_nhan_vien ? String(employee.ma_nhan_vien) : null,
      khach_buon_id: String(khachBuonId),
      hinh_thuc: "Thị trường",
      muc_tieu: "",
      ket_qua: "",
      hanh_dong_tiep_theo: "",
      hen_cs_lai: null,
      gps: "",
      hinh_anh: null,
    }
  }, [isEditMode, selectedChamSocKhachBuon, khachBuonId, employee])

  // Define columns for the table
  const columns: EmbeddedListColumn<ChamSocKhachBuon>[] = [
    {
      key: "ngay",
      header: "Ngày",
      sortable: true,
      stickyLeft: true,
      stickyMinWidth: 120,
      render: (item) => (
        <div className="font-medium min-w-[120px]">
          {item.ngay ? format(new Date(item.ngay), "dd/MM/yyyy", { locale: vi }) : "-"}
        </div>
      ),
    },
    {
      key: "ten_nhan_vien",
      header: "Nhân Viên",
      sortable: true,
      render: (item) => (
        <div className="text-sm">{item.ten_nhan_vien || "-"}</div>
      ),
    },
    {
      key: "hinh_thuc",
      header: "Hình Thức",
      sortable: true,
      render: (item) => (
        <div className="text-sm">{item.hinh_thuc || "-"}</div>
      ),
    },
    {
      key: "muc_tieu",
      header: "Mục Tiêu",
      sortable: true,
      render: (item) => (
        <div className="text-sm line-clamp-2">{item.muc_tieu || "-"}</div>
      ),
    },
    {
      key: "ket_qua",
      header: "Kết Quả",
      sortable: true,
      render: (item) => (
        <div className="text-sm line-clamp-2">{item.ket_qua || "-"}</div>
      ),
    },
  ]

  return (
    <>
      <div className="space-y-3 sm:space-y-4 print:space-y-2 print:break-inside-avoid scroll-mt-28">
        <div className="flex items-center justify-between gap-2 sm:gap-2.5 px-1">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 rounded-md bg-primary/10 print:bg-transparent print:border print:border-primary">
              <History className="h-4 w-4 text-primary shrink-0" />
            </div>
            <h3 className={sectionTitleClass("font-semibold tracking-tight text-primary")}>
              Lịch Sử Chăm Sóc
            </h3>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            {chamSocKhachBuonList.length > 0 && (
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
              Thêm Lịch Sử Chăm Sóc
            </Button>
          </div>
        </div>
        <EmbeddedListSection
          title=""
          data={chamSocKhachBuonList}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Chưa có lịch sử chăm sóc nào"
          onRowClick={handleRowClick}
          onView={handleEyeClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          getItemId={(item) => item.id!}
          getItemName={(item) => item.ngay ? `Chăm sóc ngày ${format(new Date(item.ngay), "dd/MM/yyyy", { locale: vi })}` : `Lịch sử chăm sóc #${item.id}`}
          compactMode={true}
          compactRowCount={5}
          showMoreIndicator={true}
          enableExpandView={false} // Disable default expand, use custom
          showItemCount={true}
          totalCount={chamSocKhachBuonList.length}
          defaultSortField="ngay"
          defaultSortDirection="desc"
        />
      </div>
      
      {/* Custom Expand Dialog */}
      {expandDialogOpen && (
        <EmbeddedListFullViewDialog
          open={expandDialogOpen}
          onOpenChange={setExpandDialogOpen}
          title={khachBuonName 
            ? `Danh Sách Đầy Đủ Lịch Sử Chăm Sóc - ${khachBuonName}`
            : "Danh Sách Đầy Đủ Lịch Sử Chăm Sóc"}
          data={chamSocKhachBuonList}
          columns={columns}
          onRowClick={handleRowClick}
          onView={handleEyeClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          getItemId={(item) => item.id!}
          defaultSortField="ngay"
          defaultSortDirection="desc"
          enableSearch={true}
          searchPlaceholder="Tìm kiếm theo ngày, nhân viên, hình thức, mục tiêu..."
          searchFields={["ngay", "ten_nhan_vien", "hinh_thuc", "muc_tieu", "ket_qua"]}
        />
      )}

      {/* Detail Dialog */}
      {selectedChamSocKhachBuon && (
        <GenericDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedChamSocKhachBuon.ngay 
            ? `Lịch Sử Chăm Sóc - ${format(new Date(selectedChamSocKhachBuon.ngay), "dd/MM/yyyy", { locale: vi })}`
            : `Lịch Sử Chăm Sóc #${selectedChamSocKhachBuon.id}`}
          subtitle={selectedChamSocKhachBuon.hinh_thuc || undefined}
          sections={getDetailSections(selectedChamSocKhachBuon)}
          isLoading={viewState.isLoading}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDetailDialogOpen(false)
                  handleEdit(selectedChamSocKhachBuon)
                }}
              >
                Sửa
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDetailDialogOpen(false)
                  handleDelete(selectedChamSocKhachBuon)
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
            setSelectedChamSocKhachBuon(null)
            setIsEditMode(false)
          }
        }}
        title={isEditMode ? "Sửa Lịch Sử Chăm Sóc" : "Thêm Lịch Sử Chăm Sóc Mới"}
        schema={chamSocKhachBuonBaseSchema.omit({
          id: true,
          tg_tao: true,
          tg_cap_nhat: true,
          ten_nhan_vien: true,
          ma_nhan_vien: true,
          ten_khach_buon: true,
          ten_nguoi_tao: true,
          ma_nguoi_tao: true,
        })}
        sections={formSections}
        defaultValues={defaultValues}
        onSubmit={handleFormSubmit}
        onSuccess={handleFormSuccess}
        isLoading={createMutation.isPending || updateMutation.isPending}
        submitLabel={isEditMode ? "Cập Nhật" : "Tạo Mới"}
      />

      {/* Delete Dialog */}
      {selectedChamSocKhachBuon && (
        <GenericDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Xóa Lịch Sử Chăm Sóc"
          description={`Bạn có chắc chắn muốn xóa lịch sử chăm sóc này? Hành động này không thể hoàn tác.`}
          entityName={selectedChamSocKhachBuon.ngay 
            ? `Lịch sử chăm sóc ngày ${format(new Date(selectedChamSocKhachBuon.ngay), "dd/MM/yyyy", { locale: vi })}`
            : `Lịch sử chăm sóc #${selectedChamSocKhachBuon.id}`}
          onConfirm={handleDeleteConfirm}
          isLoading={deleteMutation.isPending}
        />
      )}

      {/* View Confirm Dialog */}
      <ConfirmDialog
        open={viewConfirmOpen}
        onOpenChange={setViewConfirmOpen}
        title="Mở Trang Chi Tiết"
        description="Bạn muốn mở trang chi tiết của lịch sử chăm sóc này trong tab mới?"
        confirmLabel="Mở Trang"
        cancelLabel="Hủy"
        onConfirm={() => {
          if (chamSocKhachBuonToView?.id) {
            navigate(`${chamSocKhachBuonConfig.routePath}/${chamSocKhachBuonToView.id}`)
          }
          setViewConfirmOpen(false)
        }}
        skipConfirmStorageKey={VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY}
      />
    </>
  )
}

