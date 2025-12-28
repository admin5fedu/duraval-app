"use client"

import * as React from "react"
import { useLocation } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
    Calendar, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    ChevronDown, 
    ChevronRight, 
    ChevronLeft, 
    Link2, 
    FileText, 
    AlertCircle as AlertCircleIcon, 
    ExternalLink, 
    Maximize2 
} from "lucide-react"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useViecHangNgayByDateAndEmployee } from "../hooks/use-viec-hang-ngay-by-date"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { viecHangNgayQueryKeys } from "@/lib/react-query/query-keys"
import { ViecHangNgayAPI } from "../../viec-hang-ngay/services/viec-hang-ngay.api"
import type { CreateViecHangNgayInput, UpdateViecHangNgayInput } from "../../viec-hang-ngay/schema"
import type { ViecHangNgay } from "../../viec-hang-ngay/schema"
import { toast } from "sonner"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface CongViec {
    id: number
    ke_hoach?: string
    ket_qua?: string
    links?: string[]
}

const MAX_LINKS_PER_ITEM = 3
const DEFAULT_ITEMS_COUNT = 10

function isValidUrl(url: string): boolean {
    try {
        const urlObj = new URL(url)
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
        return false
    }
}

export function ViecHangNgayWidget() {
    const { employee, employeeLoading } = useAuthStore()
    const location = useLocation()
    const [selectedDate, setSelectedDate] = React.useState<string>(format(new Date(), "yyyy-MM-dd"))
    const [currentRecord, setCurrentRecord] = React.useState<ViecHangNgay | null>(null)
    const [congViecList, setCongViecList] = React.useState<CongViec[]>([])
    const [expandedItemId, setExpandedItemId] = React.useState<number | null>(null)
    const [globalExpandAll, setGlobalExpandAll] = React.useState(false)
    const [showFullViewDialog, setShowFullViewDialog] = React.useState(false)
    const [linkErrors, setLinkErrors] = React.useState<Map<string, boolean>>(new Map())
    const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle")
    const [lastSaved, setLastSaved] = React.useState<Date | null>(null)
    const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const isInitialLoadRef = React.useRef(true)
    const previousDataRef = React.useRef<string>("")
    const hasUnsavedChangesRef = React.useRef(false)
    const isSavingRef = React.useRef(false)
    const previousPathnameRef = React.useRef<string>(location.pathname)

    const { data: viecHangNgayData, isLoading, refetch } = useViecHangNgayByDateAndEmployee(
        employee?.ma_nhan_vien,
        selectedDate,
        !employeeLoading && !!employee?.ma_nhan_vien
    )

    const queryClient = useQueryClient()

    // Custom mutations without toast for silent saves
    const createMutation = useMutation({
        mutationFn: async (input: CreateViecHangNgayInput) => {
            return await ViecHangNgayAPI.create(input)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ 
                queryKey: viecHangNgayQueryKeys.all(),
                exact: false
            })
            queryClient.setQueryData(
                viecHangNgayQueryKeys.byDateAndEmployee(
                    employee?.ma_nhan_vien || 0,
                    selectedDate
                ),
                data
            )
        },
    })

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateViecHangNgayInput }) => {
            return await ViecHangNgayAPI.update(id, data)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ 
                queryKey: viecHangNgayQueryKeys.all(),
                exact: false
            })
            queryClient.setQueryData(
                viecHangNgayQueryKeys.byDateAndEmployee(
                    employee?.ma_nhan_vien || 0,
                    selectedDate
                ),
                data
            )
        },
    })

    // Initialize với 10 công việc mặc định
    const initializeDefaultCongViec = React.useCallback(() => {
        return Array.from({ length: DEFAULT_ITEMS_COUNT }, (_, index) => ({
            id: index + 1,
            ke_hoach: '',
            ket_qua: '',
            links: [] as string[]
        }))
    }, [])

    // Load dữ liệu khi chọn ngày hoặc employee thay đổi
    React.useEffect(() => {
        if (employeeLoading || !employee?.ma_nhan_vien || !selectedDate) return
        if (isLoading) return

        isInitialLoadRef.current = true

        if (viecHangNgayData) {
            setCurrentRecord(viecHangNgayData)
            const chiTiet = Array.isArray(viecHangNgayData.chi_tiet_cong_viec) 
                ? viecHangNgayData.chi_tiet_cong_viec 
                : []
            
            const items = chiTiet.length > 0 
                ? (() => {
                    const existingItems = chiTiet.slice(0, DEFAULT_ITEMS_COUNT)
                    const maxId = existingItems.length > 0 
                        ? Math.max(...existingItems.map(item => item.id || 0), 0)
                        : 0
                    
                    const newItems = Array.from(
                        { length: Math.max(0, DEFAULT_ITEMS_COUNT - existingItems.length) }, 
                        (_, idx) => ({
                            id: maxId + idx + 1,
                            ke_hoach: '',
                            ket_qua: '',
                            links: []
                        })
                    )
                    
                    const merged = [...existingItems, ...newItems].slice(0, DEFAULT_ITEMS_COUNT)
                    
                    const seenIds = new Set<number>()
                    return merged.map((item, index) => {
                        let uniqueId = item.id || (index + 1)
                        while (seenIds.has(uniqueId)) {
                            uniqueId = (seenIds.size > 0 ? Math.max(...Array.from(seenIds)) : 0) + 1
                        }
                        seenIds.add(uniqueId)
                        return { ...item, id: uniqueId }
                    })
                })()
                : initializeDefaultCongViec()
            
            setCongViecList(items)
            setTimeout(() => {
                const filteredList = items.filter(item => 
                    item.ke_hoach?.trim() || 
                    item.ket_qua?.trim() || 
                    (item.links && item.links.length > 0 && item.links.some(link => link.trim()))
                )
                previousDataRef.current = JSON.stringify(filteredList)
                hasUnsavedChangesRef.current = false
                setSaveStatus("idle")
            }, 0)
        } else {
            const defaultItems = initializeDefaultCongViec()
            setCurrentRecord(null)
            setCongViecList(defaultItems)
            previousDataRef.current = JSON.stringify([])
            hasUnsavedChangesRef.current = false
            setSaveStatus("idle")
        }

        setTimeout(() => {
            isInitialLoadRef.current = false
        }, 100)
    }, [selectedDate, employee?.ma_nhan_vien, employeeLoading, viecHangNgayData, isLoading, initializeDefaultCongViec])

    // Hàm lấy dữ liệu cần save
    const getDataToSave = React.useCallback((): CongViec[] => {
        return congViecList.filter(item => 
            item.ke_hoach?.trim() || 
            item.ket_qua?.trim() || 
            (item.links && item.links.length > 0 && item.links.some(link => link.trim()))
        )
    }, [congViecList])

    // Validate tất cả links
    const validateAllLinks = React.useCallback((items: CongViec[]): boolean => {
        const errors = new Map<string, boolean>()
        let hasError = false
        
        items.forEach((item, itemIndex) => {
            const links = item.links || []
            links.forEach((link, linkIndex) => {
                if (link.trim() && !isValidUrl(link)) {
                    const linkKey = `${itemIndex}-${linkIndex}`
                    errors.set(linkKey, true)
                    hasError = true
                }
            })
        })
        
        setLinkErrors(errors)
        return !hasError
    }, [])

    // Hàm thực hiện save
    const performSave = React.useCallback(async (dataToSave: CongViec[], silent = false) => {
        if (!employee?.ma_nhan_vien || !selectedDate || isInitialLoadRef.current) return false

        if (isSavingRef.current) {
            return false
        }

        if (!validateAllLinks(dataToSave)) {
            if (!silent) {
                toast.error("Vui lòng sửa lại các link không hợp lệ. Link phải bắt đầu bằng http:// hoặc https://")
            }
            const firstErrorKey = Array.from(linkErrors.keys())[0]
            if (firstErrorKey) {
                const errorElement = document.querySelector(`[data-link-key="${firstErrorKey}"]`)
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    ;(errorElement as HTMLElement).focus()
                }
            }
            return false
        }

        isSavingRef.current = true
        if (!silent) {
            setSaveStatus("saving")
        }
        
        try {
            const dataPayload: Partial<ViecHangNgay> = {
                ma_nhan_vien: employee.ma_nhan_vien,
                ngay_bao_cao: selectedDate,
                chi_tiet_cong_viec: dataToSave
            }

            if (currentRecord?.id) {
                const updated = await updateMutation.mutateAsync({ 
                    id: currentRecord.id, 
                    data: dataPayload 
                })
                setCurrentRecord(updated)
                // Refetch để đảm bảo data sync
                await refetch()
            } else {
                if (dataToSave.length > 0) {
                    const created = await createMutation.mutateAsync(dataPayload as any)
                    setCurrentRecord(created)
                    // Refetch để đảm bảo data sync
                    await refetch()
                }
            }

            hasUnsavedChangesRef.current = false
            previousDataRef.current = JSON.stringify(dataToSave)
            
            if (!silent) {
                setSaveStatus("saved")
                setLastSaved(new Date())
                toast.success("Đã lưu thành công")
                // Reset status sau 3 giây
                setTimeout(() => {
                    setSaveStatus("idle")
                }, 3000)
            }
            
            return true
        } catch (error: any) {
            console.error("Lỗi khi lưu:", error)
            if (!silent) {
                setSaveStatus("error")
                toast.error(error.message || "Có lỗi xảy ra khi lưu dữ liệu")
                // Reset error status sau 5 giây
                setTimeout(() => {
                    setSaveStatus("idle")
                }, 5000)
            }
            return false
        } finally {
            isSavingRef.current = false
        }
    }, [employee?.ma_nhan_vien, selectedDate, currentRecord, createMutation, updateMutation, validateAllLinks, linkErrors])

    // Auto-save với debounce
    React.useEffect(() => {
        if (isLoading || isSavingRef.current || isInitialLoadRef.current) return

        const filteredList = congViecList.filter(item => 
            item.ke_hoach?.trim() || 
            item.ket_qua?.trim() || 
            (item.links && item.links.length > 0 && item.links.some(link => link.trim()))
        )
        
        const currentDataString = JSON.stringify(filteredList)
        
        if (currentDataString === previousDataRef.current) {
            return
        }
        
        hasUnsavedChangesRef.current = true
        
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = setTimeout(async () => {
            const latestFiltered = congViecList.filter(item => 
                item.ke_hoach?.trim() || 
                item.ket_qua?.trim() || 
                (item.links && item.links.length > 0 && item.links.some(link => link.trim()))
            )
            const latestDataString = JSON.stringify(latestFiltered)
            
            if (latestDataString === previousDataRef.current) {
                return
            }
            
            const success = await performSave(latestFiltered, true) // Silent auto-save (no toast)
            if (success) {
                previousDataRef.current = latestDataString
            }
        }, 2000)

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [congViecList, isLoading, performSave])

    // Lưu khi component unmount
    React.useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
            if (hasUnsavedChangesRef.current && !isSavingRef.current) {
                const dataToSave = congViecList.filter(item => 
                    item.ke_hoach?.trim() || 
                    item.ket_qua?.trim() || 
                    (item.links && item.links.length > 0 && item.links.some(link => link.trim()))
                )
                if (dataToSave.length > 0 && employee?.ma_nhan_vien && selectedDate) {
                    performSave(dataToSave, true).catch(err => {
                        console.error("Error saving on unmount:", err)
                    })
                }
            }
        }
    }, [congViecList, employee?.ma_nhan_vien, selectedDate, performSave])

    // Lưu khi đóng tab/trình duyệt
    React.useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChangesRef.current && !isSavingRef.current) {
                const dataToSave = congViecList.filter(item => 
                    item.ke_hoach?.trim() || 
                    item.ket_qua?.trim() || 
                    (item.links && item.links.length > 0 && item.links.some(link => link.trim()))
                )
                if (dataToSave.length > 0 && employee?.ma_nhan_vien && selectedDate) {
                    performSave(dataToSave, true).catch(() => {})
                }
                
                e.preventDefault()
                e.returnValue = ''
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [congViecList, employee?.ma_nhan_vien, selectedDate, performSave])

    // Lưu khi navigate
    React.useEffect(() => {
        if (previousPathnameRef.current !== location.pathname && previousPathnameRef.current) {
            if (hasUnsavedChangesRef.current && !isSavingRef.current) {
                performSave(getDataToSave(), true).catch(err => {
                    console.error("Error saving on navigation:", err)
                })
            }
        }
        previousPathnameRef.current = location.pathname
    }, [location.pathname, performSave, getDataToSave])

    const updateItem = React.useCallback((index: number, updates: Partial<CongViec>) => {
        setCongViecList(prev => {
            const newList = [...prev]
            newList[index] = { ...newList[index], ...updates }
            return newList
        })
    }, [])

    const toggleItemExpand = React.useCallback((itemId: number) => {
        setExpandedItemId(expandedItemId === itemId ? null : itemId)
    }, [expandedItemId])

    const toggleGlobalExpand = React.useCallback(() => {
        if (globalExpandAll) {
            setExpandedItemId(null)
        } else {
            const firstItemWithPlan = congViecList.find(item => item.ke_hoach?.trim())
            if (firstItemWithPlan) {
                setExpandedItemId(firstItemWithPlan.id)
            }
        }
        setGlobalExpandAll(!globalExpandAll)
    }, [globalExpandAll, congViecList])

    const getDayOfWeek = React.useCallback((dateString: string) => {
        const date = new Date(dateString + "T00:00:00")
        const dayOfWeek = date.getDay() // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
        const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
        return dayNames[dayOfWeek]
    }, [])

    const updateLink = React.useCallback((itemIndex: number, linkIndex: number, newLink: string) => {
        const item = congViecList[itemIndex]
        if (!item) return
        
        const links = item.links || []
        const newLinks = [...links]
        newLinks[linkIndex] = newLink
        updateItem(itemIndex, { links: newLinks })
        
        const linkKey = `${itemIndex}-${linkIndex}`
        if (newLink.trim()) {
            const isValid = isValidUrl(newLink)
            setLinkErrors(prev => {
                const newMap = new Map(prev)
                if (!isValid) {
                    newMap.set(linkKey, true)
                } else {
                    newMap.delete(linkKey)
                }
                return newMap
            })
        } else {
            setLinkErrors(prev => {
                const newMap = new Map(prev)
                newMap.delete(linkKey)
                return newMap
            })
        }
    }, [congViecList, updateItem])

    const addLink = React.useCallback((itemIndex: number) => {
        const item = congViecList[itemIndex]
        if (!item) return
        
        const links = item.links || []
        if (links.length >= MAX_LINKS_PER_ITEM) return
        
        const newLinks = [...links, '']
        updateItem(itemIndex, { links: newLinks })
    }, [congViecList, updateItem])

    const removeLink = React.useCallback((itemIndex: number, linkIndex: number) => {
        const item = congViecList[itemIndex]
        if (!item) return
        
        const links = item.links || []
        const newLinks = links.filter((_, idx) => idx !== linkIndex)
        updateItem(itemIndex, { links: newLinks })
        
        setLinkErrors(prev => {
            const newMap = new Map(prev)
            newMap.delete(`${itemIndex}-${linkIndex}`)
            const keysToUpdate: string[] = []
            newMap.forEach((_, key) => {
                const [itemIdx, linkIdx] = key.split('-').map(Number)
                if (itemIdx === itemIndex && linkIdx > linkIndex) {
                    keysToUpdate.push(key)
                }
            })
            keysToUpdate.forEach(oldKey => {
                const [itemIdx, linkIdx] = oldKey.split('-').map(Number)
                const newKey = `${itemIdx}-${linkIdx - 1}`
                const value = newMap.get(oldKey)
                if (value !== undefined) {
                    newMap.set(newKey, value)
                    newMap.delete(oldKey)
                }
            })
            return newMap
        })
    }, [congViecList, updateItem])

    const navigateDate = React.useCallback((direction: 'prev' | 'next') => {
        const currentDate = new Date(selectedDate + "T00:00:00")
        const newDate = new Date(currentDate)
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
        setSelectedDate(format(newDate, "yyyy-MM-dd"))
    }, [selectedDate])

    const goToToday = React.useCallback(() => {
        setSelectedDate(format(new Date(), "yyyy-MM-dd"))
    }, [])

    const getSaveStatusText = React.useCallback(() => {
        switch (saveStatus) {
            case "saving":
                return <span className="text-xs text-blue-500 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Đang lưu...</span>
            case "saved":
                return (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> 
                        Đã lưu {lastSaved && format(lastSaved, "HH:mm:ss", { locale: vi })}
                    </span>
                )
            case "error":
                return <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Lỗi lưu</span>
            default:
                if (hasUnsavedChangesRef.current) {
                    return <span className="text-xs text-amber-500">Có thay đổi chưa lưu</span>
                }
                return <span className="text-xs text-muted-foreground">Đã lưu</span>
        }
    }, [saveStatus, lastSaved])

    if (employeeLoading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Calendar className="h-5 w-5" />
                        Việc hàng ngày
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!employee?.ma_nhan_vien) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Calendar className="h-5 w-5" />
                        Việc hàng ngày
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        Không tìm thấy thông tin nhân viên
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader className="shrink-0 border-b pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl">Việc hàng ngày</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        {getSaveStatusText()}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={toggleGlobalExpand}
                                        className="h-8 w-8"
                                    >
                                        {globalExpandAll ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{globalExpandAll ? "Thu gọn tất cả" : "Mở rộng tất cả"}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setShowFullViewDialog(true)}
                                        className="h-8 w-8"
                                    >
                                        <Maximize2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Xem toàn bộ kế hoạch và báo cáo</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-0 overflow-hidden">
                <div className="sticky top-0 z-10 bg-card border-b px-6 pt-3 pb-2 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg flex-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigateDate('prev')}
                                className="h-8 w-8"
                                title="Ngày trước"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex-1 flex items-center gap-2">
                                <Input
                                    id="date-picker"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={goToToday}
                                    className="h-8 w-8"
                                    title="Hôm nay"
                                >
                                    <Calendar className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigateDate('next')}
                                className="h-8 w-8"
                                title="Ngày sau"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        {selectedDate && (
                            <Badge variant="outline" className="text-xs shrink-0">
                                {getDayOfWeek(selectedDate)}
                            </Badge>
                        )}
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : congViecList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground text-sm">Chưa có công việc nào</p>
                            <p className="text-muted-foreground text-xs mt-1">Nhập kế hoạch công việc để bắt đầu</p>
                        </div>
                    ) : (
                        <div className="space-y-3 pt-3">
                            {congViecList.map((item, itemIndex) => {
                                const isExpanded = expandedItemId === item.id
                                const hasPlan = item.ke_hoach?.trim()
                                const hasReport = item.ket_qua?.trim() || (item.links && item.links.length > 0 && item.links.some(link => link.trim()))
                                const links = item.links || []

                                return (
                                    <div key={`item-${itemIndex}-${item.id}`} className="relative group">
                                        <div className="flex items-start gap-3 p-2.5 rounded-lg border hover:border-primary/50 transition-colors bg-card">
                                            <span className="text-sm font-medium text-muted-foreground mt-1.5 min-w-[24px] flex-shrink-0">
                                                {item.id}
                                            </span>
                                            
                                            <Textarea
                                                placeholder={`Kế hoạch ${item.id}...`}
                                                value={item.ke_hoach || ''}
                                                onChange={(e) => {
                                                    updateItem(itemIndex, { ke_hoach: e.target.value })
                                                    const target = e.target as HTMLTextAreaElement
                                                    target.style.height = 'auto'
                                                    target.style.height = Math.max(40, target.scrollHeight) + 'px'
                                                }}
                                                onInput={(e) => {
                                                    const target = e.target as HTMLTextAreaElement
                                                    target.style.height = 'auto'
                                                    target.style.height = Math.max(40, target.scrollHeight) + 'px'
                                                }}
                                                ref={(el) => {
                                                    if (el && item.ke_hoach) {
                                                        el.style.height = 'auto'
                                                        el.style.height = Math.max(40, el.scrollHeight) + 'px'
                                                    }
                                                }}
                                                className="flex-1 resize-none border-0 shadow-none focus-visible:ring-1 text-sm"
                                                style={{ minHeight: '40px', maxHeight: 'none' }}
                                                rows={1}
                                            />
                                            
                                            {hasPlan && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => toggleItemExpand(item.id)}
                                                    className={cn(
                                                        "h-8 w-8 flex-shrink-0",
                                                        hasReport && "text-primary"
                                                    )}
                                                    title={hasReport ? "Chỉnh sửa báo cáo" : "Thêm báo cáo"}
                                                >
                                                    <FileText className={cn("h-4 w-4", hasReport && "fill-current")} />
                                                </Button>
                                            )}
                                        </div>
                                        
                                        {hasPlan && hasReport && !isExpanded && (
                                            <div 
                                                onClick={() => toggleItemExpand(item.id)}
                                                className="mt-2 mr-2.5 p-3 rounded-lg bg-muted/30 border-l-4 border-destructive/50 space-y-2.5 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                                            >
                                                {item.ket_qua?.trim() && (
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-muted-foreground">Kết quả:</p>
                                                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                                            {item.ket_qua}
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {links.length > 0 && links.some(link => link.trim() && isValidUrl(link)) && (() => {
                                                    const validLinks = links.filter(link => link.trim() && isValidUrl(link))
                                                    const MAX_VISIBLE_LINKS = 2
                                                    const visibleLinks = validLinks.slice(0, MAX_VISIBLE_LINKS)
                                                    const remainingCount = validLinks.length - MAX_VISIBLE_LINKS
                                                    
                                                    return (
                                                        <div className="space-y-1.5">
                                                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                                <Link2 className="h-3 w-3" />
                                                                Links:
                                                            </p>
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                {visibleLinks.map((link, linkIndex) => {
                                                                    const originalIndex = links.findIndex(l => l === link)
                                                                    return (
                                                                        <a
                                                                            key={`${itemIndex}-link-${originalIndex}-${linkIndex}`}
                                                                            href={link}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-background border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                                                                            title={link}
                                                                        >
                                                                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                                            <span className="max-w-[150px] truncate">{link}</span>
                                                                        </a>
                                                                    )
                                                                })}
                                                                {remainingCount > 0 && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        +{remainingCount} link{remainingCount > 1 ? 's' : ''}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })()}
                                            </div>
                                        )}
                                        
                                        {hasPlan && isExpanded && (
                                            <div className="mt-2 mr-2.5 p-3 rounded-lg bg-muted/30 border-l-4 border-primary space-y-3">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Kết quả thực hiện</Label>
                                                    <Textarea
                                                        placeholder="Kết quả thực hiện..."
                                                        value={item.ket_qua || ''}
                                                        onChange={(e) => {
                                                            updateItem(itemIndex, { ket_qua: e.target.value })
                                                            const target = e.target as HTMLTextAreaElement
                                                            target.style.height = 'auto'
                                                            target.style.height = Math.max(80, target.scrollHeight) + 'px'
                                                        }}
                                                        onInput={(e) => {
                                                            const target = e.target as HTMLTextAreaElement
                                                            target.style.height = 'auto'
                                                            target.style.height = Math.max(80, target.scrollHeight) + 'px'
                                                        }}
                                                        ref={(el) => {
                                                            if (el && item.ket_qua) {
                                                                el.style.height = 'auto'
                                                                el.style.height = Math.max(80, el.scrollHeight) + 'px'
                                                            }
                                                        }}
                                                        className="w-full resize-none text-sm"
                                                        style={{ minHeight: '80px', maxHeight: 'none' }}
                                                        rows={4}
                                                    />
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium flex items-center gap-2">
                                                        <Link2 className="h-4 w-4" />
                                                        Links
                                                    </Label>
                                                    {links.map((link, linkIndex) => {
                                                        const linkKey = `${itemIndex}-${linkIndex}`
                                                        const hasError = linkErrors.get(linkKey) || false
                                                        const showError = hasError && link.trim()
                                                        
                                                        return (
                                                            <div key={linkKey} className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex-1">
                                                                        <Input
                                                                            data-link-key={linkKey}
                                                                            placeholder="https://example.com"
                                                                            value={link}
                                                                            onChange={(e) => updateLink(itemIndex, linkIndex, e.target.value)}
                                                                            onBlur={() => {
                                                                                if (link.trim() && !isValidUrl(link)) {
                                                                                    setLinkErrors(prev => {
                                                                                        const newMap = new Map(prev)
                                                                                        newMap.set(linkKey, true)
                                                                                        return newMap
                                                                                    })
                                                                                } else if (link.trim() && isValidUrl(link)) {
                                                                                    setLinkErrors(prev => {
                                                                                        const newMap = new Map(prev)
                                                                                        newMap.delete(linkKey)
                                                                                        return newMap
                                                                                    })
                                                                                }
                                                                            }}
                                                                            className={cn(
                                                                                "flex-1 text-sm",
                                                                                showError && "border-destructive focus-visible:ring-destructive ring-destructive"
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    {link && isValidUrl(link) && (
                                                                        <a
                                                                            href={link}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-primary hover:underline flex-shrink-0"
                                                                            title="Mở link"
                                                                        >
                                                                            <Link2 className="h-4 w-4" />
                                                                        </a>
                                                                    )}
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 flex-shrink-0"
                                                                        onClick={() => {
                                                                            removeLink(itemIndex, linkIndex)
                                                                            setLinkErrors(prev => {
                                                                                const newMap = new Map(prev)
                                                                                newMap.delete(linkKey)
                                                                                return newMap
                                                                            })
                                                                        }}
                                                                        title="Xóa link"
                                                                    >
                                                                        ×
                                                                    </Button>
                                                                </div>
                                                                {showError && (
                                                                    <div className="flex items-center gap-1.5 text-xs text-destructive ml-1">
                                                                        <AlertCircleIcon className="h-3 w-3" />
                                                                        <span>Link không hợp lệ. Vui lòng nhập link bắt đầu bằng http:// hoặc https://</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                    {links.length < MAX_LINKS_PER_ITEM && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => addLink(itemIndex)}
                                                            className="w-full text-xs"
                                                        >
                                                            + Thêm link
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Full View Dialog */}
            <Dialog open={showFullViewDialog} onOpenChange={(open) => {
                if (!open) {
                    // Validate links trước khi đóng
                    const dataToSave = getDataToSave()
                    const isValid = validateAllLinks(dataToSave)
                    if (isValid) {
                        // Force save trước khi đóng dialog nếu có thay đổi
                        if (hasUnsavedChangesRef.current && !isSavingRef.current) {
                            performSave(dataToSave, false).then(() => {
                                setShowFullViewDialog(false)
                            }).catch(() => {
                                // Error đã được handle trong performSave
                            })
                        } else {
                            setShowFullViewDialog(false)
                        }
                    } else {
                        toast.error("Vui lòng sửa lại các link không hợp lệ trước khi đóng. Link phải bắt đầu bằng http:// hoặc https://")
                        // Scroll đến link lỗi đầu tiên
                        const firstErrorKey = Array.from(linkErrors.keys())[0]
                        if (firstErrorKey) {
                            setTimeout(() => {
                                const errorElement = document.querySelector(`[data-link-key="${firstErrorKey}"]`)
                                if (errorElement) {
                                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                    ;(errorElement as HTMLElement).focus()
                                }
                            }, 100)
                        }
                    }
                } else {
                    setShowFullViewDialog(true)
                }
            }}>
                <DialogContent className="!max-w-[85vw] w-[85vw] max-h-[95vh] h-[95vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            Kế hoạch và Báo cáo - {selectedDate && (() => {
                                const date = new Date(selectedDate + "T00:00:00")
                                const dayOfWeek = format(date, "EEEE", { locale: vi })
                                const dateStr = format(date, "dd/MM/yyyy", { locale: vi })
                                const maNV = employee?.ma_nhan_vien || ""
                                const tenNV = employee?.ho_ten || ""
                                return `${dateStr} (${dayOfWeek}) - ${maNV} - ${tenNV}`
                            })()}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto">
                        <div className="space-y-0.5">
                            {congViecList.map((item, itemIndex) => {
                                const hasPlan = item.ke_hoach?.trim()
                                const hasReport = item.ket_qua?.trim() || (item.links && item.links.length > 0 && item.links.some(link => link.trim()))
                                const links = item.links || []

                                if (!hasPlan && !hasReport) return null

                                return (
                                    <div 
                                        key={`fullview-${itemIndex}-${item.id}`} 
                                        className={cn(
                                            "p-3 transition-colors",
                                            itemIndex % 2 === 0 ? "bg-muted/30" : "bg-background"
                                        )}
                                    >
                                        <div className="grid grid-cols-[2fr_2fr_0.5fr] gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-start gap-2">
                                                    <span className="text-sm font-semibold text-muted-foreground min-w-[32px] flex-shrink-0 pt-2.5">#{item.id}</span>
                                                    <Textarea
                                                        placeholder={`Kế hoạch ${item.id}...`}
                                                        value={item.ke_hoach || ''}
                                                        onChange={(e) => {
                                                            updateItem(itemIndex, { ke_hoach: e.target.value })
                                                            const target = e.target as HTMLTextAreaElement
                                                            target.style.height = 'auto'
                                                            target.style.height = Math.max(50, target.scrollHeight) + 'px'
                                                        }}
                                                        className="flex-1 resize-none text-sm border-0 shadow-none focus-visible:ring-1 bg-transparent"
                                                        style={{ minHeight: '50px', maxHeight: 'none' }}
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <Textarea
                                                    placeholder="Kết quả thực hiện..."
                                                    value={item.ket_qua || ''}
                                                    onChange={(e) => {
                                                        updateItem(itemIndex, { ket_qua: e.target.value })
                                                        const target = e.target as HTMLTextAreaElement
                                                        target.style.height = 'auto'
                                                        target.style.height = Math.max(50, target.scrollHeight) + 'px'
                                                    }}
                                                    className="w-full resize-none text-sm border-0 shadow-none focus-visible:ring-1 bg-transparent"
                                                    style={{ minHeight: '50px', maxHeight: 'none' }}
                                                    rows={2}
                                                />
                                            </div>
                                            
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        {links.filter(l => l.trim() && isValidUrl(l)).length} link{links.filter(l => l.trim() && isValidUrl(l)).length !== 1 ? 's' : ''}
                                                    </span>
                                                    {links.length < MAX_LINKS_PER_ITEM && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => addLink(itemIndex)}
                                                            className="h-6 px-2 text-xs"
                                                        >
                                                            + Thêm
                                                        </Button>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-col gap-1">
                                                    {links.map((link, linkIndex) => {
                                                        const linkKey = `${itemIndex}-${linkIndex}`
                                                        const hasError = linkErrors.get(linkKey) || false
                                                        const isValid = !link || isValidUrl(link)
                                                        const showError = hasError && link.trim()
                                                        
                                                        if (!link.trim()) {
                                                            return (
                                                                <div key={linkKey} className="flex items-center gap-1">
                                                                    <Input
                                                                        data-link-key={linkKey}
                                                                        placeholder="https://..."
                                                                        value={link}
                                                                        onChange={(e) => updateLink(itemIndex, linkIndex, e.target.value)}
                                                                        onBlur={() => {
                                                                            if (link.trim() && !isValidUrl(link)) {
                                                                                setLinkErrors(prev => {
                                                                                    const newMap = new Map(prev)
                                                                                    newMap.set(linkKey, true)
                                                                                    return newMap
                                                                                })
                                                                            } else if (link.trim() && isValidUrl(link)) {
                                                                                setLinkErrors(prev => {
                                                                                    const newMap = new Map(prev)
                                                                                    newMap.delete(linkKey)
                                                                                    return newMap
                                                                                })
                                                                            }
                                                                        }}
                                                                        className={cn(
                                                                            "h-6 text-xs flex-1",
                                                                            showError && "border-destructive focus-visible:ring-destructive ring-destructive"
                                                                        )}
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6"
                                                                        onClick={() => {
                                                                            removeLink(itemIndex, linkIndex)
                                                                            setLinkErrors(prev => {
                                                                                const newMap = new Map(prev)
                                                                                newMap.delete(linkKey)
                                                                                return newMap
                                                                            })
                                                                        }}
                                                                        title="Xóa"
                                                                    >
                                                                        ×
                                                                    </Button>
                                                                </div>
                                                            )
                                                        }
                                                        
                                                        if (isValid && isValidUrl(link)) {
                                                            return (
                                                                <div key={linkKey} className="flex items-center gap-1">
                                                                    <a
                                                                        href={link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded border border-primary/20 transition-colors flex-1 truncate"
                                                                        title={link}
                                                                    >
                                                                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                                        <span className="truncate">{new URL(link).hostname.replace('www.', '')}</span>
                                                                    </a>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6"
                                                                        onClick={() => {
                                                                            removeLink(itemIndex, linkIndex)
                                                                            setLinkErrors(prev => {
                                                                                const newMap = new Map(prev)
                                                                                newMap.delete(linkKey)
                                                                                return newMap
                                                                            })
                                                                        }}
                                                                        title="Xóa link"
                                                                    >
                                                                        ×
                                                                    </Button>
                                                                </div>
                                                            )
                                                        }
                                                        
                                                        return (
                                                            <div key={linkKey} className="flex items-center gap-1">
                                                                <Input
                                                                    data-link-key={linkKey}
                                                                    value={link}
                                                                    onChange={(e) => updateLink(itemIndex, linkIndex, e.target.value)}
                                                                    onBlur={() => {
                                                                        if (link.trim() && !isValidUrl(link)) {
                                                                            setLinkErrors(prev => {
                                                                                const newMap = new Map(prev)
                                                                                newMap.set(linkKey, true)
                                                                                return newMap
                                                                            })
                                                                        } else if (link.trim() && isValidUrl(link)) {
                                                                            setLinkErrors(prev => {
                                                                                const newMap = new Map(prev)
                                                                                newMap.delete(linkKey)
                                                                                return newMap
                                                                            })
                                                                        }
                                                                    }}
                                                                    className="h-6 text-xs flex-1 border-destructive focus-visible:ring-destructive ring-destructive"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={() => {
                                                                        removeLink(itemIndex, linkIndex)
                                                                        setLinkErrors(prev => {
                                                                            const newMap = new Map(prev)
                                                                            newMap.delete(linkKey)
                                                                            return newMap
                                                                        })
                                                                    }}
                                                                    title="Xóa"
                                                                >
                                                                    ×
                                                                </Button>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                
                                                {links.some((link, idx) => {
                                                    const key = `${itemIndex}-${idx}`
                                                    return linkErrors.get(key) && link.trim()
                                                }) && (
                                                    <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                                                        <AlertCircleIcon className="h-3 w-3 flex-shrink-0" />
                                                        <span className="truncate">Link không hợp lệ</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    )
}

