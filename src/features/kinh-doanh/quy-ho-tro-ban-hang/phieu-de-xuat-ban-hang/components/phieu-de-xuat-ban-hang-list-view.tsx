"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ActionGroup } from "@/shared/components/actions"
import { Badge } from "@/components/ui/badge"
import { PhieuDeXuatBanHang } from "../schema"
import { usePhieuDeXuatBanHang, useBatchDeletePhieuDeXuatBanHang, useDeletePhieuDeXuatBanHang } from "../hooks"
import { phieuDeXuatBanHangColumns } from "./phieu-de-xuat-ban-hang-columns"
import { phieuDeXuatBanHangConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { PhieuDeXuatBanHangImportDialog } from "./phieu-de-xuat-ban-hang-import-dialog"
import { useBatchUpsertPhieuDeXuatBanHang } from "../actions/phieu-de-xuat-ban-hang-excel-actions"

// Format số tiền
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value)
}

interface PhieuDeXuatBanHangListViewProps {
  initialData?: PhieuDeXuatBanHang[]
  onEdit?: (id: number) => void
  onAddNew?: () => void
  onView?: (id: number) => void
}

export function PhieuDeXuatBanHangListView({ 
  initialData,
  onEdit,
  onAddNew,
  onView,
}: PhieuDeXuatBanHangListViewProps = {}) {
  const { data: phieuList, isLoading, isError, refetch } = usePhieuDeXuatBanHang(initialData)
  const navigate = useNavigate()
  const batchDeleteMutation = useBatchDeletePhieuDeXuatBanHang()
  const deleteMutation = useDeletePhieuDeXuatBanHang()
  const batchImportMutation = useBatchUpsertPhieuDeXuatBanHang()
  const module = phieuDeXuatBanHangConfig.moduleName
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [rowToDelete, setRowToDelete] = React.useState<PhieuDeXuatBanHang | null>(null)
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)

  // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
  const {
    initialFilters,
    initialSearch,
    initialSorting,
    handleFiltersChange,
    handleSearchChange,
    handleSortChange,
  } = useListViewFilters(module, phieuDeXuatBanHangConfig.defaultSorting || [{ id: "tg_tao", desc: true }])

  // Generate filter options from data
  const trangThaiOptions = React.useMemo(() => {
    const unique = Array.from(
      new Set(phieuList?.map((e) => e.trang_thai).filter((d): d is string => !!d) || [])
    ).sort()
    return unique.map((d) => ({ label: d, value: d }))
  }, [phieuList])

  const phongOptions = React.useMemo(() => {
    const unique = Array.from(
      new Set(phieuList?.map((e) => e.ma_phong).filter((d): d is string => !!d) || [])
    ).sort()
    return unique.map((d) => ({ label: d, value: d }))
  }, [phieuList])

  const nhomOptions = React.useMemo(() => {
    const unique = Array.from(
      new Set(phieuList?.map((e) => e.ma_nhom).filter((d): d is string => !!d) || [])
    ).sort()
    return unique.map((d) => ({ label: d, value: d }))
  }, [phieuList])

  const loaiPhieuOptions = React.useMemo(() => {
    const unique = Array.from(
      new Set(phieuList?.map((e) => e.ten_loai_phieu).filter((d): d is string => !!d) || [])
    ).sort()
    return unique.map((d) => ({ label: d, value: d }))
  }, [phieuList])

  const hangMucOptions = React.useMemo(() => {
    const unique = Array.from(
      new Set(phieuList?.map((e) => e.ten_hang_muc).filter((d): d is string => !!d) || [])
    ).sort()
    return unique.map((d) => ({ label: d, value: d }))
  }, [phieuList])

  // Mobile card renderer
  const renderMobileCard = React.useCallback((row: PhieuDeXuatBanHang) => {
    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Header với ID và thông tin chính */}
        <div className="flex gap-3 items-start">
          <div className="flex-1 min-w-0 flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-base text-foreground leading-tight truncate block">
                ID: {row.id}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {row.ten_nhan_vien && (
                  <p className="text-sm text-muted-foreground leading-snug line-clamp-1">
                    {row.ten_nhan_vien}
                  </p>
                )}
                {row.trang_thai && (
                  <Badge variant="outline" className="shrink-0 text-[11px] px-2 py-0">
                    {row.trang_thai}
                  </Badge>
                )}
              </div>
            </div>
            {row.tong_ck && (
              <Badge variant="secondary" className="shrink-0 text-[11px] px-2 py-0">
                {formatCurrency(row.tong_ck)}
              </Badge>
            )}
          </div>
        </div>

        {/* Thông tin phụ */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {row.ma_phong && (
            <p className="leading-snug">
              Phòng: <span className="font-medium text-foreground">{row.ma_phong}</span>
            </p>
          )}
          {row.ma_nhom && (
            <p className="leading-snug">
              Nhóm: <span className="font-medium text-foreground">{row.ma_nhom}</span>
            </p>
          )}
          {row.ten_loai_phieu && (
            <p className="leading-snug">
              Loại phiếu: <span className="font-medium text-foreground">{row.ten_loai_phieu}</span>
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <p className="text-[10px] text-muted-foreground">Tiền đơn hàng</p>
              <p className="font-medium text-foreground">{formatCurrency(row.tien_don_hang)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Tổng CK</p>
              <p className="font-medium text-foreground text-green-600">{formatCurrency(row.tong_ck)}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }, [])

  // Export utilities
  const getColumnTitle = React.useCallback((columnId: string) => {
    const column = phieuDeXuatBanHangColumns.find((col) => {
      if (col.id === columnId) return true
      if ('accessorKey' in col && col.accessorKey === columnId) return true
      return false
    })
    return (column?.meta as any)?.title || columnId
  }, [])

  const getCellValue = React.useCallback((row: PhieuDeXuatBanHang, columnId: string) => {
    if (columnId === "tien_don_hang" || columnId === "tong_ck" || columnId === "ty_le") {
      const value = (row as any)[columnId]
      if (columnId === "ty_le") {
        return value?.toString() || ""
      }
      return formatCurrency(value)
    }
    if (columnId === "tg_tao" || columnId === "tg_cap_nhat" || columnId === "ngay") {
      const value = (row as any)[columnId]
      if (!value) return ""
      try {
        return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
      } catch {
        return value
      }
    }
    return (row as any)[columnId] ?? ""
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-destructive mb-4">Lỗi khi tải danh sách phiếu đề xuất bán hàng</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <>
    <GenericListView
      columns={phieuDeXuatBanHangColumns}
      data={phieuList || []}
      filterColumn="ten_nhan_vien"
      initialSorting={initialSorting}
      initialFilters={initialFilters}
      initialSearch={initialSearch}
      onFiltersChange={handleFiltersChange}
      onSearchChange={handleSearchChange}
      onSortChange={handleSortChange}
      onRowClick={(row) => {
        if (onView) {
          onView(row.id)
        } else {
          navigate(`${phieuDeXuatBanHangConfig.routePath}/${row.id}`)
        }
      }}
      onAdd={() => {
        if (onAddNew) {
          onAddNew()
        } else {
          navigate(`${phieuDeXuatBanHangConfig.routePath}/moi`)
        }
      }}
      addHref={`${phieuDeXuatBanHangConfig.routePath}/moi`}
      onBack={() => {
        navigate(phieuDeXuatBanHangConfig.parentPath)
      }}
      onDeleteSelected={async (selectedRows) => {
        const ids = selectedRows.map((row) => row.id)
        await batchDeleteMutation.mutateAsync(ids)
      }}
      batchDeleteConfig={{
        itemName: "phiếu đề xuất bán hàng",
        moduleName: phieuDeXuatBanHangConfig.moduleTitle,
        isLoading: batchDeleteMutation.isPending,
        getItemLabel: (item: PhieuDeXuatBanHang) => `ID: ${item.id} - ${item.ten_nhan_vien || ""}`,
      }}
      filters={[
        {
          columnId: "trang_thai",
          title: "Trạng thái",
          options: trangThaiOptions,
        },
        {
          columnId: "ma_phong",
          title: "Mã phòng",
          options: phongOptions,
        },
        {
          columnId: "ma_nhom",
          title: "Mã nhóm",
          options: nhomOptions,
        },
        {
          columnId: "ten_loai_phieu",
          title: "Loại phiếu",
          options: loaiPhieuOptions,
        },
        {
          columnId: "ten_hang_muc",
          title: "Hạng mục",
          options: hangMucOptions,
        },
      ]}
      searchFields={phieuDeXuatBanHangConfig.searchFields as (keyof PhieuDeXuatBanHang)[]}
      module={module}
      enableSuggestions={true}
      enableRangeSelection={true}
      enableLongPress={true}
      persistSelection={false}
      renderMobileCard={renderMobileCard}
      enableVirtualization={(phieuList || []).length > 100}
      virtualRowHeight={80}
      exportOptions={{
        columns: phieuDeXuatBanHangColumns,
        totalCount: phieuList?.length || 0,
        moduleName: phieuDeXuatBanHangConfig.moduleTitle,
        getColumnTitle,
        getCellValue,
      }}
      onEdit={(row) => {
        if (onEdit) {
          onEdit(row.id)
        } else {
          navigate(`${phieuDeXuatBanHangConfig.routePath}/${row.id}/sua`)
        }
      }}
      onDelete={(row) => {
        setRowToDelete(row)
        setDeleteDialogOpen(true)
      }}
      onImport={() => setImportDialogOpen(true)}
      isImporting={batchImportMutation.isPending}
    />

    {/* Import Dialog */}
    <PhieuDeXuatBanHangImportDialog
      open={importDialogOpen}
      onOpenChange={setImportDialogOpen}
      mutation={batchImportMutation}
    />

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa phiếu đề xuất bán hàng <strong>ID: {rowToDelete?.id}</strong>? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
          <ActionGroup
            actions={[
              {
                label: "Hủy",
                onClick: () => setDeleteDialogOpen(false),
                level: "secondary",
                disabled: deleteMutation.isPending,
              },
              {
                label: deleteMutation.isPending ? "Đang xóa..." : "Xóa",
                onClick: async () => {
              if (rowToDelete?.id) {
                try {
                  await deleteMutation.mutateAsync(rowToDelete.id)
                  setDeleteDialogOpen(false)
                  setRowToDelete(null)
                } catch (error) {
                  // Error is handled by mutation
                }
              }
                },
                level: "primary",
                variant: "destructive",
                disabled: deleteMutation.isPending,
                loading: deleteMutation.isPending,
              },
            ]}
          />
        </div>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

