import type { ViecHangNgay } from "../../viec-hang-ngay/schema"

export interface CongViec {
    id: number
    ke_hoach?: string
    ket_qua?: string
    links?: string[]
}

export type SaveStatus = "idle" | "saving" | "saved" | "error"

export interface ViecHangNgayWidgetState {
    selectedDate: string
    currentRecord: ViecHangNgay | null
    congViecList: CongViec[]
    expandedItemId: number | null
    globalExpandAll: boolean
    showFullViewDialog: boolean
    linkErrors: Map<string, boolean>
    saveStatus: SaveStatus
    lastSaved: Date | null
    isSaving: boolean
    hasUnsavedChanges: boolean
}

export interface ViecHangNgayWidgetRefs {
    saveTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
    statusUpdateTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
    typingTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
    isInitialLoadRef: React.MutableRefObject<boolean>
    previousDataRef: React.MutableRefObject<string>
    hasUnsavedChangesRef: React.MutableRefObject<boolean>
    isSavingRef: React.MutableRefObject<boolean>
    previousPathnameRef: React.MutableRefObject<string>
    isTypingRef: React.MutableRefObject<boolean>
    isUserTypingRef: React.MutableRefObject<boolean>
    savingDataRef: React.MutableRefObject<string | null>
    isBlurSavingRef: React.MutableRefObject<boolean>
    consecutiveErrorCountRef: React.MutableRefObject<number>
    previousSelectedDateRef: React.MutableRefObject<string>
}

