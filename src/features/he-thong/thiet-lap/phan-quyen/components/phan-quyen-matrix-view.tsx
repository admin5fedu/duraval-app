"use client"

import * as React from "react"
import { useChucVu } from "@/features/he-thong/so-do/chuc-vu/hooks"
import { usePhongBan } from "@/features/he-thong/so-do/phong-ban/hooks"
import { usePhanQuyen, useBatchUpsertPhanQuyen } from "../hooks"
import type { ChucVu } from "@/features/he-thong/so-do/chuc-vu/schema"
import { MODULES, getModulesByGroup } from "../modules-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
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
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    new Set(Object.keys(getModulesByGroup()))
  )
  const [hasChanges, setHasChanges] = React.useState(false)
  const [selectedPhongFilter, setSelectedPhongFilter] = React.useState<string>("all")

  // Group modules by group
  const modulesByGroup = React.useMemo(() => {
    return getModulesByGroup()
  }, [])

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

  // Filter modules by search
  const filteredModulesByGroup = React.useMemo(() => {
    if (!moduleSearch.trim()) return modulesByGroup
    
    const searchLower = moduleSearch.toLowerCase()
    const filtered: Record<string, typeof MODULES> = {}
    
    Object.entries(modulesByGroup).forEach(([groupName, modules]) => {
      const filteredModules = modules.filter(m => 
        m.name.toLowerCase().includes(searchLower) ||
        m.description?.toLowerCase().includes(searchLower) ||
        m.id.toLowerCase().includes(searchLower)
      )
      if (filteredModules.length > 0) {
        filtered[groupName] = filteredModules
      }
    })
    
    return filtered
  }, [modulesByGroup, moduleSearch])

  // Get effective permission (server + local changes)
  const getPermission = React.useCallback((chucVuId: number, moduleId: string): Quyen => {
    const defaultQuyen: Quyen = {
      xem: false,
      them: false,
      sua: false,
      xoa: false,
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
        if (quyen.xem || quyen.them || quyen.sua || quyen.xoa || quyen.quan_tri) {
          permissionsToSave.push({
            chuc_vu_id: chucVu.id,
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

  const toggleGroup = React.useCallback((groupName: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupName)) {
        newSet.delete(groupName)
      } else {
        newSet.add(groupName)
      }
      return newSet
    })
  }, [])

  const selectedModule = MODULES.find(m => m.id === selectedModuleId)
  
  // Generate filter options for phòng ban
  const phongBanFilterOptions = React.useMemo(() => {
    if (!chucVuList || !phongBanList) return []
    
    // Get unique ma_phong from chucVuList
    const uniquePhongs = Array.from(new Set(
      chucVuList.map(cv => cv.ma_phong).filter((phong): phong is string => !!phong)
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
    
    return chucVuList.filter(cv => cv.ma_phong === selectedPhongFilter)
  }, [chucVuList, selectedPhongFilter])

  // Group chức vụ theo Phòng -> Phòng ban
  const chucVusGroupedByPhong = React.useMemo(() => {
    if (!filteredChucVuList || !phongBanList) return []
    
    // Map: ma_phong -> Map<phong_ban_id, ChucVu[]>
    const groups = new Map<string | null, Map<number | null, ChucVu[]>>()

    filteredChucVuList.forEach(cv => {
      const maPhong = cv.ma_phong || null
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
      return cv.phong_ban_id === null && cv.ma_phong === maPhong
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
    
    const chucVusInPhong = filteredChucVuList.filter(cv => cv.ma_phong === maPhong)
    
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
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
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
            <ScrollArea className="h-[calc(100vh-16rem)] lg:h-[calc(100vh-20rem)]">
              <div className="p-2 space-y-1">
                {Object.entries(filteredModulesByGroup).map(([groupName, modules]) => {
                  const isExpanded = expandedGroups.has(groupName)
                  return (
                    <div key={groupName} className="space-y-1">
                      <button
                        onClick={() => toggleGroup(groupName)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent rounded-md transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span>{groupName}</span>
                      </button>
                      {isExpanded && (
                        <div className="ml-6 space-y-0.5">
                          {modules.map(module => {
                            const isSelected = selectedModuleId === module.id
                            
                            // Check if this module has any permissions
                            const hasAnyPermission = chucVuList.some((cv) => {
                              if (!cv.id) return false
                              const quyen = getPermission(cv.id, module.id)
                              return quyen.xem || quyen.them || quyen.sua || quyen.xoa || quyen.quan_tri
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
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Column: Permission Matrix */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">PHÒNG BAN</CardTitle>
                <CardDescription className="mt-1 text-sm">
                  Quản lý cơ cấu phòng ban và đơn vị trực thuộc
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                {hasChanges && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="hidden sm:inline">Có thay đổi chưa lưu</span>
                  </div>
                )}
                <Select value={selectedPhongFilter} onValueChange={setSelectedPhongFilter}>
                  <SelectTrigger className="w-[250px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Lọc theo phòng" />
                  </SelectTrigger>
                  <SelectContent>
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
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Đặt lại
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || batchUpsertMutation.isPending}
                  >
                    {batchUpsertMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {selectedModule ? (
              <ScrollArea className="h-[calc(100vh-24rem)]">
                <div className="min-w-[800px]">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-20 bg-background border-b">
                      <tr>
                        <th className="sticky left-0 top-0 z-30 bg-background border-r p-3 text-center font-semibold text-sm min-w-[60px]">
                        </th>
                        <th className="sticky left-[60px] top-0 z-30 bg-background border-r p-3 text-left font-semibold text-sm min-w-[250px]">
                          Chức vụ
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
                              className="p-3 text-center font-semibold text-sm min-w-[120px] border-r last:border-r-0"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-sm">{label}</span>
                                <Checkbox
                                  checked={allChecked}
                                  onCheckedChange={(checked) => {
                                    batchTogglePermission(allChucVuIds, selectedModule.id, key, !!checked)
                                  }}
                                  disabled={batchUpsertMutation.isPending}
                                  className="h-4 w-4 border-primary"
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
                            <tr className="bg-muted/50 border-b border-t-2 border-primary/20">
                              <td className="sticky left-0 z-10 bg-muted/50 border-r p-3" colSpan={2}>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-foreground">{phongGroup.tenPhong}</span>
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
                                    className="bg-muted/50 p-3 text-center text-sm border-r last:border-r-0"
                                  >
                                    <div className="flex justify-center">
                                      <Checkbox
                                        checked={allChecked}
                                        onCheckedChange={(checked) =>
                                          handleTogglePhongPermissions(phongGroup.maPhong, selectedModule.id, key, !!checked)
                                        }
                                        disabled={batchUpsertMutation.isPending}
                                        className="h-4 w-4 border-primary"
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
                                    <tr className="bg-muted/30 border-b">
                                      <td className="sticky left-0 z-10 bg-muted/30 border-r p-2 pl-6" colSpan={2}>
                                        <div className="flex items-center gap-2">
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
                                            className="bg-muted/30 p-2 text-center text-sm border-r last:border-r-0"
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
                                                className="h-4 w-4 border-primary"
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
                                        className="border-b hover:bg-muted/50 transition-colors"
                                      >
                                        <td className="sticky left-0 z-10 bg-background border-r p-3">
                                          <div className="flex justify-center">
                                            <Checkbox
                                              checked={allPermissionsSelected}
                                              onCheckedChange={(checked) =>
                                                handleToggleAllPermissions(chucVu.id!, selectedModule.id, !!checked)
                                              }
                                              disabled={batchUpsertMutation.isPending}
                                              className="h-4 w-4 border-primary"
                                            />
                                          </div>
                                        </td>
                                        <td className="sticky left-[60px] z-10 bg-background border-r p-3">
                                          <div className="flex items-center gap-2">
                                            <BriefcaseBusiness className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <div className="font-medium text-sm">{chucVu.ten_chuc_vu}</div>
                                          </div>
                                        </td>
                                        {QUYEN_LABELS.map(({ key, label }) => {
                                          const hasPerm = quyen[key]
                                          return (
                                            <td
                                              key={key}
                                              className="p-3 text-center text-sm border-r last:border-r-0"
                                            >
                                              <div className="flex justify-center">
                                                <Checkbox
                                                  checked={hasPerm}
                                                  onCheckedChange={(checked) =>
                                                    handlePermissionChange(chucVu.id!, selectedModule.id, key, !!checked)
                                                  }
                                                  disabled={batchUpsertMutation.isPending}
                                                  className="h-4 w-4 border-primary"
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
              </ScrollArea>
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
