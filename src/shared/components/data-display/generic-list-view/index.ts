/**
 * GenericListView Component Exports
 * 
 * Centralized exports for the GenericListView module.
 * Provides a clean API for importing the component and its types.
 */

// Main component export
export { GenericListView } from "./generic-list-view"

// Type exports
export type {
    GenericListViewProps,
    UseGenericListTableStateParams,
    UseGenericListTableStateReturn,
    UseGenericListSelectionParams,
    UseGenericListSelectionReturn,
    GenericListToolbarSectionProps,
    GenericListMobileSectionProps,
    GenericListMobileFooterSectionProps,
    GenericListTableSectionProps,
    GenericListFooterSectionProps,
} from "./types"

// Hook exports (if needed for reuse)
export {
    useGenericListTableState,
    useGenericListSelection,
} from "./hooks"

// Section exports (if needed for reuse or testing)
export {
    GenericListToolbarSection,
    GenericListMobileSection,
    GenericListTableSection,
    GenericListMobileFooterSection,
    GenericListFooterSection,
} from "./sections"

