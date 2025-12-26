/**
 * Export Template Manager
 * 
 * Generic utility to save and load export configurations
 * Can be reused across all modules
 */

export interface ExportTemplate {
  id: string
  name: string
  moduleName: string
  createdAt: string
  updatedAt: string
  config: {
    selectedColumns: string[]
    columnOrder: Record<string, number>
    exportOptions: {
      includeMetadata?: boolean
      professionalFormatting?: boolean
      dateFormat?: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd'
    }
    defaultMode?: 'all' | 'filtered' | 'selected'
    defaultFormat?: 'excel' | 'pdf'
  }
}

const STORAGE_KEY_PREFIX = 'export-templates-'

/**
 * Get storage key for a module
 */
function getStorageKey(moduleName: string): string {
  return `${STORAGE_KEY_PREFIX}${moduleName}`
}

/**
 * Get all templates for a module
 */
export function getExportTemplates(moduleName: string): ExportTemplate[] {
  if (typeof window === 'undefined') return []
  
  try {
    const key = getStorageKey(moduleName)
    const stored = localStorage.getItem(key)
    if (!stored) return []
    
    const templates: ExportTemplate[] = JSON.parse(stored)
    return templates.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  } catch (error) {
    console.warn('Failed to load export templates:', error)
    return []
  }
}

/**
 * Save export template
 */
export function saveExportTemplate(
  moduleName: string,
  template: Omit<ExportTemplate, 'id' | 'createdAt' | 'updatedAt' | 'moduleName'>
): ExportTemplate {
  if (typeof window === 'undefined') {
    throw new Error('localStorage is not available')
  }
  
  const templates = getExportTemplates(moduleName)
  const now = new Date().toISOString()
  
  const newTemplate: ExportTemplate = {
    id: template.id || `template-${Date.now()}`,
    name: template.name,
    moduleName,
    createdAt: template.id 
      ? templates.find(t => t.id === template.id)?.createdAt || now
      : now,
    updatedAt: now,
    config: template.config,
  }
  
  // Update existing or add new
  const existingIndex = templates.findIndex(t => t.id === newTemplate.id)
  if (existingIndex >= 0) {
    templates[existingIndex] = newTemplate
  } else {
    templates.push(newTemplate)
  }
  
  // Limit to 10 templates per module
  const limitedTemplates = templates.slice(0, 10)
  
  try {
    const key = getStorageKey(moduleName)
    localStorage.setItem(key, JSON.stringify(limitedTemplates))
  } catch (error) {
    console.warn('Failed to save export template:', error)
    throw error
  }
  
  return newTemplate
}

/**
 * Load export template
 */
export function loadExportTemplate(
  moduleName: string,
  templateId: string
): ExportTemplate | null {
  const templates = getExportTemplates(moduleName)
  return templates.find(t => t.id === templateId) || null
}

/**
 * Delete export template
 */
export function deleteExportTemplate(
  moduleName: string,
  templateId: string
): boolean {
  if (typeof window === 'undefined') return false
  
  const templates = getExportTemplates(moduleName)
  const filtered = templates.filter(t => t.id !== templateId)
  
  if (filtered.length === templates.length) return false
  
  try {
    const key = getStorageKey(moduleName)
    localStorage.setItem(key, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.warn('Failed to delete export template:', error)
    return false
  }
}

/**
 * Get default template for a module (most recently used)
 */
export function getDefaultExportTemplate(moduleName: string): ExportTemplate | null {
  const templates = getExportTemplates(moduleName)
  return templates.length > 0 ? templates[0] : null
}

