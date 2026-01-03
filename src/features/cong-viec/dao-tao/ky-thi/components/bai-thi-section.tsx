/**
 * Bài Thi Section Component
 * 
 * Component hiển thị danh sách bài thi trong detail view kỳ thi.
 * Sử dụng EmbeddedListSection để chuẩn hóa theo quy tắc ERP.
 */

"use client"

import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { EmbeddedListSection, type EmbeddedListColumn } from "@/shared/components/data-display/embedded-list-section"
import { EmbeddedListFullViewDialog } from "@/shared/components/data-display/embedded-list-full-view-dialog"
import { GenericDetailDialog } from "@/shared/components/dialogs/generic-detail-dialog"
import { GenericFormDialog } from "@/shared/components/dialogs/generic-form-dialog"
import { GenericDeleteDialog } from "@/shared/components/dialogs/generic-delete-dialog"
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog"
import type { DetailSection } from "@/shared/components"
import type { FormSection } from "@/shared/components/forms/generic-form-view"
import type { BaiThi } from "../../bai-thi/schema"
import type { NhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { baiThiConfig } from "../../bai-thi/config"
import { baiThiSchema } from "../../bai-thi/schema"
import { calculatePercentage } from "../../bai-thi/utils/bai-thi-test-helpers"
import { useBaiThiById } from "../../bai-thi/hooks/use-bai-thi"
import { useCreateBaiThi, useUpdateBaiThi, useDeleteBaiThi } from "../../bai-thi/hooks/use-bai-thi-mutations"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { useKyThi } from "../../ky-thi/hooks"
import { useAuthStore } from "@/shared/stores/auth-store"
import { sectionTitleClass } from "@/shared/utils/section-styles"
import { z } from "zod"

const VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY = "bai-thi-view-detail-skip-confirm"

interface BaiThiSectionProps {
  kyThiId: number
  baiThiList: BaiThi[]
  nhanSuList?: NhanSu[]
  currentEmployeeId?: number
}

export function BaiThiSection({
  kyThiId,
  baiThiList,
  nhanSuList,
  currentEmployeeId,
}: BaiThiSectionProps) {
  const navigate = useNavigate()
  const { employee } = useAuthStore()
  const { data: kyThiList } = useKyThi()
  
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
  const [selectedBaiThi, setSelectedBaiThi] = useState<BaiThi | null>(null)
  const [baiThiToView, setBaiThiToView] = useState<BaiThi | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const createMutation = useCreateBaiThi()
  const updateMutation = useUpdateBaiThi()
  const deleteMutation = useDeleteBaiThi()

  // Query for selected bai thi detail
  const baiThiQuery = useBaiThiById(selectedBaiThi?.id || 0, selectedBaiThi || undefined)
  const viewState = useDetailViewStateFromQuery(baiThiQuery, selectedBaiThi || undefined)

  // Create nhân sự map for quick lookup
  const nhanSuMap = useMemo(() => {
    const map = new Map<number, NhanSu>()
    if (nhanSuList) {
      nhanSuList.forEach((ns) => {
        if (ns.ma_nhan_vien) {
          map.set(ns.ma_nhan_vien, ns)
        }
      })
    }
    return map
  }, [nhanSuList])

  // Click dòng -> Mở popup detail
  const handleRowClick = (baiThi: BaiThi) => {
    setSelectedBaiThi(baiThi)
    setDetailDialogOpen(true)
  }

  // Click icon mắt -> Confirm dialog -> Redirect đến page detail
  const handleEyeClick = (baiThi: BaiThi) => {
    if (!baiThi.id) return

    const skipConfirm =
      typeof window !== "undefined" &&
      window.localStorage.getItem(VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY) === "true"

    if (skipConfirm) {
      navigate(`${baiThiConfig.routePath}/${baiThi.id}`)
      return
    }

    setBaiThiToView(baiThi)
    setViewConfirmOpen(true)
  }

  // Handle add
  const handleAdd = () => {
    setSelectedBaiThi(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
  }

  // Handle edit
  const handleEdit = (baiThi: BaiThi) => {
    setSelectedBaiThi(baiThi)
    setIsEditMode(true)
    setFormDialogOpen(true)
  }

  // Handle delete
  const handleDelete = (baiThi: BaiThi) => {
    setSelectedBaiThi(baiThi)
    setDeleteDialogOpen(true)
  }

  // Handle form submit - Đồng nhất với bai-thi-form-view.tsx
  const handleFormSubmit = async (data: any) => {
    // Parse trao_doi if it's a JSON string
    let traoDoiValue: any = null
    if (data.trao_doi && typeof data.trao_doi === 'string' && data.trao_doi.trim()) {
      try {
        traoDoiValue = JSON.parse(data.trao_doi)
      } catch {
        // If not valid JSON, treat as plain string
        traoDoiValue = data.trao_doi
      }
    }

    if (isEditMode && selectedBaiThi) {
      const updateInput = {
        ky_thi_id: data.ky_thi_id ? (typeof data.ky_thi_id === 'string' ? parseInt(data.ky_thi_id, 10) : data.ky_thi_id) : undefined,
        ngay_lam_bai: data.ngay_lam_bai ? String(data.ngay_lam_bai).trim() : undefined,
        tong_so_cau: data.tong_so_cau !== null && data.tong_so_cau !== undefined ? Number(data.tong_so_cau) : undefined,
        trao_doi: traoDoiValue,
        // Các trường sau sẽ được xử lý tự động (không hiển thị trong form):
        // - trang_thai
        // - thoi_gian_bat_dau
        // - thoi_gian_ket_thuc
        // - diem_so
      }
      await updateMutation.mutateAsync({ 
        id: selectedBaiThi.id!, 
        input: updateInput
      })
    } else {
      if (!employee?.ma_nhan_vien) {
        throw new Error("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.")
      }
      
      const createInput = {
        ky_thi_id: typeof data.ky_thi_id === 'string' ? parseInt(data.ky_thi_id, 10) : data.ky_thi_id,
        nhan_vien_id: employee.ma_nhan_vien, // Tự động set từ user hiện tại
        ngay_lam_bai: String(data.ngay_lam_bai || "").trim(),
        trang_thai: "Chưa thi", // Default value - sẽ được xử lý tự động sau
        tong_so_cau: data.tong_so_cau !== null && data.tong_so_cau !== undefined ? Number(data.tong_so_cau) : null,
        trao_doi: traoDoiValue,
        // Các trường sau sẽ được xử lý tự động (không hiển thị trong form):
        // - thoi_gian_bat_dau
        // - thoi_gian_ket_thuc
        // - diem_so
      }
      await createMutation.mutateAsync(createInput)
    }
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedBaiThi?.id) return
    await deleteMutation.mutateAsync(selectedBaiThi.id)
  }

  // Get detail sections for dialog
  const getDetailSections = (baiThi: BaiThi): DetailSection[] => {
    const nhanSu = nhanSuMap.get(baiThi.nhan_vien_id)
    const percentage = calculatePercentage(baiThi.diem_so || 0, baiThi.tong_so_cau || 0)
    
    // Format duration
    let duration = "---"
    if (baiThi.thoi_gian_bat_dau && baiThi.thoi_gian_ket_thuc) {
      try {
        const start = new Date(baiThi.thoi_gian_bat_dau)
        const end = new Date(baiThi.thoi_gian_ket_thuc)
        const diffMs = end.getTime() - start.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffSecs = Math.floor((diffMs % 60000) / 1000)
        duration = `${diffMins > 0 ? `${diffMins} phút ` : ""}${diffSecs > 0 ? `${diffSecs} giây` : ""}`
      } catch {
        // Keep default
      }
    }

    return [
      {
        title: "Thông Tin Cơ Bản",
        fields: [
          { 
            label: "Nhân viên", 
            key: "nhan_vien", 
            value: nhanSu
              ? `${nhanSu.ma_nhan_vien} - ${nhanSu.ho_ten}`
              : `ID: ${baiThi.nhan_vien_id}`,
            colSpan: 2 as const
          },
          { 
            label: "Ngày làm bài", 
            key: "ngay_lam_bai", 
            value: baiThi.ngay_lam_bai
              ? format(new Date(baiThi.ngay_lam_bai), "dd/MM/yyyy", { locale: vi })
              : "-"
          },
          { 
            label: "Trạng thái", 
            key: "trang_thai", 
            value: baiThi.trang_thai || "-",
            type: "badge",
            format: () => (
              <Badge
                variant={
                  baiThi.trang_thai === "Đạt"
                    ? "default"
                    : baiThi.trang_thai === "Không đạt"
                    ? "destructive"
                    : baiThi.trang_thai === "Đang thi"
                    ? "outline"
                    : "secondary"
                }
              >
                {baiThi.trang_thai}
              </Badge>
            )
          },
        ]
      },
      {
        title: "Kết Quả",
        fields: [
          { 
            label: "Điểm số", 
            key: "diem_so", 
            value: `${baiThi.diem_so || 0}/${baiThi.tong_so_cau || 0} (${percentage.toFixed(0)}%)`
          },
          { 
            label: "Thời gian làm bài", 
            key: "duration", 
            value: duration
          },
          { 
            label: "Thời gian bắt đầu", 
            key: "thoi_gian_bat_dau", 
            value: baiThi.thoi_gian_bat_dau
              ? format(new Date(baiThi.thoi_gian_bat_dau), "dd/MM/yyyy HH:mm", { locale: vi })
              : "-"
          },
          { 
            label: "Thời gian kết thúc", 
            key: "thoi_gian_ket_thuc", 
            value: baiThi.thoi_gian_ket_thuc
              ? format(new Date(baiThi.thoi_gian_ket_thuc), "dd/MM/yyyy HH:mm", { locale: vi })
              : "-"
          },
        ]
      },
    ]
  }

  // Prepare form sections - Đồng nhất với bai-thi-form-view.tsx
  const formSections: FormSection[] = useMemo(() => {
    // Prepare options for select fields - hiển thị "ngày - tên kỳ thi"
    const kyThiOptions = (kyThiList || [])
      .filter(kt => kt.id !== undefined)
      .map(kt => {
        let label = kt.ten_ky_thi || `Kỳ thi #${kt.id}`
        if (kt.ngay) {
          try {
            const ngayFormatted = format(new Date(kt.ngay), "dd/MM/yyyy", { locale: vi })
            label = `${ngayFormatted} - ${label}`
          } catch {
            // Nếu không parse được ngày, giữ nguyên label
          }
        }
        return {
          label,
          value: String(kt.id),
        }
      })

    return [
      {
        title: "Thông Tin Cơ Bản",
        fields: [
          { 
            name: "ky_thi_id", 
            label: "Kỳ Thi", 
            type: "select", 
            options: kyThiOptions,
            required: true,
            defaultValue: String(kyThiId),
            disabled: true // Luôn disable vì đã chọn từ kỳ thi cha
          },
          { name: "ngay_lam_bai", label: "Ngày Làm Bài", type: "date", required: true },
          { name: "tong_so_cau", label: "Tổng Số Câu", type: "number", min: 0 },
        ]
      },
      {
        title: "Trao Đổi",
        fields: [
          { name: "trao_doi", label: "Trao Đổi", type: "textarea", colSpan: 2 },
        ]
      },
    ]
  }, [kyThiList, kyThiId])

  // Define columns for the table
  const columns: EmbeddedListColumn<BaiThi>[] = [
    {
      key: "nhan_vien",
      header: "Nhân viên",
      sortable: true,
      stickyLeft: true,
      stickyMinWidth: 180,
      render: (item) => {
        const nhanSu = nhanSuMap.get(item.nhan_vien_id)
        const isMyTest = currentEmployeeId === item.nhan_vien_id
        return (
          <span className={cn("font-medium", isMyTest && "text-primary font-semibold")}>
            {nhanSu
              ? `${nhanSu.ma_nhan_vien} - ${nhanSu.ho_ten}`
              : `ID: ${item.nhan_vien_id}`}
            {isMyTest && (
              <Badge variant="outline" className="ml-2 text-xs">
                Của tôi
              </Badge>
            )}
          </span>
        )
      }
    },
    {
      key: "ngay_lam_bai",
      header: "Ngày thi",
      sortable: true,
      render: (item) => (
        item.ngay_lam_bai
          ? format(new Date(item.ngay_lam_bai), "dd/MM/yyyy", { locale: vi })
          : <span className="text-muted-foreground">-</span>
      )
    },
    {
      key: "diem_so",
      header: "Điểm số",
      sortable: true,
      render: (item) => {
        const percentage = calculatePercentage(item.diem_so || 0, item.tong_so_cau || 0)
        const isPassed = item.trang_thai === "Đạt"
        const isFailed = item.trang_thai === "Không đạt"
        return (
          <div className="flex flex-col gap-1">
            <span
              className={cn(
                "font-semibold",
                isPassed && "text-green-600 dark:text-green-400",
                isFailed && "text-red-600 dark:text-red-400"
              )}
            >
              {item.diem_so}/{item.tong_so_cau}
            </span>
            <span className="text-xs text-muted-foreground">
              ({percentage.toFixed(0)}%)
            </span>
          </div>
        )
      }
    },
    {
      key: "trang_thai",
      header: "Trạng thái",
      sortable: true,
      render: (item) => (
        <Badge
          variant={
            item.trang_thai === "Đạt"
              ? "default"
              : item.trang_thai === "Không đạt"
              ? "destructive"
              : item.trang_thai === "Đang thi"
              ? "outline"
              : "secondary"
          }
        >
          {item.trang_thai}
        </Badge>
      )
    },
    {
      key: "duration",
      header: "Thời gian làm bài",
      sortable: false,
      hideInCompact: true,
      render: (item) => {
        if (!item.thoi_gian_bat_dau || !item.thoi_gian_ket_thuc) {
          return <span className="text-muted-foreground">---</span>
        }
        try {
          const start = new Date(item.thoi_gian_bat_dau)
          const end = new Date(item.thoi_gian_ket_thuc)
          const diffMs = end.getTime() - start.getTime()
          const diffMins = Math.floor(diffMs / 60000)
          const diffSecs = Math.floor((diffMs % 60000) / 1000)
          return (
            <span className="text-sm text-muted-foreground">
              {diffMins > 0 ? `${diffMins} phút ` : ""}{diffSecs > 0 ? `${diffSecs} giây` : ""}
            </span>
          )
        } catch {
          return <span className="text-muted-foreground">---</span>
        }
      }
    }
  ]

  const [expandDialogOpen, setExpandDialogOpen] = useState(false)

  return (
    <>
      <div className="space-y-3 sm:space-y-4 print:space-y-2 print:break-inside-avoid scroll-mt-28">
        <div className="flex items-center justify-between gap-2 sm:gap-2.5 px-1">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 rounded-md bg-primary/10 print:bg-transparent print:border print:border-primary">
              <FileText className="h-4 w-4 text-primary shrink-0" />
            </div>
            <h3 className={sectionTitleClass("font-semibold tracking-tight text-primary")}>
              Danh Sách Các Lượt Thi
            </h3>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            {baiThiList.length > 0 && (
              <Button
                onClick={() => setExpandDialogOpen(true)}
                size="sm"
                variant="outline"
              >
                Xem tất cả
              </Button>
            )}
            <Button onClick={handleAdd} size="sm">
              Thêm Bài Thi
            </Button>
          </div>
        </div>
        <EmbeddedListSection
          title=""
          data={baiThiList}
          columns={columns}
          isLoading={false}
          emptyMessage="Chưa có lượt thi nào"
          onRowClick={handleRowClick}
          onView={handleEyeClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          getItemId={(item) => item.id!}
          getItemName={(item) => {
            const nhanSu = nhanSuMap.get(item.nhan_vien_id)
            return nhanSu ? `${nhanSu.ma_nhan_vien} - ${nhanSu.ho_ten}` : `Bài thi #${item.id}`
          }}
          compactMode={true}
          compactRowCount={5}
          showMoreIndicator={true}
          enableExpandView={false} // Disable default expand, use custom
          showItemCount={true}
          totalCount={baiThiList.length}
          defaultSortField="ngay_lam_bai"
          defaultSortDirection="desc"
        />
      </div>
      
      {/* Custom Expand Dialog */}
      {expandDialogOpen && (
        <EmbeddedListFullViewDialog
          open={expandDialogOpen}
          onOpenChange={setExpandDialogOpen}
          title="Danh Sách Đầy Đủ Các Lượt Thi"
          data={baiThiList}
          columns={columns}
          onRowClick={handleRowClick}
          onView={handleEyeClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          getItemId={(item) => item.id!}
          defaultSortField="ngay_lam_bai"
          defaultSortDirection="desc"
          enableSearch={true}
          searchPlaceholder="Tìm kiếm theo trạng thái, điểm số..."
          searchFields={["trang_thai", "diem_so"]}
        />
      )}

      {/* Detail Dialog */}
      {selectedBaiThi && (
        <GenericDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          dialogTitle={`Chi Tiết: Bài thi #${selectedBaiThi.id}`}
          dialogSubtitle="Chi tiết thông tin bài thi"
          title={`Bài thi #${selectedBaiThi.id}`}
          subtitle={nhanSuMap.get(selectedBaiThi.nhan_vien_id)?.ho_ten || undefined}
          sections={getDetailSections(selectedBaiThi)}
          isLoading={viewState.isLoading}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDetailDialogOpen(false)
                  handleEdit(selectedBaiThi)
                }}
              >
                Sửa
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDetailDialogOpen(false)
                  handleDelete(selectedBaiThi)
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
            setSelectedBaiThi(null)
            setIsEditMode(false)
          }
        }}
        title={isEditMode ? `Sửa Bài Thi: #${selectedBaiThi?.id}` : "Thêm Mới Bài Thi"}
        subtitle={isEditMode ? "Cập nhật thông tin bài thi" : "Thêm bài thi mới cho kỳ thi này"}
        schema={baiThiSchema.omit({ 
          id: true, 
          tg_tao: true, 
          tg_cap_nhat: true,
          chi_tiet_bai_lam: true,
          nhan_vien_id: true // Tự động set từ user hiện tại
        }).extend({
          ngay_lam_bai: z.union([
            z.string().min(1, "Ngày làm bài là bắt buộc"),
            z.date().transform((val) => val.toISOString().split('T')[0]),
          ]),
          ky_thi_id: z.union([
            z.number().int().positive("Kỳ thi là bắt buộc"),
            z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val > 0, "Kỳ thi là bắt buộc"),
          ]),
          tong_so_cau: z.number().int().min(0).optional().nullable(),
          trao_doi: z.union([
            z.string(),
            z.any(), // For JSONB
          ]).optional().nullable(),
        })}
        defaultValues={isEditMode && selectedBaiThi 
          ? {
              ky_thi_id: selectedBaiThi.ky_thi_id ? String(selectedBaiThi.ky_thi_id) : String(kyThiId),
              ngay_lam_bai: selectedBaiThi.ngay_lam_bai || new Date().toISOString().split('T')[0],
              tong_so_cau: selectedBaiThi.tong_so_cau ?? null,
              trao_doi: selectedBaiThi.trao_doi ? (typeof selectedBaiThi.trao_doi === 'string' ? selectedBaiThi.trao_doi : JSON.stringify(selectedBaiThi.trao_doi, null, 2)) : "",
            }
          : {
              ky_thi_id: String(kyThiId),
              ngay_lam_bai: new Date().toISOString().split('T')[0],
              tong_so_cau: null,
              trao_doi: "",
            }
        }
        sections={formSections}
        onSubmit={handleFormSubmit}
        submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
        successMessage={isEditMode ? "Cập nhật bài thi thành công" : "Thêm mới bài thi thành công"}
        errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật bài thi" : "Có lỗi xảy ra khi thêm mới bài thi"}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Dialog */}
      {selectedBaiThi && (
        <GenericDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Xác nhận xóa bài thi"
          description="Bạn có chắc chắn muốn xóa bài thi này không?"
          entityName={(() => {
            const nhanSu = nhanSuMap.get(selectedBaiThi.nhan_vien_id)
            return nhanSu ? `${nhanSu.ma_nhan_vien} - ${nhanSu.ho_ten}` : `Bài thi #${selectedBaiThi.id}`
          })()}
          onConfirm={handleDeleteConfirm}
          isLoading={deleteMutation.isPending}
        />
      )}

      {/* View Detail Confirm Dialog */}
      <ConfirmDialog
        open={viewConfirmOpen}
        onOpenChange={setViewConfirmOpen}
        title="Mở trang chi tiết bài thi"
        description="Bạn có muốn mở trang chi tiết bài thi trong module Bài thi không?"
        confirmLabel="Mở trang chi tiết"
        cancelLabel="Hủy"
        skipConfirmStorageKey={VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY}
        skipConfirmLabel="Đừng hỏi lại lần sau"
        onConfirm={() => {
          if (!baiThiToView?.id) return
          navigate(`${baiThiConfig.routePath}/${baiThiToView.id}`)
        }}
      />
    </>
  )
}

