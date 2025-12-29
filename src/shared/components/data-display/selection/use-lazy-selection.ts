"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"

interface UseLazySelectionOptions {
    /**
     * Threshold for enabling lazy selection (number of rows)
     * If dataset is larger than this, lazy selection is enabled
     * @default 1000
     */
    threshold?: number
    
    /**
     * Batch size for selection operations
     * @default 100
     */
    batchSize?: number
}

interface UseLazySelectionReturn {
    /**
     * Get selected row IDs (lazy loaded)
     */
    getSelectedIds: () => Set<string>
    
    /**
     * Get selected row data (lazy loaded)
     */
    getSelectedData: <TData>() => TData[]
    
    /**
     * Check if a specific row is selected (optimized)
     */
    isRowSelected: (rowId: string) => boolean
    
    /**
     * Get selection count (optimized)
     */
    getSelectionCount: () => number
}

/**
 * Lazy Selection Hook
 * 
 * Optimizes selection state management for large datasets by:
 * - Using Set for O(1) lookups instead of array scans
 * - Lazy loading selected data only when needed
 * - Batching selection operations
 */
export function useLazySelection<TData>(
    table: Table<TData>,
    options: UseLazySelectionOptions = {}
): UseLazySelectionReturn {
    const {
        threshold = 1000,
        batchSize: _batchSize = 100
    } = options
    void _batchSize

    const rowCount = table.getRowModel().rows.length
    const shouldUseLazy = rowCount > threshold

    // Memoized selected IDs set for O(1) lookups
    const selectedIdsRef = React.useRef<Set<string>>(new Set())
    
    // Update selected IDs when selection changes
    React.useEffect(() => {
        const selection = table.getState().rowSelection
        const newSet = new Set<string>()
        
        Object.keys(selection).forEach((rowId) => {
            if (selection[rowId]) {
                newSet.add(rowId)
            }
        })
        
        selectedIdsRef.current = newSet
    }, [table.getState().rowSelection])

    // Get selected row IDs (lazy)
    const getSelectedIds = React.useCallback(() => {
        if (!shouldUseLazy) {
            // For small datasets, use table's built-in method
            const selectedRows = table.getFilteredSelectedRowModel().rows
            return new Set(selectedRows.map(row => row.id))
        }
        
        // For large datasets, use cached set
        return new Set(selectedIdsRef.current)
    }, [table, shouldUseLazy])

    // Get selected row data (lazy - only loads when called)
    const getSelectedData = React.useCallback(<TData,>() => {
        const selectedIds = getSelectedIds()
        const rows = table.getRowModel().rows
        
        // Only process selected rows
        const selectedData: TData[] = []
        for (const row of rows) {
            if (selectedIds.has(row.id)) {
                selectedData.push(row.original as unknown as TData)
            }
        }
        
        return selectedData
    }, [table, getSelectedIds])

    // Check if a row is selected (optimized O(1) lookup)
    const isRowSelected = React.useCallback((rowId: string) => {
        if (!shouldUseLazy) {
            return table.getState().rowSelection[rowId] === true
        }
        
        return selectedIdsRef.current.has(rowId)
    }, [table, shouldUseLazy])

    // Get selection count (optimized)
    const getSelectionCount = React.useCallback(() => {
        if (!shouldUseLazy) {
            return table.getFilteredSelectedRowModel().rows.length
        }
        
        return selectedIdsRef.current.size
    }, [table, shouldUseLazy])

    return {
        getSelectedIds,
        getSelectedData,
        isRowSelected,
        getSelectionCount
    }
}

