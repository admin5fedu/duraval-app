/**
 * Column Visibility Dropdown Component
 * 
 * Main component for managing column visibility in data tables
 */

"use client"

import * as React from "react"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Columns3 } from "lucide-react"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { mediumTextClass } from "@/shared/utils/text-styles"
import { standardPaddingClass } from "@/shared/utils/spacing-styles"

import { useColumnVisibility } from "./hooks/use-column-visibility"
import { useColumnSearch } from "./hooks/use-column-search"
import { useColumnStorage } from "./hooks/use-column-storage"
import { ColumnSearchInput } from "./components/column-search-input"
import { ColumnList } from "./components/column-list"
import { ResetButton } from "./components/reset-button"

export interface ColumnVisibilityDropdownProps<TData> {
  table: Table<TData>
  storageKey?: string
}

export function ColumnVisibilityDropdown<TData>({
  table,
  storageKey = "table-column-visibility",
}: ColumnVisibilityDropdownProps<TData>) {
  // Manage column visibility
  const { hideableColumns, handleResetToDefault } = useColumnVisibility(table, storageKey)
  
  // Manage search/filter
  const { searchQuery, setSearchQuery, filteredColumns } = useColumnSearch(hideableColumns)
  
  // Manage localStorage persistence
  useColumnStorage(table, hideableColumns, storageKey)

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Columns3 className="h-4 w-4" />
              <span className="sr-only">Tùy chọn cột hiển thị</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tùy chọn cột</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-[240px] p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
        <div className={cn(standardPaddingClass(), "space-y-2")}>
          <DropdownMenuLabel className={cn("px-0", mediumTextClass())}>
            Chọn cột hiển thị
          </DropdownMenuLabel>
          
          {/* Search input */}
          <ColumnSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
          />
          
          {/* Reset to default button */}
          <ResetButton onReset={handleResetToDefault} />
        </div>

        <DropdownMenuSeparator />

        {/* Column list */}
        <ScrollArea className="h-[200px]">
          <div className="p-1">
            <ColumnList
              columns={filteredColumns}
              hasSearchQuery={!!searchQuery.trim()}
            />
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

