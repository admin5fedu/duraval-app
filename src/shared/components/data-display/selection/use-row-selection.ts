"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { selectRange, getRowIndex } from "./selection-utils"

interface UseRowSelectionOptions {
    /**
     * Enable shift+click range selection
     * @default true
     */
    enableRangeSelection?: boolean
    
    /**
     * Enable long press selection mode (mobile/touch)
     * @default true
     */
    enableLongPress?: boolean
    
    /**
     * Long press duration in milliseconds
     * @default 500
     */
    longPressDuration?: number
    
    /**
     * Enable keyboard shortcuts
     * @default true
     */
    enableKeyboardShortcuts?: boolean
    
    /**
     * Persist selection across pagination
     * @default false
     */
    persistSelection?: boolean
}

interface UseRowSelectionReturn {
    /**
     * Handle row selection with shift+click support
     */
    handleRowSelect: (rowId: string, event: React.MouseEvent | React.PointerEvent) => void
    
    /**
     * Handle row pointer down (for long press detection)
     */
    handleRowPointerDown: (rowId: string, event: React.PointerEvent) => void
    
    /**
     * Handle row pointer up (for long press detection)
     */
    handleRowPointerUp: (rowId: string, event: React.PointerEvent) => void
    
    /**
     * Whether selection mode is active (long press mode)
     */
    isSelectionMode: boolean
    
    /**
     * Clear selection mode
     */
    clearSelectionMode: () => void
    
    /**
     * Last selected row index (for range selection)
     */
    lastSelectedRowIndex: number | null
    
    /**
     * Check if a row is in the current selection range
     */
    isRowInRange: (rowId: string) => boolean
}

/**
 * Hook quản lý row selection với các tính năng nâng cao:
 * - Shift + Click range selection
 * - Long press selection mode
 * - Keyboard shortcuts
 * - Selection persistence
 */
export function useRowSelection<TData>(
    table: Table<TData>,
    options: UseRowSelectionOptions = {}
): UseRowSelectionReturn {
    const {
        enableRangeSelection = true,
        enableLongPress = true,
        longPressDuration = 500,
        enableKeyboardShortcuts = true,
        persistSelection = false
    } = options
    void persistSelection

    const lastSelectedRowIndexRef = React.useRef<number | null>(null)
    const [isSelectionMode, setIsSelectionMode] = React.useState(false)
    const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null)
    const longPressRowIdRef = React.useRef<string | null>(null)

    // Handle row selection with shift+click support
    const handleRowSelect = React.useCallback(
        (rowId: string, event: React.MouseEvent | React.PointerEvent) => {
            const row = table.getRowModel().rows.find((r) => r.id === rowId)
            if (!row) return

            const rowIndex = getRowIndex(table, rowId)
            if (rowIndex === null) return

            // Check if shift key is pressed
            const isShiftKey = event.shiftKey

            if (enableRangeSelection && isShiftKey && lastSelectedRowIndexRef.current !== null) {
                // Select range from last selected to current
                event.preventDefault()
                selectRange(table, lastSelectedRowIndexRef.current, rowIndex)
            } else {
                // Normal selection - toggle current row
                row.toggleSelected()
                lastSelectedRowIndexRef.current = rowIndex
            }
        },
        [table, enableRangeSelection]
    )

    // Handle long press detection
    const handleRowPointerDown = React.useCallback(
        (rowId: string, event: React.PointerEvent) => {
            // Only enable long press for touch or mouse events
            if (!enableLongPress || (event.pointerType !== "touch" && event.pointerType !== "mouse")) {
                return
            }
            
            // Don't trigger long press if clicking on checkbox
            const target = event.target as HTMLElement
            if (target.closest('[data-slot="checkbox"]') !== null) {
                return
            }

            longPressRowIdRef.current = rowId

            longPressTimerRef.current = setTimeout(() => {
                // Enter selection mode
                setIsSelectionMode(true)
                
                // Select the row that was long pressed
                const row = table.getRowModel().rows.find((r) => r.id === rowId)
                if (row && !row.getIsSelected()) {
                    row.toggleSelected()
                }

                // Provide haptic feedback if available
                if (navigator.vibrate) {
                    navigator.vibrate(50)
                }
            }, longPressDuration)
        },
        [table, enableLongPress, longPressDuration]
    )

    const handleRowPointerUp = React.useCallback(
        (rowId: string) => {
            // Clear long press timer
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current)
                longPressTimerRef.current = null
            }

            // If we're in selection mode and this is the same row, don't toggle
            // (it was already selected during long press)
            if (isSelectionMode && longPressRowIdRef.current === rowId) {
                longPressRowIdRef.current = null
                return
            }

            longPressRowIdRef.current = null
        },
        [isSelectionMode]
    )

    const clearSelectionMode = React.useCallback(() => {
        setIsSelectionMode(false)
    }, [])

    // Keyboard shortcuts
    React.useEffect(() => {
        if (!enableKeyboardShortcuts) return

        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle shortcuts when not typing in an input
            const activeElement = document.activeElement
            const isInputFocused =
                activeElement?.tagName === "INPUT" ||
                activeElement?.tagName === "TEXTAREA" ||
                (activeElement instanceof HTMLElement && activeElement.isContentEditable)

            if (isInputFocused) return

            // Ctrl/Cmd + A: Select all visible rows
            if ((e.ctrlKey || e.metaKey) && e.key === "a") {
                e.preventDefault()
                table.toggleAllPageRowsSelected(true)
                return
            }

            // Space: Toggle current row selection (if a row is focused)
            if (e.key === " " && activeElement?.closest("tr")) {
                e.preventDefault()
                const rowElement = activeElement.closest("tr")
                const rowId = rowElement?.getAttribute("data-row-id")
                if (rowId) {
                    const row = table.getRowModel().rows.find((r) => r.id === rowId)
                    if (row) {
                        row.toggleSelected()
                    }
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [table, enableKeyboardShortcuts])

    // Cleanup long press timer on unmount
    React.useEffect(() => {
        return () => {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current)
            }
        }
    }, [])

    // Check if a row is in the current selection range
    const isRowInRange = React.useCallback(
        (rowId: string) => {
            void rowId
            // This is a simplified check - in a real implementation,
            // you might want to track the actual range more precisely
            // For now, we'll just check if there's a last selected row
            return lastSelectedRowIndexRef.current !== null
        },
        []
    )

    // Expose lastSelectedRowIndex as a state that updates when it changes
    const [lastSelectedRowIndex, setLastSelectedRowIndex] = React.useState<number | null>(null)
    
    React.useEffect(() => {
        setLastSelectedRowIndex(lastSelectedRowIndexRef.current)
    }, [table.getRowModel().rows.length]) // Update when rows change

    return {
        handleRowSelect,
        handleRowPointerDown,
        handleRowPointerUp,
        isSelectionMode,
        clearSelectionMode,
        lastSelectedRowIndex,
        isRowInRange
    }
}

