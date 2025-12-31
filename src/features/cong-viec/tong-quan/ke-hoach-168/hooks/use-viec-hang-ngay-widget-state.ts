import * as React from "react"
import { useLocation } from "react-router-dom"
import { format } from "date-fns"
import type { ViecHangNgay } from "../../viec-hang-ngay/schema"
import type { CongViec, ViecHangNgayWidgetState, ViecHangNgayWidgetRefs } from "../types/viec-hang-ngay-widget.types"
import { TYPING_TIMEOUT_MS } from "../constants/viec-hang-ngay-widget.constants"

// LocalStorage key để lưu ngày đã chọn
const SELECTED_DATE_STORAGE_KEY = 'viec-hang-ngay-widget-selected-date'

/**
 * Hook quản lý state cho widget Việc hàng ngày
 */
export function useViecHangNgayWidgetState() {
    const location = useLocation()
    
    // Khởi tạo selectedDate từ localStorage nếu có, nếu không thì dùng today
    const [selectedDate, setSelectedDate] = React.useState<string>(() => {
        try {
            const savedDate = localStorage.getItem(SELECTED_DATE_STORAGE_KEY)
            if (savedDate) {
                // Validate date format (YYYY-MM-DD)
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/
                if (dateRegex.test(savedDate)) {
                    // Validate date là hợp lệ
                    const date = new Date(savedDate + "T00:00:00")
                    if (!isNaN(date.getTime())) {
                        return savedDate
                    }
                }
            }
        } catch (error) {
            console.error('Error loading saved date from localStorage:', error)
        }
        return format(new Date(), "yyyy-MM-dd")
    })
    const [currentRecord, setCurrentRecord] = React.useState<ViecHangNgay | null>(null)
    const [congViecList, setCongViecList] = React.useState<CongViec[]>([])
    const [expandedItemId, setExpandedItemId] = React.useState<number | null>(null)
    const [globalExpandAll, setGlobalExpandAll] = React.useState(false)
    const [showFullViewDialog, setShowFullViewDialog] = React.useState(false)
    const [linkErrors, setLinkErrors] = React.useState<Map<string, boolean>>(new Map())
    const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle")
    const [lastSaved, setLastSaved] = React.useState<Date | null>(null)
    const [isSaving, setIsSaving] = React.useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)

    // Refs
    const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const statusUpdateTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const isInitialLoadRef = React.useRef(true)
    const previousDataRef = React.useRef<string>("")
    const hasUnsavedChangesRef = React.useRef(false)
    const isSavingRef = React.useRef(false)
    const previousPathnameRef = React.useRef<string>(location.pathname)
    const isTypingRef = React.useRef(false)
    const isUserTypingRef = React.useRef(false)
    const savingDataRef = React.useRef<string | null>(null)
    const isBlurSavingRef = React.useRef(false)
    const consecutiveErrorCountRef = React.useRef(0)
    // ✅ Khởi tạo với empty string để đảm bảo lần đầu mount luôn được coi là date changed
    // Điều này đảm bảo dữ liệu được load đúng khi khôi phục từ localStorage
    const previousSelectedDateRef = React.useRef<string>("")

    // Lưu selectedDate vào localStorage mỗi khi thay đổi
    React.useEffect(() => {
        try {
            localStorage.setItem(SELECTED_DATE_STORAGE_KEY, selectedDate)
        } catch (error) {
            console.error('Error saving date to localStorage:', error)
        }
    }, [selectedDate])

    // Clear typing timeout và set typing flags
    const clearTypingFlags = React.useCallback(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = null
        }
        isTypingRef.current = false
        isUserTypingRef.current = false
    }, [])

    // Set typing flags
    const setTypingFlags = React.useCallback(() => {
        isUserTypingRef.current = true
        hasUnsavedChangesRef.current = true
        isTypingRef.current = true

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }
        
        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false
            isUserTypingRef.current = false
        }, TYPING_TIMEOUT_MS)
    }, [])

    // Clear all timeouts
    const clearAllTimeouts = React.useCallback(() => {
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
    }, [])

    // Reset state khi chuyển ngày
    const resetStateOnDateChange = React.useCallback(() => {
        if (previousSelectedDateRef.current === selectedDate) return false

        // ✅ KHÔNG cập nhật previousSelectedDateRef ở đây nữa
        // Nó sẽ được cập nhật trong useViecHangNgayWidgetData sau khi đã load xong dữ liệu
        // Điều này đảm bảo isDateChanged trong data hook luôn đúng
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
        clearAllTimeouts()
        return true
    }, [selectedDate, clearAllTimeouts])

    const state: ViecHangNgayWidgetState = {
        selectedDate,
        currentRecord,
        congViecList,
        expandedItemId,
        globalExpandAll,
        showFullViewDialog,
        linkErrors,
        saveStatus,
        lastSaved,
        isSaving,
        hasUnsavedChanges
    }

    const refs: ViecHangNgayWidgetRefs = {
        saveTimeoutRef,
        statusUpdateTimeoutRef,
        typingTimeoutRef,
        isInitialLoadRef,
        previousDataRef,
        hasUnsavedChangesRef,
        isSavingRef,
        previousPathnameRef,
        isTypingRef,
        isUserTypingRef,
        savingDataRef,
        isBlurSavingRef,
        consecutiveErrorCountRef,
        previousSelectedDateRef
    }

    return {
        state,
        refs,
        setters: {
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
        },
        helpers: {
            clearTypingFlags,
            setTypingFlags,
            clearAllTimeouts,
            resetStateOnDateChange
        },
        location
    }
}

