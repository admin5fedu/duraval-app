/**
 * Quận Huyện Section Component
 * 
 * Component hiển thị danh sách quận huyện trong detail view tỉnh thành TSN.
 * Sử dụng EmbeddedListSection để chuẩn hóa theo quy tắc ERP.
 */

"use client"

import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { EmbeddedListSection, type EmbeddedListColumn, EmbeddedListFullViewDialog, GenericDetailDialog, GenericFormDialog, GenericDeleteDialog, ConfirmDialog, type DetailSection, type FormSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { sectionTitleClass } from "@/shared/utils/section-styles"
import type { QuanHuyenTSN } from "../../quan-huyen-tsn/schema"
import { quanHuyenTSNConfig } from "../../quan-huyen-tsn/config"
import { quanHuyenTSNSchema } from "../../quan-huyen-tsn/schema"
import type { CreateQuanHuyenTSNInput, UpdateQuanHuyenTSNInput } from "../../quan-huyen-tsn/schema"
import { useQuanHuyenTSNById } from "../../quan-huyen-tsn/hooks/use-quan-huyen-tsn"
import { useCreateQuanHuyenTSN, useUpdateQuanHuyenTSN, useDeleteQuanHuyenTSN } from "../../quan-huyen-tsn/hooks/use-quan-huyen-tsn-mutations"
import { useTinhThanhTSNById } from "../hooks/use-tinh-thanh-tsn"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { z } from "zod"

const VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY = "quan-huyen-tsn-view-detail-skip-confirm"

interface QuanHuyenSectionProps {
  tinhThanhId: number
  quanHuyenList: QuanHuyenTSN[]
  isLoading?: boolean
  tinhThanhName?: string // Tên tỉnh thành để hiển thị trong dialog
}

export function QuanHuyenSection({
  tinhThanhId,
  quanHuyenList,
  isLoading = false,
  tinhThanhName,
}: QuanHuyenSectionProps) {
  const navigate = useNavigate()
  
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
  const [expandDialogOpen, setExpandDialogOpen] = useState(false)
  const [selectedQuanHuyen, setSelectedQuanHuyen] = useState<QuanHuyenTSN | null>(null)
  const [quanHuyenToView, setQuanHuyenToView] = useState<QuanHuyenTSN | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const createMutation = useCreateQuanHuyenTSN()
  const updateMutation = useUpdateQuanHuyenTSN()
  const deleteMutation = useDeleteQuanHuyenTSN()

  // Query for selected quan huyen detail
  const quanHuyenQuery = useQuanHuyenTSNById(selectedQuanHuyen?.id || 0, selectedQuanHuyen || undefined)
  const viewState = useDetailViewStateFromQuery(quanHuyenQuery, selectedQuanHuyen || undefined)

  // Load tỉnh thành data để pre-fill form
  const { data: tinhThanhData } = useTinhThanhTSNById(tinhThanhId, undefined)

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
    } catch {
      return "-"
    }
  }

  // Click dòng -> Mở popup detail
  const handleRowClick = (quanHuyen: QuanHuyenTSN) => {
    setSelectedQuanHuyen(quanHuyen)
    setDetailDialogOpen(true)
  }

  // Click icon mắt -> Confirm dialog -> Redirect đến page detail
  const handleEyeClick = (quanHuyen: QuanHuyenTSN) => {
    if (!quanHuyen.id) return

    const skipConfirm =
      typeof window !== "undefined" &&
      window.localStorage.getItem(VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY) === "true"

    if (skipConfirm) {
      navigate(`${quanHuyenTSNConfig.routePath}/${quanHuyen.id}`)
      return
    }

    setQuanHuyenToView(quanHuyen)
    setViewConfirmOpen(true)
  }

  // Handle add
  const handleAdd = () => {
    setSelectedQuanHuyen(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
  }

  // Handle edit
  const handleEdit = (quanHuyen: QuanHuyenTSN) => {
    setSelectedQuanHuyen(quanHuyen)
    setIsEditMode(true)
    setFormDialogOpen(true)
  }

  // Handle delete
  const handleDelete = (quanHuyen: QuanHuyenTSN) => {
    setSelectedQuanHuyen(quanHuyen)
    setDeleteDialogOpen(true)
  }

  // Handle form submit
  const handleFormSubmit = async (data: any) => {
    // Parse ma_tinh_thanh from format "Mã - Tên" to just "Mã"
    let maTinhThanh = data.ma_tinh_thanh || ""
    let tenTinhThanh = data.ten_tinh_thanh || ""
    
    if (data.tinh_thanh_id?.ma_tinh_thanh) {
      maTinhThanh = data.tinh_thanh_id.ma_tinh_thanh
      tenTinhThanh = data.tinh_thanh_id.ten_tinh_thanh
    } else if (maTinhThanh.includes(" - ")) {
      // Parse from "Mã - Tên" format
      const parts = maTinhThanh.split(" - ")
      maTinhThanh = parts[0] || ""
      tenTinhThanh = parts[1] || ""
    }
    
    // Transform form data to match schema
    const submitData = {
      tinh_thanh_id: data.tinh_thanh_id?.tinh_thanh_id || data.tinh_thanh_id || tinhThanhId,
      ma_tinh_thanh: maTinhThanh,
      ten_tinh_thanh: tenTinhThanh,
      ma_quan_huyen: data.ma_quan_huyen,
      ten_quan_huyen: data.ten_quan_huyen,
    }

    if (isEditMode && selectedQuanHuyen) {
      await updateMutation.mutateAsync({ 
        id: selectedQuanHuyen.id!, 
        input: submitData as UpdateQuanHuyenTSNInput
      })
    } else {
      await createMutation.mutateAsync(submitData as CreateQuanHuyenTSNInput)
    }
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedQuanHuyen?.id) return
    await deleteMutation.mutateAsync(selectedQuanHuyen.id)
  }

  // Get detail sections for dialog
  const getDetailSections = (quanHuyen: QuanHuyenTSN): DetailSection[] => {
    return [
      {
        title: "Thông Tin Cơ Bản",
        fields: [
          { 
            label: "Mã - Tên Tỉnh Thành", 
            key: "tinh_thanh", 
            value: `${quanHuyen.ma_tinh_thanh} - ${quanHuyen.ten_tinh_thanh}`,
            colSpan: 2 as const
          },
          { 
            label: "Mã Quận Huyện", 
            key: "ma_quan_huyen", 
            value: quanHuyen.ma_quan_huyen || "-"
          },
          { 
            label: "Tên Quận Huyện", 
            key: "ten_quan_huyen", 
            value: quanHuyen.ten_quan_huyen || "-"
          },
        ]
      },
      {
        title: "Thông Tin Hệ Thống",
        fields: [
          { 
            label: "Thời Gian Tạo", 
            key: "tg_tao", 
            value: formatDate(quanHuyen.tg_tao)
          },
          { 
            label: "Thời Gian Cập Nhật", 
            key: "tg_cap_nhat", 
            value: formatDate(quanHuyen.tg_cap_nhat)
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
            name: "tinh_thanh_id", 
            label: "Tỉnh Thành", 
            type: "tinh-thanh-tsn-select",
            required: true,
            description: "Chọn tỉnh thành TSN",
            defaultValue: tinhThanhId,
            disabled: true, // Luôn disable vì đã chọn từ tỉnh thành cha
          },
          { name: "ma_tinh_thanh", label: "Mã - Tên Tỉnh Thành", required: true, disabled: true },
          { name: "ma_quan_huyen", label: "Mã Quận Huyện", required: true },
          { name: "ten_quan_huyen", label: "Tên Quận Huyện", required: true },
        ]
      },
    ]
  }, [tinhThanhId])

  // Define columns for the table
  const columns: EmbeddedListColumn<QuanHuyenTSN>[] = [
    {
      key: "ma_quan_huyen",
      header: "Mã Quận Huyện",
      sortable: true,
      stickyLeft: true,
      stickyMinWidth: 150,
      render: (item) => (
        <div className="font-mono text-sm">{item.ma_quan_huyen || "-"}</div>
      ),
    },
    {
      key: "ten_quan_huyen",
      header: "Tên Quận Huyện",
      sortable: true,
      render: (item) => (
        <div className="font-medium">{item.ten_quan_huyen || "-"}</div>
      ),
    },
    {
      key: "tg_tao",
      header: "Thời Gian Tạo",
      sortable: true,
      render: (item) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(item.tg_tao)}
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="space-y-3 sm:space-y-4 print:space-y-2 print:break-inside-avoid scroll-mt-28">
        <div className="flex items-center justify-between gap-2 sm:gap-2.5 px-1">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 rounded-md bg-primary/10 print:bg-transparent print:border print:border-primary">
              <FileText className="h-4 w-4 text-primary shrink-0" />
            </div>
            <h3 className={sectionTitleClass("font-semibold tracking-tight text-primary")}>
              Danh Sách Quận Huyện
            </h3>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            {quanHuyenList.length > 0 && (
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
              Thêm Quận Huyện
            </Button>
          </div>
        </div>
        <EmbeddedListSection
          title=""
          data={quanHuyenList}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Chưa có quận huyện nào"
          onRowClick={handleRowClick}
          onView={handleEyeClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          getItemId={(item) => item.id!}
          getItemName={(item) => item.ten_quan_huyen || `Quận huyện #${item.id}`}
          compactMode={true}
          compactRowCount={5}
          showMoreIndicator={true}
          enableExpandView={false} // Disable default expand, use custom
          showItemCount={true}
          totalCount={quanHuyenList.length}
          defaultSortField="ten_quan_huyen"
          defaultSortDirection="asc"
        />
      </div>
      
      {/* Custom Expand Dialog */}
      {expandDialogOpen && (
        <EmbeddedListFullViewDialog
          open={expandDialogOpen}
          onOpenChange={setExpandDialogOpen}
          title={tinhThanhName 
            ? `Danh Sách Đầy Đủ Quận Huyện - ${tinhThanhName}`
            : "Danh Sách Đầy Đủ Quận Huyện"}
          data={quanHuyenList}
          columns={columns}
          onRowClick={handleRowClick}
          onView={handleEyeClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          getItemId={(item) => item.id!}
          defaultSortField="ten_quan_huyen"
          defaultSortDirection="asc"
          enableSearch={true}
          searchPlaceholder="Tìm kiếm theo mã, tên quận huyện..."
          searchFields={["ma_quan_huyen", "ten_quan_huyen"]}
        />
      )}

      {/* Detail Dialog */}
      {selectedQuanHuyen && (
        <GenericDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedQuanHuyen.ten_quan_huyen || `Quận huyện #${selectedQuanHuyen.id}`}
          subtitle={selectedQuanHuyen.ma_quan_huyen || undefined}
          sections={getDetailSections(selectedQuanHuyen)}
          isLoading={viewState.isLoading}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDetailDialogOpen(false)
                  handleEdit(selectedQuanHuyen)
                }}
              >
                Sửa
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDetailDialogOpen(false)
                  handleDelete(selectedQuanHuyen)
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
            setSelectedQuanHuyen(null)
            setIsEditMode(false)
          }
        }}
        title={isEditMode ? `Sửa Quận Huyện: #${selectedQuanHuyen?.id}` : "Thêm Mới Quận Huyện"}
        subtitle={isEditMode ? "Cập nhật thông tin quận huyện" : "Thêm quận huyện mới cho tỉnh thành này"}
        schema={quanHuyenTSNSchema.omit({ 
          id: true, 
          tg_tao: true, 
          tg_cap_nhat: true
        }).extend({
          tinh_thanh_id: z.union([
            z.number().min(1, "Tỉnh thành là bắt buộc"),
            z.object({
              tinh_thanh_id: z.number().min(1),
              ma_tinh_thanh: z.string(),
              ten_tinh_thanh: z.string(),
            }),
          ]),
        })}
        defaultValues={isEditMode && selectedQuanHuyen 
          ? {
              tinh_thanh_id: selectedQuanHuyen.tinh_thanh_id ? {
                tinh_thanh_id: selectedQuanHuyen.tinh_thanh_id,
                ma_tinh_thanh: selectedQuanHuyen.ma_tinh_thanh || "",
                ten_tinh_thanh: selectedQuanHuyen.ten_tinh_thanh || "",
              } : null,
              ma_tinh_thanh: selectedQuanHuyen.ma_tinh_thanh && selectedQuanHuyen.ten_tinh_thanh 
                ? `${selectedQuanHuyen.ma_tinh_thanh} - ${selectedQuanHuyen.ten_tinh_thanh}` 
                : "",
              ma_quan_huyen: selectedQuanHuyen.ma_quan_huyen || "",
              ten_quan_huyen: selectedQuanHuyen.ten_quan_huyen || "",
            }
          : {
              tinh_thanh_id: tinhThanhData ? {
                tinh_thanh_id: tinhThanhData.id!,
                ma_tinh_thanh: tinhThanhData.ma_tinh_thanh || "",
                ten_tinh_thanh: tinhThanhData.ten_tinh_thanh || "",
              } : tinhThanhId,
              ma_tinh_thanh: tinhThanhData && tinhThanhData.ma_tinh_thanh && tinhThanhData.ten_tinh_thanh
                ? `${tinhThanhData.ma_tinh_thanh} - ${tinhThanhData.ten_tinh_thanh}`
                : "",
              ma_quan_huyen: "",
              ten_quan_huyen: "",
            }
        }
        sections={formSections}
        onSubmit={handleFormSubmit}
        submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
        successMessage={isEditMode ? "Cập nhật quận huyện thành công" : "Thêm mới quận huyện thành công"}
        errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật quận huyện" : "Có lỗi xảy ra khi thêm mới quận huyện"}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Dialog */}
      {selectedQuanHuyen && (
        <GenericDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Xác nhận xóa quận huyện"
          description="Bạn có chắc chắn muốn xóa quận huyện này không?"
          entityName={selectedQuanHuyen.ten_quan_huyen || `Quận huyện #${selectedQuanHuyen.id}`}
          onConfirm={handleDeleteConfirm}
          isLoading={deleteMutation.isPending}
        />
      )}

      {/* View Detail Confirm Dialog */}
      <ConfirmDialog
        open={viewConfirmOpen}
        onOpenChange={setViewConfirmOpen}
        title="Mở trang chi tiết quận huyện"
        description="Bạn có muốn mở trang chi tiết quận huyện trong module Quận huyện TSN không?"
        confirmLabel="Mở trang chi tiết"
        cancelLabel="Hủy"
        skipConfirmStorageKey={VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY}
        skipConfirmLabel="Đừng hỏi lại lần sau"
        onConfirm={() => {
          if (!quanHuyenToView?.id) return
          navigate(`${quanHuyenTSNConfig.routePath}/${quanHuyenToView.id}`)
        }}
      />
    </>
  )
}

