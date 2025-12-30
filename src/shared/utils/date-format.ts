/**
 * Date Formatting Utilities
 * 
 * Utility functions để format dates consistently across the application
 */

import { format } from "date-fns"
import { vi } from "date-fns/locale"

/**
 * Format date and time: dd/MM/yyyy HH:mm
 * 
 * @param dateStr - Date string, Date object, or null/undefined
 * @returns Formatted date string or "-" if invalid
 * 
 * @example
 * formatDateTime("2024-01-15T10:30:00") // "15/01/2024 10:30"
 * formatDateTime(null) // "-"
 */
export function formatDateTime(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return "-"
    try {
        const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr
        if (isNaN(date.getTime())) return "-"
        return format(date, "dd/MM/yyyy HH:mm", { locale: vi })
    } catch {
        return "-"
    }
}

/**
 * Format date only: dd/MM/yyyy
 * 
 * @param dateStr - Date string, Date object, or null/undefined
 * @returns Formatted date string or "-" if invalid
 * 
 * @example
 * formatDate("2024-01-15T10:30:00") // "15/01/2024"
 * formatDate(null) // "-"
 */
export function formatDate(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return "-"
    try {
        const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr
        if (isNaN(date.getTime())) return "-"
        return format(date, "dd/MM/yyyy", { locale: vi })
    } catch {
        return "-"
    }
}

/**
 * Format time only: HH:mm
 * 
 * @param dateStr - Date string, Date object, or null/undefined
 * @returns Formatted time string or "-" if invalid
 * 
 * @example
 * formatTime("2024-01-15T10:30:00") // "10:30"
 * formatTime(null) // "-"
 */
export function formatTime(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return "-"
    try {
        const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr
        if (isNaN(date.getTime())) return "-"
        return format(date, "HH:mm", { locale: vi })
    } catch {
        return "-"
    }
}

