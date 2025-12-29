"use client"

import * as React from "react"
import { useRowSelection } from "../../selection/use-row-selection"
import type {
    UseGenericListSelectionParams,
    UseGenericListSelectionReturn,
} from "../types"

/**
 * Hook to manage row selection for GenericListView
 * Handles selection mode, range selection, and keyboard shortcuts
 */
export function useGenericListSelection(
    table: any,
    {
        enableRangeSelection,
        enableLongPress,
        persistSelection,
    }: UseGenericListSelectionParams
): UseGenericListSelectionReturn {
    const [rangeStartIndex, setRangeStartIndex] = React.useState<number | null>(null)
    const [rangeEndIndex, setRangeEndIndex] = React.useState<number | null>(null)
    const isShiftHeldRef = React.useRef(false)

    const {
        handleRowSelect,
        handleRowPointerDown,
        handleRowPointerUp,
        isSelectionMode,
        clearSelectionMode,
        lastSelectedRowIndex,
    } = useRowSelection(table, {
        enableRangeSelection: enableRangeSelection ?? true,
        enableLongPress: enableLongPress ?? true,
        enableKeyboardShortcuts: true,
        persistSelection: persistSelection ?? false,
    })

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                isShiftHeldRef.current = true
            }
        }
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Shift") {
                isShiftHeldRef.current = false
                setRangeEndIndex(null)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("keyup", handleKeyUp)
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            window.removeEventListener("keyup", handleKeyUp)
        }
    }, [])

    React.useEffect(() => {
        if (lastSelectedRowIndex !== null) {
            setRangeStartIndex(lastSelectedRowIndex)
            if (isShiftHeldRef.current) {
                setRangeEndIndex(lastSelectedRowIndex)
            } else {
                setRangeEndIndex(null)
            }
        }
    }, [lastSelectedRowIndex])

    return {
        isSelectionMode,
        handleRowSelect,
        handleRowPointerDown,
        handleRowPointerUp,
        rangeStartIndex,
        rangeEndIndex,
        clearSelectionMode,
        isShiftHeldRef,
        lastSelectedRowIndex,
    }
}

