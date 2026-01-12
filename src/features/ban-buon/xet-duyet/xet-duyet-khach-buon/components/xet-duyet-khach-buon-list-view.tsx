"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { XetDuyetKhachBuon } from "../schema"
import { useXetDuyetKhachBuon, useBatchDeleteXetDuyetKhachBuon } from "../hooks/use-xet-duyet-khach-buon"
import { xetDuyetKhachBuonColumns } from "./xet-duyet-khach-buon-columns"
import { xetDuyetKhachBuonConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { formatNumber } from "@/shared/utils/detail-utils"
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks/use-nhan-su"

interface XetDuyetKhachBuonListViewProps {
  initialData?: XetDuyetKhachBuon[]
  onEdit?: (id: number) => void
  onAddNew?: () => void
  onView?: (id: number) => void
}

export function XetDuyetKhachBuonListView({ 
  initialData,
  onEdit,
  onAddNew,
  onView,
}: XetDuyetKhachBuonListViewProps = {}) {
  const { data: xetDuyetKhachBuonList, isLoading, isError, refetch } = useXetDuyetKhachBuon(initialData)
  const navigate = useNavigate()
  const batchDeleteMutation = useBatchDeleteXetDuyetKhachBuon()
  const module = xetDuyetKhachBuonConfig.moduleName

  // Create columns
  const columns = React.useMemo(() => {
    return xetDuyetKhachBuonColumns()
  }, [])

  // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
  const {
    initialFilters,
    initialSearch,
    initialSorting,
    handleFiltersChange,
    handleSearchChange,
    handleSortChange,
  } = useListViewFilters(module, xetDuyetKhachBuonConfig.defaultSorting)

  // Fetch nhân sự để tạo filter options
  const { data: nhanSuList } = useNhanSu()

  // Generate filter options from data
  const nguoiTaoOptions = React.useMemo(() => {
    if (!xetDuyetKhachBuonList || !nhanSuList) return []
    const unique = new Map<number, { id: number; name: string }>()
    
    xetDuyetKhachBuonList.forEach((item) => {
      if (item.nguoi_tao_id && !unique.has(item.nguoi_tao_id)) {
        const nhanSu = nhanSuList.find(ns => ns.ma_nhan_vien === item.nguoi_tao_id)
        unique.set(item.nguoi_tao_id, {
          id: item.nguoi_tao_id,
          name: item.ten_nguoi_tao || nhanSu?.ho_ten || `Mã ${item.nguoi_tao_id}`
        })
      }
    })
    
    return Array.from(unique.values())
      .map(item => ({
        label: `${item.id} - ${item.name}`,
        value: String(item.id)
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [xetDuyetKhachBuonList, nhanSuList])

  const quanLyOptions = React.useMemo(() => {
    if (!xetDuyetKhachBuonList || !nhanSuList) return []
    const unique = new Map<number, { id: number; name: string }>()
    
    xetDuyetKhachBuonList.forEach((item) => {
      if (item.quan_ly_id && !unique.has(item.quan_ly_id)) {
        const nhanSu = nhanSuList.find(ns => ns.ma_nhan_vien === item.quan_ly_id)
        unique.set(item.quan_ly_id, {
          id: item.quan_ly_id,
          name: item.ten_quan_ly || nhanSu?.ho_ten || `Mã ${item.quan_ly_id}`
        })
      }
    })
    
    return Array.from(unique.values())
      .map(item => ({
        label: `${item.id} - ${item.name}`,
        value: String(item.id)
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [xetDuyetKhachBuonList, nhanSuList])

  const bgdOptions = React.useMemo(() => {
    if (!xetDuyetKhachBuonList || !nhanSuList) return []
    const unique = new Map<number, { id: number; name: string }>()
    
    xetDuyetKhachBuonList.forEach((item) => {
      if (item.bgd_id && !unique.has(item.bgd_id)) {
        const nhanSu = nhanSuList.find(ns => ns.ma_nhan_vien === item.bgd_id)
        unique.set(item.bgd_id, {
          id: item.bgd_id,
          name: item.ten_bgd || nhanSu?.ho_ten || `Mã ${item.bgd_id}`
        })
      }
    })
    
    return Array.from(unique.values())
      .map(item => ({
        label: `${item.id} - ${item.name}`,
        value: String(item.id)
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [xetDuyetKhachBuonList, nhanSuList])

  // Build filters array from config + dynamic options
  const filters = React.useMemo(() => {
    const baseFilters = xetDuyetKhachBuonConfig.filterColumns || []
    
    const dynamicFilters = []
    
    // Add nguoi_tao_id filter
    if (nguoiTaoOptions.length > 0) {
      dynamicFilters.push({
        columnId: "nguoi_tao_id",
        title: "Người Tạo",
        options: nguoiTaoOptions,
      })
    }
    
    // Add quan_ly_id filter
    if (quanLyOptions.length > 0) {
      dynamicFilters.push({
        columnId: "quan_ly_id",
        title: "Quản Lý Duyệt",
        options: quanLyOptions,
      })
    }
    
    // Add bgd_id filter
    if (bgdOptions.length > 0) {
      dynamicFilters.push({
        columnId: "bgd_id",
        title: "BGD Duyệt",
        options: bgdOptions,
      })
    }
    
    return [...baseFilters, ...dynamicFilters]
  }, [nguoiTaoOptions, quanLyOptions, bgdOptions])

  const handleAddNewClick = () => {
    if (onAddNew) {
      onAddNew()
    } else {
      navigate(`${xetDuyetKhachBuonConfig.routePath}/moi`)
    }
  }

  const handleEditClick = (row: XetDuyetKhachBuon) => {
    const id = row.id!
    if (onEdit) {
      onEdit(id)
    } else {
      navigate(`${xetDuyetKhachBuonConfig.routePath}/${id}/sua?returnTo=list`)
    }
  }

  const handleViewClick = (row: XetDuyetKhachBuon) => {
    const id = row.id!
    if (onView) {
      onView(id)
    } else {
      navigate(`${xetDuyetKhachBuonConfig.routePath}/${id}`)
    }
  }

  const renderMobileCard = React.useCallback((row: XetDuyetKhachBuon) => {
    return (
      <div className="flex flex-col gap-3 w-full p-3 bg-card rounded-lg border">
        {/* Thông tin chính */}
        <div className="flex gap-3 items-start">
          <div className="flex-1 min-w-0">
            {row.ten_khach_buon && (
              <h3 className="font-semibold text-base text-foreground leading-tight mb-1">
                {row.ten_khach_buon}
              </h3>
            )}
            {row.ten_muc_dang_ky && (
              <div className="mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {row.ten_muc_dang_ky}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Thông tin phụ - Grid layout cho mobile */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {(row.doanh_so_min_quy !== null && row.doanh_so_min_quy !== undefined) && (
            <div className="space-y-0.5">
              <span className="text-muted-foreground">DS Min Quý:</span>
              <p className="font-medium text-foreground">{formatNumber(row.doanh_so_min_quy)}</p>
            </div>
          )}
          {(row.doanh_so_max_quy !== null && row.doanh_so_max_quy !== undefined) && (
            <div className="space-y-0.5">
              <span className="text-muted-foreground">DS Max Quý:</span>
              <p className="font-medium text-foreground">{formatNumber(row.doanh_so_max_quy)}</p>
            </div>
          )}
          {row.trang_thai && (
            <div className="space-y-0.5">
              <span className="text-muted-foreground">Trạng Thái:</span>
              <p className="font-medium text-foreground">{row.trang_thai}</p>
            </div>
          )}
          {row.ngay && (
            <div className="space-y-0.5">
              <span className="text-muted-foreground">Ngày:</span>
              <p className="font-medium text-foreground">{row.ngay}</p>
            </div>
          )}
          {row.tg_tao && (
            <div className="space-y-0.5">
              <span className="text-muted-foreground">Tạo:</span>
              <p className="font-medium text-foreground">
                {format(new Date(row.tg_tao), "dd/MM/yyyy", { locale: vi })}
              </p>
            </div>
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
        <p className="text-destructive mb-4">Lỗi khi tải danh sách xét duyệt khách buôn</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <GenericListView
      data={xetDuyetKhachBuonList || []}
      columns={columns}
      module={module}
      onAdd={handleAddNewClick}
      addHref={`${xetDuyetKhachBuonConfig.routePath}/moi`}
      onEdit={handleEditClick}
      onDeleteSelected={async (selectedRows) => {
        const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
        await batchDeleteMutation.mutateAsync(ids)
        refetch()
      }}
      batchDeleteConfig={{
        itemName: "xét duyệt khách buôn",
        moduleName: xetDuyetKhachBuonConfig.moduleTitle,
        isLoading: batchDeleteMutation.isPending,
        getItemLabel: (item: XetDuyetKhachBuon) => `ID ${item.id}`,
      }}
      initialFilters={initialFilters}
      initialSearch={initialSearch}
      initialSorting={initialSorting}
      onFiltersChange={handleFiltersChange}
      onSearchChange={handleSearchChange}
      onSortChange={handleSortChange}
      searchFields={xetDuyetKhachBuonConfig.searchFields as any}
      filters={filters}
      renderMobileCard={renderMobileCard}
      onRowClick={handleViewClick}
      exportOptions={{
        columns: columns,
        totalCount: xetDuyetKhachBuonList?.length || 0,
        moduleName: xetDuyetKhachBuonConfig.moduleTitle,
      }}
    />
  )
}

