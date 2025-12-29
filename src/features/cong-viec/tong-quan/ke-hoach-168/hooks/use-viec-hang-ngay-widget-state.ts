import * as React from "react"
import { useLocation } from "react-router-dom"
import { format } from "date-fns"
import type { ViecHangNgay } from "../../viec-hang-ngay/schema"
import type { CongViec, ViecHangNgayWidgetState, ViecHangNgayWidgetRefs } from "../types/viec-hang-ngay-widget.types"
import { TYPING_TIMEOUT_MS } from "../constants/viec-hang-ngay-widget.constants"

/**
 * Hook quản lý state cho widget Việc hàng ngày
 */
export function useViecHangNgayWidgetState() {
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
    const previousSelectedDateRef = React.useRef<string>(selectedDate)

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

