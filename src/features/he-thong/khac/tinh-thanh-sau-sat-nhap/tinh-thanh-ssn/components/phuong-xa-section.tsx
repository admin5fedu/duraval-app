/**
 * Phường Xã Section Component
 * 
 * Component hiển thị danh sách phường xã trong detail view tỉnh thành SSN.
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
import type { PhuongXaSNN } from "../../phuong-xa-snn/schema"
import { phuongXaSNNConfig } from "../../phuong-xa-snn/config"
import { phuongXaSNNSchema } from "../../phuong-xa-snn/schema"
import type { CreatePhuongXaSNNInput, UpdatePhuongXaSNNInput } from "../../phuong-xa-snn/schema"
import { usePhuongXaSNNById } from "../../phuong-xa-snn/hooks/use-phuong-xa-snn"
import { useCreatePhuongXaSNN, useUpdatePhuongXaSNN, useDeletePhuongXaSNN } from "../../phuong-xa-snn/hooks/use-phuong-xa-snn-mutations"
import { useTinhThanhSSNById } from "../hooks/use-tinh-thanh-ssn"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { z } from "zod"

const VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY = "phuong-xa-snn-view-detail-skip-confirm"

interface PhuongXaSectionProps {
  tinhThanhId: number
  phuongXaList: PhuongXaSNN[]
  isLoading?: boolean
  tinhThanhName?: string // Tên tỉnh thành để hiển thị trong dialog
}

export function PhuongXaSection({
  tinhThanhId,
  phuongXaList,
  isLoading = false,
  tinhThanhName,
}: PhuongXaSectionProps) {
  const navigate = useNavigate()
  
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
  const [expandDialogOpen, setExpandDialogOpen] = useState(false)
  const [selectedPhuongXa, setSelectedPhuongXa] = useState<PhuongXaSNN | null>(null)
  const [phuongXaToView, setPhuongXaToView] = useState<PhuongXaSNN | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const createMutation = useCreatePhuongXaSNN()
  const updateMutation = useUpdatePhuongXaSNN()
  const deleteMutation = useDeletePhuongXaSNN()

  // Query for selected phuong xa detail
  const phuongXaQuery = usePhuongXaSNNById(selectedPhuongXa?.id || 0, selectedPhuongXa || undefined)
  const viewState = useDetailViewStateFromQuery(phuongXaQuery, selectedPhuongXa || undefined)

  // Load tỉnh thành data để pre-fill form
  const { data: tinhThanhData } = useTinhThanhSSNById(tinhThanhId, undefined)

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
    } catch {
      return "-"
    }
  }

  // Click dòng -> Mở popup detail
  const handleRowClick = (phuongXa: PhuongXaSNN) => {
    setSelectedPhuongXa(phuongXa)
    setDetailDialogOpen(true)
  }

  // Click icon mắt -> Confirm dialog -> Redirect đến page detail
  const handleEyeClick = (phuongXa: PhuongXaSNN) => {
    if (!phuongXa.id) return

    const skipConfirm =
      typeof window !== "undefined" &&
      window.localStorage.getItem(VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY) === "true"

    if (skipConfirm) {
      navigate(`${phuongXaSNNConfig.routePath}/${phuongXa.id}`)
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
  const handleEdit = (phuongXa: PhuongXaSNN) => {
    setSelectedPhuongXa(phuongXa)
    setIsEditMode(true)
    setFormDialogOpen(true)
  }

  // Handle delete
  const handleDelete = (phuongXa: PhuongXaSNN) => {
    setSelectedPhuongXa(phuongXa)
    setDeleteDialogOpen(true)
  }

  // Handle form submit
  const handleFormSubmit = async (data: any) => {
    // Parse tinh_thanh_id từ object hoặc number
    let tinhThanhIdValue: number
    if (typeof data.tinh_thanh_id === 'object' && data.tinh_thanh_id !== null) {
      tinhThanhIdValue = data.tinh_thanh_id.tinh_thanh_id || data.tinh_thanh_id.id
    } else {
      tinhThanhIdValue = data.tinh_thanh_id || tinhThanhId
    }

    // Parse ma_tinh_thanh from format "Mã - Tên" to just "Mã"
    let maTinhThanh = data.ma_tinh_thanh || ""
    let tenTinhThanh = data.ten_tinh_thanh || ""
    
    if (data.tinh_thanh_id?.ma_tinh_thanh) {
      maTinhThanh = data.tinh_thanh_id.ma_tinh_thanh
      tenTinhThanh = data.tinh_thanh_id.ten_tinh_thanh || ""
    } else if (maTinhThanh.includes(" - ")) {
      // Parse from "Mã - Tên" format
      const parts = maTinhThanh.split(" - ")
      maTinhThanh = parts[0] || ""
      tenTinhThanh = parts[1] || ""
    }
    
    // Transform form data to match schema
    const submitData: CreatePhuongXaSNNInput | UpdatePhuongXaSNNInput = {
      tinh_thanh_id: tinhThanhIdValue,
      ma_tinh_thanh: maTinhThanh,
      ten_tinh_thanh: tenTinhThanh || null,
      ma_phuong_xa: data.ma_phuong_xa,
      ten_phuong_xa: data.ten_phuong_xa,
    }

    if (isEditMode && selectedPhuongXa) {
      await updateMutation.mutateAsync({ 
        id: selectedPhuongXa.id!, 
        input: submitData as UpdatePhuongXaSNNInput
      })
    } else {
      await createMutation.mutateAsync(submitData as CreatePhuongXaSNNInput)
    }
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedPhuongXa?.id) return
    await deleteMutation.mutateAsync(selectedPhuongXa.id)
  }

  // Get detail sections for dialog
  const getDetailSections = (phuongXa: PhuongXaSNN): DetailSection[] => {
    return [
      {
        title: "Thông Tin Cơ Bản",
        fields: [
          { 
            label: "Mã - Tên Tỉnh Thành", 
            key: "tinh_thanh", 
            value: phuongXa.ma_tinh_thanh && phuongXa.ten_tinh_thanh
              ? `${phuongXa.ma_tinh_thanh} - ${phuongXa.ten_tinh_thanh}`
              : phuongXa.ma_tinh_thanh || "-",
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
            name: "tinh_thanh_id", 
            label: "Tỉnh Thành", 
            type: "tinh-thanh-ssn-select",
            required: true,
            description: "Chọn tỉnh thành SSN",
            defaultValue: tinhThanhId,
            disabled: true, // Luôn disable vì đã chọn từ tỉnh thành cha
          },
          { name: "ma_tinh_thanh", label: "Mã - Tên Tỉnh Thành", required: false, disabled: true },
          { name: "ma_phuong_xa", label: "Mã Phường Xã", required: true },
          { name: "ten_phuong_xa", label: "Tên Phường Xã", required: true },
        ]
      },
    ]
  }, [tinhThanhId])

  // Define columns for the table
  const columns: EmbeddedListColumn<PhuongXaSNN>[] = [
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
          title={tinhThanhName 
            ? `Danh Sách Đầy Đủ Phường Xã - ${tinhThanhName}`
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
        subtitle={isEditMode ? "Cập nhật thông tin phường xã" : "Thêm phường xã mới cho tỉnh thành này"}
        schema={phuongXaSNNSchema.omit({ 
          id: true, 
          tg_tao: true, 
          tg_cap_nhat: true
        }).extend({
          tinh_thanh_id: z.union([
            z.number().min(1, "Tỉnh thành là bắt buộc"),
            z.object({
              tinh_thanh_id: z.number().min(1),
              ma_tinh_thanh: z.string(),
              ten_tinh_thanh: z.string().optional(),
            }),
          ]),
        })}
        defaultValues={isEditMode && selectedPhuongXa 
          ? {
              tinh_thanh_id: selectedPhuongXa.tinh_thanh_id ? {
                tinh_thanh_id: typeof selectedPhuongXa.tinh_thanh_id === 'object' 
                  ? selectedPhuongXa.tinh_thanh_id.id 
                  : selectedPhuongXa.tinh_thanh_id,
                ma_tinh_thanh: selectedPhuongXa.ma_tinh_thanh || "",
                ten_tinh_thanh: selectedPhuongXa.ten_tinh_thanh || "",
              } : null,
              ma_tinh_thanh: selectedPhuongXa.ma_tinh_thanh && selectedPhuongXa.ten_tinh_thanh 
                ? `${selectedPhuongXa.ma_tinh_thanh} - ${selectedPhuongXa.ten_tinh_thanh}` 
                : selectedPhuongXa.ma_tinh_thanh || "",
              ma_phuong_xa: selectedPhuongXa.ma_phuong_xa || "",
              ten_phuong_xa: selectedPhuongXa.ten_phuong_xa || "",
            }
          : {
              tinh_thanh_id: tinhThanhData ? {
                tinh_thanh_id: tinhThanhData.id!,
                ma_tinh_thanh: tinhThanhData.ma_tinh_thanh || "",
                ten_tinh_thanh: tinhThanhData.ten_tinh_thanh || "",
              } : tinhThanhId,
              ma_tinh_thanh: tinhThanhData && tinhThanhData.ma_tinh_thanh && tinhThanhData.ten_tinh_thanh
                ? `${tinhThanhData.ma_tinh_thanh} - ${tinhThanhData.ten_tinh_thanh}`
                : tinhThanhData?.ma_tinh_thanh || "",
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
        description="Bạn có muốn mở trang chi tiết phường xã trong module Phường xã SNN không?"
        confirmLabel="Mở trang chi tiết"
        cancelLabel="Hủy"
        skipConfirmStorageKey={VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY}
        skipConfirmLabel="Đừng hỏi lại lần sau"
        onConfirm={() => {
          if (!phuongXaToView?.id) return
          navigate(`${phuongXaSNNConfig.routePath}/${phuongXaToView.id}`)
        }}
      />
    </>
  )
}

