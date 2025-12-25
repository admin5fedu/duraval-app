import { lazy, ComponentType } from "react"

/**
 * Utility để tạo dynamic imports cho dialogs
 * Tự động áp dụng loading state và SSR config
 * 
 * @example
 * ```tsx
 * const MyDialog = createDynamicDialog(
 *   () => import("./MyDialog").then(mod => ({ default: mod.MyDialog })),
 *   {
 *     loading: () => <div>Loading...</div>
 *   }
 * )
 * ```
 */
export function createDynamicDialog<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    options?: {
        loading?: () => React.ReactNode
    }
) {
    return lazy(importFn)
}

/**
 * Pre-configured dynamic imports cho ExportDialog
 * Sử dụng trong các List components để tự động lazy load
 * 
 * @example
 * ```tsx
 * const ExportDialog = createExportDialog(
 *   () => import("./ExportDialog").then(mod => ({ default: mod.ExportDialog }))
 * )
 * ```
 */
export function createExportDialog<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>
) {
    return createDynamicDialog(importFn, {
        loading: () => null, // Don't show loading indicator for dialogs
    })
}

/**
 * Pre-configured dynamic imports cho ImportDialog
 * Sử dụng trong các List components để tự động lazy load
 * 
 * @example
 * ```tsx
 * const ImportDialog = createImportDialog(
 *   () => import("./ImportDialog").then(mod => ({ default: mod.ImportDialog }))
 * )
 * ```
 */
export function createImportDialog<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>
) {
    return createDynamicDialog(importFn, {
        loading: () => null, // Don't show loading indicator for dialogs
    })
}

