import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import type { SaveStatus } from "../types/viec-hang-ngay-widget.types"

/**
 * Component hiển thị trạng thái save
 */
export function SaveStatusText({ 
    saveStatus, 
    lastSaved, 
    hasUnsavedChanges 
}: { 
    saveStatus: SaveStatus
    lastSaved: Date | null
    hasUnsavedChanges: boolean
}) {
    switch (saveStatus) {
        case "saving":
            return (
                <span className="text-xs text-blue-500 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Đang lưu...
                </span>
            )
        case "saved":
            return (
                <span className="text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> 
                    Đã lưu {lastSaved && format(lastSaved, "HH:mm:ss", { locale: vi })}
                </span>
            )
        case "error":
            return (
                <span className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Lỗi lưu
                </span>
            )
        default:
            if (hasUnsavedChanges) {
                return <span className="text-xs text-amber-500">Có thay đổi chưa lưu</span>
            }
            return <span className="text-xs text-muted-foreground">Đã lưu</span>
    }
}

/**
 * Helper function: Lấy thứ trong tuần từ date string
 */
export function getDayOfWeek(dateString: string): string {
    const date = new Date(dateString + "T00:00:00")
    const dayOfWeek = date.getDay()
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
    return dayNames[dayOfWeek]
}

