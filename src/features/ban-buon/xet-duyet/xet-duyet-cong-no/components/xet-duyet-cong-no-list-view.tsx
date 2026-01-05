"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { XetDuyetCongNo } from "../schema"
import { useXetDuyetCongNo, useBatchDeleteXetDuyetCongNo } from "../hooks/use-xet-duyet-cong-no"
import { xetDuyetCongNoColumns } from "./xet-duyet-cong-no-columns"
import { xetDuyetCongNoConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { formatNumber } from "@/shared/utils/detail-utils"

interface XetDuyetCongNoListViewProps {
  initialData?: XetDuyetCongNo[]
  onEdit?: (id: number) => void
  onAddNew?: () => void
  onView?: (id: number) => void
}

export function XetDuyetCongNoListView({ 
  initialData,
  onEdit,
  onAddNew,
  onView,
}: XetDuyetCongNoListViewProps = {}) {
  const { data: xetDuyetCongNoList, isLoading, isError, refetch } = useXetDuyetCongNo(initialData)
  const navigate = useNavigate()
  const batchDeleteMutation = useBatchDeleteXetDuyetCongNo()
  const module = xetDuyetCongNoConfig.moduleName

  // Create columns
  const columns = React.useMemo(() => {
    return xetDuyetCongNoColumns()
  }, [])

  // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
  const {
    initialFilters,
    initialSearch,
    initialSorting,
    handleFiltersChange,
    handleSearchChange,
    handleSortChange,
  } = useListViewFilters(module, xetDuyetCongNoConfig.defaultSorting)

  const handleAddNewClick = () => {
    if (onAddNew) {
      onAddNew()
    } else {
      navigate(`${xetDuyetCongNoConfig.routePath}/moi`)
    }
  }

  const handleEditClick = (row: XetDuyetCongNo) => {
    const id = row.id!
    if (onEdit) {
      onEdit(id)
    } else {
      navigate(`${xetDuyetCongNoConfig.routePath}/${id}/sua?returnTo=list`)
    }
  }

  const handleViewClick = (row: XetDuyetCongNo) => {
    const id = row.id!
    if (onView) {
      onView(id)
    } else {
      navigate(`${xetDuyetCongNoConfig.routePath}/${id}`)
    }
  }

  const renderMobileCard = React.useCallback((row: XetDuyetCongNo) => {
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
              {row.loai_hinh && (
                <span className="text-sm text-muted-foreground block">
                  {row.loai_hinh}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin phụ */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {(row.muc_cong_no !== null && row.muc_cong_no !== undefined) && (
            <p className="leading-snug">
              Mức Công Nợ: <span className="font-medium text-foreground">{formatNumber(row.muc_cong_no)}</span>
            </p>
          )}
          {row.trang_thai && (
            <p className="leading-snug">
              Trạng Thái: <span className="font-medium text-foreground">{row.trang_thai}</span>
            </p>
          )}
          {row.de_xuat_ngay_ap_dung && (
            <p className="leading-snug">
              Đề Xuất Ngày Áp Dụng: <span className="font-medium text-foreground">{row.de_xuat_ngay_ap_dung}</span>
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
        <p className="text-destructive mb-4">Lỗi khi tải danh sách xét duyệt công nợ</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <GenericListView
      data={xetDuyetCongNoList || []}
      columns={columns}
      module={module}
      onAdd={handleAddNewClick}
      addHref={`${xetDuyetCongNoConfig.routePath}/moi`}
      onEdit={handleEditClick}
      onDeleteSelected={async (selectedRows) => {
        const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
        await batchDeleteMutation.mutateAsync(ids)
        refetch()
      }}
      batchDeleteConfig={{
        itemName: "xét duyệt công nợ",
        moduleName: xetDuyetCongNoConfig.moduleTitle,
        isLoading: batchDeleteMutation.isPending,
        getItemLabel: (item: XetDuyetCongNo) => `ID ${item.id}`,
      }}
      initialFilters={initialFilters}
      initialSearch={initialSearch}
      initialSorting={initialSorting}
      onFiltersChange={handleFiltersChange}
      onSearchChange={handleSearchChange}
      onSortChange={handleSortChange}
      searchFields={xetDuyetCongNoConfig.searchFields as any}
      renderMobileCard={renderMobileCard}
      onRowClick={handleViewClick}
      exportOptions={{
        columns: columns,
        totalCount: xetDuyetCongNoList?.length || 0,
        moduleName: xetDuyetCongNoConfig.moduleTitle,
      }}
    />
  )
}

