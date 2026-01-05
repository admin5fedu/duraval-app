"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { KeHoachThiTruong } from "../schema"
import { useKeHoachThiTruong, useBatchDeleteKeHoachThiTruong } from "../hooks"
import { keHoachThiTruongColumns } from "./ke-hoach-thi-truong-columns"
import { keHoachThiTruongConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertKeHoachThiTruong } from "../actions/ke-hoach-thi-truong-excel-actions"
import { KeHoachThiTruongImportDialog } from "./ke-hoach-thi-truong-import-dialog"

interface KeHoachThiTruongListViewProps {
  initialData?: KeHoachThiTruong[]
  onEdit?: (id: number) => void
  onAddNew?: () => void
  onView?: (id: number) => void
}

export function KeHoachThiTruongListView({ 
  initialData,
  onEdit,
  onAddNew,
  onView,
}: KeHoachThiTruongListViewProps = {}) {
  const { data: keHoachThiTruongList, isLoading, isError, refetch } = useKeHoachThiTruong(initialData)
  const navigate = useNavigate()
  const batchDeleteMutation = useBatchDeleteKeHoachThiTruong()
  const batchImportMutation = useBatchUpsertKeHoachThiTruong()
  const module = keHoachThiTruongConfig.moduleName
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)

  // Create columns
  const columns = React.useMemo(() => {
    return keHoachThiTruongColumns()
  }, [])

  // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
  const {
    initialFilters,
    initialSearch,
    initialSorting,
    handleFiltersChange,
    handleSearchChange,
    handleSortChange,
  } = useListViewFilters(module, keHoachThiTruongConfig.defaultSorting)

  const handleAddNewClick = () => {
    if (onAddNew) {
      onAddNew()
    } else {
      navigate(`${keHoachThiTruongConfig.routePath}/moi`)
    }
  }

  const handleEditClick = (row: KeHoachThiTruong) => {
    const id = row.id!
    if (onEdit) {
      onEdit(id)
    } else {
      navigate(`${keHoachThiTruongConfig.routePath}/${id}/sua?returnTo=list`)
    }
  }

  const handleViewClick = (row: KeHoachThiTruong) => {
    const id = row.id!
    if (onView) {
      onView(id)
    } else {
      navigate(`${keHoachThiTruongConfig.routePath}/${id}`)
    }
  }

  const renderMobileCard = React.useCallback((row: KeHoachThiTruong) => {
    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Thông tin chính */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 min-w-0 flex items-start gap-2">
            <div className="flex-1 min-w-0">
              {row.ngay && (
                <span className="font-semibold text-base text-foreground leading-tight truncate block">
                  {format(new Date(row.ngay), "dd/MM/yyyy", { locale: vi })}
                </span>
              )}
              {row.ten_nhan_vien && (
                <span className="text-sm text-muted-foreground block">
                  {row.ten_nhan_vien}
                </span>
              )}
              {row.buoi && (
                <span className="text-sm text-muted-foreground">
                  {row.buoi}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin phụ */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {row.hanh_dong && (
            <p className="leading-snug">
              Hành động: <span className="font-medium text-foreground">{row.hanh_dong}</span>
            </p>
          )}
          {row.ten_khach_buon && (
            <p className="leading-snug">
              Khách buôn: <span className="font-medium text-foreground">{row.ten_khach_buon}</span>
            </p>
          )}
          {row.muc_tieu && (
            <p className="leading-snug">
              Mục tiêu: <span className="font-medium text-foreground">{row.muc_tieu}</span>
            </p>
          )}
          {row.tg_tao && (
            <p className="leading-snug">
              Tạo: <span className="font-medium text-foreground">
                {format(new Date(row.tg_tao), "dd/MM/yyyy HH:mm", { locale: vi })}
              </span>
            </p>
          )}
        </div>
      </div>
    )
  }, [])

  const getColumnTitle = React.useCallback((columnId: string) => {
    const column = columns.find((col) => {
      if (col.id === columnId) return true
      if ('accessorKey' in col && col.accessorKey === columnId) return true
      return false
    })
    return (column?.meta as { title?: string } | undefined)?.title || columnId
  }, [columns])

  const getCellValue = React.useCallback((row: KeHoachThiTruong, columnId: string) => {
    const value = (row as any)[columnId]
    if (value === null || value === undefined) return "-"
    if (columnId === "ngay") {
      try {
        return format(new Date(value), "dd/MM/yyyy", { locale: vi })
      } catch {
        return "-"
      }
    }
    if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
      try {
        return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
      } catch {
        return "-"
      }
    }
    return String(value)
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
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">Có lỗi xảy ra khi tải danh sách kế hoạch thị trường</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <>
    <GenericListView
      data={keHoachThiTruongList || []}
      columns={columns}
      module={module}
      onAdd={handleAddNewClick}
      addHref={`${keHoachThiTruongConfig.routePath}/moi`}
      onEdit={handleEditClick}
      onDeleteSelected={async (selectedRows) => {
        const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
        await batchDeleteMutation.mutateAsync(ids)
        refetch()
      }}
      batchDeleteConfig={{
        itemName: "kế hoạch thị trường",
        moduleName: keHoachThiTruongConfig.moduleTitle,
        isLoading: batchDeleteMutation.isPending,
        getItemLabel: (item: KeHoachThiTruong) => `ID ${item.id}`,
      }}
      initialFilters={initialFilters}
      initialSearch={initialSearch}
      initialSorting={initialSorting}
      onFiltersChange={handleFiltersChange}
      onSearchChange={handleSearchChange}
      onSortChange={handleSortChange}
      searchFields={keHoachThiTruongConfig.searchFields as (keyof KeHoachThiTruong)[]}
      renderMobileCard={renderMobileCard}
      onRowClick={handleViewClick}
      exportOptions={{
        columns: columns,
        totalCount: keHoachThiTruongList?.length || 0,
        moduleName: keHoachThiTruongConfig.moduleTitle,
        getColumnTitle,
        getCellValue,
      }}
      onImport={() => setImportDialogOpen(true)}
      isImporting={batchImportMutation.isPending}
    />

    {/* Import Dialog */}
    <KeHoachThiTruongImportDialog
      open={importDialogOpen}
      onOpenChange={(open) => {
        setImportDialogOpen(open)
        if (!open) {
          refetch()
        }
      }}
    />
    </>
  )
}

