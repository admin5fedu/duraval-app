"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import { Column } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { responsiveTextClass, mediumTextClass, smallTextClass, bodyTextClass } from "@/shared/utils/text-styles"
import { BADGE_TYPOGRAPHY } from "@/shared/constants/typography"
import { standardPaddingClass } from "@/shared/utils/spacing-styles"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

interface MultiSelectFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  searchable?: boolean
}

/**
 * Multi-Select Filter Component
 * 
 * Allows filtering by multiple selected values (checkbox list)
 */
export function MultiSelectFilter<TData, TValue>({
  column,
  title = "Lọc",
  options,
  searchable = false,
}: MultiSelectFilterProps<TData, TValue>) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Get faceted values for count display
  const facets = React.useMemo(() => {
    if (!isOpen || !column) return undefined
    return column.getFacetedUniqueValues()
  }, [isOpen, column])

  const filterValue = column?.getFilterValue() as string[] | undefined
  const selectedValues = new Set(filterValue || [])

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options
    const query = searchQuery.toLowerCase()
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query)
    )
  }, [options, searchQuery])

  const handleSelect = (value: string) => {
    const newSelectedValues = new Set(selectedValues)
    if (newSelectedValues.has(value)) {
      newSelectedValues.delete(value)
    } else {
      newSelectedValues.add(value)
    }
    const filterValues = Array.from(newSelectedValues)
    column?.setFilterValue(filterValues.length ? filterValues : undefined)
  }

  const handleClear = () => {
    column?.setFilterValue(undefined)
    setSearchQuery("")
  }

  const handleSelectAll = () => {
    const allValues = filteredOptions.map((opt) => opt.value)
    column?.setFilterValue(allValues)
  }

  const handleDeselectAll = () => {
    column?.setFilterValue(undefined)
  }

  const hasFilter = selectedValues.size > 0

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed shrink-0">
          <ChevronsUpDown className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className={responsiveTextClass()}>{title}</span>
          {hasFilter && (
            <>
              <Separator orientation="vertical" className="mx-1.5 md:mx-2 h-4" />
              <Badge
                variant="secondary"
                className={cn("rounded-sm px-1", smallTextClass(), BADGE_TYPOGRAPHY.default.fontWeight)}
              >
                {selectedValues.size}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <div className={cn(standardPaddingClass(), "space-y-3")}>
          <div className="flex items-center justify-between">
            <p className={mediumTextClass()}>{title}</p>
            {hasFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleClear}
              >
                Xóa
              </Button>
            )}
          </div>

          {searchable && (
            <div className="space-y-2">
              <Input
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs flex-1"
              onClick={handleSelectAll}
            >
              Chọn tất cả
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs flex-1"
              onClick={handleDeselectAll}
            >
              Bỏ chọn
            </Button>
          </div>

          <Separator />

          <ScrollArea className="h-[200px]">
            <div className="space-y-1 p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                  Không tìm thấy
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.has(option.value)
                  const Icon = option.icon
                  return (
                    <div
                      key={option.value}
                      className={cn(
                        "flex items-center space-x-2 rounded-md px-2 py-1.5 cursor-pointer hover:bg-accent",
                        isSelected && "bg-accent"
                      )}
                      onClick={() => handleSelect(option.value)}
                    >
                      <Checkbox
                        id={`filter-checkbox-${column?.id || 'unknown'}-${option.value}`}
                        checked={isSelected}
                        className="pointer-events-none"
                      />
                      {Icon && (
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className={cn("flex-1", bodyTextClass())}>{option.label}</span>
                      {facets?.get(option.value) && (
                        <span className={cn("text-muted-foreground tabular-nums", smallTextClass())}>
                          {facets.get(option.value)}
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}

