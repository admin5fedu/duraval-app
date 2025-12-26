/**
 * Import Preferences Manager
 * 
 * Generic utility to save and load import preferences per module
 * Persists import options and column mappings
 */

export interface ImportPreferences {
  importOptions: {
    skipEmptyCells?: boolean
    upsertMode?: 'update' | 'skip' | 'error'
    defaultValues?: Record<string, any>
    dateFormat?: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd' | 'auto'
  }
  columnMapping?: Record<string, string> // Excel column -> DB field mapping
  lastUpdated: string
}

const STORAGE_KEY_PREFIX = 'import-preferences-'

/**
 * Get storage key for a module
 */
function getStorageKey(moduleName: string): string {
  return `${STORAGE_KEY_PREFIX}${moduleName}`
}

/**
 * Load import preferences for a module
 */
export function loadImportPreferences(moduleName: string): ImportPreferences | null {
  if (typeof window === 'undefined') return null
  
  try {
    const key = getStorageKey(moduleName)
    const stored = localStorage.getItem(key)
    if (!stored) return null
    
    return JSON.parse(stored) as ImportPreferences
  } catch (error) {
    console.warn('Failed to load import preferences:', error)
    return null
  }
}

/**
 * Save import preferences for a module
 */
export function saveImportPreferences(
  moduleName: string,
  preferences: Omit<ImportPreferences, 'lastUpdated'>
): void {
  if (typeof window === 'undefined') return
  
  try {
    const key = getStorageKey(moduleName)
    const data: ImportPreferences = {
      ...preferences,
      lastUpdated: new Date().toISOString(),
    }
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save import preferences:', error)
  }
}

/**
 * Clear import preferences for a module
 */
export function clearImportPreferences(moduleName: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const key = getStorageKey(moduleName)
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Failed to clear import preferences:', error)
  }
}

