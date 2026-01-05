"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { DangKyDoanhSo } from "../schema"
import { useDangKyDoanhSo, useBatchDeleteDangKyDoanhSo } from "../hooks/use-dang-ky-doanh-so"
import { dangKyDoanhSoColumns } from "./dang-ky-doanh-so-columns"
import { dangKyDoanhSoConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { formatNumber } from "@/shared/utils/detail-utils"

interface DangKyDoanhSoListViewProps {
  initialData?: DangKyDoanhSo[]
  onEdit?: (id: number) => void
  onAddNew?: () => void
  onView?: (id: number) => void
}

export function DangKyDoanhSoListView({ 
  initialData,
  onEdit,
  onAddNew,
  onView,
}: DangKyDoanhSoListViewProps = {}) {
  const { data: dangKyDoanhSoList, isLoading, isError, refetch } = useDangKyDoanhSo(initialData)
  const navigate = useNavigate()
  const batchDeleteMutation = useBatchDeleteDangKyDoanhSo()
  const module = dangKyDoanhSoConfig.moduleName

  // Create columns
  const columns = React.useMemo(() => {
    return dangKyDoanhSoColumns()
  }, [])

  // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
  const {
    initialFilters,
    initialSearch,
    initialSorting,
    handleFiltersChange,
    handleSearchChange,
    handleSortChange,
  } = useListViewFilters(module, dangKyDoanhSoConfig.defaultSorting)

  const handleAddNewClick = () => {
    if (onAddNew) {
      onAddNew()
    } else {
      navigate(`${dangKyDoanhSoConfig.routePath}/moi`)
    }
  }

  const handleEditClick = (row: DangKyDoanhSo) => {
    const id = row.id!
    if (onEdit) {
      onEdit(id)
    } else {
      navigate(`${dangKyDoanhSoConfig.routePath}/${id}/sua?returnTo=list`)
    }
  }

  const handleViewClick = (row: DangKyDoanhSo) => {
    const id = row.id!
    if (onView) {
      onView(id)
    } else {
      navigate(`${dangKyDoanhSoConfig.routePath}/${id}`)
    }
  }

  const renderMobileCard = React.useCallback((row: DangKyDoanhSo) => {
    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Thông tin chính */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 min-w-0 flex items-start gap-2">
            <div className="flex-1 min-w-0">
              {row.ten_khach_buon && (
                <span className="font-semibold text-base text-foreground leading-tight truncate block">
                  {row.ten_khach_buon}
                </span>
              )}
              {row.ten_muc_dang_ky && (
                <span className="text-sm text-muted-foreground block">
                  {row.ten_muc_dang_ky}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin phụ */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {row.nam && (
            <p className="leading-snug">
              Năm: <span className="font-medium text-foreground">{row.nam}</span>
            </p>
          )}
          {(row.doanh_so_min_quy !== null && row.doanh_so_min_quy !== undefined) && (
            <p className="leading-snug">
              DS Min Quý: <span className="font-medium text-foreground">{formatNumber(row.doanh_so_min_quy)}</span>
            </p>
          )}
          {(row.doanh_so_max_quy !== null && row.doanh_so_max_quy !== undefined) && (
            <p className="leading-snug">
              DS Max Quý: <span className="font-medium text-foreground">{formatNumber(row.doanh_so_max_quy)}</span>
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
        <p className="text-destructive mb-4">Lỗi khi tải danh sách đăng ký doanh số</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <GenericListView
      data={dangKyDoanhSoList || []}
      columns={columns}
      module={module}
      onAdd={handleAddNewClick}
      addHref={`${dangKyDoanhSoConfig.routePath}/moi`}
      onEdit={handleEditClick}
      onDeleteSelected={async (selectedRows) => {
        const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
        await batchDeleteMutation.mutateAsync(ids)
        refetch()
      }}
      batchDeleteConfig={{
        itemName: "đăng ký doanh số",
        moduleName: dangKyDoanhSoConfig.moduleTitle,
        isLoading: batchDeleteMutation.isPending,
        getItemLabel: (item: DangKyDoanhSo) => `ID ${item.id}`,
      }}
      initialFilters={initialFilters}
      initialSearch={initialSearch}
      initialSorting={initialSorting}
      onFiltersChange={handleFiltersChange}
      onSearchChange={handleSearchChange}
      onSortChange={handleSortChange}
      searchFields={dangKyDoanhSoConfig.searchFields as any}
      renderMobileCard={renderMobileCard}
      onRowClick={handleViewClick}
      exportOptions={{
        columns: columns,
        totalCount: dangKyDoanhSoList?.length || 0,
        moduleName: dangKyDoanhSoConfig.moduleTitle,
      }}
    />
  )
}

