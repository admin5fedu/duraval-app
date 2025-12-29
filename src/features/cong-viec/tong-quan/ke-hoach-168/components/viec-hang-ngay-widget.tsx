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
import type { CreateViecHangNgayInput, UpdateViecHangNgayInput } from "../../viec-hang-ngay/types"
import type { ViecHangNgay } from "../../viec-hang-ngay/schema"
import { toast } from "sonner"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { supabase } from "@/lib/supabase"

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
    // State để track saving status (dùng trong auto-save effect)
    const [isSaving, setIsSaving] = React.useState(false)
    // State để track unsaved changes (debounce để tránh nhấp nháy)
    const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)
    const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const statusUpdateTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const isInitialLoadRef = React.useRef(true)
    const previousDataRef = React.useRef<string>("")
    const hasUnsavedChangesRef = React.useRef(false)
    const isSavingRef = React.useRef(false)
    const previousPathnameRef = React.useRef<string>(location.pathname)
    // ✅ Chuyên nghiệp: Track trạng thái đang gõ để chặn auto-save
    const isTypingRef = React.useRef(false)
    const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    // ✅ FIX: Track khi user đang gõ để chặn load effect ghi đè state
    const isUserTypingRef = React.useRef(false)
    // ✅ Chuyên nghiệp: Track dữ liệu đang save để tránh duplicate requests
    const savingDataRef = React.useRef<string | null>(null)
    // ✅ Guard để tránh nhiều blur save cùng lúc
    const isBlurSavingRef = React.useRef(false)
    // ✅ FIX DỨT ĐIỂM: Track retry count và previous date để reset khi chuyển ngày
    const consecutiveErrorCountRef = React.useRef(0)
    const previousSelectedDateRef = React.useRef<string>(selectedDate)
    const MAX_CONSECUTIVE_ERRORS = 3

    const { data: viecHangNgayData, isLoading } = useViecHangNgayByDateAndEmployee(
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
            // ✅ BỎ invalidateQueries để tránh trigger refetch (gây request GET mỗi khi gõ)
            // Chỉ update cache thủ công bằng setQueryData
            if (employee?.ma_nhan_vien && selectedDate && viecHangNgayQueryKeys?.byDateAndEmployee) {
                queryClient.setQueryData(
                    viecHangNgayQueryKeys.byDateAndEmployee(
                        employee.ma_nhan_vien,
                        selectedDate
                    ),
                    data
                )
            }
        },
    })

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateViecHangNgayInput }) => {
            return await ViecHangNgayAPI.update(id, data)
        },
        onSuccess: (data) => {
            // ✅ Reset error count khi success
            consecutiveErrorCountRef.current = 0
            // ✅ BỎ invalidateQueries để tránh trigger refetch (gây request GET mỗi khi gõ)
            // Chỉ update cache thủ công bằng setQueryData
            if (employee?.ma_nhan_vien && selectedDate && viecHangNgayQueryKeys?.byDateAndEmployee) {
                queryClient.setQueryData(
                    viecHangNgayQueryKeys.byDateAndEmployee(
                        employee.ma_nhan_vien,
                        selectedDate
                    ),
                    data
                )
            }
        },
        onError: (error: any) => {
            // ✅ Xử lý lỗi 406 đặc biệt
            if (error.message?.includes("406") || error.message?.includes("Not Acceptable")) {
                console.error("Lỗi 406 - Không có quyền truy cập:", error)
            }
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
        
        // ✅ FIX DỨT ĐIỂM: Chỉ chặn load khi đang gõ trong CÙNG ngày, KHÔNG chặn khi chuyển ngày
        // Đây là nguyên nhân gốc rễ: setQueryData trigger load effect → ghi đè state đang gõ
        if (previousSelectedDateRef.current === selectedDate && 
            (isUserTypingRef.current || (hasUnsavedChangesRef.current && !isInitialLoadRef.current))) {
            return // Giữ nguyên dữ liệu đang gõ (chỉ trong cùng ngày)
        }

        isInitialLoadRef.current = true

        if (viecHangNgayData) {
            setCurrentRecord(viecHangNgayData)
            const chiTiet = Array.isArray(viecHangNgayData.chi_tiet_cong_viec) 
                ? viecHangNgayData.chi_tiet_cong_viec 
                : []
            
            // ✅ FIX: Merge thông minh - giữ lại dữ liệu user đang gõ, chỉ update từ database
            // Thay vì ghi đè hoàn toàn, merge để bảo vệ dữ liệu đang gõ
            setCongViecList(prev => {
                // Tạo map để dễ lookup items từ database theo ID
                const itemsMap = new Map<number, CongViec>()
                chiTiet.forEach(item => {
                    if (item.id) {
                        itemsMap.set(item.id, item)
                    }
                })
                
                // Merge: Ưu tiên dữ liệu đang gõ, fallback về database
                return Array.from({ length: DEFAULT_ITEMS_COUNT }, (_, index) => {
                    const itemId = index + 1
                    const existingInState = prev.find(item => item.id === itemId)
                    const existingInDB = itemsMap.get(itemId)
                    
                    // ✅ Nếu user đang gõ (có nội dung), giữ lại dữ liệu đang gõ
                    if (existingInState && (
                        existingInState.ke_hoach?.trim() || 
                        existingInState.ket_qua?.trim() || 
                        (existingInState.links && existingInState.links.length > 0 && existingInState.links.some((link: string) => link?.trim()))
                    )) {
                        // ✅ FIX: Giữ nguyên toàn bộ dữ liệu đang gõ (không merge với DB)
                        // Vì user đang gõ, ưu tiên dữ liệu từ state
                        return existingInState
                    }
                    
                    // Nếu không có dữ liệu đang gõ, dùng từ database hoặc tạo mới
                    return existingInDB || {
                        id: itemId,
                        ke_hoach: '',
                        ket_qua: '',
                        links: []
                    }
                })
            })
            
            // Update previousDataRef sau khi merge
            setTimeout(() => {
                setCongViecList(currentList => {
                    const filteredList = currentList.filter(item => 
                        item.ke_hoach?.trim() || 
                        item.ket_qua?.trim() || 
                        (item.links && item.links.length > 0 && item.links.some((link: string) => link?.trim()))
                    )
                    previousDataRef.current = JSON.stringify(filteredList)
                    return currentList
                })
                hasUnsavedChangesRef.current = false
                setHasUnsavedChanges(false)
                setSaveStatus("idle")
            }, 0)
        } else {
            // ✅ FIX: Khi không có data, chỉ set default nếu chưa có dữ liệu đang gõ
            setCongViecList(prev => {
                // Nếu đã có dữ liệu đang gõ, giữ lại
                const hasUserData = prev.some(item => 
                    item.ke_hoach?.trim() || 
                    item.ket_qua?.trim() || 
                    (item.links && item.links.length > 0 && item.links.some((link: string) => link?.trim()))
                )
                
                if (hasUserData) {
                    // Đảm bảo có đủ DEFAULT_ITEMS_COUNT items
                    const currentLength = prev.length
                    if (currentLength < DEFAULT_ITEMS_COUNT) {
                        const defaultItems = initializeDefaultCongViec()
                        // Merge: giữ items đang có, thêm items trống cho các vị trí còn thiếu
                        const merged = [...prev]
                        for (let i = currentLength; i < DEFAULT_ITEMS_COUNT; i++) {
                            merged.push(defaultItems[i])
                        }
                        return merged
                    }
                    return prev
                }
                
                // Nếu không có dữ liệu đang gõ, set default
                const defaultItems = initializeDefaultCongViec()
                setCurrentRecord(null)
                previousDataRef.current = JSON.stringify([])
                hasUnsavedChangesRef.current = false
                setHasUnsavedChanges(false)
                setSaveStatus("idle")
                return defaultItems
            })
        }

        setTimeout(() => {
            isInitialLoadRef.current = false
        }, 100)
    }, [selectedDate, employee?.ma_nhan_vien, employeeLoading, viecHangNgayData, isLoading, initializeDefaultCongViec])

    // ✅ FIX DỨT ĐIỂM: Reset tất cả state/refs khi chuyển ngày
    React.useEffect(() => {
        // Chỉ reset khi selectedDate thực sự thay đổi
        if (previousSelectedDateRef.current === selectedDate) return
        
        // Reset tất cả refs và state khi chuyển ngày
        previousSelectedDateRef.current = selectedDate
        consecutiveErrorCountRef.current = 0
        hasUnsavedChangesRef.current = false
        setHasUnsavedChanges(false)
        isUserTypingRef.current = false
        isTypingRef.current = false
        isSavingRef.current = false
        savingDataRef.current = null
        previousDataRef.current = ""
        isInitialLoadRef.current = true
        setSaveStatus("idle")
        setCurrentRecord(null)
        
        // Clear tất cả timeouts
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
            saveTimeoutRef.current = null
        }
        if (statusUpdateTimeoutRef.current) {
            clearTimeout(statusUpdateTimeoutRef.current)
            statusUpdateTimeoutRef.current = null
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = null
        }
    }, [selectedDate])

    // Hàm lấy dữ liệu cần save
    const getDataToSave = React.useCallback((): CongViec[] => {
        return congViecList.filter(item => 
            item.ke_hoach?.trim() || 
            item.ket_qua?.trim() || 
            (item.links && item.links.length > 0 && item.links.some(link => link.trim()))
        )
    }, [congViecList])

    // ✅ Helper: Check xem có dữ liệu cần save không (dựa trên dữ liệu thực tế, không phải ref)
    const hasDataToSave = React.useCallback((): boolean => {
        const dataToSave = getDataToSave()
        if (dataToSave.length === 0) return false
        
        const currentDataString = JSON.stringify(dataToSave)
        return currentDataString !== previousDataRef.current
    }, [getDataToSave])

    // ✅ Helper: Gọi fetch với keepalive cho beforeunload/unmount (không dùng sendBeacon vì không hỗ trợ PATCH và Header Auth)
    const saveWithKeepalive = React.useCallback(async (dataToSave: CongViec[]): Promise<void> => {
        if (!employee?.ma_nhan_vien || !selectedDate) return
        
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.access_token) {
                console.warn("No session token available for keepalive save")
                return
            }

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || ''
            const TABLE_NAME = "cong_viec_viec_hang_ngay"

            if (currentRecord?.id) {
                // Update existing record
                const url = `${supabaseUrl}/rest/v1/${TABLE_NAME}?id=eq.${currentRecord.id}&select=*`
                const payload = {
                    chi_tiet_cong_viec: dataToSave
                }
                
                await fetch(url, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseAnonKey,
                        'Authorization': `Bearer ${session.access_token}`,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(payload),
                    keepalive: true // ✅ Đảm bảo request được gửi ngay cả khi trang đóng
                })
            } else {
                // Create new record
                const url = `${supabaseUrl}/rest/v1/${TABLE_NAME}?select=*`
                const payload = {
                    ma_nhan_vien: employee.ma_nhan_vien,
                    ngay_bao_cao: selectedDate,
                    chi_tiet_cong_viec: dataToSave
                }
                
                await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseAnonKey,
                        'Authorization': `Bearer ${session.access_token}`,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(payload),
                    keepalive: true // ✅ Đảm bảo request được gửi ngay cả khi trang đóng
                })
            }
        } catch (error) {
            console.error("Error saving with keepalive:", error)
        }
    }, [employee?.ma_nhan_vien, selectedDate, currentRecord])

    // ✅ Chuyên nghiệp: Debounce congViecList để chỉ save sau khi dừng gõ 3 giây
    // Debounce 3 giây - chỉ trigger khi user dừng gõ 3 giây
    const debouncedCongViecList = useDebounce(congViecList, 3000)

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

    // Hàm thực hiện save (đơn giản hóa, bỏ queue, bỏ refetch)
    const performSave = React.useCallback(async (dataToSave: CongViec[], silent = false, force = false): Promise<boolean> => {
        if (!employee?.ma_nhan_vien || !selectedDate || isInitialLoadRef.current) return false

        // ✅ Force save: Bypass isSaving check nếu là force save (navigate/unmount)
        if (!force) {
            // ✅ Chuyên nghiệp: Xử lý race condition - đợi request cũ xong nếu đang save
            // Sau đó check lại dữ liệu mới nhất để đảm bảo lưu đúng
            if (isSavingRef.current || isSaving) {
                // Đợi request cũ xong (tối đa 5 giây)
                let waitCount = 0
                while ((isSavingRef.current || isSaving) && waitCount < 50) {
                    await new Promise(resolve => setTimeout(resolve, 100))
                    waitCount++
                }
                
                // Sau khi đợi xong, lấy dữ liệu mới nhất (có thể đã thay đổi)
                const latestDataToSave = getDataToSave()
                const latestDataString = JSON.stringify(latestDataToSave)
                const currentDataString = JSON.stringify(dataToSave)
                
                // Nếu dữ liệu khác → dùng dữ liệu mới nhất
                if (latestDataString !== currentDataString) {
                    dataToSave = latestDataToSave
                }
                
                // Check lại sau khi đợi
                if (isSavingRef.current || isSaving) {
                    console.warn("Save request still in progress, skipping duplicate save")
                    return false
                }
            }
        }

        // Validate links
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

        // Set flags để chống race condition
        isSavingRef.current = true
        setIsSaving(true)
        if (!silent) {
            setSaveStatus("saving")
        }
        
        try {
            let savedRecord: ViecHangNgay | null = null

            if (currentRecord?.id) {
                // ✅ Tối ưu: Khi update, chỉ gửi chi_tiet_cong_viec (không gửi ma_nhan_vien và ngay_bao_cao)
                // Để tránh trigger checkDuplicateReport không cần thiết
                const updatePayload: Partial<ViecHangNgay> = {
                    chi_tiet_cong_viec: dataToSave
                }
                savedRecord = await updateMutation.mutateAsync({ 
                    id: currentRecord.id, 
                    data: updatePayload 
                })
                // ✅ KHÔNG update currentRecord ngay - tránh trigger re-render và ghi đè dữ liệu đang gõ
                // setCurrentRecord(savedRecord) // BỎ DÒNG NÀY
            } else {
                // Khi create, cần gửi đầy đủ thông tin
                if (dataToSave.length > 0) {
                    const createPayload: Partial<ViecHangNgay> = {
                        ma_nhan_vien: employee.ma_nhan_vien,
                        ngay_bao_cao: selectedDate,
                        chi_tiet_cong_viec: dataToSave
                    }
                    savedRecord = await createMutation.mutateAsync(createPayload as any)
                    // ✅ CHỈ update currentRecord khi create (lần đầu), không update khi update
                    setCurrentRecord(savedRecord)
                }
            }

            // ✅ Update query cache thủ công (KHÔNG refetch để tránh ghi đè dữ liệu đang gõ)
            if (savedRecord && employee?.ma_nhan_vien && selectedDate && viecHangNgayQueryKeys?.byDateAndEmployee) {
                queryClient.setQueryData(
                    viecHangNgayQueryKeys.byDateAndEmployee(
                        employee.ma_nhan_vien,
                        selectedDate
                    ),
                    savedRecord
                )
            }

            // ✅ Cập nhật mốc so sánh NGAY SAU KHI API thành công
            hasUnsavedChangesRef.current = false
            setHasUnsavedChanges(false) // ✅ Cập nhật state để trigger re-render status
            previousDataRef.current = JSON.stringify(dataToSave)
            // ✅ Clear saving data ref sau khi save thành công
            savingDataRef.current = null
            // ✅ FIX: Clear flag đang gõ sau khi save thành công (cho phép load effect chạy lại nếu cần)
            isUserTypingRef.current = false
            
            if (!silent) {
                setSaveStatus("saved")
                setLastSaved(new Date())
                toast.success("Đã lưu thành công")
                setTimeout(() => {
                    setSaveStatus("idle")
                }, 3000)
            }
            
            return true
        } catch (error: any) {
            console.error("Lỗi khi lưu:", error)
            
            // ✅ FIX: Tăng consecutive error count
            consecutiveErrorCountRef.current += 1
            
            // ✅ FIX: Xử lý lỗi PGRST116 (record không tồn tại) - tạo mới thay vì update
            if (error.message?.includes("PGRST116") || error.message?.includes("0 rows") || error.message?.includes("Cannot coerce")) {
                // Record không tồn tại, thử tạo mới
                if (currentRecord?.id && employee?.ma_nhan_vien && selectedDate) {
                    try {
                        const createPayload: Partial<ViecHangNgay> = {
                            ma_nhan_vien: employee.ma_nhan_vien,
                            ngay_bao_cao: selectedDate,
                            chi_tiet_cong_viec: dataToSave
                        }
                        const newRecord = await createMutation.mutateAsync(createPayload as any)
                        setCurrentRecord(newRecord)
                        
                        // Update cache
                        if (viecHangNgayQueryKeys?.byDateAndEmployee) {
                            queryClient.setQueryData(
                                viecHangNgayQueryKeys.byDateAndEmployee(
                                    employee.ma_nhan_vien,
                                    selectedDate
                                ),
                                newRecord
                            )
                        }
                        
                        // Reset error count và clear flags
                        consecutiveErrorCountRef.current = 0
                        hasUnsavedChangesRef.current = false
                        setHasUnsavedChanges(false)
                        previousDataRef.current = JSON.stringify(dataToSave)
                        savingDataRef.current = null
                        
                        if (!silent) {
                            setSaveStatus("saved")
                            setLastSaved(new Date())
                            toast.success("Đã lưu thành công")
                        }
                        
                        return true
                    } catch (createError: any) {
                        console.error("Lỗi khi tạo mới sau khi update fail:", createError)
                        // Fall through to error handling
                    }
                }
            }
            
            // ✅ FIX: Nếu đã lỗi quá nhiều lần, dừng auto-save và thông báo
            const currentDataString = JSON.stringify(dataToSave)
            if (consecutiveErrorCountRef.current >= MAX_CONSECUTIVE_ERRORS) {
                hasUnsavedChangesRef.current = true
                setHasUnsavedChanges(true)
                savingDataRef.current = currentDataString // ✅ KHÔNG clear để tránh retry
                if (!silent) {
                    setSaveStatus("error")
                    toast.error(`Đã lỗi ${MAX_CONSECUTIVE_ERRORS} lần liên tiếp. Vui lòng kiểm tra kết nối hoặc quyền truy cập.`)
                }
                return false
            }
            
            // ✅ XỬ LÝ LỖI: Giữ nguyên hasUnsavedChangesRef = true để người dùng có cơ hội lưu lại
            // NHƯNG không clear savingDataRef để tránh retry ngay lập tức
            hasUnsavedChangesRef.current = true
            setHasUnsavedChanges(true)
            savingDataRef.current = currentDataString // ✅ KHÔNG clear để tránh retry
            
            if (!silent) {
                setSaveStatus("error")
                toast.error(error.message || "Có lỗi xảy ra khi lưu dữ liệu")
                setTimeout(() => {
                    setSaveStatus("idle")
                }, 5000)
            }
            return false
        } finally {
            setIsSaving(false)
            isSavingRef.current = false
        }
    }, [employee?.ma_nhan_vien, selectedDate, currentRecord, createMutation, updateMutation, validateAllLinks, linkErrors, queryClient, isSaving, getDataToSave])

    // ✅ Chuyên nghiệp: Auto-save chỉ chạy khi debounced value thay đổi (sau 3 giây dừng gõ)
    // Sử dụng debouncedCongViecList thay vì congViecList trực tiếp
    React.useEffect(() => {
        // Bỏ qua nếu đang load, đang save, hoặc là initial load
        if (isLoading || isInitialLoadRef.current) return
        
        // ✅ CHẶN: Không chạy auto-save nếu đang save (tránh race condition)
        if (isSaving || isSavingRef.current) {
            return
        }
        
        // ✅ CHẶN: Không chạy auto-save nếu đang gõ (chuyên nghiệp)
        if (isTypingRef.current) {
            return // Đang gõ, không save
        }

        // Chuẩn bị dữ liệu để so sánh và lưu (dùng debouncedCongViecList)
        const filteredList = debouncedCongViecList.filter(item => 
            item.ke_hoach?.trim() || 
            item.ket_qua?.trim() || 
            (item.links && item.links.length > 0 && item.links.some(link => link.trim()))
        )
        
        // Serialize để so sánh với previous data
        const currentDataString = JSON.stringify(filteredList)
        
        // ✅ CHẶN: Không save nếu dữ liệu giống với lần save trước (tránh duplicate)
        if (currentDataString === previousDataRef.current) {
            return // Không có thay đổi, không cần save
        }
        
        // ✅ CHẶN: Không save nếu đang save cùng dữ liệu này (tránh duplicate requests)
        if (currentDataString === savingDataRef.current) {
            return // Đang save dữ liệu này rồi, không save lại
        }
        
        // Đánh dấu có thay đổi chưa lưu
        hasUnsavedChangesRef.current = true
        
        // ✅ DEBOUNCE STATUS TEXT: Chỉ hiển thị "Có thay đổi chưa lưu" sau 500ms dừng gõ
        if (statusUpdateTimeoutRef.current) {
            clearTimeout(statusUpdateTimeoutRef.current)
        }
        statusUpdateTimeoutRef.current = setTimeout(() => {
            setHasUnsavedChanges(true)
        }, 500)
        
        // ✅ Đánh dấu dữ liệu đang save (tránh duplicate)
        savingDataRef.current = currentDataString
        
        // Thực hiện save với debounced data
        performSave(filteredList, true)
            .then(() => {
                // ✅ Reset error count khi save thành công
                consecutiveErrorCountRef.current = 0
                // ✅ Clear saving data ref sau khi save thành công
                if (savingDataRef.current === currentDataString) {
                    savingDataRef.current = null
                }
            })
            .catch(err => {
                console.error("Auto-save error:", err)
                // ✅ KHÔNG clear savingDataRef khi lỗi để tránh retry ngay lập tức
                // Chỉ clear nếu đã vượt quá retry limit
                if (consecutiveErrorCountRef.current >= MAX_CONSECUTIVE_ERRORS) {
                    // Đã vượt quá limit, clear để user có thể thử lại sau
                    if (savingDataRef.current === currentDataString) {
                        savingDataRef.current = null
                    }
                }
                // Nếu chưa vượt limit, giữ nguyên savingDataRef để tránh retry
            })
    }, [debouncedCongViecList, isLoading, isSaving, performSave])

    // ✅ Lưu khi component unmount (dùng fetch với keepalive)
    React.useEffect(() => {
        return () => {
            // Clear timeouts
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
                saveTimeoutRef.current = null
            }
            if (statusUpdateTimeoutRef.current) {
                clearTimeout(statusUpdateTimeoutRef.current)
                statusUpdateTimeoutRef.current = null
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
                typingTimeoutRef.current = null
            }
            
            // ✅ Check dữ liệu thực tế (không chỉ dựa vào hasUnsavedChangesRef)
            if (hasDataToSave()) {
                const dataToSave = getDataToSave()
                // Dùng fetch với keepalive để đảm bảo request được gửi
                saveWithKeepalive(dataToSave).catch(err => {
                    console.error("Error saving on unmount:", err)
                })
            }
        }
    }, [hasDataToSave, getDataToSave, saveWithKeepalive])

    // ✅ Lưu khi đóng tab/trình duyệt (dùng fetch với keepalive)
    React.useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // ✅ Check dữ liệu thực tế (không chỉ dựa vào hasUnsavedChangesRef)
            if (hasDataToSave()) {
                const dataToSave = getDataToSave()
                // ✅ Dùng fetch với keepalive để đảm bảo request được gửi ngay cả khi trang đóng
                saveWithKeepalive(dataToSave).catch(() => {})
                
                e.preventDefault()
                e.returnValue = ''
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [hasDataToSave, getDataToSave, saveWithKeepalive])

    // ✅ Lưu khi ẩn trình duyệt/chuyển tab (dùng fetch với keepalive)
    React.useEffect(() => {
        const handleVisibilityChange = () => {
            // ✅ Lưu khi ẩn trình duyệt/chuyển tab
            if (document.hidden && hasDataToSave()) {
                const dataToSave = getDataToSave()
                // Dùng fetch với keepalive để đảm bảo request được gửi
                saveWithKeepalive(dataToSave).catch(err => {
                    console.error("Error saving on visibility change:", err)
                })
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [hasDataToSave, getDataToSave, saveWithKeepalive])

    // ✅ Chuyên nghiệp: Force save khi navigate (chuyển module)
    React.useEffect(() => {
        if (previousPathnameRef.current !== location.pathname && previousPathnameRef.current) {
            // Clear tất cả timeouts (tránh save trùng lặp)
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
                saveTimeoutRef.current = null
            }
            if (statusUpdateTimeoutRef.current) {
                clearTimeout(statusUpdateTimeoutRef.current)
                statusUpdateTimeoutRef.current = null
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
                typingTimeoutRef.current = null
            }
            isTypingRef.current = false // Tắt flag đang gõ
            isUserTypingRef.current = false // ✅ FIX: Tắt flag khi navigate
            
            // ✅ Check dữ liệu thực tế (không chỉ dựa vào hasUnsavedChangesRef)
            if (hasDataToSave()) {
                const dataToSave = getDataToSave()
                // ✅ Force save: bypass isSaving check (lệnh force-save cuối cùng)
                performSave(dataToSave, true, true).catch(err => {
                    // ✅ Log lỗi nhưng không block navigation
                    console.error("Error saving on navigation:", err)
                })
            }
        }
        previousPathnameRef.current = location.pathname
    }, [location.pathname, performSave, getDataToSave, hasDataToSave])

    const updateItem = React.useCallback((index: number, updates: Partial<CongViec>) => {
        // ✅ FIX: Đánh dấu user đang gõ để chặn load effect ghi đè state
        isUserTypingRef.current = true
        // ✅ Set flag ngay lập tức khi gõ (không đợi debounce) - để các handler biết có thay đổi
        hasUnsavedChangesRef.current = true
        
        // ✅ Chuyên nghiệp: Đánh dấu đang gõ khi user thay đổi input
        isTypingRef.current = true
        
        // Clear timeout cũ
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }
        
        // ✅ FIX: Sau 5 giây không gõ → tắt cả 2 flags (tăng từ 3 giây để an toàn hơn)
        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false
            isUserTypingRef.current = false // ✅ Tắt flag để cho phép load effect chạy lại
        }, 5000)
        
        // Update local state ngay lập tức (không chờ debounce)
        setCongViecList(prev => {
            // ✅ FIX: Đảm bảo index hợp lệ
            if (index < 0 || index >= prev.length) {
                console.warn(`Invalid index: ${index}, list length: ${prev.length}`)
                return prev
            }
            
            const newList = [...prev]
            newList[index] = { ...newList[index], ...updates }
            return newList
        })
    }, [])

    // ✅ Chuyên nghiệp: Force save khi blur (rời khỏi ô input)
    const handleInputBlur = React.useCallback(async () => {
        // ✅ GUARD: Chặn nếu đang blur save (tránh 170 requests)
        if (isBlurSavingRef.current) {
            return
        }
        
        // Clear timeout auto-save 3s (tránh save trùng lặp)
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
            saveTimeoutRef.current = null
        }
        if (statusUpdateTimeoutRef.current) {
            clearTimeout(statusUpdateTimeoutRef.current)
            statusUpdateTimeoutRef.current = null
        }
        
        // Clear typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = null
        }
        isTypingRef.current = false // Tắt flag đang gõ
        isUserTypingRef.current = false // ✅ FIX: Tắt flag để cho phép load effect chạy lại sau khi save
        
        // Kiểm tra có thay đổi chưa lưu không
        if (!hasUnsavedChangesRef.current) {
            return // Không có thay đổi, không cần save
        }
        
        const dataToSave = getDataToSave()
        if (dataToSave.length === 0) {
            return
        }
        
        // ✅ DIRTY CHECK: So sánh với previousDataRef (tránh save dữ liệu không thay đổi)
        const currentDataString = JSON.stringify(dataToSave)
        if (currentDataString === previousDataRef.current) {
            // Dữ liệu không thay đổi, không cần save
            hasUnsavedChangesRef.current = false
            setHasUnsavedChanges(false)
            return
        }
        
        // ✅ Set flag trước khi save
        isBlurSavingRef.current = true
        
        try {
            // ✅ Force save ngay lập tức (silent, không toast)
            // performSave sẽ tự xử lý race condition (đợi request cũ xong và lấy dữ liệu mới nhất)
            // Validate sẽ được thực hiện trong performSave
            await performSave(dataToSave, true).catch(err => {
                console.error("Error saving on blur:", err)
                // Giữ hasUnsavedChangesRef = true (đã được xử lý trong performSave khi lỗi)
            })
        } finally {
            // ✅ Clear flag sau khi xong
            isBlurSavingRef.current = false
        }
    }, [getDataToSave, performSave])

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
                // ✅ Sử dụng state đã được debounce (500ms) để tránh nhấp nháy
                if (hasUnsavedChanges) {
                    return <span className="text-xs text-amber-500">Có thay đổi chưa lưu</span>
                }
                return <span className="text-xs text-muted-foreground">Đã lưu</span>
        }
    }, [saveStatus, lastSaved, hasUnsavedChanges])

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
                                                onBlur={handleInputBlur}
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
                                                        onBlur={handleInputBlur}
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
                        if (hasUnsavedChangesRef.current && !isSavingRef.current && !isSaving) {
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
                                                            const target = e.target as HTMLTextAreaElement
                                                            target.style.height = 'auto'
                                                            target.style.height = Math.max(50, target.scrollHeight) + 'px'
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
                                                        const target = e.target as HTMLTextAreaElement
                                                        target.style.height = 'auto'
                                                        target.style.height = Math.max(50, target.scrollHeight) + 'px'
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
        </Card>
    )
}

