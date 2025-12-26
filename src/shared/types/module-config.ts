/**
 * Module Configuration Types
 * 
 * Centralized type definitions for module configurations
 * Ensures consistency across all modules
 */

/**
 * Filter column configuration for list view
 */
export interface FilterColumnConfig {
  columnId: string
  title: string
  options: Array<{ label: string; value: string }>
}

/**
 * Breadcrumb configuration
 */
export interface BreadcrumbConfig {
  label: string // Label for breadcrumb (default: moduleTitle)
  parentLabel?: string // Override parent label
  skipSegments?: string[] // Additional segments to skip
}

/**
 * Permissions configuration (optional)
 */
export interface PermissionsConfig {
  view?: string
  create?: string
  update?: string
  delete?: string
}

/**
 * Main module configuration interface
 * All modules should implement this interface
 */
export interface ModuleConfig {
  // Basic info
  moduleName: string
  moduleTitle: string
  moduleDescription?: string
  
  // Routing
  routePath: string
  parentPath: string
  routePattern?: string // For wildcard routes like "/he-thong/danh-sach-nhan-su/*"
  
  // Breadcrumb
  breadcrumb?: BreadcrumbConfig
  
  // Database
  tableName?: string
  primaryKey?: string
  
  // List view
  filterColumns?: FilterColumnConfig[]
  searchFields?: string[]
  defaultSorting?: Array<{ id: string; desc: boolean }>
  
  // Permissions (optional)
  permissions?: PermissionsConfig
}

