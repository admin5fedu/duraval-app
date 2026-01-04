"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { HinhAnhKhachBuon } from "../schema"
import { useHinhAnhKhachBuon, useBatchDeleteHinhAnhKhachBuon } from "../hooks"
import { hinhAnhKhachBuonColumns } from "./hinh-anh-khach-buon-columns"
import { hinhAnhKhachBuonConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertHinhAnhKhachBuon } from "../actions/hinh-anh-khach-buon-excel-actions"
import { HinhAnhKhachBuonImportDialog } from "./hinh-anh-khach-buon-import-dialog"

interface HinhAnhKhachBuonListViewProps {
  initialData?: HinhAnhKhachBuon[]
  onEdit?: (id: number) => void
  onAddNew?: () => void
  onView?: (id: number) => void
}

export function HinhAnhKhachBuonListView({ 
  initialData,
  onEdit,
  onAddNew,
  onView,
}: HinhAnhKhachBuonListViewProps = {}) {
  const { data: hinhAnhKhachBuonList, isLoading, isError, refetch } = useHinhAnhKhachBuon(initialData)
  const navigate = useNavigate()
  const batchDeleteMutation = useBatchDeleteHinhAnhKhachBuon()
  const batchImportMutation = useBatchUpsertHinhAnhKhachBuon()
  const module = hinhAnhKhachBuonConfig.moduleName
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)

  // Create columns
  const columns = React.useMemo(() => {
    return hinhAnhKhachBuonColumns()
  }, [])

  // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
  const {
    initialFilters,
    initialSearch,
    initialSorting,
    handleFiltersChange,
    handleSearchChange,
    handleSortChange,
  } = useListViewFilters(module, hinhAnhKhachBuonConfig.defaultSorting)

  // Generate filter options from data
  const khachBuonOptions = React.useMemo(() => {
    if (!hinhAnhKhachBuonList) return []
    const unique = new Map<string, { value: string; label: string }>()
    
    hinhAnhKhachBuonList.forEach((item) => {
      if (item.ten_khach_buon && !unique.has(item.ten_khach_buon)) {
        unique.set(item.ten_khach_buon, {
          value: item.ten_khach_buon,
          label: item.ten_khach_buon
        })
      }
    })
    
    return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [hinhAnhKhachBuonList])

  const hangMucOptions = React.useMemo(() => {
    if (!hinhAnhKhachBuonList) return []
    const unique = new Map<string, { value: string; label: string }>()
    
    hinhAnhKhachBuonList.forEach((item) => {
      if (item.hang_muc && !unique.has(item.hang_muc)) {
        unique.set(item.hang_muc, {
          value: item.hang_muc,
          label: item.hang_muc
        })
      }
    })
    
    return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [hinhAnhKhachBuonList])

  const filters = React.useMemo(() => {
    const result: Array<{ columnId: string; title: string; options: Array<{ label: string; value: string }> }> = []
    
    if (khachBuonOptions.length > 0) {
      result.push({
        columnId: "ten_khach_buon",
        title: "Khách Buôn",
        options: khachBuonOptions,
      })
    }

    if (hangMucOptions.length > 0) {
      result.push({
        columnId: "hang_muc",
        title: "Hạng Mục",
        options: hangMucOptions,
      })
    }

    return result
  }, [khachBuonOptions, hangMucOptions])

  const handleAddNewClick = () => {
    if (onAddNew) {
      onAddNew()
    } else {
      navigate(`${hinhAnhKhachBuonConfig.routePath}/moi`)
    }
  }

  const handleEditClick = (row: HinhAnhKhachBuon) => {
    if (onEdit) {
      onEdit(row.id!)
    } else {
      navigate(`${hinhAnhKhachBuonConfig.routePath}/${row.id}/sua`)
    }
  }

  const handleViewClick = (row: HinhAnhKhachBuon) => {
    if (onView) {
      onView(row.id!)
    } else {
      navigate(`${hinhAnhKhachBuonConfig.routePath}/${row.id}`)
    }
  }

  const getColumnTitle = React.useCallback((columnId: string) => {
    const column = columns.find(col => col.id === columnId || (col as any).accessorKey === columnId)
    return (column?.meta as any)?.title || columnId
  }, [columns])

  const getCellValue = React.useCallback((row: HinhAnhKhachBuon, columnId: string) => {
    if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
      const value = (row as any)[columnId]
      if (!value) return ""
      return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
    }
    return (row as any)[columnId] ?? ""
  }, [])

  const renderMobileCard = React.useCallback((row: HinhAnhKhachBuon) => {
    return (
      <div className="space-y-2 p-4 border rounded-lg">
        <div className="font-semibold">{row.hang_muc || `Hình ảnh #${row.id}`}</div>
        {row.ten_khach_buon && (
          <div className="text-sm text-muted-foreground">Khách buôn: {row.ten_khach_buon}</div>
        )}
        {row.hinh_anh && (
          <div>
            <img 
              src={row.hinh_anh} 
              alt="Hình ảnh" 
              className="h-24 w-24 object-cover rounded"
            />
          </div>
        )}
        {row.mo_ta && (
          <div className="text-sm line-clamp-2">{row.mo_ta}</div>
        )}
      </div>
    )
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
        <p className="text-destructive mb-4">Có lỗi xảy ra khi tải danh sách hình ảnh khách buôn</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <>
      <GenericListView
        data={hinhAnhKhachBuonList || []}
        columns={columns}
        module={module}
        onAdd={handleAddNewClick}
        addHref={`${hinhAnhKhachBuonConfig.routePath}/moi`}
        onEdit={handleEditClick}
        onDeleteSelected={async (selectedRows) => {
          const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
          await batchDeleteMutation.mutateAsync(ids)
          refetch()
        }}
        batchDeleteConfig={{
          itemName: "hình ảnh khách buôn",
          moduleName: hinhAnhKhachBuonConfig.moduleTitle,
          isLoading: batchDeleteMutation.isPending,
          getItemLabel: (item: HinhAnhKhachBuon) => item.hang_muc || `Hình ảnh #${item.id}`,
        }}
        filters={filters}
        initialFilters={initialFilters}
        initialSearch={initialSearch}
        initialSorting={initialSorting}
        onFiltersChange={handleFiltersChange}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        renderMobileCard={renderMobileCard}
        searchFields={hinhAnhKhachBuonConfig.searchFields as (keyof HinhAnhKhachBuon)[]}
        enableSuggestions={true}
        enableRangeSelection={true}
        enableLongPress={true}
        persistSelection={false}
        enableVirtualization={(hinhAnhKhachBuonList || []).length > 100}
        virtualRowHeight={60}
        exportOptions={{
          columns: columns,
          totalCount: hinhAnhKhachBuonList?.length || 0,
          moduleName: hinhAnhKhachBuonConfig.moduleTitle,
          getColumnTitle,
          getCellValue,
        }}
        onRowClick={(row) => handleViewClick(row)}
        onImport={() => setImportDialogOpen(true)}
        isImporting={batchImportMutation.isPending}
      />

      {/* Import Dialog */}
      <HinhAnhKhachBuonImportDialog
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

