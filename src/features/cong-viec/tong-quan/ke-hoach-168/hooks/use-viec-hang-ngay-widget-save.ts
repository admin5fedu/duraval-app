import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { ViecHangNgayAPI } from "../../viec-hang-ngay/services/viec-hang-ngay.api"
import { viecHangNgayQueryKeys } from "@/lib/react-query/query-keys"
import type { CreateViecHangNgayInput, UpdateViecHangNgayInput } from "../../viec-hang-ngay/types"
import type { ViecHangNgay } from "../../viec-hang-ngay/schema"
import type { CongViec, ViecHangNgayWidgetState, ViecHangNgayWidgetRefs } from "../types/viec-hang-ngay-widget.types"
import { isValidUrl, filterCongViecList } from "../utils/viec-hang-ngay-widget.utils"
import { saveWithKeepalive } from "../utils/viec-hang-ngay-widget-save.utils"
import { MAX_CONSECUTIVE_ERRORS, DEBOUNCE_DELAY_MS, STATUS_UPDATE_DELAY_MS, RETRY_DELAY_MS, MAX_RETRY_ATTEMPTS } from "../constants/viec-hang-ngay-widget.constants"

interface UseViecHangNgayWidgetSaveParams {
    employee: { ma_nhan_vien: number } | null | undefined
    state: ViecHangNgayWidgetState
    refs: ViecHangNgayWidgetRefs
    setCurrentRecord: (record: ViecHangNgay | null) => void
    setLinkErrors: React.Dispatch<React.SetStateAction<Map<string, boolean>>>
    setSaveStatus: (status: "idle" | "saving" | "saved" | "error") => void
    setLastSaved: (date: Date | null) => void
    setIsSaving: (saving: boolean) => void
    setHasUnsavedChanges: (value: boolean) => void
}

/**
 * Hook quản lý logic save cho widget Việc hàng ngày
 */
export function useViecHangNgayWidgetSave({
    employee,
    state,
    refs,
    setCurrentRecord,
    setLinkErrors,
    setSaveStatus,
    setLastSaved,
    setIsSaving,
    setHasUnsavedChanges
}: UseViecHangNgayWidgetSaveParams) {
    const { selectedDate, currentRecord, congViecList, linkErrors, isSaving } = state
    const queryClient = useQueryClient()
    
    // AbortController để cancel request cũ khi có request mới
    const abortControllerRef = React.useRef<AbortController | null>(null)
    
    // Metrics tracking
    const saveMetricsRef = React.useRef({
        totalSaves: 0,
        successfulSaves: 0,
        failedSaves: 0,
        retryCount: 0
    })

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (input: CreateViecHangNgayInput) => {
            return await ViecHangNgayAPI.create(input)
        },
        onSuccess: (data) => {
            if (employee?.ma_nhan_vien && selectedDate && viecHangNgayQueryKeys?.byDateAndEmployee) {
                queryClient.setQueryData(
                    viecHangNgayQueryKeys.byDateAndEmployee(employee.ma_nhan_vien, selectedDate),
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
            refs.consecutiveErrorCountRef.current = 0
            if (employee?.ma_nhan_vien && selectedDate && viecHangNgayQueryKeys?.byDateAndEmployee) {
                queryClient.setQueryData(
                    viecHangNgayQueryKeys.byDateAndEmployee(employee.ma_nhan_vien, selectedDate),
                    data
                )
            }
        },
        onError: (error: any) => {
            if (error.message?.includes("406") || error.message?.includes("Not Acceptable")) {
                console.error("Lỗi 406 - Không có quyền truy cập:", error)
            }
        },
    })

    // Debounced list để auto-save
    const debouncedCongViecList = useDebounce(congViecList, DEBOUNCE_DELAY_MS)

    // Lấy dữ liệu cần save
    const getDataToSave = React.useCallback((): CongViec[] => {
        return filterCongViecList(congViecList)
    }, [congViecList])

    // Kiểm tra có dữ liệu cần save không
    const hasDataToSave = React.useCallback((): boolean => {
        const dataToSave = getDataToSave()
        if (dataToSave.length === 0) return false
        const currentDataString = JSON.stringify(dataToSave)
        return currentDataString !== refs.previousDataRef.current
    }, [getDataToSave, refs.previousDataRef])

    // Validate links
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
    }, [setLinkErrors])

    // Perform save với retry logic
    const performSave = React.useCallback(async (
        dataToSave: CongViec[],
        silent = false,
        force = false,
        retryCount = 0
    ): Promise<boolean> => {
        if (!employee?.ma_nhan_vien || !selectedDate || refs.isInitialLoadRef.current) return false

        // Cancel request cũ nếu có
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        // Xử lý race condition
        if (!force) {
            if (refs.isSavingRef.current || isSaving) {
                // Nếu đang save, cancel request cũ và dùng data mới nhất
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort()
                }
                
                const latestDataToSave = getDataToSave()
                const latestDataString = JSON.stringify(latestDataToSave)
                const currentDataString = JSON.stringify(dataToSave)
                
                if (latestDataString !== currentDataString) {
                    dataToSave = latestDataToSave
                }
                
                // Đợi một chút để request cũ hoàn thành hoặc bị cancel
                await new Promise(resolve => setTimeout(resolve, 50))
                
                if (refs.isSavingRef.current || isSaving) {
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

        // Set flags
        refs.isSavingRef.current = true
        setIsSaving(true)
        saveMetricsRef.current.totalSaves++
        
        if (!silent) {
            setSaveStatus("saving")
        }
        
        // Optimistic update: Update query cache trước khi server confirm
        const optimisticRecord: ViecHangNgay | null = currentRecord?.id 
            ? { ...currentRecord, chi_tiet_cong_viec: dataToSave } as ViecHangNgay
            : dataToSave.length > 0 
                ? {
                    id: currentRecord?.id || 0,
                    ma_nhan_vien: employee.ma_nhan_vien,
                    ngay_bao_cao: selectedDate,
                    chi_tiet_cong_viec: dataToSave,
                    tg_tao: currentRecord?.tg_tao || new Date().toISOString(),
                    tg_cap_nhat: new Date().toISOString()
                } as ViecHangNgay
                : null
        
        if (optimisticRecord && employee?.ma_nhan_vien && selectedDate && viecHangNgayQueryKeys?.byDateAndEmployee) {
            queryClient.setQueryData(
                viecHangNgayQueryKeys.byDateAndEmployee(employee.ma_nhan_vien, selectedDate),
                optimisticRecord
            )
        }
        
        try {
            // Check if aborted
            if (abortControllerRef.current?.signal.aborted) {
                return false
            }
            
            let savedRecord: ViecHangNgay | null = null

            // Kiểm tra currentRecord có khớp với selectedDate không
            let recordToUpdate: ViecHangNgay | null = null
            if (currentRecord?.id && currentRecord.ngay_bao_cao === selectedDate) {
                recordToUpdate = currentRecord
            } else {
                try {
                    recordToUpdate = await ViecHangNgayAPI.getByDateAndEmployee(employee.ma_nhan_vien, selectedDate)
                    if (recordToUpdate) {
                        setCurrentRecord(recordToUpdate)
                    }
                } catch (queryError) {
                    console.error("Error querying record for current date:", queryError)
                }
            }

            // Check if aborted
            if (abortControllerRef.current?.signal.aborted) {
                return false
            }

            if (recordToUpdate?.id) {
                // Update existing record
                const updatePayload: Partial<ViecHangNgay> = {
                    chi_tiet_cong_viec: dataToSave
                }
                savedRecord = await updateMutation.mutateAsync({ 
                    id: recordToUpdate.id, 
                    data: updatePayload 
                })
                setCurrentRecord(savedRecord)
            } else {
                // Create new record
                if (dataToSave.length > 0) {
                    const createPayload: Partial<ViecHangNgay> = {
                        ma_nhan_vien: employee.ma_nhan_vien,
                        ngay_bao_cao: selectedDate,
                        chi_tiet_cong_viec: dataToSave
                    }
                    savedRecord = await createMutation.mutateAsync(createPayload as any)
                    setCurrentRecord(savedRecord)
                }
            }

            // Update query cache với data thực từ server
            if (savedRecord && employee?.ma_nhan_vien && selectedDate && viecHangNgayQueryKeys?.byDateAndEmployee) {
                queryClient.setQueryData(
                    viecHangNgayQueryKeys.byDateAndEmployee(employee.ma_nhan_vien, selectedDate),
                    savedRecord
                )
            }

            // Update refs
            refs.hasUnsavedChangesRef.current = false
            setHasUnsavedChanges(false)
            refs.previousDataRef.current = JSON.stringify(dataToSave)
            refs.savingDataRef.current = null
            refs.isUserTypingRef.current = false
            
            // Metrics tracking - success
            saveMetricsRef.current.successfulSaves++
            
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
            // Check if aborted
            if (abortControllerRef.current?.signal.aborted) {
                return false
            }
            
            console.error("Lỗi khi lưu:", error)
            
            // Metrics tracking - failure
            saveMetricsRef.current.failedSaves++
            
            refs.consecutiveErrorCountRef.current += 1
            
            // Retry logic nếu chưa vượt quá số lần retry
            if (retryCount < MAX_RETRY_ATTEMPTS && !error.message?.includes("406")) {
                saveMetricsRef.current.retryCount++
                console.log(`Retrying save (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})...`)
                
                // Đợi một chút trước khi retry
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
                
                // Retry với data mới nhất
                const latestDataToSave = getDataToSave()
                return await performSave(latestDataToSave, silent, force, retryCount + 1)
            }
            
            // Xử lý lỗi PGRST116 (record không tồn tại)
            if (error.message?.includes("PGRST116") || error.message?.includes("0 rows") || error.message?.includes("Cannot coerce")) {
                if (currentRecord?.id && employee?.ma_nhan_vien && selectedDate) {
                    try {
                        const createPayload: Partial<ViecHangNgay> = {
                            ma_nhan_vien: employee.ma_nhan_vien,
                            ngay_bao_cao: selectedDate,
                            chi_tiet_cong_viec: dataToSave
                        }
                        const newRecord = await createMutation.mutateAsync(createPayload as any)
                        setCurrentRecord(newRecord)
                        
                        if (viecHangNgayQueryKeys?.byDateAndEmployee) {
                            queryClient.setQueryData(
                                viecHangNgayQueryKeys.byDateAndEmployee(employee.ma_nhan_vien, selectedDate),
                                newRecord
                            )
                        }
                        
                        refs.consecutiveErrorCountRef.current = 0
                        refs.hasUnsavedChangesRef.current = false
                        setHasUnsavedChanges(false)
                        refs.previousDataRef.current = JSON.stringify(dataToSave)
                        refs.savingDataRef.current = null
                        
                        // Metrics tracking - success after retry
                        saveMetricsRef.current.successfulSaves++
                        
                        if (!silent) {
                            setSaveStatus("saved")
                            setLastSaved(new Date())
                            toast.success("Đã lưu thành công")
                        }
                        
                        return true
                    } catch (createError: any) {
                        console.error("Lỗi khi tạo mới sau khi update fail:", createError)
                    }
                }
            }
            
            // Xử lý lỗi quá nhiều lần
            const currentDataString = JSON.stringify(dataToSave)
            if (refs.consecutiveErrorCountRef.current >= MAX_CONSECUTIVE_ERRORS) {
                refs.hasUnsavedChangesRef.current = true
                setHasUnsavedChanges(true)
                refs.savingDataRef.current = currentDataString
                if (!silent) {
                    setSaveStatus("error")
                    toast.error(`Đã lỗi ${MAX_CONSECUTIVE_ERRORS} lần liên tiếp. Vui lòng kiểm tra kết nối hoặc quyền truy cập.`)
                }
                return false
            }
            
            // Xử lý lỗi thông thường
            refs.hasUnsavedChangesRef.current = true
            setHasUnsavedChanges(true)
            refs.savingDataRef.current = currentDataString
            
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
            refs.isSavingRef.current = false
        }
    }, [
        employee?.ma_nhan_vien,
        selectedDate,
        currentRecord?.id,
        isSaving,
        linkErrors,
        createMutation,
        updateMutation,
        validateAllLinks,
        queryClient,
        getDataToSave,
        setCurrentRecord,
        setLinkErrors,
        setSaveStatus,
        setLastSaved,
        setIsSaving,
        setHasUnsavedChanges
    ])
    
    // Cleanup AbortController khi unmount
    React.useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
                abortControllerRef.current = null
            }
        }
    }, [])
    
    // Expose metrics (có thể dùng để debug hoặc analytics)
    const getSaveMetrics = React.useCallback(() => {
        return { ...saveMetricsRef.current }
    }, [])

    // Auto-save effect
    React.useEffect(() => {
        if (refs.isInitialLoadRef.current) return
        
        if (refs.isSavingRef.current || isSaving) return
        if (refs.isTypingRef.current) return

        const filteredList = filterCongViecList(debouncedCongViecList)
        const currentDataString = JSON.stringify(filteredList)
        
        if (currentDataString === refs.previousDataRef.current) return
        if (currentDataString === refs.savingDataRef.current) return

        refs.hasUnsavedChangesRef.current = true
        
        if (refs.statusUpdateTimeoutRef.current) {
            clearTimeout(refs.statusUpdateTimeoutRef.current)
        }
        refs.statusUpdateTimeoutRef.current = setTimeout(() => {
            setHasUnsavedChanges(true)
        }, STATUS_UPDATE_DELAY_MS)
        
        refs.savingDataRef.current = currentDataString
        
        performSave(filteredList, true)
            .then(() => {
                refs.consecutiveErrorCountRef.current = 0
                if (refs.savingDataRef.current === currentDataString) {
                    refs.savingDataRef.current = null
                }
            })
            .catch(err => {
                console.error("Auto-save error:", err)
                if (refs.consecutiveErrorCountRef.current >= MAX_CONSECUTIVE_ERRORS) {
                    if (refs.savingDataRef.current === currentDataString) {
                        refs.savingDataRef.current = null
                    }
                }
            })
    }, [debouncedCongViecList, isSaving, refs, performSave, setHasUnsavedChanges])

    // Save on blur
    const handleInputBlur = React.useCallback(async () => {
        if (refs.isBlurSavingRef.current) return
        
        if (refs.saveTimeoutRef.current) {
            clearTimeout(refs.saveTimeoutRef.current)
            refs.saveTimeoutRef.current = null
        }
        if (refs.statusUpdateTimeoutRef.current) {
            clearTimeout(refs.statusUpdateTimeoutRef.current)
            refs.statusUpdateTimeoutRef.current = null
        }
        if (refs.typingTimeoutRef.current) {
            clearTimeout(refs.typingTimeoutRef.current)
            refs.typingTimeoutRef.current = null
        }
        refs.isTypingRef.current = false
        refs.isUserTypingRef.current = false
        
        if (!refs.hasUnsavedChangesRef.current) return
        
        const dataToSave = getDataToSave()
        if (dataToSave.length === 0) return
        
        const currentDataString = JSON.stringify(dataToSave)
        if (currentDataString === refs.previousDataRef.current) {
            refs.hasUnsavedChangesRef.current = false
            setHasUnsavedChanges(false)
            return
        }
        
        refs.isBlurSavingRef.current = true
        
        try {
            await performSave(dataToSave, true).catch(err => {
                console.error("Error saving on blur:", err)
            })
        } finally {
            refs.isBlurSavingRef.current = false
        }
    }, [refs, getDataToSave, performSave, setHasUnsavedChanges])

    // Save on unmount
    React.useEffect(() => {
        return () => {
            if (refs.saveTimeoutRef.current) {
                clearTimeout(refs.saveTimeoutRef.current)
                refs.saveTimeoutRef.current = null
            }
            if (refs.statusUpdateTimeoutRef.current) {
                clearTimeout(refs.statusUpdateTimeoutRef.current)
                refs.statusUpdateTimeoutRef.current = null
            }
            if (refs.typingTimeoutRef.current) {
                clearTimeout(refs.typingTimeoutRef.current)
                refs.typingTimeoutRef.current = null
            }
            
            if (hasDataToSave()) {
                const dataToSave = getDataToSave()
                saveWithKeepalive(dataToSave, employee?.ma_nhan_vien!, selectedDate, currentRecord).catch(err => {
                    console.error("Error saving on unmount:", err)
                })
            }
        }
    }, [hasDataToSave, getDataToSave, employee?.ma_nhan_vien, selectedDate, currentRecord, refs])

    // Save on beforeunload
    React.useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasDataToSave()) {
                const dataToSave = getDataToSave()
                saveWithKeepalive(dataToSave, employee?.ma_nhan_vien!, selectedDate, currentRecord).catch(() => {})
                e.preventDefault()
                e.returnValue = ''
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [hasDataToSave, getDataToSave, employee?.ma_nhan_vien, selectedDate, currentRecord])

    // Save on visibility change
    React.useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && hasDataToSave()) {
                const dataToSave = getDataToSave()
                saveWithKeepalive(dataToSave, employee?.ma_nhan_vien!, selectedDate, currentRecord).catch(err => {
                    console.error("Error saving on visibility change:", err)
                })
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [hasDataToSave, getDataToSave, employee?.ma_nhan_vien, selectedDate, currentRecord])

    // Save on navigation
    React.useEffect(() => {
        const currentPath = window.location.pathname
        if (refs.previousPathnameRef.current !== currentPath && refs.previousPathnameRef.current) {
            if (refs.saveTimeoutRef.current) {
                clearTimeout(refs.saveTimeoutRef.current)
                refs.saveTimeoutRef.current = null
            }
            if (refs.statusUpdateTimeoutRef.current) {
                clearTimeout(refs.statusUpdateTimeoutRef.current)
                refs.statusUpdateTimeoutRef.current = null
            }
            if (refs.typingTimeoutRef.current) {
                clearTimeout(refs.typingTimeoutRef.current)
                refs.typingTimeoutRef.current = null
            }
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
    }, [hasDataToSave, getDataToSave, performSave, refs])

    return {
        performSave,
        handleInputBlur,
        getDataToSave,
        hasDataToSave,
        validateAllLinks,
        getSaveMetrics
    }
}

