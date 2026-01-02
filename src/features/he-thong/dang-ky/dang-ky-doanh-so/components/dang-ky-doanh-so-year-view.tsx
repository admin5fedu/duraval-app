"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useReactTable, type ColumnDef, flexRender, getCoreRowModel } from "@tanstack/react-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/shared/utils/detail-utils"
import { DangKyDoanhSo } from "../schema"
import { dangKyDoanhSoConfig } from "../config"
import type { NhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/schema"
import { SortableHeader } from "@/shared/components"

interface YearViewRow {
  nhan_vien_id: number
  ten_nhan_vien: string | null
  ho_ten?: string | null
  thang_1: number | null
  thang_2: number | null
  thang_3: number | null
  thang_4: number | null
  thang_5: number | null
  thang_6: number | null
  thang_7: number | null
  thang_8: number | null
  thang_9: number | null
  thang_10: number | null
  thang_11: number | null
  thang_12: number | null
  record_ids: Record<number, number> // Map thang -> record id
}

interface DangKyDoanhSoYearViewProps {
  data: DangKyDoanhSo[]
  nhanSuList?: NhanSu[]
  selectedYear: number
  onYearChange: (year: number) => void
  onCellClick?: (nhanVienId: number, thang: number, recordId?: number) => void
}

export function DangKyDoanhSoYearView({
  data,
  nhanSuList = [],
  selectedYear,
  onYearChange,
  onCellClick,
}: DangKyDoanhSoYearViewProps) {
  const navigate = useNavigate()

  // Transform data to year view format
  const yearViewData = React.useMemo(() => {
    // Filter data by selected year
    const filteredData = data.filter((item) => item.nam === selectedYear)

    // Group by nhan_vien_id
    const grouped = new Map<number, YearViewRow>()

    filteredData.forEach((item) => {
      if (!item.nhan_vien_id || !item.thang) return

      if (!grouped.has(item.nhan_vien_id)) {
        const nhanSu = nhanSuList.find((ns) => ns.ma_nhan_vien === item.nhan_vien_id)
        grouped.set(item.nhan_vien_id, {
          nhan_vien_id: item.nhan_vien_id,
          ten_nhan_vien: item.ten_nhan_vien || null,
          ho_ten: nhanSu?.ho_ten ?? null,
          thang_1: null,
          thang_2: null,
          thang_3: null,
          thang_4: null,
          thang_5: null,
          thang_6: null,
          thang_7: null,
          thang_8: null,
          thang_9: null,
          thang_10: null,
          thang_11: null,
          thang_12: null,
          record_ids: {},
        })
      }

      const row = grouped.get(item.nhan_vien_id)!
      const thangKey = `thang_${item.thang}` as keyof YearViewRow

      if (item.doanh_thu !== null && item.doanh_thu !== undefined) {
        ;(row[thangKey] as number | null) = item.doanh_thu
      }
      if (item.id) {
        row.record_ids[item.thang] = item.id
      }
    })

    return Array.from(grouped.values()).sort((a, b) => {
      const nameA = a.ho_ten || a.ten_nhan_vien || ""
      const nameB = b.ho_ten || b.ten_nhan_vien || ""
      return nameA.localeCompare(nameB, "vi")
    })
  }, [data, selectedYear, nhanSuList])

  // Create columns
  const columns = React.useMemo<ColumnDef<YearViewRow>[]>(() => {
    const monthColumns: ColumnDef<YearViewRow>[] = []

    // Nhân viên column (sticky left)
    monthColumns.push({
      accessorKey: "ten_nhan_vien",
      header: ({ column }) => <SortableHeader column={column} title="Nhân viên" />,
      size: 200,
      minSize: 150,
      meta: {
        stickyLeft: true,
        stickyLeftOffset: 0,
        minWidth: 150,
      },
      cell: ({ row }) => {
        const displayName = row.original.ho_ten || row.original.ten_nhan_vien || `NV${row.original.nhan_vien_id}`
        return (
          <button
            onClick={() => {
              // Navigate to first record or create new
              const firstRecordId = Object.values(row.original.record_ids)[0]
              if (firstRecordId) {
                navigate(`${dangKyDoanhSoConfig.routePath}/${firstRecordId}`)
              }
            }}
            className="font-medium hover:underline truncate text-left w-full"
          >
            {displayName}
          </button>
        )
      },
    })

    // 12 month columns
    for (let thang = 1; thang <= 12; thang++) {
      const thangKey = `thang_${thang}` as keyof YearViewRow
      monthColumns.push({
        accessorKey: thangKey,
        header: () => <div className="text-center font-medium">Tháng {thang}</div>,
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
          const value = row.original[thangKey] as number | null | undefined
          const recordId = row.original.record_ids[thang]
          const displayValue = value !== null && value !== undefined ? formatCurrency(value) : "-"

          return (
            <div
              className="text-center cursor-pointer hover:bg-accent p-1 rounded"
              onClick={() => {
                if (onCellClick) {
                  onCellClick(row.original.nhan_vien_id, thang, recordId)
                } else if (recordId) {
                  navigate(`${dangKyDoanhSoConfig.routePath}/${recordId}`)
                } else {
                  // Navigate to create form with pre-filled year, month, and nhan_vien_id
                  const params = new URLSearchParams({
                    nam: selectedYear.toString(),
                    thang: thang.toString(),
                    nhan_vien_id: row.original.nhan_vien_id.toString(),
                  })
                  navigate(`${dangKyDoanhSoConfig.routePath}/moi?${params.toString()}`)
                }
              }}
            >
              <span className="font-mono text-sm">{displayValue}</span>
            </div>
          )
        },
      })
    }

    return monthColumns
  }, [selectedYear, navigate, onCellClick])

  const table = useReactTable({
    data: yearViewData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Get available years from data
  const availableYears = React.useMemo(() => {
    const years = new Set(data.map((item) => item.nam).filter((y): y is number => y !== null && y !== undefined))
    return Array.from(years).sort((a, b) => b - a) // Descending
  }, [data])

  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-4">
      {/* Year Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Năm:</label>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => onYearChange(Number(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.length > 0 ? (
                availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value={currentYear.toString()}>{currentYear}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Tổng cộng: {yearViewData.length} nhân viên
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta as any
                    const isStickyLeft = meta?.stickyLeft
                    const stickyOffset = meta?.stickyLeftOffset || 0

                    return (
                      <TableHead
                        key={header.id}
                        style={{
                          position: isStickyLeft ? "sticky" : "relative",
                          left: isStickyLeft ? `${stickyOffset}px` : undefined,
                          zIndex: isStickyLeft ? 20 : 1,
                          backgroundColor: isStickyLeft ? "hsl(var(--background))" : undefined,
                          minWidth: header.getSize(),
                          width: header.getSize(),
                        }}
                        className={isStickyLeft ? "shadow-[2px_0_6px_-2px_rgba(0,0,0,0.1)]" : ""}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Không có dữ liệu cho năm {selectedYear}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as any
                      const isStickyLeft = meta?.stickyLeft
                      const stickyOffset = meta?.stickyLeftOffset || 0

                      return (
                        <TableCell
                          key={cell.id}
                          style={{
                            position: isStickyLeft ? "sticky" : "relative",
                            left: isStickyLeft ? `${stickyOffset}px` : undefined,
                            zIndex: isStickyLeft ? 10 : 1,
                            backgroundColor: isStickyLeft ? "hsl(var(--background))" : undefined,
                            minWidth: cell.column.getSize(),
                            width: cell.column.getSize(),
                          }}
                          className={isStickyLeft ? "shadow-[2px_0_6px_-2px_rgba(0,0,0,0.1)]" : ""}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}

