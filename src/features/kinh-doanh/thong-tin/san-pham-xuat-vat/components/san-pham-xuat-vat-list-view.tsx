"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SanPhamXuatVat } from "../types"
import { useSanPhamXuatVat } from "../hooks"
import { sanPhamXuatVatColumns } from "./san-pham-xuat-vat-columns"
import { sanPhamXuatVatConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { NumberRangeFilter } from "@/shared/components/data-display/filters/number-range-filter"

// Format số tiền
function formatCurrencyValue(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return "-"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value)
}

// Format phần trăm
function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-"
  return `${value}%`
}

// Format loại sản phẩm
function formatLoaiSanPham(loai: string | null | undefined): string {
  if (!loai || loai === "") return "-"
  return `Loại ${loai}`
}

interface SanPhamXuatVatListViewProps {
  initialData?: SanPhamXuatVat[]
  onView?: (index: number) => void
}

export function SanPhamXuatVatListView({
  initialData,
  onView,
}: SanPhamXuatVatListViewProps = {}) {
  const { data: sanPhamList, isLoading, isError, refetch } = useSanPhamXuatVat(initialData)
  const navigate = useNavigate()
  const module = sanPhamXuatVatConfig.moduleName

  // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
  const {
    initialFilters,
    initialSearch,
    initialSorting,
    handleFiltersChange,
    handleSearchChange,
    handleSortChange,
  } = useListViewFilters(module, sanPhamXuatVatConfig.defaultSorting || [{ id: "ma_hang", desc: false }])

  // Generate filter options from data
  const loaiSanPhamOptions = React.useMemo(() => {
    const unique = Array.from(
      new Set(
        sanPhamList
          ?.map((e) => e.loai_san_pham)
          .filter((d): d is string => !!d) || []
      )
    ).sort()
    return unique.map((d) => ({ label: formatLoaiSanPham(d), value: d }))
  }, [sanPhamList])

  // Mobile card renderer
  const renderMobileCard = React.useCallback((row: SanPhamXuatVat) => {
    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Header với Index và thông tin chính */}
        <div className="flex gap-3 items-start">
          <div className="flex-1 min-w-0 flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-base text-foreground leading-tight truncate block">
                STT: {row.index}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {row.ma_hang && (
                  <p className="text-sm text-muted-foreground leading-snug line-clamp-1">
                    {row.ma_hang}
                  </p>
                )}
                {row.loai_san_pham && (
                  <Badge variant="outline" className="shrink-0 text-[11px] px-2 py-0">
                    {formatLoaiSanPham(row.loai_san_pham)}
                  </Badge>
                )}
              </div>
            </div>
            {row.gia_xuat && (
              <Badge variant="secondary" className="shrink-0 text-[11px] px-2 py-0">
                {formatCurrencyValue(row.gia_xuat)}
              </Badge>
            )}
          </div>
        </div>

        {/* Thông tin phụ */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {row.ten_hang_hoa && (
            <p className="leading-snug">
              Tên: <span className="font-medium text-foreground">{row.ten_hang_hoa}</span>
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <p className="text-[10px] text-muted-foreground">Số lượng tồn</p>
              <p
                className={`font-medium text-foreground ${
                  row.so_luong_ton === 0 ? "text-red-600" : ""
                }`}
              >
                {row.so_luong_ton.toLocaleString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Thuế suất</p>
              <p className="font-medium text-foreground">{formatPercentage(row.thue_suat)}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }, [])

  // Export utilities
  const getColumnTitle = React.useCallback((columnId: string) => {
    const column = sanPhamXuatVatColumns.find((col) => {
      if (col.id === columnId) return true
      if ("accessorKey" in col && col.accessorKey === columnId) return true
      return false
    })
    return (column?.meta as any)?.title || columnId
  }, [])

  const getCellValue = React.useCallback((row: SanPhamXuatVat, columnId: string) => {
    if (columnId === "gia_xuat") {
      return formatCurrencyValue((row as any)[columnId])
    }
    if (columnId === "thue_suat") {
      return formatPercentage((row as any)[columnId])
    }
    if (columnId === "so_luong_ton") {
      return ((row as any)[columnId] as number).toLocaleString("vi-VN")
    }
    if (columnId === "loai_san_pham") {
      return formatLoaiSanPham((row as any)[columnId])
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
        <p className="text-destructive mb-4">Lỗi khi tải danh sách sản phẩm xuất VAT</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    )
  }

  return (
    <GenericListView
      columns={sanPhamXuatVatColumns}
      data={sanPhamList || []}
      filterColumn="ma_hang"
      initialSorting={initialSorting}
      initialFilters={initialFilters}
      initialSearch={initialSearch}
      onFiltersChange={handleFiltersChange}
      onSearchChange={handleSearchChange}
      onSortChange={handleSortChange}
      onRowClick={(row) => {
        if (onView) {
          onView(row.index)
        } else {
          navigate(`${sanPhamXuatVatConfig.routePath}/${row.index}`)
        }
      }}
      // Readonly: No onAdd, onEdit, onDelete
      onBack={() => {
        navigate(sanPhamXuatVatConfig.parentPath)
      }}
      filters={[
        {
          columnId: "loai_san_pham",
          title: "Loại sản phẩm",
          options: loaiSanPhamOptions,
        },
      ]}
      customFilters={[
        <NumberRangeFilter
          key="thue_suat"
          columnId="thue_suat"
          title="Thuế suất (%)"
          min={0}
          max={100}
          step={0.1}
          suffix="%"
        />,
        <NumberRangeFilter
          key="gia_xuat"
          columnId="gia_xuat"
          title="Giá xuất (VND)"
          min={0}
          step={1000}
          formatThousands={true}
        />,
      ]}
      searchFields={sanPhamXuatVatConfig.searchFields as (keyof SanPhamXuatVat)[]}
      module={module}
      enableSuggestions={true}
      enableRangeSelection={true}
      enableLongPress={true}
      persistSelection={false}
      renderMobileCard={renderMobileCard}
      enableVirtualization={(sanPhamList || []).length > 100}
      virtualRowHeight={80}
      exportOptions={{
        columns: sanPhamXuatVatColumns,
        totalCount: sanPhamList?.length || 0,
        moduleName: sanPhamXuatVatConfig.moduleTitle,
        getColumnTitle,
        getCellValue,
      }}
      // Readonly: No onEdit, onDelete, onAdd, onDeleteSelected
    />
  )
}

