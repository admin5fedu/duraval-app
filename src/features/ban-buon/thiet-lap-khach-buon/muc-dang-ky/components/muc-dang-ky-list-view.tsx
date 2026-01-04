"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { MucDangKy } from "../schema"
import { useMucDangKy, useBatchDeleteMucDangKy } from "../hooks"
import { mucDangKyColumns } from "./muc-dang-ky-columns"
import { mucDangKyConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertMucDangKy } from "../actions/muc-dang-ky-excel-actions"
import { MucDangKyImportDialog } from "./muc-dang-ky-import-dialog"

interface MucDangKyListViewProps {
  initialData?: MucDangKy[]
  onEdit?: (id: number) => void
  onAddNew?: () => void
  onView?: (id: number) => void
}

export function MucDangKyListView({ 
  initialData,
  onEdit,
  onAddNew,
  onView,
}: MucDangKyListViewProps = {}) {
  const { data: mucDangKyList, isLoading, isError, refetch } = useMucDangKy(initialData)
  const navigate = useNavigate()
  const batchDeleteMutation = useBatchDeleteMucDangKy()
  const batchImportMutation = useBatchUpsertMucDangKy()
  const module = mucDangKyConfig.moduleName
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)

  // Create columns
  const columns = React.useMemo(() => {
    return mucDangKyColumns()
  }, [])

  // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
  const {
    initialFilters,
    initialSearch,
    initialSorting,
    handleFiltersChange,
    handleSearchChange,
    handleSortChange,
  } = useListViewFilters(module, mucDangKyConfig.defaultSorting)

  // Generate filter options from data
  const nguoiTaoOptions = React.useMemo(() => {
    if (!mucDangKyList) return []
    const unique = new Map<number, { id: number; name: string }>()
    
    mucDangKyList.forEach((item) => {
      if (item.nguoi_tao_id && !unique.has(item.nguoi_tao_id)) {
        unique.set(item.nguoi_tao_id, {
          id: item.nguoi_tao_id,
          name: item.nguoi_tao_ten || `Mã ${item.nguoi_tao_id}`
        })
      }
    })
    
    return Array.from(unique.values())
      .map(item => ({
        label: `${item.id} - ${item.name}`,
        value: String(item.id)
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [mucDangKyList])

  // Build filters array from config + dynamic options
  const filters = React.useMemo(() => {
    const baseFilters = mucDangKyConfig.filterColumns || []
    
    // Add nguoi_tao_id filter if we have options
    if (nguoiTaoOptions.length > 0) {
      return [
        ...baseFilters,
        {
          columnId: "nguoi_tao_id",
          title: "Người Tạo",
          options: nguoiTaoOptions,
        },
      ]
    }
    
    return baseFilters
  }, [nguoiTaoOptions])

  const handleAddNewClick = () => {
    if (onAddNew) {
      onAddNew()
    } else {
      navigate(`${mucDangKyConfig.routePath}/moi`)
    }
  }

  const handleEditClick = (id: number) => {
    if (onEdit) {
      onEdit(id)
    } else {
      navigate(`${mucDangKyConfig.routePath}/${id}/sua`)
    }
  }

  const handleViewClick = (id: number) => {
    if (onView) {
      onView(id)
    } else {
      navigate(`${mucDangKyConfig.routePath}/${id}`)
    }
  }

  // Mobile card renderer
  const renderMobileCard = React.useCallback((row: MucDangKy) => {
    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Thông tin chính */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 min-w-0 flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-base text-foreground leading-tight truncate block">
                {row.ten_hang}
              </span>
              {row.ma_hang && (
                <span className="text-sm text-muted-foreground mt-1 block">
                  Mã: {row.ma_hang}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin phụ */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {row.ghi_chu && (
            <p className="leading-snug line-clamp-2">
              {row.ghi_chu}
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

  // Export utilities
  const getColumnTitle = React.useCallback((columnId: string) => {
    const column = columns.find((col) => {
      const id = (col as any).id
      const accessorKey = (col as any).accessorKey
      return id === columnId || accessorKey === columnId
    })
    return (column?.meta as any)?.title || columnId
  }, [columns])

  const getCellValue = React.useCallback((row: MucDangKy, columnId: string) => {
    if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
      const value = (row as any)[columnId]
      if (!value) return ""
      return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
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
        <p className="text-destructive mb-4">Lỗi khi tải danh sách mức đăng ký</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <>
      <GenericListView
        data={mucDangKyList || []}
        columns={columns}
        filterColumn="ten_hang"
        module={module}
        searchFields={mucDangKyConfig.searchFields as (keyof MucDangKy)[]}
        filters={filters}
        initialFilters={initialFilters}
        initialSearch={initialSearch}
        initialSorting={initialSorting}
        onFiltersChange={handleFiltersChange}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onDeleteSelected={async (selectedRows) => {
          const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
          await batchDeleteMutation.mutateAsync(ids)
          refetch()
        }}
        batchDeleteConfig={{
          itemName: "mức đăng ký",
          moduleName: mucDangKyConfig.moduleTitle,
          isLoading: batchDeleteMutation.isPending,
          getItemLabel: (item: MucDangKy) => item.ten_hang || String(item.id),
        }}
        onImport={() => setImportDialogOpen(true)}
        isImporting={batchImportMutation.isPending}
        onAdd={handleAddNewClick}
        addHref={`${mucDangKyConfig.routePath}/moi`}
        onBack={() => {
          navigate(mucDangKyConfig.parentPath)
        }}
        enableSuggestions={true}
        enableRangeSelection={true}
        enableLongPress={true}
        persistSelection={false}
        renderMobileCard={renderMobileCard}
        enableVirtualization={(mucDangKyList?.length || 0) > 100}
        virtualRowHeight={60}
        exportOptions={{
          columns: columns,
          totalCount: mucDangKyList?.length || 0,
          moduleName: mucDangKyConfig.moduleTitle,
          getColumnTitle,
          getCellValue,
        }}
        onEdit={(row) => handleEditClick(row.id!)}
        onRowClick={(row) => handleViewClick(row.id!)}
      />

      {/* Import Dialog */}
      <MucDangKyImportDialog
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
