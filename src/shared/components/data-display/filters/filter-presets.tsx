"use client"

import * as React from "react"
import { Save, FolderOpen, Trash2 } from "lucide-react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { ColumnFiltersState } from "@tanstack/react-table"

interface FilterPreset {
  id: string
  name: string
  filters: ColumnFiltersState
  search?: string
  createdAt: number
}

interface FilterPresetsProps {
  module: string
  currentFilters: ColumnFiltersState
  currentSearch?: string
  onLoadPreset: (filters: ColumnFiltersState, search?: string) => void
}

/**
 * Filter Presets Component
 * 
 * Allows saving and loading filter configurations
 */
export function FilterPresets({
  module,
  currentFilters,
  currentSearch = "",
  onLoadPreset,
}: FilterPresetsProps) {
  const [presets, setPresets] = React.useState<FilterPreset[]>([])
  const [showSaveDialog, setShowSaveDialog] = React.useState(false)
  const [presetName, setPresetName] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)

  // Load presets from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem(`filter-presets-${module}`)
    if (saved) {
      try {
        setPresets(JSON.parse(saved))
      } catch (error) {
        console.error("Error loading filter presets:", error)
      }
    }
  }, [module])

  // Save presets to localStorage whenever they change
  React.useEffect(() => {
    if (presets.length > 0) {
      localStorage.setItem(`filter-presets-${module}`, JSON.stringify(presets))
    }
  }, [presets, module])

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error("Vui lòng nhập tên preset")
      return
    }

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      filters: currentFilters,
      search: currentSearch || undefined,
      createdAt: Date.now(),
    }

    setPresets((prev) => [...prev, newPreset])
    setPresetName("")
    setShowSaveDialog(false)
    toast.success("Đã lưu filter preset")
  }

  const handleLoadPreset = (preset: FilterPreset) => {
    onLoadPreset(preset.filters, preset.search)
    setIsOpen(false)
    toast.success(`Đã tải filter preset: ${preset.name}`)
  }

  const handleDeletePreset = (presetId: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== presetId))
    toast.success("Đã xóa filter preset")
  }

  const hasActiveFilters = currentFilters.length > 0 || currentSearch.trim().length > 0

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 shrink-0">
            <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
            <span className="text-xs">Presets</span>
            {presets.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-xs">
                {presets.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter Presets</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {hasActiveFilters && (
            <>
              <DropdownMenuItem onClick={() => setShowSaveDialog(true)}>
                <Save className="mr-2 h-4 w-4" />
                Lưu preset hiện tại
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {presets.length === 0 ? (
            <div className="px-2 py-4 text-center text-xs text-muted-foreground">
              Chưa có preset nào
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between px-2 py-1.5 hover:bg-accent rounded-sm group"
                >
                  <DropdownMenuItem
                    className="flex-1 cursor-pointer"
                    onClick={() => handleLoadPreset(preset)}
                  >
                    <span className="text-sm">{preset.name}</span>
                  </DropdownMenuItem>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePreset(preset.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lưu Filter Preset</DialogTitle>
            <DialogDescription>
              Lưu các filter và search hiện tại để sử dụng lại sau
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Tên preset</Label>
              <Input
                id="preset-name"
                placeholder="Nhập tên preset..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSavePreset()
                  }
                }}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Filters: {currentFilters.length}</p>
              {currentSearch && <p>Search: {currentSearch}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveDialog(false)
                setPresetName("")
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

