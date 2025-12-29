"use client"

import * as React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { bodyTextClass } from "@/shared/utils/text-styles"

interface Column {
  id: string
  title: string
  order: number
}

interface ColumnOrderSelectorProps {
  columns: Column[]
  selectedColumns: Set<string>
  onColumnToggle: (columnId: string) => void
  onColumnReorder: (columnId: string, direction: 'up' | 'down') => void
  onSelectAll: () => void
  onDeselectAll: () => void
}

export function ColumnOrderSelector({
  columns,
  selectedColumns,
  onColumnToggle,
  onColumnReorder,
  onSelectAll,
  onDeselectAll,
}: ColumnOrderSelectorProps) {
  // Sort columns by order
  const sortedColumns = React.useMemo(() => {
    if (!columns || columns.length === 0) return []
    return [...columns].sort((a, b) => a.order - b.order)
  }, [columns])

  // Show message if no columns
  if (!columns || columns.length === 0) {
    return (
      <div className="space-y-3">
        <Label>Cột xuất (0/0)</Label>
        <div className="p-4 border rounded-md text-center text-muted-foreground">
          Không có cột nào để xuất
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Cột xuất ({selectedColumns.size}/{columns.length})</Label>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onSelectAll}
          >
            Chọn tất cả
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onDeselectAll}
          >
            Bỏ chọn
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[300px] rounded-md border p-3">
        <div className="space-y-2">
          {sortedColumns.map((column, index) => {
            const isSelected = selectedColumns.has(column.id)
            const canMoveUp = index > 0
            const canMoveDown = index < sortedColumns.length - 1

            return (
              <div
                key={column.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md border transition-colors",
                  isSelected ? "bg-muted/50 border-primary/20" : "bg-background"
                )}
              >
                <Checkbox
                  id={`export-column-${column.id}`}
                  checked={isSelected}
                  onCheckedChange={() => onColumnToggle(column.id)}
                />
                <Label
                  htmlFor={`export-column-${column.id}`}
                  className={cn(
                    bodyTextClass(),
                    "cursor-pointer flex-1",
                    !isSelected && "text-muted-foreground"
                  )}
                >
                  {column.title}
                </Label>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onColumnReorder(column.id, 'up')}
                    disabled={!canMoveUp}
                    title="Di chuyển lên"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onColumnReorder(column.id, 'down')}
                    disabled={!canMoveDown}
                    title="Di chuyển xuống"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
      <p className="text-xs text-muted-foreground">
        Sử dụng nút mũi tên để sắp xếp thứ tự cột trong file Excel
      </p>
    </div>
  )
}

