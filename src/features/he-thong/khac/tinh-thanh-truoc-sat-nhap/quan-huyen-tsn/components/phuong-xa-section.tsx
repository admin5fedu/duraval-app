/**
 * Phường Xã Section Component
 * 
 * Component hiển thị danh sách phường xã trong detail view quận huyện TSN.
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
import type { PhuongXaTSN } from "../../phuong-xa-tsn/schema"
import { phuongXaTSNConfig } from "../../phuong-xa-tsn/config"
import { phuongXaTSNSchema } from "../../phuong-xa-tsn/schema"
import type { CreatePhuongXaTSNInput, UpdatePhuongXaTSNInput } from "../../phuong-xa-tsn/schema"
import { usePhuongXaTSNById } from "../../phuong-xa-tsn/hooks/use-phuong-xa-tsn"
import { useCreatePhuongXaTSN, useUpdatePhuongXaTSN, useDeletePhuongXaTSN } from "../../phuong-xa-tsn/hooks/use-phuong-xa-tsn-mutations"
import { useQuanHuyenTSNById } from "../hooks/use-quan-huyen-tsn"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { z } from "zod"

const VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY = "phuong-xa-tsn-view-detail-skip-confirm"

interface PhuongXaSectionProps {
  quanHuyenId: number
  phuongXaList: PhuongXaTSN[]
  isLoading?: boolean
  quanHuyenName?: string // Tên quận huyện để hiển thị trong dialog
}

export function PhuongXaSection({
  quanHuyenId,
  phuongXaList,
  isLoading = false,
  quanHuyenName,
}: PhuongXaSectionProps) {
  const navigate = useNavigate()
  
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
  const [expandDialogOpen, setExpandDialogOpen] = useState(false)
  const [selectedPhuongXa, setSelectedPhuongXa] = useState<PhuongXaTSN | null>(null)
  const [phuongXaToView, setPhuongXaToView] = useState<PhuongXaTSN | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const createMutation = useCreatePhuongXaTSN()
  const updateMutation = useUpdatePhuongXaTSN()
  const deleteMutation = useDeletePhuongXaTSN()

  // Query for selected phuong xa detail
  const phuongXaQuery = usePhuongXaTSNById(selectedPhuongXa?.id || 0, selectedPhuongXa || undefined)
  const viewState = useDetailViewStateFromQuery(phuongXaQuery, selectedPhuongXa || undefined)

  // Load quận huyện data để pre-fill form
  const { data: quanHuyenData } = useQuanHuyenTSNById(quanHuyenId, undefined)

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
    } catch {
      return "-"
    }
  }

  // Click dòng -> Mở popup detail
  const handleRowClick = (phuongXa: PhuongXaTSN) => {
    setSelectedPhuongXa(phuongXa)
    setDetailDialogOpen(true)
  }

  // Click icon mắt -> Confirm dialog -> Redirect đến page detail
  const handleEyeClick = (phuongXa: PhuongXaTSN) => {
    if (!phuongXa.id) return

    const skipConfirm =
      typeof window !== "undefined" &&
      window.localStorage.getItem(VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY) === "true"

    if (skipConfirm) {
      navigate(`${phuongXaTSNConfig.routePath}/${phuongXa.id}`)
      return
    }

    setPhuongXaToView(phuongXa)
    setViewConfirmOpen(true)
  }

  // Handle add
  const handleAdd = () => {
    setSelectedPhuongXa(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
  }

  // Handle edit
  const handleEdit = (phuongXa: PhuongXaTSN) => {
    setSelectedPhuongXa(phuongXa)
    setIsEditMode(true)
    setFormDialogOpen(true)
  }

  // Handle delete
  const handleDelete = (phuongXa: PhuongXaTSN) => {
    setSelectedPhuongXa(phuongXa)
    setDeleteDialogOpen(true)
  }

  // Handle form submit
  const handleFormSubmit = async (data: any) => {
    // Parse ma_quan_huyen from format "Mã - Tên" to just "Mã"
    let maQuanHuyen = data.ma_quan_huyen || ""
    let tenQuanHuyen = data.ten_quan_huyen || ""
    let maTinhThanh = data.ma_tinh_thanh || ""
    let tenTinhThanh = data.ten_tinh_thanh || ""
    
    if (data.quan_huyen_id?.ma_quan_huyen) {
      maQuanHuyen = data.quan_huyen_id.ma_quan_huyen
      tenQuanHuyen = data.quan_huyen_id.ten_quan_huyen
      maTinhThanh = data.quan_huyen_id.ma_tinh_thanh || ""
      tenTinhThanh = data.quan_huyen_id.ten_tinh_thanh || ""
    } else if (maQuanHuyen.includes(" - ")) {
      // Parse from "Mã - Tên" format
      const parts = maQuanHuyen.split(" - ")
      maQuanHuyen = parts[0] || ""
      tenQuanHuyen = parts[1] || ""
    }
    
    if (maTinhThanh.includes(" - ")) {
      const parts = maTinhThanh.split(" - ")
      maTinhThanh = parts[0] || ""
      tenTinhThanh = parts[1] || ""
    }
    
    // Transform form data to match schema
    const submitData = {
      quan_huyen_id: data.quan_huyen_id?.quan_huyen_id || data.quan_huyen_id || quanHuyenId,
      ma_quan_huyen: maQuanHuyen,
      ten_quan_huyen: tenQuanHuyen,
      ma_phuong_xa: data.ma_phuong_xa,
      ten_phuong_xa: data.ten_phuong_xa,
      tinh_thanh_id: data.quan_huyen_id?.tinh_thanh_id || data.tinh_thanh_id || null,
      ma_tinh_thanh: maTinhThanh || null,
      ten_tinh_thanh: tenTinhThanh || null,
    }

    if (isEditMode && selectedPhuongXa) {
      await updateMutation.mutateAsync({ 
        id: selectedPhuongXa.id!, 
        input: submitData as UpdatePhuongXaTSNInput
      })
    } else {
      await createMutation.mutateAsync(submitData as CreatePhuongXaTSNInput)
    }
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedPhuongXa?.id) return
    await deleteMutation.mutateAsync(selectedPhuongXa.id)
  }

  // Get detail sections for dialog
  const getDetailSections = (phuongXa: PhuongXaTSN): DetailSection[] => {
    return [
      {
        title: "Thông Tin Cơ Bản",
        fields: [
          { 
            label: "Mã - Tên Tỉnh Thành", 
            key: "tinh_thanh", 
            value: phuongXa.ma_tinh_thanh && phuongXa.ten_tinh_thanh
              ? `${phuongXa.ma_tinh_thanh} - ${phuongXa.ten_tinh_thanh}`
              : "-",
            colSpan: 2 as const
          },
          { 
            label: "Mã - Tên Quận Huyện", 
            key: "quan_huyen", 
            value: `${phuongXa.ma_quan_huyen} - ${phuongXa.ten_quan_huyen}`,
            colSpan: 2 as const
          },
          { 
            label: "Mã Phường Xã", 
            key: "ma_phuong_xa", 
            value: phuongXa.ma_phuong_xa || "-"
          },
          { 
            label: "Tên Phường Xã", 
            key: "ten_phuong_xa", 
            value: phuongXa.ten_phuong_xa || "-"
          },
        ]
      },
      {
        title: "Thông Tin Hệ Thống",
        fields: [
          { 
            label: "Thời Gian Tạo", 
            key: "tg_tao", 
            value: formatDate(phuongXa.tg_tao)
          },
          { 
            label: "Thời Gian Cập Nhật", 
            key: "tg_cap_nhat", 
            value: formatDate(phuongXa.tg_cap_nhat)
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
            name: "quan_huyen_id", 
            label: "Quận Huyện", 
            type: "quan-huyen-tsn-select",
            required: true,
            description: "Chọn quận huyện TSN",
            defaultValue: quanHuyenId,
            disabled: true, // Luôn disable vì đã chọn từ quận huyện cha
          },
          { name: "ma_quan_huyen", label: "Mã - Tên Quận Huyện", required: true, disabled: true },
          { name: "ma_tinh_thanh", label: "Mã - Tên Tỉnh Thành", required: false, disabled: true },
          { name: "ma_phuong_xa", label: "Mã Phường Xã", required: true },
          { name: "ten_phuong_xa", label: "Tên Phường Xã", required: true },
        ]
      },
    ]
  }, [quanHuyenId])

  // Define columns for the table
  const columns: EmbeddedListColumn<PhuongXaTSN>[] = [
    {
      key: "ma_phuong_xa",
      header: "Mã Phường Xã",
      sortable: true,
      stickyLeft: true,
      stickyMinWidth: 150,
      render: (item) => (
        <div className="font-mono text-sm">{item.ma_phuong_xa || "-"}</div>
      ),
    },
    {
      key: "ten_phuong_xa",
      header: "Tên Phường Xã",
      sortable: true,
      render: (item) => (
        <div className="font-medium">{item.ten_phuong_xa || "-"}</div>
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
              Danh Sách Phường Xã
            </h3>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            {phuongXaList.length > 0 && (
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
              Thêm Phường Xã
            </Button>
          </div>
        </div>
        <EmbeddedListSection
          title=""
          data={phuongXaList}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Chưa có phường xã nào"
          onRowClick={handleRowClick}
          onView={handleEyeClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          getItemId={(item) => item.id!}
          getItemName={(item) => item.ten_phuong_xa || `Phường xã #${item.id}`}
          compactMode={true}
          compactRowCount={5}
          showMoreIndicator={true}
          enableExpandView={false} // Disable default expand, use custom
          showItemCount={true}
          totalCount={phuongXaList.length}
          defaultSortField="ten_phuong_xa"
          defaultSortDirection="asc"
        />
      </div>
      
      {/* Custom Expand Dialog */}
      {expandDialogOpen && (
        <EmbeddedListFullViewDialog
          open={expandDialogOpen}
          onOpenChange={setExpandDialogOpen}
          title={quanHuyenName 
            ? `Danh Sách Đầy Đủ Phường Xã - ${quanHuyenName}`
            : "Danh Sách Đầy Đủ Phường Xã"}
          data={phuongXaList}
          columns={columns}
          onRowClick={handleRowClick}
          onView={handleEyeClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          getItemId={(item) => item.id!}
          defaultSortField="ten_phuong_xa"
          defaultSortDirection="asc"
          enableSearch={true}
          searchPlaceholder="Tìm kiếm theo mã, tên phường xã..."
          searchFields={["ma_phuong_xa", "ten_phuong_xa"]}
        />
      )}

      {/* Detail Dialog */}
      {selectedPhuongXa && (
        <GenericDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          title={selectedPhuongXa.ten_phuong_xa || `Phường xã #${selectedPhuongXa.id}`}
          subtitle={selectedPhuongXa.ma_phuong_xa || undefined}
          sections={getDetailSections(selectedPhuongXa)}
          isLoading={viewState.isLoading}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDetailDialogOpen(false)
                  handleEdit(selectedPhuongXa)
                }}
              >
                Sửa
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDetailDialogOpen(false)
                  handleDelete(selectedPhuongXa)
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
            setSelectedPhuongXa(null)
            setIsEditMode(false)
          }
        }}
        title={isEditMode ? `Sửa Phường Xã: #${selectedPhuongXa?.id}` : "Thêm Mới Phường Xã"}
        subtitle={isEditMode ? "Cập nhật thông tin phường xã" : "Thêm phường xã mới cho quận huyện này"}
        schema={phuongXaTSNSchema.omit({ 
          id: true, 
          tg_tao: true, 
          tg_cap_nhat: true
        }).extend({
          quan_huyen_id: z.union([
            z.number().min(1, "Quận huyện là bắt buộc"),
            z.object({
              quan_huyen_id: z.number().min(1),
              ma_quan_huyen: z.string(),
              ten_quan_huyen: z.string(),
              ma_tinh_thanh: z.string().optional(),
              ten_tinh_thanh: z.string().optional(),
            }),
          ]),
        })}
        defaultValues={isEditMode && selectedPhuongXa 
          ? {
              quan_huyen_id: selectedPhuongXa.quan_huyen_id ? {
                quan_huyen_id: selectedPhuongXa.quan_huyen_id,
                ma_quan_huyen: selectedPhuongXa.ma_quan_huyen || "",
                ten_quan_huyen: selectedPhuongXa.ten_quan_huyen || "",
                ma_tinh_thanh: selectedPhuongXa.ma_tinh_thanh || "",
                ten_tinh_thanh: selectedPhuongXa.ten_tinh_thanh || "",
              } : null,
              ma_quan_huyen: selectedPhuongXa.ma_quan_huyen && selectedPhuongXa.ten_quan_huyen 
                ? `${selectedPhuongXa.ma_quan_huyen} - ${selectedPhuongXa.ten_quan_huyen}` 
                : "",
              ma_tinh_thanh: selectedPhuongXa.ma_tinh_thanh && selectedPhuongXa.ten_tinh_thanh
                ? `${selectedPhuongXa.ma_tinh_thanh} - ${selectedPhuongXa.ten_tinh_thanh}`
                : "",
              ma_phuong_xa: selectedPhuongXa.ma_phuong_xa || "",
              ten_phuong_xa: selectedPhuongXa.ten_phuong_xa || "",
            }
          : {
              quan_huyen_id: quanHuyenData ? {
                quan_huyen_id: quanHuyenData.id!,
                ma_quan_huyen: quanHuyenData.ma_quan_huyen || "",
                ten_quan_huyen: quanHuyenData.ten_quan_huyen || "",
                ma_tinh_thanh: quanHuyenData.ma_tinh_thanh || "",
                ten_tinh_thanh: quanHuyenData.ten_tinh_thanh || "",
              } : quanHuyenId,
              ma_quan_huyen: quanHuyenData && quanHuyenData.ma_quan_huyen && quanHuyenData.ten_quan_huyen
                ? `${quanHuyenData.ma_quan_huyen} - ${quanHuyenData.ten_quan_huyen}`
                : "",
              ma_tinh_thanh: quanHuyenData && quanHuyenData.ma_tinh_thanh && quanHuyenData.ten_tinh_thanh
                ? `${quanHuyenData.ma_tinh_thanh} - ${quanHuyenData.ten_tinh_thanh}`
                : "",
              ma_phuong_xa: "",
              ten_phuong_xa: "",
            }
        }
        sections={formSections}
        onSubmit={handleFormSubmit}
        submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
        successMessage={isEditMode ? "Cập nhật phường xã thành công" : "Thêm mới phường xã thành công"}
        errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật phường xã" : "Có lỗi xảy ra khi thêm mới phường xã"}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Dialog */}
      {selectedPhuongXa && (
        <GenericDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Xác nhận xóa phường xã"
          description="Bạn có chắc chắn muốn xóa phường xã này không?"
          entityName={selectedPhuongXa.ten_phuong_xa || `Phường xã #${selectedPhuongXa.id}`}
          onConfirm={handleDeleteConfirm}
          isLoading={deleteMutation.isPending}
        />
      )}

      {/* View Detail Confirm Dialog */}
      <ConfirmDialog
        open={viewConfirmOpen}
        onOpenChange={setViewConfirmOpen}
        title="Mở trang chi tiết phường xã"
        description="Bạn có muốn mở trang chi tiết phường xã trong module Phường xã TSN không?"
        confirmLabel="Mở trang chi tiết"
        cancelLabel="Hủy"
        skipConfirmStorageKey={VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY}
        skipConfirmLabel="Đừng hỏi lại lần sau"
        onConfirm={() => {
          if (!phuongXaToView?.id) return
          navigate(`${phuongXaTSNConfig.routePath}/${phuongXaToView.id}`)
        }}
      />
    </>
  )
}

