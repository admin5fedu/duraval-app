import * as React from "react"
import type { ViecHangNgay } from "../../viec-hang-ngay/schema"
import type { CongViec, ViecHangNgayWidgetState, ViecHangNgayWidgetRefs } from "../types/viec-hang-ngay-widget.types"
import { useViecHangNgayByDateAndEmployee } from "./use-viec-hang-ngay-by-date"
import { createDefaultCongViecList, filterCongViecList, hasCongViecData } from "../utils/viec-hang-ngay-widget.utils"
import { DEFAULT_ITEMS_COUNT } from "../constants/viec-hang-ngay-widget.constants"

interface UseViecHangNgayWidgetDataParams {
    employee: { ma_nhan_vien: number } | null | undefined
    employeeLoading: boolean
    state: ViecHangNgayWidgetState
    refs: ViecHangNgayWidgetRefs
    setCurrentRecord: (record: ViecHangNgay | null) => void
    setCongViecList: React.Dispatch<React.SetStateAction<CongViec[]>>
    setHasUnsavedChanges: (value: boolean) => void
    setSaveStatus: (status: "idle" | "saving" | "saved" | "error") => void
}

/**
 * Hook quản lý việc load và sync dữ liệu từ API
 */
export function useViecHangNgayWidgetData({
    employee,
    employeeLoading,
    state,
    refs,
    setCurrentRecord,
    setCongViecList,
    setHasUnsavedChanges,
    setSaveStatus
}: UseViecHangNgayWidgetDataParams) {
    const { selectedDate } = state

    const { data: viecHangNgayData, isLoading } = useViecHangNgayByDateAndEmployee(
        employee?.ma_nhan_vien,
        selectedDate,
        !employeeLoading && !!employee?.ma_nhan_vien
    )

    // Load dữ liệu khi chọn ngày hoặc employee thay đổi
    React.useEffect(() => {
        if (employeeLoading || !employee?.ma_nhan_vien || !selectedDate) return
        if (isLoading) return
        
        const isDateChanged = refs.previousSelectedDateRef.current !== selectedDate
        
        // Chỉ chặn load khi đang gõ trong CÙNG ngày, KHÔNG chặn khi chuyển ngày
        if (!isDateChanged && 
            (refs.isUserTypingRef.current || (refs.hasUnsavedChangesRef.current && !refs.isInitialLoadRef.current))) {
            return // Giữ nguyên dữ liệu đang gõ (chỉ trong cùng ngày)
        }

        refs.isInitialLoadRef.current = true

        if (viecHangNgayData) {
            setCurrentRecord(viecHangNgayData)
            const chiTiet = Array.isArray(viecHangNgayData.chi_tiet_cong_viec) 
                ? viecHangNgayData.chi_tiet_cong_viec 
                : []
            
            if (isDateChanged) {
                // Chuyển ngày: Load hoàn toàn dữ liệu mới
                const newList = Array.from({ length: DEFAULT_ITEMS_COUNT }, (_, index) => {
                    const itemId = index + 1
                    const existingInDB = chiTiet.find(item => item.id === itemId)
                    return existingInDB || {
                        id: itemId,
                        ke_hoach: '',
                        ket_qua: '',
                        links: []
                    }
                })
                setCongViecList(newList)
                
                // Update previousDataRef và previousSelectedDateRef SAU khi đã load xong dữ liệu
                // Sử dụng queueMicrotask thay vì setTimeout(0) để đảm bảo chạy sau khi state đã update
                queueMicrotask(() => {
                    const filteredList = filterCongViecList(newList)
                    refs.previousDataRef.current = JSON.stringify(filteredList)
                    refs.previousSelectedDateRef.current = selectedDate // ✅ Cập nhật SAU khi đã load xong
                    refs.hasUnsavedChangesRef.current = false
                    setHasUnsavedChanges(false)
                    setSaveStatus("idle")
                })
            } else {
                // Cùng ngày: Merge thông minh - giữ lại dữ liệu user đang gõ
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
                        
                        // Nếu user đang gõ (có nội dung), giữ lại dữ liệu đang gõ
                        if (existingInState && hasCongViecData(existingInState)) {
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
                // Sử dụng queueMicrotask thay vì setTimeout(0) để đảm bảo chạy sau khi state đã update
                queueMicrotask(() => {
                    setCongViecList(currentList => {
                        const filteredList = filterCongViecList(currentList)
                        refs.previousDataRef.current = JSON.stringify(filteredList)
                        return currentList
                    })
                    refs.hasUnsavedChangesRef.current = false
                    setHasUnsavedChanges(false)
                    setSaveStatus("idle")
                })
            }
        } else {
            // Khi không có data
            if (isDateChanged) {
                // Chuyển ngày: Reset hoàn toàn
                const defaultItems = createDefaultCongViecList()
                setCongViecList(defaultItems)
                setCurrentRecord(null)
                refs.previousDataRef.current = JSON.stringify([])
                refs.previousSelectedDateRef.current = selectedDate // ✅ Cập nhật SAU khi đã reset xong
                refs.hasUnsavedChangesRef.current = false
                setHasUnsavedChanges(false)
                setSaveStatus("idle")
            } else {
                // Cùng ngày: Giữ lại dữ liệu đang gõ nếu có
                setCongViecList(prev => {
                    const hasUserData = prev.some(item => hasCongViecData(item))
                    
                    if (hasUserData) {
                        // Đảm bảo có đủ DEFAULT_ITEMS_COUNT items
                        const currentLength = prev.length
                        if (currentLength < DEFAULT_ITEMS_COUNT) {
                            const defaultItems = createDefaultCongViecList()
                            const merged = [...prev]
                            for (let i = currentLength; i < DEFAULT_ITEMS_COUNT; i++) {
                                merged.push(defaultItems[i])
                            }
                            return merged
                        }
                        return prev
                    }
                    
                    // Nếu không có dữ liệu đang gõ, set default
                    const defaultItems = createDefaultCongViecList()
                    setCurrentRecord(null)
                    refs.previousDataRef.current = JSON.stringify([])
                    refs.hasUnsavedChangesRef.current = false
                    setHasUnsavedChanges(false)
                    setSaveStatus("idle")
                    return defaultItems
                })
            }
        }

        setTimeout(() => {
            refs.isInitialLoadRef.current = false
        }, 100)
    }, [
        selectedDate,
        employee?.ma_nhan_vien,
        employeeLoading,
        viecHangNgayData,
        isLoading,
        setCurrentRecord,
        setCongViecList,
        setHasUnsavedChanges,
        setSaveStatus
    ])

    return {
        viecHangNgayData,
        isLoading
    }
}

