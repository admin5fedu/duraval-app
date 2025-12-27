/**
 * Application Configuration
 * Centralized configuration for app metadata, branding, and constants
 */

/**
 * App metadata
 * Note: Version can be set via VITE_APP_VERSION env variable or default to 1.0.0
 */
export const APP_NAME = 'Duraval ERP'
export const APP_DESCRIPTION = 'Hệ thống quản lý doanh nghiệp ERP'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'

/**
 * Logo configuration
 * Using external URL for now - can be replaced with local asset later
 * For production: consider using /logo.svg or /logo.png in public folder
 * 
 * Best practice: Use lazy loading for logo to improve initial page load
 */
export const LOGO_URL = 'https://duraval.vn/wp-content/uploads/2024/08/logoduraval-png-khong-chu-e1724896799526-1024x370.png'
export const LOGO_FALLBACK = '/logo.png' // Local fallback if needed

/**
 * TopBar configuration
 */
export const TOPBAR_CLASSES = {
  container: 'flex h-16 shrink-0 items-center gap-2 border-b px-2 md:px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed md:sticky top-0 left-0 right-0 md:left-auto md:right-auto z-50 transition-all w-full max-w-full min-w-0 shadow-sm',
} as const

