/**
 * Export Preferences Manager
 * 
 * Generic utility to save and load export preferences per module
 * Persists column selections, order, and options
 */

export interface ExportPreferences {
  selectedColumns: string[]
  columnOrder: Record<string, number>
  exportOptions: {
    includeMetadata?: boolean
    professionalFormatting?: boolean
    dateFormat?: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd'
  }
  defaultMode?: 'all' | 'filtered' | 'selected'
  defaultFormat?: 'excel' | 'pdf'
  lastUpdated: string
}

const STORAGE_KEY_PREFIX = 'export-preferences-'

/**
 * Get storage key for a module
 */
function getStorageKey(moduleName: string): string {
  return `${STORAGE_KEY_PREFIX}${moduleName}`
}

/**
 * Load export preferences for a module
 */
export function loadExportPreferences(moduleName: string): ExportPreferences | null {
  if (typeof window === 'undefined') return null
  
  try {
    const key = getStorageKey(moduleName)
    const stored = localStorage.getItem(key)
    if (!stored) return null
    
    return JSON.parse(stored) as ExportPreferences
  } catch (error) {
    console.warn('Failed to load export preferences:', error)
    return null
  }
}

/**
 * Save export preferences for a module
 */
export function saveExportPreferences(
  moduleName: string,
  preferences: Omit<ExportPreferences, 'lastUpdated'>
): void {
  if (typeof window === 'undefined') return
  
  try {
    const key = getStorageKey(moduleName)
    const data: ExportPreferences = {
      ...preferences,
      lastUpdated: new Date().toISOString(),
    }
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save export preferences:', error)
  }
}

/**
 * Clear export preferences for a module
 */
export function clearExportPreferences(moduleName: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const key = getStorageKey(moduleName)
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Failed to clear export preferences:', error)
  }
}

