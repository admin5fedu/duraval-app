"use client"

import * as React from "react"
import { useChucVu } from "@/features/he-thong/so-do/chuc-vu/hooks"
import { usePhongBan } from "@/features/he-thong/so-do/phong-ban/hooks"
import { usePhanQuyen, useBatchUpsertPhanQuyen } from "../hooks"
import type { ChucVu } from "@/features/he-thong/so-do/chuc-vu/schema"
import { MODULES, getModulesByCategoryAndGroup } from "../modules-config"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Quyen } from "../schema"
import {
  Loader2,
  Save,
  Search,
  ChevronDown,
  ChevronRight,
  BriefcaseBusiness,
  RotateCcw,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const QUYEN_LABELS: Array<{ key: keyof Quyen; label: string }> = [
  { key: "xem", label: "Xem" },
  { key: "them", label: "Thêm" },
  { key: "sua", label: "Sửa" },
  { key: "xoa", label: "Xóa" },
  { key: "import", label: "Import" },
  { key: "export", label: "Export" },
  { key: "quan_tri", label: "Quản trị" },
]

interface PhongBanGroup {
  phongBanId: number | null
  tenPhongBan: string
  chucVus: ChucVu[]
}

interface PhongGroup {
  maPhong: string | null
  tenPhong: string
  phongBanGroups: PhongBanGroup[]
}

export function PhanQuyenMatrixView() {
  const { data: chucVuList, isLoading: isLoadingChucVu } = useChucVu()
  const { data: phongBanList } = usePhongBan()
  const { data: phanQuyenList, isLoading: isLoadingPhanQuyen } = usePhanQuyen()
  const batchUpsertMutation = useBatchUpsertPhanQuyen()

  const [selectedModuleId, setSelectedModuleId] = React.useState<string | null>(null)
  const [moduleSearch, setModuleSearch] = React.useState("")
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set())
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set())
  const [hasChanges, setHasChanges] = React.useState(false)
  const [selectedPhongFilter, setSelectedPhongFilter] = React.useState<string>("all")

  // Group modules by category and group (2-level hierarchy)
  const modulesByCategoryAndGroup = React.useMemo(() => {
    return getModulesByCategoryAndGroup()
  }, [])

  // Initialize expanded categories and groups
  React.useEffect(() => {
    const categories = Object.keys(modulesByCategoryAndGroup)
    setExpandedCategories(new Set(categories))

    // Expand all groups in all categories
    const allGroups = new Set<string>()
    categories.forEach(category => {
      Object.keys(modulesByCategoryAndGroup[category]).forEach(group => {
        allGroups.add(`${category}::${group}`)
      })
    })
    setExpandedGroups(allGroups)
  }, [modulesByCategoryAndGroup])

  // Create permission map from server data: chuc_vu_id -> module_id -> quyen
  const serverPermissionMap = React.useMemo(() => {
    const map = new Map<number, Map<string, Quyen>>()

    if (!phanQuyenList) return map

    phanQuyenList.forEach((pq) => {
      if (!pq.chuc_vu_id || !pq.module_id || !pq.quyen) return

      if (!map.has(pq.chuc_vu_id)) {
        map.set(pq.chuc_vu_id, new Map())
      }

      const moduleMap = map.get(pq.chuc_vu_id)!
      moduleMap.set(pq.module_id, pq.quyen as Quyen)
    })

    return map
  }, [phanQuyenList])

  // Local state for unsaved changes
  const [localChanges, setLocalChanges] = React.useState<Map<string, Quyen>>(new Map())

  // Update selectedModuleId when modules load
  React.useEffect(() => {
    if (!selectedModuleId && MODULES.length > 0) {
      setSelectedModuleId(MODULES[0].id)
    }
  }, [selectedModuleId])

  // Filter modules by search (2-level structure)
  const filteredModulesByCategoryAndGroup = React.useMemo(() => {
    if (!moduleSearch.trim()) return modulesByCategoryAndGroup

    const searchLower = moduleSearch.toLowerCase()
    const filtered: Record<string, Record<string, typeof MODULES>> = {}

    Object.entries(modulesByCategoryAndGroup).forEach(([category, groups]) => {
      const filteredGroups: Record<string, typeof MODULES> = {}

      Object.entries(groups).forEach(([group, modules]) => {
        const filteredModules = modules.filter(m =>
          m.name.toLowerCase().includes(searchLower) ||
          m.description?.toLowerCase().includes(searchLower) ||
          m.id.toLowerCase().includes(searchLower) ||
          category.toLowerCase().includes(searchLower) ||
          group.toLowerCase().includes(searchLower)
        )
        if (filteredModules.length > 0) {
          filteredGroups[group] = filteredModules
        }
      })

      if (Object.keys(filteredGroups).length > 0) {
        filtered[category] = filteredGroups
      }
    })

    return filtered
  }, [modulesByCategoryAndGroup, moduleSearch])

  // Toggle category expansion
  const toggleCategory = React.useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }, [])

  // Toggle group expansion
  const toggleGroup = React.useCallback((category: string, group: string) => {
    const groupKey = `${category}::${group}`
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey)
      } else {
        newSet.add(groupKey)
      }
      return newSet
    })
  }, [])

  // Get effective permission (server + local changes)
  const getPermission = React.useCallback((chucVuId: number, moduleId: string): Quyen => {
    const defaultQuyen: Quyen = {
      xem: false,
      them: false,
      sua: false,
      xoa: false,
      import: false,
      export: false,
      quan_tri: false,
    }

    // Check local changes first
    const changeKey = `${chucVuId}-${moduleId}`
    if (localChanges.has(changeKey)) {
      return localChanges.get(changeKey)!
    }

    // Fall back to server data
    const moduleMap = serverPermissionMap.get(chucVuId)
    if (!moduleMap) return defaultQuyen

    return moduleMap.get(moduleId) || defaultQuyen
  }, [serverPermissionMap, localChanges])

  // Handle permission change
  const handlePermissionChange = React.useCallback((
    chucVuId: number,
    moduleId: string,
    quyenKey: keyof Quyen,
    checked: boolean
  ) => {
    setLocalChanges((prev) => {
      const newMap = new Map(prev)
      const changeKey = `${chucVuId}-${moduleId}`

      const currentQuyen = getPermission(chucVuId, moduleId)
      const newQuyen: Quyen = {
        ...currentQuyen,
        [quyenKey]: checked,
      }

      newMap.set(changeKey, newQuyen)
      setHasChanges(true)
      return newMap
    })
  }, [getPermission])

  // Batch toggle permission for multiple chuc vus
  const batchTogglePermission = React.useCallback((
    chucVuIds: number[],
    moduleId: string,
    quyenKey: keyof Quyen,
    shouldSelect: boolean
  ) => {
    setLocalChanges((prev) => {
      const newMap = new Map(prev)

      chucVuIds.forEach(chucVuId => {
        const changeKey = `${chucVuId}-${moduleId}`
        const currentQuyen = getPermission(chucVuId, moduleId)
        const newQuyen: Quyen = {
          ...currentQuyen,
          [quyenKey]: shouldSelect,
        }
        newMap.set(changeKey, newQuyen)
      })

      setHasChanges(true)
      return newMap
    })
  }, [getPermission])

  // Toggle all permissions for a specific chức vụ
  const handleToggleAllPermissions = React.useCallback((
    chucVuId: number,
    moduleId: string,
    shouldSelect: boolean
  ) => {
    setLocalChanges((prev) => {
      const newMap = new Map(prev)
      const changeKey = `${chucVuId}-${moduleId}`

      const newQuyen: Quyen = {
        xem: shouldSelect,
        them: shouldSelect,
        sua: shouldSelect,
        xoa: shouldSelect,
        import: shouldSelect,
        export: shouldSelect,
        quan_tri: shouldSelect,
      }

      newMap.set(changeKey, newQuyen)
      setHasChanges(true)
      return newMap
    })
  }, [])

  // Batch save all permissions
  const handleSave = React.useCallback(async () => {
    if (!chucVuList) return

    const permissionsToSave: Array<{ chuc_vu_id: number; module_id: string; quyen: Quyen }> = []

    chucVuList.forEach((chucVu) => {
      if (!chucVu.id) return

      MODULES.forEach((module) => {
        const quyen = getPermission(chucVu.id!, module.id)
        // Only save if at least one permission is true
        if (quyen.xem || quyen.them || quyen.sua || quyen.xoa || quyen.import || quyen.export || quyen.quan_tri) {
          permissionsToSave.push({
            chuc_vu_id: chucVu.id!,
            module_id: module.id,
            quyen,
          })
        }
      })
    })

    try {
      await batchUpsertMutation.mutateAsync(permissionsToSave)
      // Clear local changes after successful save
      setLocalChanges(new Map())
      setHasChanges(false)
    } catch (error) {
      console.error("Error saving permissions:", error)
    }
  }, [chucVuList, getPermission, batchUpsertMutation])

  const handleReset = React.useCallback(() => {
    setLocalChanges(new Map())
    setHasChanges(false)
  }, [])

  const selectedModule = MODULES.find(m => m.id === selectedModuleId)

  // Generate filter options for phòng ban
  const phongBanFilterOptions = React.useMemo(() => {
    if (!chucVuList || !phongBanList) return []

    // Get unique ma_phong_ban from chucVuList
    const uniquePhongs = Array.from(new Set(
      chucVuList.map(cv => cv.ma_phong_ban).filter((phong): phong is string => !!phong)
    ))

    return uniquePhongs.map(maPhong => {
      // Find phong ban with matching ma_phong_ban
      const phongBan = phongBanList.find(pb => pb.ma_phong_ban === maPhong)
      return {
        value: maPhong,
        label: phongBan ? `${maPhong} - ${phongBan.ten_phong_ban}` : maPhong
      }
    }).sort((a, b) => a.label.localeCompare(b.label))
  }, [chucVuList, phongBanList])

  // Filter chucVuList by selected phong
  const filteredChucVuList = React.useMemo(() => {
    if (!chucVuList || selectedPhongFilter === "all") return chucVuList

    return chucVuList.filter(cv => cv.ma_phong_ban === selectedPhongFilter)
  }, [chucVuList, selectedPhongFilter])

  // Group chức vụ theo Phòng -> Phòng ban
  const chucVusGroupedByPhong = React.useMemo(() => {
    if (!filteredChucVuList || !phongBanList) return []

    // Map: ma_phong -> Map<phong_ban_id, ChucVu[]>
    const groups = new Map<string | null, Map<number | null, ChucVu[]>>()

    filteredChucVuList.forEach(cv => {
      const maPhong = cv.ma_phong_ban || null
      const phongBanId = cv.phong_ban_id ?? null

      if (!groups.has(maPhong)) {
        groups.set(maPhong, new Map())
      }

      const phongBanMap = groups.get(maPhong)!
      if (!phongBanMap.has(phongBanId)) {
        phongBanMap.set(phongBanId, [])
      }
      phongBanMap.get(phongBanId)!.push(cv)
    })

    // Convert to array và lấy tên phòng / phòng ban
    const result: PhongGroup[] = []
    groups.forEach((phongBanMap, maPhong) => {
      // Tên nhóm cấp 1 (ma_phong)
      let tenPhong = "Không xác định phòng"
      if (maPhong) {
        const phongBanTheoMa = phongBanList.find(pb => pb.ma_phong_ban === maPhong)
        tenPhong = phongBanTheoMa ? `${maPhong} - ${phongBanTheoMa.ten_phong_ban}` : maPhong
      }

      const phongBanGroups: PhongBanGroup[] = []

      phongBanMap.forEach((chucVusInPhongBan, phongBanId) => {
        let tenPhongBan = "Không có phòng ban"

        if (phongBanId != null) {
          const pb = phongBanList.find(p => p.id === phongBanId)
          tenPhongBan = pb ? `${pb.ma_phong_ban} - ${pb.ten_phong_ban}` : `Phòng ban #${phongBanId}`
        } else if (maPhong) {
          const pb = phongBanList.find(p => p.ma_phong_ban === maPhong)
          tenPhongBan = pb ? `${pb.ma_phong_ban} - ${pb.ten_phong_ban}` : maPhong
        }

        phongBanGroups.push({
          phongBanId,
          tenPhongBan,
          chucVus: chucVusInPhongBan,
        })
      })

      // Sort phong ban trong mỗi nhóm
      phongBanGroups.sort((a, b) => {
        if (a.phongBanId === null && b.phongBanId !== null) return -1
        if (a.phongBanId !== null && b.phongBanId === null) return 1
        return a.tenPhongBan.localeCompare(b.tenPhongBan)
      })

      result.push({
        maPhong,
        tenPhong,
        phongBanGroups
      })
    })

    // Sort phòng
    result.sort((a, b) => {
      if (a.maPhong === null && b.maPhong !== null) return -1
      if (a.maPhong !== null && b.maPhong === null) return 1
      return a.tenPhong.localeCompare(b.tenPhong)
    })

    return result
  }, [filteredChucVuList, phongBanList])

  // Toggle all permissions for all chức vụ in a phòng ban
  const handleTogglePhongBanPermissions = React.useCallback((
    phongBanId: number | null,
    maPhong: string | null,
    moduleId: string,
    quyenKey: keyof Quyen,
    shouldSelect: boolean
  ) => {
    if (!filteredChucVuList) return

    const chucVusInPhongBan = filteredChucVuList.filter(cv => {
      if (phongBanId !== null) {
        return cv.phong_ban_id === phongBanId
      }
      return cv.phong_ban_id === null && cv.ma_phong_ban === maPhong
    })

    batchTogglePermission(
      chucVusInPhongBan.map(cv => cv.id).filter((id): id is number => id !== undefined),
      moduleId,
      quyenKey,
      shouldSelect
    )
  }, [filteredChucVuList, batchTogglePermission])

  // Toggle all permissions for all chức vụ in a phòng
  const handleTogglePhongPermissions = React.useCallback((
    maPhong: string | null,
    moduleId: string,
    quyenKey: keyof Quyen,
    shouldSelect: boolean
  ) => {
    if (!filteredChucVuList) return

    const chucVusInPhong = filteredChucVuList.filter(cv => cv.ma_phong_ban === maPhong)

    batchTogglePermission(
      chucVusInPhong.map(cv => cv.id).filter((id): id is number => id !== undefined),
      moduleId,
      quyenKey,
      shouldSelect
    )
  }, [filteredChucVuList, batchTogglePermission])

  const allChucVuIds = filteredChucVuList?.map(cv => cv.id).filter((id): id is number => id !== undefined) || []

  if (isLoadingChucVu || isLoadingPhanQuyen) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải phân quyền...</span>
      </div>
    )
  }

  if (!chucVuList || chucVuList.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <BriefcaseBusiness className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Chưa có chức vụ nào. Vui lòng tạo chức vụ trước.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 min-w-0">
        {/* Left Column: Module List with Search */}
        <Card className="lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)]">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm module..."
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-14rem)] sm:h-[calc(100vh-16rem)] lg:h-[calc(100vh-20rem)]">
              <div className="p-2 space-y-1">
                {Object.entries(filteredModulesByCategoryAndGroup).map(([category, groups]) => {
                  const isCategoryExpanded = expandedCategories.has(category)
                  return (
                    <div key={category} className="space-y-1">
                      {/* Category Level (Cấp 1) */}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-foreground hover:bg-accent rounded-md transition-colors"
                      >
                        {isCategoryExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span>{category}</span>
                      </button>
                      {isCategoryExpanded && (
                        <div className="ml-4 space-y-1">
                          {Object.entries(groups).map(([group, modules]) => {
                            const groupKey = `${category}::${group}`
                            const isGroupExpanded = expandedGroups.has(groupKey)
                            return (
                              <div key={groupKey} className="space-y-1">
                                {/* Group Level (Cấp 2) */}
                                <button
                                  onClick={() => toggleGroup(category, group)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent rounded-md transition-colors"
                                >
                                  {isGroupExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                  <span>{group}</span>
                                </button>
                                {isGroupExpanded && (
                                  <div className="ml-6 space-y-0.5">
                                    {modules.map(module => {
                                      const isSelected = selectedModuleId === module.id

                                      // Check if this module has any permissions
                                      const hasAnyPermission = chucVuList.some((cv) => {
                                        if (!cv.id) return false
                                        const quyen = getPermission(cv.id, module.id)
                                        return quyen.xem || quyen.them || quyen.sua || quyen.xoa || quyen.import || quyen.export || quyen.quan_tri
                                      })

                                      return (
                                        <button
                                          key={module.id}
                                          onClick={() => setSelectedModuleId(module.id)}
                                          className={cn(
                                            "w-full text-left px-3 py-2 rounded-md text-sm transition-all",
                                            "hover:bg-accent",
                                            isSelected
                                              ? "bg-primary text-primary-foreground font-medium"
                                              : "text-foreground",
                                            hasAnyPermission && !isSelected && "text-primary"
                                          )}
                                        >
                                          {module.name}
                                        </button>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Column: Permission Matrix */}
        <Card className="min-w-0 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
          <CardContent className="p-0 flex-1 min-h-0 min-w-0 flex flex-col">
            {/* Sticky Toolbar - Không scroll ngang */}
            <div
              className="flex-shrink-0 sticky top-0 z-30 bg-background border-b px-6 py-4"
              style={{
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
              }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold truncate">PHÒNG BAN</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedModule?.name || "Quản lý cơ cấu phòng ban và đơn vị trực thuộc"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  {hasChanges && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="hidden sm:inline">Có thay đổi chưa lưu</span>
                      <span className="sm:hidden">Có thay đổi</span>
                    </div>
                  )}
                  <Select value={selectedPhongFilter} onValueChange={setSelectedPhongFilter}>
                    <SelectTrigger className="w-full sm:w-[250px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Lọc theo phòng" />
                    </SelectTrigger>
                    <SelectContent className="z-[120]">
                      <SelectItem value="all">Tất cả phòng</SelectItem>
                      {phongBanFilterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={!hasChanges || batchUpsertMutation.isPending}
                      className="flex-1 sm:flex-initial"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Đặt lại</span>
                      <span className="sm:hidden">Reset</span>
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!hasChanges || batchUpsertMutation.isPending}
                      className="flex-1 sm:flex-initial"
                    >
                      {batchUpsertMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span className="hidden sm:inline">Đang lưu...</span>
                          <span className="sm:hidden">Lưu...</span>
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Lưu thay đổi</span>
                          <span className="sm:hidden">Lưu</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            {/* Table Container - Scroll ngang và dọc */}
            {selectedModule ? (
              <div
                className="flex-1 min-h-0 overflow-y-auto overflow-x-auto"
                style={{
                  scrollBehavior: 'smooth',
                }}
              >
                <style>{`
                  @media (min-width: 640px) {
                    th[data-sticky-left="50"],
                    td[data-sticky-left="50"] {
                      left: 60px !important;
                    }
                  }
                `}</style>
                <table className="w-full border-collapse" style={{ minWidth: '800px' }}>
                  <thead
                    className="bg-background border-b"
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 30,
                      backgroundColor: 'hsl(var(--background))',
                      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                    }}
                  >
                    <tr>
                      <th
                        className="border-r p-2 sm:p-3 text-center font-semibold text-xs sm:text-sm min-w-[50px] sm:min-w-[60px]"
                        style={{
                          position: 'sticky',
                          left: 0,
                          top: 0,
                          zIndex: 25,
                          boxShadow: '2px 0 6px -2px rgba(0, 0, 0, 0.15)',
                          borderRight: '1px solid hsl(var(--border) / 0.5)',
                          isolation: 'isolate',
                          transform: 'translateZ(0)',
                          willChange: 'transform',
                          backgroundClip: 'padding-box',
                          backgroundColor: 'hsl(var(--background))',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'white',
                            zIndex: 0,
                            pointerEvents: 'none',
                          }}
                        />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                        </div>
                      </th>
                      <th
                        className="border-r p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm min-w-[150px] sm:min-w-[250px]"
                        data-sticky-left="50"
                        style={{
                          position: 'sticky',
                          left: '50px',
                          top: 0,
                          zIndex: 25,
                          boxShadow: '2px 0 6px -2px rgba(0, 0, 0, 0.15)',
                          borderRight: '1px solid hsl(var(--border) / 0.5)',
                          isolation: 'isolate',
                          transform: 'translateZ(0)',
                          willChange: 'transform',
                          backgroundClip: 'padding-box',
                          backgroundColor: 'hsl(var(--background))',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'white',
                            zIndex: 0,
                            pointerEvents: 'none',
                          }}
                        />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                          Chức vụ
                        </div>
                      </th>
                      {selectedModule && QUYEN_LABELS.map(({ key, label }) => {
                        // Check if all chức vụ have this permission
                        const allChecked = allChucVuIds.length > 0 && allChucVuIds.every(chucVuId => {
                          const quyen = getPermission(chucVuId, selectedModule.id)
                          return quyen[key]
                        })

                        return (
                          <th
                            key={key}
                            className="p-1.5 sm:p-2 md:p-3 text-center font-semibold text-[10px] sm:text-xs md:text-sm min-w-[80px] sm:min-w-[100px] md:min-w-[120px] border-r last:border-r-0"
                          >
                            <div className="flex flex-col items-center gap-0.5 sm:gap-1 md:gap-2">
                              <span className="text-[10px] sm:text-xs md:text-sm leading-tight">{label}</span>
                              <Checkbox
                                checked={allChecked}
                                onCheckedChange={(checked) => {
                                  batchTogglePermission(allChucVuIds, selectedModule.id, key, !!checked)
                                }}
                                disabled={batchUpsertMutation.isPending}
                                className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 border-primary"
                              />
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {chucVusGroupedByPhong.map((phongGroup, phongIndex) => {
                      return (
                        <React.Fragment key={phongGroup.maPhong ?? `phong-${phongIndex}`}>
                          {/* Phòng Header Row */}
                          <tr className="bg-muted/40 border-b">
                            <td
                              className="border-r p-2 sm:p-2.5"
                              colSpan={2}
                              style={{
                                position: 'sticky',
                                left: 0,
                                zIndex: 20,
                                boxShadow: '2px 0 6px -2px rgba(0, 0, 0, 0.15)',
                                borderRight: '1px solid hsl(var(--border) / 0.5)',
                                isolation: 'isolate',
                                transform: 'translateZ(0)',
                                willChange: 'transform',
                                backgroundClip: 'padding-box',
                                backgroundColor: 'hsl(var(--muted) / 0.4)',
                              }}
                            >
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  backgroundColor: 'white',
                                  zIndex: 0,
                                  pointerEvents: 'none',
                                }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  backgroundColor: 'hsl(var(--muted) / 0.4)',
                                  zIndex: 1,
                                  pointerEvents: 'none',
                                }}
                              />
                              <div className="flex items-center gap-2" style={{ position: 'relative', zIndex: 2 }}>
                                <span className="font-semibold text-xs sm:text-sm text-foreground">{phongGroup.tenPhong}</span>
                              </div>
                            </td>
                            {QUYEN_LABELS.map(({ key }) => {
                              // Get all chức vụ IDs in this phòng
                              const allChucVuIdsInPhong = phongGroup.phongBanGroups
                                .flatMap(pb => pb.chucVus)
                                .map(cv => cv.id)
                                .filter((id): id is number => id !== undefined)

                              // Check if all chức vụ in phòng have this permission
                              const allChecked = allChucVuIdsInPhong.length > 0 && allChucVuIdsInPhong.every(chucVuId => {
                                const quyen = getPermission(chucVuId, selectedModule.id)
                                return quyen[key]
                              })

                              return (
                                <td
                                  key={key}
                                  className="bg-muted/40 p-1.5 sm:p-2 md:p-2.5 text-center border-r last:border-r-0"
                                >
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={allChecked}
                                      onCheckedChange={(checked) =>
                                        handleTogglePhongPermissions(phongGroup.maPhong, selectedModule.id, key, !!checked)
                                      }
                                      disabled={batchUpsertMutation.isPending}
                                      className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 border-primary"
                                    />
                                  </div>
                                </td>
                              )
                            })}
                          </tr>

                          {/* Phòng ban groups and chức vụ rows */}
                          {phongGroup.phongBanGroups.map((phongBanGroup, pbIndex) => {
                            const chucVuIdsInPhongBan = phongBanGroup.chucVus
                              .map(cv => cv.id)
                              .filter((id): id is number => id !== undefined)

                            // Only show phòng ban header if there are multiple phòng bans in the phòng
                            const showPhongBanHeader = phongGroup.phongBanGroups.length > 1

                            return (
                              <React.Fragment key={phongBanGroup.phongBanId ?? `pb-${pbIndex}`}>
                                {showPhongBanHeader && (
                                  <tr className="bg-muted/20 border-b">
                                    <td
                                      className="border-r p-2 sm:p-2 pl-3 sm:pl-5"
                                      colSpan={2}
                                      style={{
                                        position: 'sticky',
                                        left: 0,
                                        zIndex: 20,
                                        boxShadow: '2px 0 6px -2px rgba(0, 0, 0, 0.15)',
                                        borderRight: '1px solid hsl(var(--border) / 0.5)',
                                        isolation: 'isolate',
                                        transform: 'translateZ(0)',
                                        willChange: 'transform',
                                        backgroundClip: 'padding-box',
                                        backgroundColor: 'hsl(var(--muted) / 0.2)',
                                      }}
                                    >
                                      <div
                                        style={{
                                          position: 'absolute',
                                          inset: 0,
                                          backgroundColor: 'white',
                                          zIndex: 0,
                                          pointerEvents: 'none',
                                        }}
                                      />
                                      <div
                                        style={{
                                          position: 'absolute',
                                          inset: 0,
                                          backgroundColor: 'hsl(var(--muted) / 0.2)',
                                          zIndex: 1,
                                          pointerEvents: 'none',
                                        }}
                                      />
                                      <div className="flex items-center gap-2" style={{ position: 'relative', zIndex: 2 }}>
                                        <span className="font-medium text-xs text-muted-foreground">{phongBanGroup.tenPhongBan}</span>
                                      </div>
                                    </td>
                                    {QUYEN_LABELS.map(({ key }) => {
                                      const allChecked = chucVuIdsInPhongBan.length > 0 && chucVuIdsInPhongBan.every(chucVuId => {
                                        const quyen = getPermission(chucVuId, selectedModule.id)
                                        return quyen[key]
                                      })

                                      return (
                                        <td
                                          key={key}
                                          className="bg-muted/20 p-1.5 sm:p-2 md:p-2 text-center border-r last:border-r-0"
                                        >
                                          <div className="flex justify-center">
                                            <Checkbox
                                              checked={allChecked}
                                              onCheckedChange={(checked) =>
                                                handleTogglePhongBanPermissions(
                                                  phongBanGroup.phongBanId,
                                                  phongGroup.maPhong,
                                                  selectedModule.id,
                                                  key,
                                                  !!checked
                                                )
                                              }
                                              disabled={batchUpsertMutation.isPending}
                                              className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 border-primary"
                                            />
                                          </div>
                                        </td>
                                      )
                                    })}
                                  </tr>
                                )}

                                {/* Chức vụ rows */}
                                {phongBanGroup.chucVus.map((chucVu) => {
                                  if (!chucVu.id) return null
                                  const quyen = getPermission(chucVu.id, selectedModule.id)

                                  const allPermissionsSelected = QUYEN_LABELS.every(({ key }) => quyen[key])

                                  return (
                                    <tr
                                      key={chucVu.id}
                                      className="border-b hover:bg-muted/30 transition-colors"
                                    >
                                      <td
                                        className="border-r p-2 sm:p-2.5"
                                        style={{
                                          position: 'sticky',
                                          left: 0,
                                          zIndex: 20,
                                          boxShadow: '2px 0 6px -2px rgba(0, 0, 0, 0.15)',
                                          borderRight: '1px solid hsl(var(--border) / 0.5)',
                                          isolation: 'isolate',
                                          transform: 'translateZ(0)',
                                          willChange: 'transform',
                                          backgroundClip: 'padding-box',
                                          backgroundColor: 'hsl(var(--background))',
                                        }}
                                      >
                                        <div
                                          style={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundColor: 'hsl(var(--background))',
                                            zIndex: 0,
                                            pointerEvents: 'none',
                                          }}
                                        />
                                        <div className="flex justify-center" style={{ position: 'relative', zIndex: 10 }}>
                                          <Checkbox
                                            checked={allPermissionsSelected}
                                            onCheckedChange={(checked) =>
                                              handleToggleAllPermissions(chucVu.id!, selectedModule.id, !!checked)
                                            }
                                            disabled={batchUpsertMutation.isPending}
                                            className="h-3.5 w-3.5 sm:h-4 sm:w-4 border-primary"
                                          />
                                        </div>
                                      </td>
                                      <td
                                        className="border-r p-2 sm:p-2.5"
                                        data-sticky-left="50"
                                        style={{
                                          position: 'sticky',
                                          left: '50px',
                                          zIndex: 20,
                                          boxShadow: '2px 0 6px -2px rgba(0, 0, 0, 0.15)',
                                          borderRight: '1px solid hsl(var(--border) / 0.5)',
                                          isolation: 'isolate',
                                          transform: 'translateZ(0)',
                                          willChange: 'transform',
                                          backgroundClip: 'padding-box',
                                          backgroundColor: 'hsl(var(--background))',
                                        }}
                                      >
                                        <div
                                          style={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundColor: 'hsl(var(--background))',
                                            zIndex: 0,
                                            pointerEvents: 'none',
                                          }}
                                        />
                                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0" style={{ position: 'relative', zIndex: 10 }}>
                                          <BriefcaseBusiness className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                                          <div className="font-medium text-xs sm:text-sm truncate">{chucVu.ten_chuc_vu}</div>
                                        </div>
                                      </td>
                                      {QUYEN_LABELS.map(({ key, label: _label }) => {
                                        const hasPerm = quyen[key]
                                        return (
                                          <td
                                            key={key}
                                            className="p-1.5 sm:p-2 md:p-2.5 text-center border-r last:border-r-0"
                                          >
                                            <div className="flex justify-center" style={{ position: 'relative', zIndex: 10 }}>
                                              <Checkbox
                                                checked={hasPerm}
                                                onCheckedChange={(checked) =>
                                                  handlePermissionChange(chucVu.id!, selectedModule.id, key, !!checked)
                                                }
                                                disabled={batchUpsertMutation.isPending}
                                                className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 border-primary"
                                              />
                                            </div>
                                          </td>
                                        )
                                      })}
                                    </tr>
                                  )
                                })}
                              </React.Fragment>
                            )
                          })}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BriefcaseBusiness className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Chọn một module ở bên trái để bắt đầu phân quyền
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
