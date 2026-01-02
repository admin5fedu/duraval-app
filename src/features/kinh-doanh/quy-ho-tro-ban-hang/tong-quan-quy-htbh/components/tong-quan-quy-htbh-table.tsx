"use client"

import * as React from "react"
import { TongQuanQuyHTBHData } from "../types"
import { cn } from "@/lib/utils"
import { Download, Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTongQuanQuyHTBH } from "../hooks/use-tong-quan-quy-htbh"
import { createWorkbook, addDataToWorksheet, downloadWorkbook } from "@/lib/excel/exceljs-utils"
import { useElementHeight } from "@/shared/hooks/use-element-height"
import { useMobileBreakpoint } from "@/shared/hooks/use-mobile-breakpoint"
import { getListViewContainerHeight } from "@/shared/constants"
import { toolbarGapClass, toolbarButtonOutlineClass } from "@/shared/utils/toolbar-styles"
import { BADGE_TYPOGRAPHY } from "@/shared/constants/typography"
import { PhongBanSelect } from "@/components/ui/phong-ban-select"
import { useUserPreferencesStore } from "@/shared/stores/user-preferences-store"

interface TongQuanQuyHTBHTableProps {
  data?: TongQuanQuyHTBHData[]
  isLoading?: boolean
}

/**
 * Format số với dấu phẩy phân tách hàng nghìn
 */
function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value)
}

/**
 * Helper component cho sticky cells với backdrop
 * Đảm bảo che khuất hoàn toàn nội dung scroll qua và hover effect đồng bộ
 */
interface StickyCellWrapperProps {
  bgColor?: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

function StickyCellWrapper({
  bgColor,
  children,
  className,
  style
}: StickyCellWrapperProps) {
  const finalBgColor = bgColor && bgColor !== '' 
    ? bgColor 
    : 'hsl(var(--background))'
  
  const hasHoverBg = bgColor && bgColor !== ''
  
  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      {/* Backdrop - đổi màu khi hover, mượt mà và đẹp hơn */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: hasHoverBg ? finalBgColor : 'hsl(var(--background))',
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
      {/* Content - z-index cao nhất */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}

/**
 * Component bảng pivot tổng quan quỹ HTBH
 */
export function TongQuanQuyHTBHTable({ data, isLoading }: TongQuanQuyHTBHTableProps) {
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear())
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedPhongId, setSelectedPhongId] = React.useState<number | null>(null)
  const [selectedNhomId, setSelectedNhomId] = React.useState<number | null>(null)
  const [pageIndex, setPageIndex] = React.useState(0)
  const [hoveredRowId, setHoveredRowId] = React.useState<string | null>(null)
  const [pageSize, setPageSize] = React.useState(20)
  const [pageInputValue, setPageInputValue] = React.useState("1")
  const pageInputRef = React.useRef<HTMLInputElement>(null)
  const { setDefaultPageSize } = useUserPreferencesStore()
  const { data: tableData, isLoading: isDataLoading } = useTongQuanQuyHTBH(selectedYear)

  const rawData = data || tableData || []
  const loading = isLoading || isDataLoading

  // Get unique phòng và nhóm từ data
  const phongOptions = React.useMemo(() => {
    const phongMap = new Map<number, { id: number; ma: string | null }>()
    rawData.forEach((emp) => {
      if (emp.phong_id && !phongMap.has(emp.phong_id)) {
        phongMap.set(emp.phong_id, { id: emp.phong_id, ma: emp.ma_phong })
      }
    })
    return Array.from(phongMap.values()).sort((a, b) => (a.ma || "").localeCompare(b.ma || ""))
  }, [rawData])

  const nhomOptions = React.useMemo(() => {
    const nhomMap = new Map<number, { id: number; ma: string | null }>()
    rawData.forEach((emp) => {
      if (emp.nhom_id && !nhomMap.has(emp.nhom_id)) {
        nhomMap.set(emp.nhom_id, { id: emp.nhom_id, ma: emp.ma_nhom })
      }
    })
    return Array.from(nhomMap.values()).sort((a, b) => (a.ma || "").localeCompare(b.ma || ""))
  }, [rawData])

  // Filter data based on search query, phòng, và nhóm
  const filteredData = React.useMemo(() => {
    let filtered = rawData

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((employee) =>
        employee.ten_nhan_vien.toLowerCase().includes(query)
      )
    }

    // Filter by phòng
    if (selectedPhongId !== null) {
      filtered = filtered.filter((employee) => employee.phong_id === selectedPhongId)
    }

    // Filter by nhóm
    if (selectedNhomId !== null) {
      filtered = filtered.filter((employee) => employee.nhom_id === selectedNhomId)
    }

    return filtered
  }, [rawData, searchQuery, selectedPhongId, selectedNhomId])

  // Pagination
  const totalRows = filteredData.length
  const pageCount = Math.ceil(totalRows / pageSize) || 1
  const startIndex = pageIndex * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalRows)
  const displayData = filteredData.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setPageIndex(0)
    setPageInputValue("1")
  }, [searchQuery, selectedPhongId, selectedNhomId, selectedYear])

  // Pagination handlers
  const handlePageInputFocus = React.useCallback(() => {
    setPageInputValue(`${pageIndex + 1}`)
  }, [pageIndex])

  const handlePageInputBlur = React.useCallback(() => {
    const pageNum = parseInt(pageInputValue, 10)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pageCount) {
      setPageIndex(pageNum - 1)
      setPageInputValue(`${pageNum}`)
    } else {
      setPageInputValue(`${pageIndex + 1}`)
    }
  }, [pageInputValue, pageCount, pageIndex])

  const handlePageInputKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur()
    }
  }, [])

  // Hooks for responsive layout
  const { ref: toolbarRef, height: toolbarHeight } = useElementHeight<HTMLDivElement>()
  const { ref: footerRef } = useElementHeight<HTMLDivElement>()
  const { isMobile } = useMobileBreakpoint()

  // Calculate container height
  const containerHeight = React.useMemo(() => {
    if (typeof window === 'undefined') {
      return '100vh'
    }
    return getListViewContainerHeight(isMobile)
  }, [isMobile])

  // Scroll ref for body (header và body cùng scroll trong 1 container)
  const bodyScrollRef = React.useRef<HTMLDivElement>(null)

  // Generate năm options (năm hiện tại và 2 năm trước)
  const yearOptions = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 3 }, (_, i) => currentYear - i)
  }, [])

  // Export to Excel
  const handleExportExcel = React.useCallback(async () => {
    if (!displayData || displayData.length === 0) return

    try {
      // Prepare headers
      const headers: string[] = ["Nhân viên"]
      for (let i = 1; i <= 12; i++) {
        headers.push(`Tháng ${i}`)
        if (i % 3 === 0) {
          headers.push(`Quý ${i / 3}`)
        }
      }
      headers.push("Tổng năm")

      // Prepare data rows
      const rows: any[][] = []
      displayData.forEach((employee) => {
        const row: any[] = [employee.ten_nhan_vien]

        for (let i = 1; i <= 12; i++) {
          const monthData = employee.months[i] || { budget: 0, actual: 0, balance: 0, sales: 0 }
          row.push(
            `ĐM: ${formatNumber(monthData.budget)} | Dùng: ${formatNumber(monthData.actual)} | Dư: ${formatNumber(monthData.balance)} | DS: ${formatNumber(monthData.sales)}`
          )

          if (i % 3 === 0) {
            const quarter = i / 3
            const quarterData = employee.quarters[quarter as 1 | 2 | 3 | 4]
            row.push(
              `ĐM: ${formatNumber(quarterData.budget)} | Dùng: ${formatNumber(quarterData.actual)} | Dư: ${formatNumber(quarterData.balance)} | DS: ${formatNumber(quarterData.sales)}`
            )
          }
        }

        row.push(
          `ĐM: ${formatNumber(employee.total.budget)} | Dùng: ${formatNumber(employee.total.actual)} | Dư: ${formatNumber(employee.total.balance)} | DS: ${formatNumber(employee.total.sales)}`
        )
        rows.push(row)
      })

      // Create workbook
      const workbook = createWorkbook()
      const worksheet = workbook.addWorksheet("Tổng quan quỹ HTBH")

      // Add data
      addDataToWorksheet(worksheet, headers, rows)

      // Download
      const filename = `Tong-quan-quy-HTBH-${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`
      await downloadWorkbook(workbook, filename)
    } catch (error) {
      console.error("Lỗi khi export Excel:", error)
    }
  }, [displayData, selectedYear])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div 
      className="flex flex-col w-full max-w-full min-w-0"
      style={{
        minHeight: containerHeight,
        height: containerHeight,
      }}
    >
      {/* Toolbar Section - Sticky top */}
      <div 
        ref={toolbarRef}
        className="shrink-0 sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b shadow-sm"
      >
        {/* Main toolbar */}
        <div className={cn("hidden md:flex flex-row items-center justify-between w-full max-w-full min-w-0", toolbarGapClass(), "py-2 px-4")}>
          <div className={cn("flex flex-1 items-center min-w-0 max-w-full", toolbarGapClass())}>
            {/* Search Input */}
            <div className="relative w-[140px] lg:w-[180px] xl:w-[220px] flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
              <Input
                id="tong-quan-quy-htbh-search"
                name="tong-quan-quy-htbh-search"
                placeholder="Tìm kiếm nhân viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "h-8 pl-8",
                  searchQuery ? "pr-8" : "pr-3"
                )}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery("")}
                  title="Xóa tìm kiếm"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Phòng filter */}
            <PhongBanSelect
              value={selectedPhongId}
              onChange={setSelectedPhongId}
              placeholder="Chọn phòng..."
              className="w-[160px]"
            />

            {/* Nhóm filter */}
            {nhomOptions.length > 0 && (
              <Select
                value={selectedNhomId === null ? "all" : selectedNhomId.toString()}
                onValueChange={(value) => {
                  if (value === "all") {
                    setSelectedNhomId(null)
                  } else {
                    setSelectedNhomId(Number(value))
                  }
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Chọn nhóm..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhóm</SelectItem>
                  {nhomOptions.map((nhom) => (
                    <SelectItem key={nhom.id} value={nhom.id.toString()}>
                      {nhom.ma || `Nhóm ${nhom.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Clear filters button */}
            {(searchQuery || selectedYear !== new Date().getFullYear() || selectedPhongId !== null || selectedNhomId !== null) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedYear(new Date().getFullYear())
                  setSelectedPhongId(null)
                  setSelectedNhomId(null)
                }}
                className={toolbarButtonOutlineClass("px-2.5 lg:px-3")}
              >
                <X className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1.5" />
                <span>Bỏ lọc</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 min-w-0">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    Năm {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleExportExcel}
              disabled={displayData.length === 0}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-4 py-1.5 border-t">
          <div className="flex flex-wrap items-center gap-2">
            {/* Year filter chip */}
            {selectedYear && selectedYear !== new Date().getFullYear() && (
              <Badge
                variant="secondary"
                className={cn("h-6 px-2 gap-1.5 shrink-0", BADGE_TYPOGRAPHY.default.fontSize, BADGE_TYPOGRAPHY.default.fontWeight)}
              >
                <span>Năm: {selectedYear}</span>
                <button
                  onClick={() => setSelectedYear(new Date().getFullYear())}
                  className="ml-0.5 rounded-full hover:bg-secondary-foreground/20 p-0.5 transition-colors"
                  title="Xóa bộ lọc năm"
                  aria-label="Xóa bộ lọc năm"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {/* Phòng filter chip */}
            {selectedPhongId !== null && (() => {
              const phong = phongOptions.find(p => p.id === selectedPhongId)
              return phong ? (
                <Badge
                  variant="secondary"
                  className={cn("h-6 px-2 gap-1.5 shrink-0", BADGE_TYPOGRAPHY.default.fontSize, BADGE_TYPOGRAPHY.default.fontWeight)}
                >
                  <span className="truncate max-w-[150px]">Phòng: {phong.ma || `ID ${phong.id}`}</span>
                  <button
                    onClick={() => setSelectedPhongId(null)}
                    className="ml-0.5 rounded-full hover:bg-secondary-foreground/20 p-0.5 transition-colors"
                    title="Xóa bộ lọc phòng"
                    aria-label="Xóa bộ lọc phòng"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null
            })()}
            {/* Nhóm filter chip */}
            {selectedNhomId !== null && (() => {
              const nhom = nhomOptions.find(n => n.id === selectedNhomId)
              return nhom ? (
                <Badge
                  variant="secondary"
                  className={cn("h-6 px-2 gap-1.5 shrink-0", BADGE_TYPOGRAPHY.default.fontSize, BADGE_TYPOGRAPHY.default.fontWeight)}
                >
                  <span className="truncate max-w-[150px]">Nhóm: {nhom.ma || `ID ${nhom.id}`}</span>
                  <button
                    onClick={() => setSelectedNhomId(null)}
                    className="ml-0.5 rounded-full hover:bg-secondary-foreground/20 p-0.5 transition-colors"
                    title="Xóa bộ lọc nhóm"
                    aria-label="Xóa bộ lọc nhóm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null
            })()}
            {/* Search chip */}
            {searchQuery && (
              <Badge
                variant="secondary"
                className={cn("h-6 px-2 gap-1.5 shrink-0", BADGE_TYPOGRAPHY.default.fontSize, BADGE_TYPOGRAPHY.default.fontWeight)}
              >
                <span className="truncate max-w-[150px]">Tìm kiếm: {searchQuery}</span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-0.5 rounded-full hover:bg-secondary-foreground/20 p-0.5 transition-colors"
                  title="Xóa tìm kiếm"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div 
        className="flex-1 min-h-0 flex flex-col w-full max-w-full min-w-0"
        style={{
          height: `calc(${containerHeight} - ${toolbarHeight}px)`,
          maxHeight: `calc(${containerHeight} - ${toolbarHeight}px)`,
        }}
      >
        <div className="hidden md:flex rounded-md border flex-1 overflow-hidden flex-col w-full max-w-full min-w-0 isolate mt-2 min-h-0">
          {/* Table Container - Scrollable */}
          <div 
            ref={bodyScrollRef}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-auto w-full max-w-full min-w-0 relative"
            style={{
              scrollBehavior: 'smooth',
            }}
            role="region"
            aria-label="Bảng tổng quan quỹ HTBH"
          >
            <Table containerClassName="w-full max-w-full min-w-0" style={{ minWidth: 'max-content' }}>
              <TableHeader
                className="sticky top-0 bg-background shadow-sm z-50"
                style={{
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                  isolation: 'isolate',
                }}
              >
                <TableRow className="hover:bg-transparent">
                  <TableHead 
                    className="p-0 font-semibold w-[200px] sticky left-0 z-[150] shadow-[2px_0_6px_-2px_rgba(0,0,0,0.15)] text-center border-r border-border/50"
                    style={{
                      top: 0,
                      backgroundColor: 'hsl(var(--background))',
                      isolation: 'isolate',
                      transform: 'translateZ(0)',
                      willChange: 'transform',
                      backgroundClip: 'padding-box'
                    }}
                  >
                    <StickyCellWrapper>
                      <div className="p-4">Nhân viên</div>
                    </StickyCellWrapper>
                  </TableHead>
                  <TableHead 
                    className="p-0 font-semibold w-[120px] sticky left-[200px] z-[150] shadow-[2px_0_6px_-2px_rgba(0,0,0,0.15)] text-center border-l border-r border-border/50"
                    style={{
                      top: 0,
                      backgroundColor: 'hsl(var(--background))',
                      isolation: 'isolate',
                      transform: 'translateZ(0)',
                      willChange: 'transform',
                      backgroundClip: 'padding-box'
                    }}
                  >
                    <StickyCellWrapper>
                      <div className="p-3">Thông tin</div>
                    </StickyCellWrapper>
                  </TableHead>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <React.Fragment key={month}>
                      <TableHead 
                        className="p-3 font-medium w-[120px] border-l text-center"
                      >
                        Tháng {month}
                      </TableHead>
                      {month % 3 === 0 && (
                        <TableHead 
                          className="p-3 font-semibold w-[140px] border-l text-center"
                        >
                          Quý {month / 3}
                        </TableHead>
                      )}
                    </React.Fragment>
                  ))}
                  <TableHead 
                    className="p-0 font-semibold w-[140px] sticky right-0 border-l text-center z-[150] shadow-[-2px_0_6px_-2px_rgba(0,0,0,0.15)] border-l border-border/50"
                    style={{
                      top: 0,
                      // ❌ Loại bỏ backgroundColor để tránh duplicate với StickyCellWrapper backdrop
                      isolation: 'isolate',
                      transform: 'translateZ(0)',
                      willChange: 'transform',
                      backgroundClip: 'padding-box'
                    }}
                  >
                    <StickyCellWrapper>
                      <div className="p-3">Tổng năm</div>
                    </StickyCellWrapper>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2 + 12 + 4 + 1} className="p-8 text-center text-muted-foreground">
                      Không có dữ liệu cho năm {selectedYear}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayData.map((employee) => {
                    const rowTypes = [
                      { key: 'sales', label: 'Doanh số ĐK', getValue: (data: any) => data.sales },
                      { key: 'budget', label: 'Tổng quỹ', getValue: (data: any) => data.budget },
                      { key: 'actual', label: 'Tổng dùng', getValue: (data: any) => data.actual },
                      { key: 'balance', label: 'Tổng dư', getValue: (data: any) => data.balance },
                    ]

                    const employeeId = `${employee.nhan_vien_id}`
                    const isHovered = hoveredRowId === employeeId
                    // Màu hover đẹp hơn, nhẹ nhàng và dễ nhìn
                    const hoverBgColor = isHovered ? 'hsl(var(--muted) / 0.5)' : ''

                    // Handler cho tất cả 4 rows của cùng một employee
                    const handleMouseEnter = () => {
                      if (hoveredRowId !== employeeId) {
                        setHoveredRowId(employeeId)
                      }
                    }
                    const handleMouseLeave = (e: React.MouseEvent) => {
                      // Chỉ clear hover nếu mouse không còn trong bất kỳ row nào của employee này
                      const relatedTarget = e.relatedTarget as HTMLElement
                      if (!relatedTarget || !relatedTarget.closest(`[data-employee-id="${employeeId}"]`)) {
                        setHoveredRowId(null)
                      }
                    }

                    return rowTypes.map((rowType, rowIndex) => {
                      const rowId = `${employee.nhan_vien_id}-${rowType.key}`
                      return (
                      <TableRow 
                        key={rowId}
                        data-employee-id={employeeId}
                        className="group hover:bg-transparent"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        style={{ backgroundColor: 'transparent' }}
                      >
                        {/* Nhân viên column - sticky, chỉ hiển thị ở dòng đầu */}
                        {rowIndex === 0 && (
                          <TableCell
                            rowSpan={4}
                            className="p-0 w-[200px] sticky left-0 z-[100] shadow-[2px_0_6px_-2px_rgba(0,0,0,0.15)] border-b border-r border-border/50"
                            style={{
                              // ❌ Loại bỏ backgroundColor để tránh duplicate với StickyCellWrapper backdrop
                              transform: 'translateZ(0)',
                              willChange: 'transform',
                              backgroundClip: 'padding-box'
                            }}
                          >
                            <StickyCellWrapper bgColor={hoverBgColor}>
                              <div className="p-4 font-medium">
                                {employee.ten_nhan_vien}
                              </div>
                            </StickyCellWrapper>
                          </TableCell>
                        )}

                        {/* Thông tin column - sticky */}
                        <TableCell 
                          className={cn(
                            "p-0 w-[120px] border-l border-r border-border/50 text-center font-medium text-xs sticky left-[200px] z-[100] shadow-[2px_0_6px_-2px_rgba(0,0,0,0.15)]",
                            rowIndex === 3 && "border-b"
                          )}
                          style={{
                            // ❌ Loại bỏ backgroundColor để tránh duplicate với StickyCellWrapper backdrop
                            transform: 'translateZ(0)',
                            willChange: 'transform',
                            backgroundClip: 'padding-box'
                          }}
                        >
                          <StickyCellWrapper bgColor={hoverBgColor}>
                            <div className="p-3">{rowType.label}</div>
                          </StickyCellWrapper>
                        </TableCell>

                        {/* Month columns - mỗi tháng 1 cell, hiển thị giá trị tương ứng với rowType */}
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                          const monthData = employee.months[month] || {
                            budget: 0,
                            actual: 0,
                            balance: 0,
                            sales: 0,
                          }
                          const value = rowType.getValue(monthData)
                          const hasData = monthData.budget !== 0 || monthData.actual !== 0 || monthData.sales !== 0

                          return (
                            <React.Fragment key={month}>
                              <TableCell className="p-0 w-[120px] border-l text-right text-xs">
                                <StickyCellWrapper bgColor={hoverBgColor}>
                                  <div className={cn(
                                    "p-3",
                                    rowIndex === 3 && "border-b",
                                    rowType.key === 'balance' && value < 0 && "text-destructive"
                                  )}>
                                    {hasData ? formatNumber(value) : "-"}
                                  </div>
                                </StickyCellWrapper>
                              </TableCell>
                              {/* Quarter column - chỉ hiển thị sau tháng 3, 6, 9, 12 */}
                              {month % 3 === 0 && (
                                <TableCell className="p-0 w-[140px] border-l text-right text-xs">
                                  <StickyCellWrapper bgColor={hoverBgColor}>
                                    <div className={cn(
                                      "p-3",
                                      rowIndex === 3 && "border-b",
                                      rowType.key === 'balance' && rowType.getValue(employee.quarters[month / 3 as 1 | 2 | 3 | 4]) < 0 && "text-destructive",
                                      // Tô màu primary cho các giá trị quý
                                      rowType.key === 'sales' && "bg-primary/5 text-primary font-semibold",
                                      rowType.key === 'budget' && "bg-primary/5 text-primary font-semibold",
                                      rowType.key === 'actual' && "bg-primary/5 text-primary font-semibold",
                                      rowType.key === 'balance' && rowType.getValue(employee.quarters[month / 3 as 1 | 2 | 3 | 4]) >= 0 && "bg-primary/5 text-primary font-semibold"
                                    )}>
                                      {formatNumber(rowType.getValue(employee.quarters[month / 3 as 1 | 2 | 3 | 4]))}
                                    </div>
                                  </StickyCellWrapper>
                                </TableCell>
                              )}
                            </React.Fragment>
                          )
                        })}

                        {/* Total column - 1 cell, sticky right */}
                        <TableCell 
                          className={cn(
                            "p-0 w-[140px] sticky right-0 border-l border-border/50 text-right text-xs z-[100] shadow-[-2px_0_6px_-2px_rgba(0,0,0,0.15)]",
                            rowIndex === 3 && "border-b"
                          )}
                          style={{
                            // ❌ Loại bỏ backgroundColor và bg-muted/30 để tránh duplicate với StickyCellWrapper backdrop
                            transform: 'translateZ(0)',
                            willChange: 'transform',
                            backgroundClip: 'padding-box'
                          }}
                        >
                          <StickyCellWrapper bgColor={hoverBgColor}>
                            <div className={cn(
                              "p-3",
                              rowType.key === 'balance' && employee.total.balance < 0 && "text-destructive",
                              // Tô màu primary cho các giá trị tổng năm
                              rowType.key === 'sales' && "bg-primary/5 text-primary font-semibold",
                              rowType.key === 'budget' && "bg-primary/5 text-primary font-semibold",
                              rowType.key === 'actual' && "bg-primary/5 text-primary font-semibold",
                              rowType.key === 'balance' && employee.total.balance >= 0 && "bg-primary/5 text-primary font-semibold"
                            )}>
                              {formatNumber(rowType.getValue(employee.total))}
                            </div>
                          </StickyCellWrapper>
                        </TableCell>
                      </TableRow>
                      )
                    })
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer - Sticky bottom */}
          <div 
            ref={footerRef}
            className="flex-shrink-0 border-t bg-background sticky bottom-0 z-20"
            data-testid="tong-quan-quy-htbh-table-footer"
          >
            <div className="hidden md:flex shrink-0 bg-background py-2.5 px-3 md:px-4 flex-row items-center justify-between gap-2 md:gap-0">
              <div className="flex items-center gap-2 md:gap-6 text-xs md:text-sm text-muted-foreground min-w-0 shrink">
                <span className="tabular-nums whitespace-nowrap shrink-0">
                  <span className="font-medium text-foreground">
                    {totalRows}
                  </span>
                  <span className="hidden md:inline"> nhân viên</span>
                </span>
                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground hidden md:inline">
                    Hiển thị
                  </span>
                  <Select
                    value={`${pageSize}`}
                    onValueChange={(value) => {
                      const newPageSize = Number(value)
                      setPageSize(newPageSize)
                      setDefaultPageSize(newPageSize)
                      setPageIndex(0)
                      setPageInputValue("1")
                    }}
                    name="table-page-size"
                  >
                    <SelectTrigger
                      id="table-page-size-select"
                      className="h-7 md:h-8 w-[65px] md:w-[75px] text-xs border-muted"
                      aria-label="Số dòng hiển thị"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="top" align="start">
                      {[20, 50, 100].map((size) => (
                        <SelectItem key={size} value={`${size}`}>
                          {size} dòng
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-0.5 md:gap-1 justify-end shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:h-8 md:w-8 hidden lg:flex"
                  onClick={() => {
                    setPageIndex(0)
                    setPageInputValue("1")
                  }}
                  disabled={pageIndex === 0}
                >
                  <ChevronsLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:h-8 md:w-8"
                  onClick={() => {
                    if (pageIndex > 0) {
                      setPageIndex(pageIndex - 1)
                      setPageInputValue(`${pageIndex}`)
                    }
                  }}
                  disabled={pageIndex === 0}
                >
                  <ChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>

                <div className="flex items-center gap-0.5 md:gap-1 px-1 md:px-2 min-w-[70px] md:min-w-[100px] justify-center">
                  <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">
                    Trang
                  </span>
                  <Input
                    ref={pageInputRef}
                    id="table-page-number-input"
                    name="table-page-number"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="h-7 md:h-8 w-10 md:w-14 text-center text-xs md:text-sm border-muted p-0"
                    value={pageInputValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value
                      if (value === "" || /^\d+$/.test(value)) {
                        setPageInputValue(value)
                      }
                    }}
                    onFocus={handlePageInputFocus}
                    onBlur={handlePageInputBlur}
                    onKeyDown={handlePageInputKeyDown}
                    aria-label="Số trang"
                  />
                  <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                    / {pageCount}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:h-8 md:w-8"
                  onClick={() => {
                    if (pageIndex < pageCount - 1) {
                      setPageIndex(pageIndex + 1)
                      setPageInputValue(`${pageIndex + 2}`)
                    }
                  }}
                  disabled={pageIndex >= pageCount - 1}
                >
                  <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:h-8 md:w-8 hidden lg:flex"
                  onClick={() => {
                    setPageIndex(pageCount - 1)
                    setPageInputValue(`${pageCount}`)
                  }}
                  disabled={pageIndex >= pageCount - 1}
                >
                  <ChevronsRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile view - placeholder */}
        <div className="md:hidden p-4 text-center text-muted-foreground">
          Vui lòng sử dụng desktop để xem bảng dữ liệu
        </div>
      </div>
    </div>
  )
}

