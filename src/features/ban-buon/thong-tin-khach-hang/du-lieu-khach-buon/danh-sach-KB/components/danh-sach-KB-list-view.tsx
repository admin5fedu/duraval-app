"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { DanhSachKB } from "../schema"
import { useDanhSachKB, useBatchDeleteDanhSachKB } from "../hooks"
import { danhSachKBColumns } from "./danh-sach-KB-columns"
import { danhSachKBConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useGiaiDoanKhachBuon } from "@/features/ban-buon/thiet-lap-khach-buon/giai-doan-khach-buon/hooks/use-giai-doan-khach-buon"
import { useTrangThaiKhachBuon } from "@/features/ban-buon/thiet-lap-khach-buon/trang-thai-khach-buon/hooks/use-trang-thai-khach-buon"
import { useBatchUpsertDanhSachKB } from "../actions/danh-sach-KB-excel-actions"
import { DanhSachKBImportDialog } from "./danh-sach-KB-import-dialog"

interface DanhSachKBListViewProps {
  initialData?: DanhSachKB[]
  onEdit?: (id: number) => void
  onAddNew?: () => void
  onView?: (id: number) => void
}

export function DanhSachKBListView({ 
  initialData,
  onEdit,
  onAddNew,
  onView,
}: DanhSachKBListViewProps = {}) {
  const { data: danhSachKBList, isLoading, isError, refetch } = useDanhSachKB(initialData)
  const { data: giaiDoanList } = useGiaiDoanKhachBuon(undefined)
  const { data: trangThaiList } = useTrangThaiKhachBuon(undefined)
  const navigate = useNavigate()
  const batchDeleteMutation = useBatchDeleteDanhSachKB()
  const batchImportMutation = useBatchUpsertDanhSachKB()
  const module = danhSachKBConfig.moduleName
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)

  // Create columns
  const columns = React.useMemo(() => {
    return danhSachKBColumns()
  }, [])

  // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
  const {
    initialFilters,
    initialSearch,
    initialSorting,
    handleFiltersChange,
    handleSearchChange,
    handleSortChange,
  } = useListViewFilters(module, danhSachKBConfig.defaultSorting)

  // Generate filter options from data
  const nguoiTaoOptions = React.useMemo(() => {
    if (!danhSachKBList) return []
    const unique = new Map<number, { id: number; name: string }>()
    
    danhSachKBList.forEach((item) => {
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
  }, [danhSachKBList])

  // Build giai doan options from all giai doan
  const giaiDoanOptions = React.useMemo(() => {
    if (!giaiDoanList) return []
    return giaiDoanList
      .map(item => ({
        label: item.ten_giai_doan || `Giai đoạn ${item.id}`,
        value: String(item.id)
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [giaiDoanList])

  // Build trang thai options from all trang thai
  const trangThaiOptions = React.useMemo(() => {
    if (!trangThaiList) return []
    return trangThaiList
      .map(item => ({
        label: item.ten_trang_thai || `Trạng thái ${item.id}`,
        value: String(item.id)
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [trangThaiList])

  // Build filters array from config + dynamic options
  const filters = React.useMemo(() => {
    const baseFilters = danhSachKBConfig.filterColumns || []
    
    const dynamicFilters = []
    
    // Add giai_doan filter
    if (giaiDoanOptions.length > 0) {
      dynamicFilters.push({
        columnId: "ten_giai_doan",
        title: "Giai Đoạn",
        options: giaiDoanOptions,
      })
    }
    
    // Add trang_thai filter
    if (trangThaiOptions.length > 0) {
      dynamicFilters.push({
        columnId: "ten_trang_thai",
        title: "Trạng Thái",
        options: trangThaiOptions,
      })
    }
    
    // Add nguoi_tao_id filter
    if (nguoiTaoOptions.length > 0) {
      dynamicFilters.push({
        columnId: "nguoi_tao_id",
        title: "Người Tạo",
        options: nguoiTaoOptions,
      })
    }
    
    return [...baseFilters, ...dynamicFilters]
  }, [giaiDoanOptions, trangThaiOptions, nguoiTaoOptions])

  const handleAddNewClick = () => {
    if (onAddNew) {
      onAddNew()
    } else {
      navigate(`${danhSachKBConfig.routePath}/moi`)
    }
  }

  const handleEditClick = (row: DanhSachKB) => {
    const id = row.id!
    if (onEdit) {
      onEdit(id)
    } else {
      navigate(`${danhSachKBConfig.routePath}/${id}/sua?returnTo=list`)
    }
  }

  const handleViewClick = (row: DanhSachKB) => {
    const id = row.id!
    if (onView) {
      onView(id)
    } else {
      navigate(`${danhSachKBConfig.routePath}/${id}`)
    }
  }

  // Mobile card renderer
  const renderMobileCard = React.useCallback((row: DanhSachKB) => {
    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Thông tin chính */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 min-w-0 flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-base text-foreground leading-tight truncate block">
                {row.ten_khach_buon}
              </span>
              {row.ma_so && (
                <span className="text-sm text-muted-foreground mt-1 block">
                  Mã: {row.ma_so}
                </span>
              )}
              {row.so_dien_thoai_1 && (
                <span className="text-sm text-muted-foreground mt-1 block">
                  SĐT: {row.so_dien_thoai_1}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin phụ */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {row.ten_giai_doan && (
            <p className="leading-snug">
              Giai đoạn: <span className="font-medium text-foreground">{row.ten_giai_doan}</span>
            </p>
          )}
          {row.ten_trang_thai && (
            <p className="leading-snug">
              Trạng thái: <span className="font-medium text-foreground">{row.ten_trang_thai}</span>
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

  const getCellValue = React.useCallback((row: DanhSachKB, columnId: string) => {
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
        <p className="text-destructive mb-4">Lỗi khi tải danh sách khách buôn</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <>
    <GenericListView
      data={danhSachKBList || []}
      columns={columns}
      filterColumn="ten_khach_buon"
      module={module}
      searchFields={danhSachKBConfig.searchFields as (keyof DanhSachKB)[]}
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
        itemName: "khách buôn",
        moduleName: danhSachKBConfig.moduleTitle,
        isLoading: batchDeleteMutation.isPending,
        getItemLabel: (item: DanhSachKB) => item.ten_khach_buon || String(item.id),
      }}
      onImport={() => setImportDialogOpen(true)}
      isImporting={batchImportMutation.isPending}
      onAdd={handleAddNewClick}
      addHref={`${danhSachKBConfig.routePath}/moi`}
      onBack={() => {
        navigate(danhSachKBConfig.parentPath)
      }}
      onEdit={handleEditClick}
      onRowClick={handleViewClick}
      renderMobileCard={renderMobileCard}
      enableSuggestions={true}
      enableRangeSelection={true}
      enableLongPress={true}
      persistSelection={false}
      enableVirtualization={(danhSachKBList?.length || 0) > 100}
      virtualRowHeight={60}
      exportOptions={{
        columns: columns,
        totalCount: danhSachKBList?.length || 0,
        moduleName: danhSachKBConfig.moduleTitle,
        getColumnTitle,
        getCellValue,
      }}
    />

    {/* Import Dialog */}
    <DanhSachKBImportDialog
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

