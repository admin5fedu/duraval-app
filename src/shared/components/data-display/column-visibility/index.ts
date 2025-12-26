/**
 * Column Visibility Module
 * 
 * Exports for column visibility functionality
 */

export { ColumnVisibilityDropdown } from "./column-visibility-dropdown"
export type { ColumnVisibilityDropdownProps } from "./column-visibility-dropdown"

// Re-export for backward compatibility
export { ColumnVisibilityDropdown as DataTableViewOptions } from "./column-visibility-dropdown"
export type { ColumnVisibilityDropdownProps as DataTableViewOptionsProps } from "./column-visibility-dropdown"

// Export hooks for advanced usage
export { useColumnVisibility } from "./hooks/use-column-visibility"
export { useColumnSearch } from "./hooks/use-column-search"
export { useColumnStorage } from "./hooks/use-column-storage"

// Export utilities
export { getColumnDisplayName, getColumnOrder, isColumnHideable } from "./utils/column-helpers"

