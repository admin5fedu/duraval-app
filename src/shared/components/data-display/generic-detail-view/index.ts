/**
 * GenericDetailView Component Exports
 * 
 * Centralized exports for the GenericDetailView module.
 * Provides a clean API for importing the component and its types.
 */

// Main component export
export { GenericDetailView } from "./generic-detail-view"

// Export simplified version separately (re-export from parent)
export { GenericDetailViewSimple } from "../generic-detail-view-simple"

// Type exports
export type {
    DetailField,
    DetailSection,
    GenericDetailConfig,
    GenericDetailViewProps,
    UseGenericDetailStateReturn,
    DetailHeaderSectionProps,
    DetailSectionsProps,
    DetailDeleteDialogProps,
    DetailLoadingStateProps,
    DetailEmptyStateProps,
} from "./types"

// Hook exports (if needed for reuse)
export { useGenericDetailState } from "./hooks"

// Section exports (if needed for reuse or testing)
export {
    DetailHeaderSection,
    DetailSections,
    DetailDeleteDialog,
    DetailLoadingState,
    DetailEmptyState,
} from "./sections"

// Detail component exports
export { DetailErrorState } from "../detail/detail-error-state"
export { DetailViewSkeleton } from "../detail/detail-view-skeleton"

// Utils exports (if needed for reuse)
export { renderFieldValue } from "./utils"

