/**
 * Hình Ảnh Khách Buôn Section Component
 * 
 * Component hiển thị danh sách hình ảnh khách buôn trong detail view khách buôn.
 * Sử dụng EmbeddedListSection để chuẩn hóa theo quy tắc ERP.
 */

"use client"

import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { EmbeddedListSection, type EmbeddedListColumn, EmbeddedListFullViewDialog, GenericDetailDialog, GenericFormDialog, GenericDeleteDialog, ConfirmDialog, type DetailSection, type FormSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Image, Plus } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { sectionTitleClass } from "@/shared/utils/section-styles"
import type { HinhAnhKhachBuon } from "../../hinh-anh-khach-buon/schema"
import { hinhAnhKhachBuonConfig } from "../../hinh-anh-khach-buon/config"
import { hinhAnhKhachBuonBaseSchema } from "../../hinh-anh-khach-buon/schema"
import type { CreateHinhAnhKhachBuonInput, UpdateHinhAnhKhachBuonInput } from "../../hinh-anh-khach-buon/schema"
import { useHinhAnhKhachBuonById } from "../../hinh-anh-khach-buon/hooks/use-hinh-anh-khach-buon"
import { useCreateHinhAnhKhachBuon, useUpdateHinhAnhKhachBuon, useDeleteHinhAnhKhachBuon } from "../../hinh-anh-khach-buon/hooks/use-hinh-anh-khach-buon-mutations"
// import { useDanhSachKBById } from "../hooks/use-danh-sach-KB"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { useAuthStore } from "@/shared/stores/auth-store"

const VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY = "hinh-anh-khach-buon-view-detail-skip-confirm"

interface HinhAnhKhachBuonSectionProps {
  khachBuonId: number
  hinhAnhKhachBuonList: HinhAnhKhachBuon[]
  isLoading?: boolean
  khachBuonName?: string // Tên khách buôn để hiển thị trong dialog
}

export function HinhAnhKhachBuonSection({
  khachBuonId,
  hinhAnhKhachBuonList,
  isLoading = false,
  khachBuonName,
}: HinhAnhKhachBuonSectionProps) {
  const navigate = useNavigate()
  const { employee } = useAuthStore()
  
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
  const [expandDialogOpen, setExpandDialogOpen] = useState(false)
  const [selectedHinhAnhKhachBuon, setSelectedHinhAnhKhachBuon] = useState<HinhAnhKhachBuon | null>(null)
  const [hinhAnhKhachBuonToView, setHinhAnhKhachBuonToView] = useState<HinhAnhKhachBuon | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const createMutation = useCreateHinhAnhKhachBuon()
  const updateMutation = useUpdateHinhAnhKhachBuon()
  const deleteMutation = useDeleteHinhAnhKhachBuon()

  // Query for selected hình ảnh khách buôn detail
  const hinhAnhKhachBuonQuery = useHinhAnhKhachBuonById(selectedHinhAnhKhachBuon?.id || 0, undefined)
  const viewState = useDetailViewStateFromQuery(hinhAnhKhachBuonQuery, selectedHinhAnhKhachBuon || undefined)

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
  const handleRowClick = (hinhAnhKhachBuon: HinhAnhKhachBuon) => {
    setSelectedHinhAnhKhachBuon(hinhAnhKhachBuon)
    setDetailDialogOpen(true)
  }

  // Click icon mắt -> Confirm dialog -> Redirect đến page detail
  const handleEyeClick = (hinhAnhKhachBuon: HinhAnhKhachBuon) => {
    if (!hinhAnhKhachBuon.id) return

    const skipConfirm =
      typeof window !== "undefined" &&
      window.localStorage.getItem(VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY) === "true"

    if (skipConfirm) {
      navigate(`${hinhAnhKhachBuonConfig.routePath}/${hinhAnhKhachBuon.id}`)
      return
    }

    setHinhAnhKhachBuonToView(hinhAnhKhachBuon)
    setViewConfirmOpen(true)
  }

  // Handle add
  const handleAdd = () => {
    setSelectedHinhAnhKhachBuon(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
  }

  // Handle edit
  const handleEdit = (hinhAnhKhachBuon: HinhAnhKhachBuon) => {
    setSelectedHinhAnhKhachBuon(hinhAnhKhachBuon)
    setIsEditMode(true)
    setFormDialogOpen(true)
  }

  // Handle delete
  const handleDelete = (hinhAnhKhachBuon: HinhAnhKhachBuon) => {
    setSelectedHinhAnhKhachBuon(hinhAnhKhachBuon)
    setDeleteDialogOpen(true)
  }

  // Handle form submit
  const handleFormSubmit = async (data: any) => {
    const submitData = {
      ...data,
      khach_buon_id: khachBuonId, // Ensure khach_buon_id is set from parent
      nguoi_tao_id: employee?.ma_nhan_vien || null,
    }

    if (isEditMode && selectedHinhAnhKhachBuon) {
      await updateMutation.mutateAsync({
        id: selectedHinhAnhKhachBuon.id!,
        input: submitData as UpdateHinhAnhKhachBuonInput
      })
    } else {
      await createMutation.mutateAsync(submitData as CreateHinhAnhKhachBuonInput)
    }
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedHinhAnhKhachBuon?.id) return
    await deleteMutation.mutateAsync(selectedHinhAnhKhachBuon.id)
  }

  // Get detail sections
  const getDetailSections = (hinhAnhKhachBuon: HinhAnhKhachBuon): DetailSection[] => {
    return [
      {
        title: "Thông Tin Cơ Bản",
        fields: [
          {
            label: "Khách Buôn",
            key: "khach_buon",
            value: hinhAnhKhachBuon.ten_khach_buon || "-",
            colSpan: 2 as const
          },
          {
            label: "Hạng Mục",
            key: "hang_muc",
            value: hinhAnhKhachBuon.hang_muc || "-"
          },
          {
            label: "Hình Ảnh",
            key: "hinh_anh",
            value: hinhAnhKhachBuon.hinh_anh || null,
            type: "image",
            colSpan: 3 as const
          },
        ]
      },
      {
        title: "Thông Tin Khác",
        fields: [
          {
            label: "Mô Tả",
            key: "mo_ta",
            value: hinhAnhKhachBuon.mo_ta || "-",
            colSpan: 2 as const
          },
          {
            label: "Ghi Chú",
            key: "ghi_chu",
            value: hinhAnhKhachBuon.ghi_chu || "-",
            colSpan: 2 as const
          },
        ]
      },
      {
        title: "Thông Tin Hệ Thống",
        fields: [
          {
            label: "Người Tạo",
            key: "nguoi_tao_id",
            value: hinhAnhKhachBuon.nguoi_tao_id ? String(hinhAnhKhachBuon.nguoi_tao_id) : "-",
          },
          {
            label: "Thời Gian Tạo",
            key: "tg_tao",
            value: formatDate(hinhAnhKhachBuon.tg_tao),
            type: "date"
          },
          {
            label: "Thời Gian Cập Nhật",
            key: "tg_cap_nhat",
            value: formatDate(hinhAnhKhachBuon.tg_cap_nhat),
            type: "date"
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
            disabled: true, // Disable vì đã chọn từ khách buôn cha
          },
          { 
            name: "hang_muc", 
            label: "Hạng Mục",
            type: "toggle",
            required: true,
            options: [
              { label: "Sản phẩm", value: "Sản phẩm" },
              { label: "Khác", value: "Khác" },
            ],
          },
          { name: "hinh_anh", label: "Hình Ảnh", type: "image", required: true },
        ]
      },
      {
        title: "Thông Tin Khác",
        fields: [
          { name: "mo_ta", label: "Mô Tả", type: "textarea" },
          { name: "ghi_chu", label: "Ghi Chú", type: "textarea", colSpan: 2 },
        ]
      },
    ]
  }, [khachBuonId])

  // Define columns for the table
  const columns: EmbeddedListColumn<HinhAnhKhachBuon>[] = [
    {
      key: "hang_muc",
      header: "Hạng Mục",
      sortable: true,
      stickyLeft: true,
      stickyMinWidth: 150,
      render: (item) => (
        <div className="font-medium">{item.hang_muc || "-"}</div>
      ),
    },
    {
      key: "hinh_anh",
      header: "Hình Ảnh",
      sortable: false,
      render: (item) => (
        <div>
          {item.hinh_anh ? (
            <img 
              src={item.hinh_anh} 
              alt="Hình ảnh" 
              className="h-12 w-12 object-cover rounded"
            />
          ) : (
            "-"
          )}
        </div>
      ),
    },
    {
      key: "mo_ta",
      header: "Mô Tả",
      sortable: true,
      render: (item) => (
        <div className="text-sm line-clamp-2">{item.mo_ta || "-"}</div>
      ),
    },
    {
      key: "ghi_chu",
      header: "Ghi Chú",
      sortable: true,
      render: (item) => (
        <div className="text-sm line-clamp-2">{item.ghi_chu || "-"}</div>
      ),
    },
  ]

  return (
    <>
      <div className="space-y-3 sm:space-y-4 print:space-y-2 print:break-inside-avoid scroll-mt-28">
        <div className="flex items-center justify-between gap-2 sm:gap-2.5 px-1">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 rounded-md bg-primary/10 print:bg-transparent print:border print:border-primary">
              <Image className="h-4 w-4 text-primary shrink-0" />
            </div>
            <h3 className={sectionTitleClass("font-semibold tracking-tight text-primary")}>
              Danh Sách Hình Ảnh Khách Buôn
            </h3>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            {hinhAnhKhachBuonList.length > 0 && (
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
              Thêm Hình Ảnh
            </Button>
          </div>
        </div>
        <EmbeddedListSection
          title=""
          data={hinhAnhKhachBuonList}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Chưa có hình ảnh nào"
          onRowClick={handleRowClick}
          onView={handleEyeClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          getItemId={(item) => item.id!}
          getItemName={(item) => item.hang_muc || `Hình ảnh #${item.id}`}
          compactMode={true}
          compactRowCount={5}
          showMoreIndicator={true}
          enableExpandView={false}
          showItemCount={true}
          totalCount={hinhAnhKhachBuonList.length}
          defaultSortField="hang_muc"
          defaultSortDirection="asc"
        />
      </div>

      {expandDialogOpen && (
        <EmbeddedListFullViewDialog
          open={expandDialogOpen}
          onOpenChange={setExpandDialogOpen}
          title={khachBuonName
            ? `Danh Sách Đầy Đủ Hình Ảnh Khách Buôn - ${khachBuonName}`
            : "Danh Sách Đầy Đủ Hình Ảnh Khách Buôn"}
          data={hinhAnhKhachBuonList}
          columns={columns}
          onRowClick={handleRowClick}
          onView={handleEyeClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          getItemId={(item) => item.id!}
          defaultSortField="hang_muc"
          defaultSortDirection="asc"
          enableSearch={true}
          searchPlaceholder="Tìm kiếm theo hạng mục, mô tả..."
          searchFields={["hang_muc", "mo_ta", "ghi_chu"]}
        />
      )}

      {selectedHinhAnhKhachBuon && (
        <GenericDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedHinhAnhKhachBuon.hang_muc || `Hình ảnh #${selectedHinhAnhKhachBuon.id}`}
          subtitle={selectedHinhAnhKhachBuon.ten_khach_buon || undefined}
          sections={getDetailSections(selectedHinhAnhKhachBuon)}
          isLoading={viewState.isLoading}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDetailDialogOpen(false)
                  handleEdit(selectedHinhAnhKhachBuon)
                }}
              >
                Sửa
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDetailDialogOpen(false)
                  handleDelete(selectedHinhAnhKhachBuon)
                }}
              >
                Xóa
              </Button>
            </>
          }
        />
      )}

      <GenericFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open)
          if (!open) {
            setSelectedHinhAnhKhachBuon(null)
            setIsEditMode(false)
          }
        }}
        title={isEditMode ? `Sửa Hình Ảnh Khách Buôn: ${selectedHinhAnhKhachBuon?.hang_muc || `#${selectedHinhAnhKhachBuon?.id}`}` : "Thêm Mới Hình Ảnh Khách Buôn"}
        subtitle={isEditMode ? "Cập nhật thông tin hình ảnh khách buôn" : `Thêm hình ảnh mới cho khách buôn ${khachBuonName || ""}`}
        schema={hinhAnhKhachBuonBaseSchema.omit({
          id: true,
          tg_tao: true,
          tg_cap_nhat: true,
          ten_khach_buon: true,
        })}
        defaultValues={isEditMode && selectedHinhAnhKhachBuon
          ? {
            ...selectedHinhAnhKhachBuon,
            khach_buon_id: selectedHinhAnhKhachBuon.khach_buon_id || khachBuonId,
            hang_muc: selectedHinhAnhKhachBuon.hang_muc || "Sản phẩm",
            hinh_anh: selectedHinhAnhKhachBuon.hinh_anh || "",
            mo_ta: selectedHinhAnhKhachBuon.mo_ta || "",
            ghi_chu: selectedHinhAnhKhachBuon.ghi_chu || "",
          }
          : {
            khach_buon_id: khachBuonId,
            hang_muc: "Sản phẩm",
            hinh_anh: "",
            mo_ta: "",
            ghi_chu: "",
          }
        }
        sections={formSections}
        onSubmit={handleFormSubmit}
        submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
        successMessage={isEditMode ? "Cập nhật hình ảnh khách buôn thành công" : "Thêm mới hình ảnh khách buôn thành công"}
        errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật hình ảnh khách buôn" : "Có lỗi xảy ra khi thêm mới hình ảnh khách buôn"}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {selectedHinhAnhKhachBuon && (
        <GenericDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Xác nhận xóa hình ảnh khách buôn"
          description="Bạn có chắc chắn muốn xóa hình ảnh khách buôn này không?"
          entityName={selectedHinhAnhKhachBuon.hang_muc || `Hình ảnh #${selectedHinhAnhKhachBuon.id}`}
          onConfirm={handleDeleteConfirm}
          isLoading={deleteMutation.isPending}
        />
      )}

      <ConfirmDialog
        open={viewConfirmOpen}
        onOpenChange={setViewConfirmOpen}
        title="Mở trang chi tiết hình ảnh khách buôn"
        description="Bạn có muốn mở trang chi tiết hình ảnh khách buôn trong module Hình ảnh khách buôn không?"
        confirmLabel="Mở trang chi tiết"
        cancelLabel="Hủy"
        skipConfirmStorageKey={VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY}
        skipConfirmLabel="Đừng hỏi lại lần sau"
        onConfirm={() => {
          if (!hinhAnhKhachBuonToView?.id) return
          navigate(`${hinhAnhKhachBuonConfig.routePath}/${hinhAnhKhachBuonToView.id}`)
        }}
      />
    </>
  )
}

