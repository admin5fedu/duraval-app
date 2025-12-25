/**
 * GenericFormView Component Exports
 * 
 * Centralized exports for the GenericFormView module.
 * Provides a clean API for importing the component and its types.
 */

// Main component export
export { GenericFormView } from "./generic-form-view"

// Type exports
export type {
    FieldType,
    FormFieldConfig,
    FormSection,
    GenericFormViewProps,
    FormFooterSectionProps,
} from "./types"

// Hook exports (if needed for reuse)
export {
    useGenericFormState,
    useGenericFormSubmit,
    useFormKeyboardShortcuts,
} from "./hooks"

// Section exports (if needed for reuse or testing)
export { FormFooterSection } from "./sections"

