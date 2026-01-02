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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { QuyHTBHTheoThang } from "../schema"
import { useQuyHTBHTheoThang, useBatchDeleteQuyHTBHTheoThang, useDeleteQuyHTBHTheoThang } from "../hooks"
import { quyHTBHTheoThangColumns } from "./quy-htbh-theo-thang-columns"
import { quyHTBHTheoThangConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { QuyHTBHTheoThangImportDialog } from "./quy-htbh-theo-thang-import-dialog"
import { useBatchUpsertQuyHTBHTheoThang } from "../actions/quy-htbh-theo-thang-excel-actions"

// Format số tiền
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value)
}

interface QuyHTBHTheoThangListViewProps {
  initialData?: QuyHTBHTheoThang[]
  onEdit?: (id: number) => void
  onAddNew?: () => void
  onView?: (id: number) => void
}

export function QuyHTBHTheoThangListView({ 
  initialData,
  onEdit,
  onAddNew,
  onView,
}: QuyHTBHTheoThangListViewProps = {}) {
  const { data: quyHTBHList, isLoading, isError, refetch } = useQuyHTBHTheoThang(initialData)
  const navigate = useNavigate()
  const batchDeleteMutation = useBatchDeleteQuyHTBHTheoThang()
  const deleteMutation = useDeleteQuyHTBHTheoThang()
  const batchImportMutation = useBatchUpsertQuyHTBHTheoThang()
  const module = quyHTBHTheoThangConfig.moduleName
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [rowToDelete, setRowToDelete] = React.useState<QuyHTBHTheoThang | null>(null)
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)

  // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
  const {
    initialFilters,
    initialSearch,
    initialSorting,
    handleFiltersChange,
    handleSearchChange,
    handleSortChange,
  } = useListViewFilters(module, quyHTBHTheoThangConfig.defaultSorting || [{ id: "tg_tao", desc: true }])

  // Generate filter options from data
  const namOptions = React.useMemo(() => {
    const unique = Array.from(
      new Set(quyHTBHList?.map((e) => e.nam).filter((d): d is number => d !== null && d !== undefined) || [])
    ).sort((a, b) => b - a) // Sort descending
    return unique.map((d) => ({ label: d.toString(), value: d.toString() }))
  }, [quyHTBHList])

  const thangOptions = React.useMemo(() => {
    const unique = Array.from(
      new Set(quyHTBHList?.map((e) => e.thang).filter((d): d is number => d !== null && d !== undefined) || [])
    ).sort((a, b) => b - a) // Sort descending
    return unique.map((d) => ({ label: `Tháng ${d}`, value: d.toString() }))
  }, [quyHTBHList])

  const phongOptions = React.useMemo(() => {
    const unique = Array.from(
      new Set(quyHTBHList?.map((e) => e.ma_phong).filter((d): d is string => !!d) || [])
    ).sort()
    return unique.map((d) => ({ label: d, value: d }))
  }, [quyHTBHList])

  const nhomOptions = React.useMemo(() => {
    const unique = Array.from(
      new Set(quyHTBHList?.map((e) => e.ma_nhom).filter((d): d is string => !!d) || [])
    ).sort()
    return unique.map((d) => ({ label: d, value: d }))
  }, [quyHTBHList])

  const quyOptions = React.useMemo(() => {
    const unique = Array.from(
      new Set(quyHTBHList?.map((e) => e.quy).filter((d): d is string => !!d) || [])
    ).sort()
    return unique.map((d) => ({ label: d, value: d }))
  }, [quyHTBHList])

  // Mobile card renderer
  const renderMobileCard = React.useCallback((row: QuyHTBHTheoThang) => {
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
                {row.nam && row.thang && (
                  <Badge variant="outline" className="shrink-0 text-[11px] px-2 py-0">
                    {row.nam}/{row.thang}
                  </Badge>
                )}
              </div>
            </div>
            {/* Góc phải: Quỹ */}
            {row.quy && (
              <Badge variant="secondary" className="shrink-0 text-[11px] px-2 py-0">
                {row.quy}
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
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <p className="text-[10px] text-muted-foreground">Số tiền quỹ</p>
              <p className="font-medium text-foreground">{formatCurrency(row.so_tien_quy)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Còn dư</p>
              <p className="font-medium text-foreground text-green-600">{formatCurrency(row.con_du)}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }, [])

  // Export utilities
  const getColumnTitle = React.useCallback((columnId: string) => {
    const column = quyHTBHTheoThangColumns.find((col) => {
      if (col.id === columnId) return true
      if ('accessorKey' in col && col.accessorKey === columnId) return true
      return false
    })
    return (column?.meta as any)?.title || columnId
  }, [])

  const getCellValue = React.useCallback((row: QuyHTBHTheoThang, columnId: string) => {
    if (columnId === "so_tien_quy" || columnId === "da_dung" || columnId === "con_du") {
      const value = (row as any)[columnId]
      return formatCurrency(value)
    }
    if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
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
        <p className="text-destructive mb-4">Lỗi khi tải danh sách quỹ HTBH theo tháng</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <>
    <GenericListView
      columns={quyHTBHTheoThangColumns}
      data={quyHTBHList || []}
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
          navigate(`${quyHTBHTheoThangConfig.routePath}/${row.id}`)
        }
      }}
      onAdd={() => {
        if (onAddNew) {
          onAddNew()
        } else {
          navigate(`${quyHTBHTheoThangConfig.routePath}/moi`)
        }
      }}
      addHref={`${quyHTBHTheoThangConfig.routePath}/moi`}
      onBack={() => {
        navigate(quyHTBHTheoThangConfig.parentPath)
      }}
      onDeleteSelected={async (selectedRows) => {
        const ids = selectedRows.map((row) => row.id)
        await batchDeleteMutation.mutateAsync(ids)
      }}
      batchDeleteConfig={{
        itemName: "quỹ HTBH theo tháng",
        moduleName: quyHTBHTheoThangConfig.moduleTitle,
        isLoading: batchDeleteMutation.isPending,
        getItemLabel: (item: QuyHTBHTheoThang) => `ID: ${item.id} - ${item.ten_nhan_vien || ""}`,
      }}
      filters={[
        {
          columnId: "nam",
          title: "Năm",
          options: namOptions,
        },
        {
          columnId: "thang",
          title: "Tháng",
          options: thangOptions,
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
          columnId: "quy",
          title: "Quỹ",
          options: quyOptions,
        },
      ]}
      searchFields={quyHTBHTheoThangConfig.searchFields as (keyof QuyHTBHTheoThang)[]}
      module={module}
      enableSuggestions={true}
      enableRangeSelection={true}
      enableLongPress={true}
      persistSelection={false}
      renderMobileCard={renderMobileCard}
      enableVirtualization={(quyHTBHList || []).length > 100}
      virtualRowHeight={80}
      exportOptions={{
        columns: quyHTBHTheoThangColumns,
        totalCount: quyHTBHList?.length || 0,
        moduleName: quyHTBHTheoThangConfig.moduleTitle,
        getColumnTitle,
        getCellValue,
      }}
      onEdit={(row) => {
        if (onEdit) {
          onEdit(row.id)
        } else {
          navigate(`${quyHTBHTheoThangConfig.routePath}/${row.id}/sua`)
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
    <QuyHTBHTheoThangImportDialog
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
            Bạn có chắc chắn muốn xóa quỹ HTBH theo tháng <strong>ID: {rowToDelete?.id}</strong>? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              if (rowToDelete?.id) {
                try {
                  await deleteMutation.mutateAsync(rowToDelete.id)
                  setDeleteDialogOpen(false)
                  setRowToDelete(null)
                } catch (error) {
                  // Error is handled by mutation
                }
              }
            }}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

