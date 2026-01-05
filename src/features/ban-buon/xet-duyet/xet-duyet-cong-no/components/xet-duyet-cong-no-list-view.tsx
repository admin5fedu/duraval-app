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
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks/use-nhan-su"

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

  // Fetch nhân sự để tạo filter options
  const { data: nhanSuList } = useNhanSu()

  // Generate filter options from data
  const nguoiTaoOptions = React.useMemo(() => {
    if (!xetDuyetCongNoList || !nhanSuList) return []
    const unique = new Map<number, { id: number; name: string }>()
    
    xetDuyetCongNoList.forEach((item) => {
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
  }, [xetDuyetCongNoList, nhanSuList])

  const quanLyOptions = React.useMemo(() => {
    if (!xetDuyetCongNoList || !nhanSuList) return []
    const unique = new Map<number, { id: number; name: string }>()
    
    xetDuyetCongNoList.forEach((item) => {
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
  }, [xetDuyetCongNoList, nhanSuList])

  const bgdOptions = React.useMemo(() => {
    if (!xetDuyetCongNoList || !nhanSuList) return []
    const unique = new Map<number, { id: number; name: string }>()
    
    xetDuyetCongNoList.forEach((item) => {
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
  }, [xetDuyetCongNoList, nhanSuList])

  // Build filters array from config + dynamic options
  const filters = React.useMemo(() => {
    const baseFilters = xetDuyetCongNoConfig.filterColumns || []
    
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
      <div className="flex flex-col gap-3 w-full p-3 bg-card rounded-lg border">
        {/* Thông tin chính */}
        <div className="flex gap-3 items-start">
          <div className="flex-1 min-w-0">
            {row.ten_khach_buon && (
              <h3 className="font-semibold text-base text-foreground leading-tight mb-1">
                {row.ten_khach_buon}
              </h3>
            )}
            {row.loai_hinh && (
              <div className="mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {row.loai_hinh}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Thông tin phụ - Grid layout cho mobile */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {(row.muc_cong_no !== null && row.muc_cong_no !== undefined) && (
            <div className="space-y-0.5">
              <span className="text-muted-foreground">Mức Công Nợ:</span>
              <p className="font-medium text-foreground">{formatNumber(row.muc_cong_no)}</p>
            </div>
          )}
          {row.trang_thai && (
            <div className="space-y-0.5">
              <span className="text-muted-foreground">Trạng Thái:</span>
              <p className="font-medium text-foreground">{row.trang_thai}</p>
            </div>
          )}
          {row.de_xuat_ngay_ap_dung && (
            <div className="space-y-0.5">
              <span className="text-muted-foreground">Đề Xuất Ngày:</span>
              <p className="font-medium text-foreground">{row.de_xuat_ngay_ap_dung}</p>
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
      filters={filters}
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

