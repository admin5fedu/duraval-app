"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { 
    Calendar, 
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
import { toast } from "sonner"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useViecHangNgayWidgetState } from "../hooks/use-viec-hang-ngay-widget-state"
import { useViecHangNgayWidgetData } from "../hooks/use-viec-hang-ngay-widget-data"
import { useViecHangNgayWidgetSave } from "../hooks/use-viec-hang-ngay-widget-save"
import { useViecHangNgayWidgetHandlers } from "../hooks/use-viec-hang-ngay-widget-handlers"
import { SaveStatusText, getDayOfWeek } from "./viec-hang-ngay-widget.helpers"
import { isValidUrl } from "../utils/viec-hang-ngay-widget.utils"
import { MAX_LINKS_PER_ITEM } from "../constants/viec-hang-ngay-widget.constants"

export function ViecHangNgayWidget() {
    const { employee, employeeLoading } = useAuthStore()
    
    // State management hook
    const {
        state,
        refs,
        setters,
        helpers,
        location
    } = useViecHangNgayWidgetState()
    
    const {
        selectedDate,
        congViecList,
        expandedItemId,
        globalExpandAll,
        showFullViewDialog,
        linkErrors,
        saveStatus,
        lastSaved,
        isSaving,
        hasUnsavedChanges
    } = state
    
    const {
        setSelectedDate,
        setCurrentRecord,
        setCongViecList,
        setExpandedItemId,
        setGlobalExpandAll,
        setShowFullViewDialog,
        setLinkErrors,
        setSaveStatus,
        setLastSaved,
        setIsSaving,
        setHasUnsavedChanges
    } = setters
    
    const { setTypingFlags } = helpers

    // State để track pending date change và loading
    const [pendingDateChange, setPendingDateChange] = React.useState<{ direction: 'prev' | 'next' | 'today' | 'custom', newDate?: string } | null>(null)
    const [isChangingDate, setIsChangingDate] = React.useState(false)

    // Debounced resize function cho textarea để tối ưu performance
    const resizeTextareaRef = React.useRef<Map<HTMLElement, NodeJS.Timeout>>(new Map())
    const resizeTextarea = React.useCallback((target: HTMLTextAreaElement, minHeight: number = 40) => {
        // Clear previous timeout
        const existingTimeout = resizeTextareaRef.current.get(target)
        if (existingTimeout) {
            clearTimeout(existingTimeout)
        }
        
        // Debounce resize để tránh lag khi gõ nhanh
        const timeout = setTimeout(() => {
            target.style.height = 'auto'
            target.style.height = Math.max(minHeight, target.scrollHeight) + 'px'
            resizeTextareaRef.current.delete(target)
        }, 50) // 50ms debounce cho resize
        
        resizeTextareaRef.current.set(target, timeout)
    }, [])
    
    // Cleanup resizeTextareaRef khi unmount để tránh memory leak
    React.useEffect(() => {
        return () => {
            resizeTextareaRef.current.forEach((timeout) => {
                clearTimeout(timeout)
            })
            resizeTextareaRef.current.clear()
        }
    }, [])

    // Data loading hook
    const { isLoading } = useViecHangNgayWidgetData({
        employee,
        employeeLoading,
        state,
        refs,
        setCurrentRecord,
        setCongViecList,
        setHasUnsavedChanges,
        setSaveStatus
    })
    
    // Save hook
    const {
        performSave,
        handleInputBlur,
        getDataToSave,
        hasDataToSave,
        validateAllLinks
    } = useViecHangNgayWidgetSave({
        employee,
        state,
        refs,
        setCurrentRecord,
        setLinkErrors,
        setSaveStatus,
        setLastSaved,
        setIsSaving,
        setHasUnsavedChanges
    })
    
    // Handlers hook
    const {
        updateItem,
        updateLink,
        addLink,
        removeLink,
        toggleItemExpand,
        toggleGlobalExpand,
        navigateDate,
        goToToday
    } = useViecHangNgayWidgetHandlers({
        state,
        refs,
        setCongViecList,
        setLinkErrors,
        setTypingFlags
    })
    
    // Reset state on date change và clear loading state
    React.useEffect(() => {
        helpers.resetStateOnDateChange()
        // Clear loading state sau khi data đã load
        if (isChangingDate && !isLoading) {
            setIsChangingDate(false)
        }
    }, [selectedDate, helpers, isChangingDate, isLoading])
    
    // Save on navigation
    React.useEffect(() => {
        const currentPath = location.pathname
        if (refs.previousPathnameRef.current !== currentPath && refs.previousPathnameRef.current) {
            helpers.clearAllTimeouts()
            refs.isTypingRef.current = false
            refs.isUserTypingRef.current = false
            
            if (hasDataToSave()) {
                const dataToSave = getDataToSave()
                performSave(dataToSave, true, true).catch(err => {
                    console.error("Error saving on navigation:", err)
                })
            }
        }
        refs.previousPathnameRef.current = currentPath
    }, [location.pathname, hasDataToSave, getDataToSave, performSave, refs, helpers])

    // Helper functions for UI handlers
    const handleToggleItemExpand = React.useCallback((itemId: number) => {
        toggleItemExpand(itemId, expandedItemId, setExpandedItemId)
    }, [toggleItemExpand, expandedItemId, setExpandedItemId])
    
    const handleToggleGlobalExpand = React.useCallback(() => {
        toggleGlobalExpand(globalExpandAll, expandedItemId, setGlobalExpandAll, setExpandedItemId)
    }, [toggleGlobalExpand, globalExpandAll, expandedItemId, setGlobalExpandAll, setExpandedItemId])
    
    const handleNavigateDate = React.useCallback((direction: 'prev' | 'next') => {
        // Kiểm tra có unsaved changes không
        if (hasUnsavedChanges || refs.hasUnsavedChangesRef.current) {
            setPendingDateChange({ direction })
            return
        }
        // Nếu không có unsaved changes, chuyển ngày ngay
        setIsChangingDate(true)
        navigateDate(direction, selectedDate, setSelectedDate)
    }, [navigateDate, selectedDate, setSelectedDate, hasUnsavedChanges, refs])
    
    const handleGoToToday = React.useCallback(() => {
        // Kiểm tra có unsaved changes không
        if (hasUnsavedChanges || refs.hasUnsavedChangesRef.current) {
            setPendingDateChange({ direction: 'today' })
            return
        }
        // Nếu không có unsaved changes, chuyển ngày ngay
        setIsChangingDate(true)
        goToToday(setSelectedDate)
    }, [goToToday, setSelectedDate, hasUnsavedChanges, refs])
    
    const handleDateInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value
        // Kiểm tra có unsaved changes không
        if (hasUnsavedChanges || refs.hasUnsavedChangesRef.current) {
            setPendingDateChange({ direction: 'custom', newDate })
            return
        }
        // Nếu không có unsaved changes, chuyển ngày ngay
        setIsChangingDate(true)
        setSelectedDate(newDate)
    }, [setSelectedDate, hasUnsavedChanges, refs])
    
    const confirmDateChange = React.useCallback(async () => {
        if (!pendingDateChange) return
        
        // Force save trước khi chuyển ngày
        if (hasDataToSave()) {
            const dataToSave = getDataToSave()
            await performSave(dataToSave, true, true).catch(err => {
                console.error("Error saving before date change:", err)
            })
        }
        
        setIsChangingDate(true)
        
        if (pendingDateChange.direction === 'today') {
            goToToday(setSelectedDate)
        } else if (pendingDateChange.direction === 'custom' && pendingDateChange.newDate) {
            setSelectedDate(pendingDateChange.newDate)
        } else if (pendingDateChange.direction === 'prev' || pendingDateChange.direction === 'next') {
            navigateDate(pendingDateChange.direction, selectedDate, setSelectedDate)
        }
        
        setPendingDateChange(null)
    }, [pendingDateChange, hasDataToSave, getDataToSave, performSave, navigateDate, goToToday, selectedDate, setSelectedDate])
    
    const cancelDateChange = React.useCallback(() => {
        setPendingDateChange(null)
    }, [])

    // UI Logic - removed old implementations, now using hooks above
    
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
                        <SaveStatusText 
                            saveStatus={saveStatus} 
                            lastSaved={lastSaved} 
                            hasUnsavedChanges={hasUnsavedChanges}
                            isAutoSaving={isSaving && saveStatus === "saving"}
                        />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleToggleGlobalExpand}
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
                                onClick={() => handleNavigateDate('prev')}
                                className="h-8 w-8"
                                title="Ngày trước"
                                disabled={isChangingDate}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex-1 flex items-center gap-2">
                                <Input
                                    id="date-picker"
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateInputChange}
                                    className="flex-1"
                                    disabled={isChangingDate}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleGoToToday}
                                    className="h-8 w-8"
                                    title="Hôm nay"
                                    disabled={isChangingDate}
                                >
                                    <Calendar className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleNavigateDate('next')}
                                className="h-8 w-8"
                                title="Ngày sau"
                                disabled={isChangingDate}
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
                    {(isLoading || isChangingDate) ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-sm text-muted-foreground">
                                {isChangingDate ? "Đang tải dữ liệu..." : "Đang tải..."}
                            </span>
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
                                                    resizeTextarea(e.target as HTMLTextAreaElement, 40)
                                                }}
                                                onBlur={handleInputBlur}
                                                onInput={(e) => {
                                                    resizeTextarea(e.target as HTMLTextAreaElement, 40)
                                                }}
                                                ref={(el) => {
                                                    if (el && item.ke_hoach) {
                                                        // Initial resize không debounce
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
                                                    onClick={() => handleToggleItemExpand(item.id)}
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
                                                onClick={() => handleToggleItemExpand(item.id)}
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
                                                            resizeTextarea(e.target as HTMLTextAreaElement, 80)
                                                        }}
                                                        onBlur={handleInputBlur}
                                                        onInput={(e) => {
                                                            resizeTextarea(e.target as HTMLTextAreaElement, 80)
                                                        }}
                                                        ref={(el) => {
                                                            if (el && item.ket_qua) {
                                                                // Initial resize không debounce
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
                        if (refs.hasUnsavedChangesRef.current && !refs.isSavingRef.current && !isSaving) {
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
                                const links = item.links || []

                                // ✅ SỬA: Luôn hiển thị tất cả items, kể cả trống (để đảm bảo đủ từ 1, 2, 3...)
                                // Không return null nữa

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
                                                            resizeTextarea(e.target as HTMLTextAreaElement, 50)
                                                        }}
                                                        onBlur={handleInputBlur}
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
                                                        resizeTextarea(e.target as HTMLTextAreaElement, 50)
                                                    }}
                                                    onBlur={handleInputBlur}
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

            {/* Alert Dialog for unsaved changes warning */}
            <AlertDialog open={!!pendingDateChange} onOpenChange={(open) => !open && cancelDateChange()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có thay đổi chưa lưu</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có thay đổi chưa được lưu. Bạn có muốn lưu trước khi chuyển sang ngày khác không?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelDateChange}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDateChange}>
                            Lưu và chuyển ngày
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}

