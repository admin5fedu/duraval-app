"use client"

import * as React from "react"
import { TableRow } from "@/components/ui/table"
import { useTableRowHover } from "@/hooks/use-table-row-hover"

interface TableRowWithHoverProps {
    isSelected: boolean
    onRowClick?: () => void
    onRowHover?: () => void
    renderCells: (bgColor: string) => React.ReactNode
    rowId: string
    onRowSelect?: (rowId: string, event: React.MouseEvent | React.PointerEvent) => void
    onRowPointerDown?: (rowId: string, event: React.PointerEvent) => void
    onRowPointerUp?: (rowId: string, event: React.PointerEvent) => void
    isSelectionMode?: boolean
    isInRange?: boolean
    showRangeHighlight?: boolean
}

/**
 * Component cho table row với hover effect đồng bộ
 * Xử lý click events và hover state cho toàn bộ row
 */
export const TableRowWithHover = React.memo(function TableRowWithHover({
    isSelected,
    onRowClick,
    onRowHover,
    renderCells,
    rowId,
    onRowSelect,
    onRowPointerDown,
    onRowPointerUp,
    isSelectionMode = false,
    isInRange = false,
    showRangeHighlight = false
}: TableRowWithHoverProps) {
    const { isHovered, setIsHovered, bgColor } = useTableRowHover(isSelected)
    void isInRange
    void showRangeHighlight
    void isHovered
    
    // Handle row click, but prevent it if clicking on checkbox
    const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
        // Check if the click target is a checkbox or inside a checkbox container
        const target = e.target as HTMLElement
        
        // Find the clicked cell
        const clickedCell = target.closest('td')
        
        // Check if clicking in checkbox column (first cell) or on checkbox elements
        const isCheckboxClick = 
            // Direct checkbox element clicks
            target.closest('[data-slot="checkbox"]') !== null ||
            target.closest('[data-slot="checkbox-indicator"]') !== null ||
            target.closest('button[aria-label="Select row"]') !== null ||
            target.closest('button[aria-label="Select all"]') !== null ||
            // Check if clicking anywhere in the first cell (checkbox column)
            (clickedCell && clickedCell.parentElement?.children[0] === clickedCell)
        
        // ⚡ Professional: If in selection mode, handle selection instead of navigation
        if (isSelectionMode && onRowSelect) {
            onRowSelect(rowId, e)
            return
        }
        
        if (!isCheckboxClick && onRowClick) {
            onRowClick()
        }
    }
    
    return (
        <TableRow
            key={rowId}
            data-row-id={rowId}
            data-state={isSelected ? "selected" : undefined}
            data-selection-mode={isSelectionMode ? "true" : undefined}
            onClick={handleRowClick}
            onPointerDown={onRowPointerDown ? (e) => {
                // Don't trigger long press if clicking on checkbox
                const target = e.target as HTMLElement
                if (target.closest('[data-slot="checkbox"]') === null) {
                    onRowPointerDown(rowId, e)
                }
            } : undefined}
            onPointerUp={onRowPointerUp ? (e) => onRowPointerUp(rowId, e) : undefined}
            className={`
                ${onRowClick || isSelectionMode ? "cursor-pointer" : ""} 
                border-b 
                hover:!bg-transparent 
                data-[state=selected]:!bg-transparent
                !bg-transparent
                ${isSelectionMode ? "select-none" : ""}
            `}
            style={{
                transition: 'background-color 0.2s ease-in-out',
                backgroundColor: 'transparent', // ✅ Force transparent background to override CSS defaults
            }}
            onMouseEnter={() => {
                setIsHovered(true)
                onRowHover?.()
            }}
            onMouseLeave={() => setIsHovered(false)}
        >
            {renderCells(bgColor)}
        </TableRow>
    )
})

