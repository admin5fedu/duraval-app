"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { ChamSocKhachBuon } from "../schema"
import { useChamSocKhachBuon, useBatchDeleteChamSocKhachBuon } from "../hooks/use-cham-soc-khach-buon"
import { chamSocKhachBuonColumns } from "./cham-soc-khach-buon-columns"
import { chamSocKhachBuonConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { ChamSocKhachBuonImportDialog } from "./cham-soc-khach-buon-import-dialog"
import { useBatchUpsertChamSocKhachBuon } from "../actions/cham-soc-khach-buon-excel-actions"

interface ChamSocKhachBuonListViewProps {
  initialData?: ChamSocKhachBuon[]
  onEdit?: (id: number) => void
  onAddNew?: () => void
  onView?: (id: number) => void
}

export function ChamSocKhachBuonListView({ 
  initialData,
  onEdit,
  onAddNew,
  onView,
}: ChamSocKhachBuonListViewProps = {}) {
  const { data: chamSocKhachBuonList, isLoading, isError, refetch } = useChamSocKhachBuon(initialData)
  const navigate = useNavigate()
  const batchDeleteMutation = useBatchDeleteChamSocKhachBuon()
  const batchImportMutation = useBatchUpsertChamSocKhachBuon()
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)
  const module = chamSocKhachBuonConfig.moduleName

  // Create columns
  const columns = React.useMemo(() => {
    return chamSocKhachBuonColumns()
  }, [])

  // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
  const {
    initialFilters,
    initialSearch,
    initialSorting,
    handleFiltersChange,
    handleSearchChange,
    handleSortChange,
  } = useListViewFilters(module, chamSocKhachBuonConfig.defaultSorting)

  const handleAddNewClick = () => {
    if (onAddNew) {
      onAddNew()
    } else {
      navigate(`${chamSocKhachBuonConfig.routePath}/moi`)
    }
  }

  const handleEditClick = (row: ChamSocKhachBuon) => {
    const id = row.id!
    if (onEdit) {
      onEdit(id)
    } else {
      navigate(`${chamSocKhachBuonConfig.routePath}/${id}/sua?returnTo=list`)
    }
  }

  const handleViewClick = (row: ChamSocKhachBuon) => {
    const id = row.id!
    if (onView) {
      onView(id)
    } else {
      navigate(`${chamSocKhachBuonConfig.routePath}/${id}`)
    }
  }

  const renderMobileCard = React.useCallback((row: ChamSocKhachBuon) => {
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
              {row.ten_khach_buon && (
                <span className="text-sm text-muted-foreground">
                  {row.ten_khach_buon}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin phụ */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {row.hinh_thuc && (
            <p className="leading-snug">
              Hình thức: <span className="font-medium text-foreground">{row.hinh_thuc}</span>
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
        <p className="text-destructive mb-4">Lỗi khi tải danh sách chăm sóc khách buôn</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <>
      <GenericListView
        data={chamSocKhachBuonList || []}
        columns={columns}
        module={module}
        onAdd={handleAddNewClick}
        addHref={`${chamSocKhachBuonConfig.routePath}/moi`}
        onEdit={handleEditClick}
        onDeleteSelected={async (selectedRows) => {
          const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
          await batchDeleteMutation.mutateAsync(ids)
          refetch()
        }}
        batchDeleteConfig={{
          itemName: "chăm sóc khách buôn",
          moduleName: chamSocKhachBuonConfig.moduleTitle,
          isLoading: batchDeleteMutation.isPending,
          getItemLabel: (item: ChamSocKhachBuon) => `ID ${item.id}`,
        }}
        initialFilters={initialFilters}
        initialSearch={initialSearch}
        initialSorting={initialSorting}
        onFiltersChange={handleFiltersChange}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        searchFields={chamSocKhachBuonConfig.searchFields as any}
        renderMobileCard={renderMobileCard}
        onRowClick={handleViewClick}
        exportOptions={{
          columns: columns,
          totalCount: chamSocKhachBuonList?.length || 0,
          moduleName: chamSocKhachBuonConfig.moduleTitle,
        }}
        onImport={() => setImportDialogOpen(true)}
        isImporting={batchImportMutation.isPending}
      />

      {/* Import Dialog */}
      <ChamSocKhachBuonImportDialog
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

