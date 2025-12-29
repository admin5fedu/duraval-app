"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { smallTextClass } from "@/shared/utils/text-styles"

interface ExportPreviewProps<TData> {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: TData[]
  headers: string[]
  columnIds: string[]
  getCellValue?: (row: TData, columnId: string) => any
  moduleName?: string
  rowCount?: number
  onExport?: () => void
}

export function ExportPreview<TData>({
  open,
  onOpenChange,
  data,
  headers,
  columnIds,
  getCellValue,
  moduleName = "export",
  rowCount,
  onExport,
}: ExportPreviewProps<TData>) {
  const [previewLimit, setPreviewLimit] = React.useState(50)
  const previewData = React.useMemo(() => {
    return data.slice(0, previewLimit)
  }, [data, previewLimit])

  const totalRows = rowCount ?? data.length
  const showingRows = Math.min(previewLimit, totalRows)
  const hasMore = totalRows > previewLimit

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1200px] !w-[90vw] max-w-[90vw] !h-[calc(95vh-4rem)] !max-h-[calc(95vh-4rem)] md:!h-[95vh] md:!max-h-[95vh] p-0 !flex !flex-col overflow-hidden !translate-y-[-50%] !z-[70]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>Xem trước dữ liệu xuất</DialogTitle>
          <DialogDescription>
            Xem trước {showingRows.toLocaleString()} / {totalRows.toLocaleString()} dòng sẽ được xuất
            {moduleName && ` - Module: ${moduleName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 py-4 flex flex-col">
            {/* Preview Options */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b flex-shrink-0">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {showingRows.toLocaleString()} dòng
                </Badge>
                {hasMore && (
                  <Badge variant="outline">
                    +{(totalRows - previewLimit).toLocaleString()} dòng nữa
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(smallTextClass(), "text-muted-foreground")}>
                  Hiển thị:
                </span>
                <select
                  value={previewLimit}
                  onChange={(e) => setPreviewLimit(Number(e.target.value))}
                  className="h-8 px-2 text-sm border rounded-md bg-background"
                >
                  <option value={10}>10 dòng</option>
                  <option value={50}>50 dòng</option>
                  <option value={100}>100 dòng</option>
                  <option value={500}>500 dòng</option>
                  <option value={totalRows}>Tất cả ({totalRows.toLocaleString()})</option>
                </select>
              </div>
            </div>

            {/* Preview Table */}
            <ScrollArea className="flex-1 border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-12 text-center bg-muted/50 font-semibold">#</TableHead>
                    {headers.map((header, index) => (
                      <TableHead
                        key={index}
                        className="bg-muted/50 font-semibold min-w-[120px]"
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={headers.length + 1} className="text-center py-8 text-muted-foreground">
                        Không có dữ liệu để hiển thị
                      </TableCell>
                    </TableRow>
                  ) : (
                    previewData.map((row, rowIndex) => (
                      <TableRow key={rowIndex} className="hover:bg-muted/50">
                        <TableCell className="text-center text-muted-foreground font-mono text-xs">
                          {rowIndex + 1}
                        </TableCell>
                        {columnIds.map((colId, colIndex) => {
                          const value = getCellValue
                            ? getCellValue(row, colId)
                            : (row as any)[colId]
                          
                          // Format value for display
                          let displayValue: React.ReactNode = value
                          
                          if (value === null || value === undefined || value === '') {
                            displayValue = <span className="text-muted-foreground italic">—</span>
                          } else if (typeof value === 'boolean') {
                            displayValue = (
                              <Badge variant={value ? 'default' : 'secondary'} className="text-xs">
                                {value ? 'Có' : 'Không'}
                              </Badge>
                            )
                          } else if (Array.isArray(value)) {
                            displayValue = (
                              <span className="text-sm">
                                {value.length > 0 ? value.join(', ') : '—'}
                              </span>
                            )
                          } else if (typeof value === 'object') {
                            displayValue = (
                              <span className="text-xs font-mono text-muted-foreground">
                                {JSON.stringify(value).substring(0, 50)}
                                {JSON.stringify(value).length > 50 ? '...' : ''}
                              </span>
                            )
                          } else if (typeof value === 'number') {
                            displayValue = (
                              <span className="font-mono">
                                {value.toLocaleString('vi-VN')}
                              </span>
                            )
                          } else {
                            const strValue = String(value)
                            // Check if it's a date string
                            const dateMatch = strValue.match(/^\d{4}-\d{2}-\d{2}/)
                            if (dateMatch) {
                              try {
                                const date = new Date(strValue)
                                if (!isNaN(date.getTime())) {
                                  displayValue = date.toLocaleDateString('vi-VN')
                                } else {
                                  displayValue = strValue
                                }
                              } catch {
                                displayValue = strValue
                              }
                            } else {
                              displayValue = strValue
                            }
                          }
                          
                          return (
                            <TableCell key={colIndex} className="max-w-[250px]">
                              <div className="truncate" title={String(value ?? '')}>
                                {displayValue}
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Footer Info */}
            {hasMore && (
              <div className="mt-2 pt-2 border-t flex-shrink-0">
                <p className={cn(smallTextClass(), "text-muted-foreground text-center")}>
                  Đang hiển thị {showingRows.toLocaleString()} dòng đầu tiên. 
                  File Excel sẽ chứa tất cả {totalRows.toLocaleString()} dòng.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

