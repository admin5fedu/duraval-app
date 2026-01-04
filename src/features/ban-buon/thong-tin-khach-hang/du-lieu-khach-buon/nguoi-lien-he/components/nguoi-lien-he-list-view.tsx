"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { NguoiLienHe } from "../schema"
import { useNguoiLienHe, useBatchDeleteNguoiLienHe } from "../hooks"
import { nguoiLienHeColumns } from "./nguoi-lien-he-columns"
import { nguoiLienHeConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertNguoiLienHe } from "../actions/nguoi-lien-he-excel-actions"
import { NguoiLienHeImportDialog } from "./nguoi-lien-he-import-dialog"

interface NguoiLienHeListViewProps {
  initialData?: NguoiLienHe[]
  onEdit?: (id: number) => void
  onAddNew?: () => void
  onView?: (id: number) => void
}

export function NguoiLienHeListView({ 
  initialData,
  onEdit,
  onAddNew,
  onView,
}: NguoiLienHeListViewProps = {}) {
  const { data: nguoiLienHeList, isLoading, isError, refetch } = useNguoiLienHe(initialData)
  const navigate = useNavigate()
  const batchDeleteMutation = useBatchDeleteNguoiLienHe()
  const batchImportMutation = useBatchUpsertNguoiLienHe()
  const module = nguoiLienHeConfig.moduleName
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)

  // Create columns
  const columns = React.useMemo(() => {
    return nguoiLienHeColumns()
  }, [])

  // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
  const {
    initialFilters,
    initialSearch,
    initialSorting,
    handleFiltersChange,
    handleSearchChange,
    handleSortChange,
  } = useListViewFilters(module, nguoiLienHeConfig.defaultSorting)

  // Generate filter options from data
  const khachBuonOptions = React.useMemo(() => {
    if (!nguoiLienHeList) return []
    const unique = new Map<string, string>()
    
    nguoiLienHeList.forEach((item) => {
      if (item.ten_khach_buon && !unique.has(item.ten_khach_buon)) {
        unique.set(item.ten_khach_buon, item.ten_khach_buon)
      }
    })
    
    return Array.from(unique.entries())
      .map(([value, label]) => ({
        label,
        value,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [nguoiLienHeList])

  const vaiTroOptions = React.useMemo(() => {
    if (!nguoiLienHeList) return []
    const unique = new Map<string, string>()
    
    nguoiLienHeList.forEach((item) => {
      if (item.vai_tro && !unique.has(item.vai_tro)) {
        unique.set(item.vai_tro, item.vai_tro)
      }
    })
    
    return Array.from(unique.entries())
      .map(([value, label]) => ({
        label,
        value,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [nguoiLienHeList])

  // Build filters array
  const filters = React.useMemo(() => {
    const baseFilters = nguoiLienHeConfig.filterColumns || []
    
    const dynamicFilters = []
    
    // Add ten_khach_buon filter
    if (khachBuonOptions.length > 0) {
      dynamicFilters.push({
        columnId: "ten_khach_buon",
        title: "Khách Buôn",
        options: khachBuonOptions,
      })
    }
    
    // Add vai_tro filter
    if (vaiTroOptions.length > 0) {
      dynamicFilters.push({
        columnId: "vai_tro",
        title: "Vai Trò",
        options: vaiTroOptions,
      })
    }
    
    return [...baseFilters, ...dynamicFilters]
  }, [khachBuonOptions, vaiTroOptions])

  const handleAddNewClick = () => {
    if (onAddNew) {
      onAddNew()
    } else {
      navigate(`${nguoiLienHeConfig.routePath}/moi`)
    }
  }

  const handleEditClick = (row: NguoiLienHe) => {
    const id = row.id!
    if (onEdit) {
      onEdit(id)
    } else {
      navigate(`${nguoiLienHeConfig.routePath}/${id}/sua?returnTo=list`)
    }
  }

  const handleViewClick = (row: NguoiLienHe) => {
    const id = row.id!
    if (onView) {
      onView(id)
    } else {
      navigate(`${nguoiLienHeConfig.routePath}/${id}`)
    }
  }

  const renderMobileCard = React.useCallback((row: NguoiLienHe) => {
    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Thông tin chính */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 min-w-0 flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-base text-foreground leading-tight truncate block">
                {row.ten_lien_he || "-"}
              </span>
              {row.vai_tro && (
                <span className="text-sm text-muted-foreground">
                  {row.vai_tro}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin phụ */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {row.ten_khach_buon && (
            <p className="leading-snug">
              Khách buôn: <span className="font-medium text-foreground">{row.ten_khach_buon}</span>
            </p>
          )}
          {row.so_dien_thoai_1 && (
            <p className="leading-snug">
              SĐT: <span className="font-medium text-foreground">{row.so_dien_thoai_1}</span>
            </p>
          )}
          {row.email && (
            <p className="leading-snug">
              Email: <span className="font-medium text-foreground">{row.email}</span>
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

  const getCellValue = React.useCallback((row: NguoiLienHe, columnId: string) => {
    const value = (row as any)[columnId]
    if (value === null || value === undefined) return "-"
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
        <p className="text-destructive mb-4">Có lỗi xảy ra khi tải danh sách người liên hệ</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <>
    <GenericListView
      data={nguoiLienHeList || []}
      columns={columns}
      module={module}
      onAdd={handleAddNewClick}
      addHref={`${nguoiLienHeConfig.routePath}/moi`}
      onEdit={handleEditClick}
      onDeleteSelected={async (selectedRows) => {
        const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
        await batchDeleteMutation.mutateAsync(ids)
        refetch()
      }}
      batchDeleteConfig={{
        itemName: "người liên hệ",
        moduleName: nguoiLienHeConfig.moduleTitle,
        isLoading: batchDeleteMutation.isPending,
        getItemLabel: (item: NguoiLienHe) => item.ten_lien_he || String(item.id),
      }}
      filters={filters}
      initialFilters={initialFilters}
      initialSearch={initialSearch}
      initialSorting={initialSorting}
      onFiltersChange={handleFiltersChange}
      onSearchChange={handleSearchChange}
      onSortChange={handleSortChange}
      renderMobileCard={renderMobileCard}
      searchFields={nguoiLienHeConfig.searchFields as (keyof NguoiLienHe)[]}
      enableSuggestions={true}
      enableRangeSelection={true}
      enableLongPress={true}
      persistSelection={false}
      enableVirtualization={(nguoiLienHeList || []).length > 100}
      virtualRowHeight={60}
      exportOptions={{
        columns: columns,
        totalCount: nguoiLienHeList?.length || 0,
        moduleName: nguoiLienHeConfig.moduleTitle,
        getColumnTitle,
        getCellValue,
      }}
      onRowClick={(row) => handleViewClick(row)}
      onImport={() => setImportDialogOpen(true)}
      isImporting={batchImportMutation.isPending}
    />

    {/* Import Dialog */}
    <NguoiLienHeImportDialog
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

