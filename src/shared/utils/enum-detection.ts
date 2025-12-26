/**
 * Enum Detection System
 * 
 * Automatically detects enum fields from:
 * - Form field configurations (options array)
 * - Column definitions (meta.enumConfig)
 * - Pattern matching (field key patterns)
 */

import { FormFieldConfig } from "@/shared/components/forms/generic-form-view/types"
import { ColumnDef } from "@tanstack/react-table"
import { EnumColorConfig, hasEnumColorConfig, registerEnumColors } from "./enum-color-registry"
import { matchesEnumPattern, autoRegisterEnumFromPattern, getDefaultColorsForPattern } from "./enum-patterns"

/**
 * Check if a field should be treated as enum based on multiple criteria
 */
export interface EnumDetectionOptions {
  fieldKey: string
  type?: string
  value?: any
  formFieldConfig?: FormFieldConfig
  columnDef?: ColumnDef<any>
  explicitEnumConfig?: EnumColorConfig
}

/**
 * Auto-detect if a field should be treated as enum
 * 
 * Priority:
 * 1. Explicit enum config
 * 2. Field key in registry
 * 3. Pattern matching (field key)
 * 4. Form field config with options
 * 5. Column meta with enumConfig
 */
export function isEnumField(options: EnumDetectionOptions): boolean {
  const { fieldKey, type, formFieldConfig, columnDef, explicitEnumConfig } = options

  // 1. Explicit enum config
  if (explicitEnumConfig) {
    return true
  }

  // 2. Explicit enum type
  if (type === "badge" || type === "status" || type === "enum") {
    return true
  }

  // 3. Field key in registry
  if (hasEnumColorConfig(fieldKey)) {
    return true
  }

  // 4. Pattern matching
  if (matchesEnumPattern(fieldKey)) {
    return true
  }

  // 5. Form field config with options (select/combobox)
  if (formFieldConfig) {
    if (formFieldConfig.type === "select" || formFieldConfig.type === "combobox") {
      if (formFieldConfig.options && formFieldConfig.options.length > 0) {
        return true
      }
    }
  }

  // 6. Column meta with enumConfig
  if (columnDef?.meta) {
    const meta = columnDef.meta as { enumConfig?: EnumColorConfig }
    if (meta.enumConfig) {
      return true
    }
  }

  return false
}

/**
 * Auto-register enum colors from form field config
 * Extracts options array and creates color mapping
 */
export function autoRegisterEnumFromFormField(
  fieldKey: string,
  formFieldConfig: FormFieldConfig
): boolean {
  // Only process select/combobox fields with options
  if (formFieldConfig.type !== "select" && formFieldConfig.type !== "combobox") {
    return false
  }

  if (!formFieldConfig.options || formFieldConfig.options.length === 0) {
    return false
  }

  // Skip if already registered
  if (hasEnumColorConfig(fieldKey)) {
    return false
  }

  // Try to get default colors from pattern first
  const patternColors = getDefaultColorsForPattern(fieldKey)
  
  if (patternColors) {
    // Use pattern colors but extend with actual options
    const config: EnumColorConfig = { ...patternColors }
    
    // Add any missing options with default color
    formFieldConfig.options.forEach(option => {
      if (!config[option.value]) {
        config[option.value] = "bg-slate-50 text-slate-700 border-slate-200"
      }
    })
    
    registerEnumColors(fieldKey, config)
    return true
  }

  // Otherwise, create default color mapping for all options
  const config: EnumColorConfig = {}
  formFieldConfig.options.forEach((option, index) => {
    // Use a simple color rotation for options without pattern
    const colors = [
      "bg-blue-50 text-blue-700 border-blue-200",
      "bg-emerald-50 text-emerald-700 border-emerald-200",
      "bg-amber-50 text-amber-700 border-amber-200",
      "bg-purple-50 text-purple-700 border-purple-200",
      "bg-pink-50 text-pink-700 border-pink-200",
      "bg-slate-50 text-slate-700 border-slate-200",
    ]
    config[option.value] = colors[index % colors.length]
  })

  registerEnumColors(fieldKey, config)
  return true
}

/**
 * Auto-register enum colors from column definition
 */
export function autoRegisterEnumFromColumn(
  fieldKey: string,
  columnDef: ColumnDef<any>
): boolean {
  if (!columnDef.meta) {
    return false
  }

  const meta = columnDef.meta as { enumConfig?: EnumColorConfig }
  if (!meta.enumConfig) {
    return false
  }

  // Skip if already registered
  if (hasEnumColorConfig(fieldKey)) {
    return false
  }

  registerEnumColors(fieldKey, meta.enumConfig)
  return true
}

/**
 * Auto-detect and register enum for a field
 * Tries all detection methods and registers if found
 */
export function autoDetectAndRegisterEnum(options: EnumDetectionOptions): boolean {
  const { fieldKey, formFieldConfig, columnDef, explicitEnumConfig } = options

  // 1. Explicit config
  if (explicitEnumConfig) {
    registerEnumColors(fieldKey, explicitEnumConfig)
    return true
  }

  // 2. Column meta
  if (columnDef) {
    if (autoRegisterEnumFromColumn(fieldKey, columnDef)) {
      return true
    }
  }

  // 3. Form field config
  if (formFieldConfig) {
    if (autoRegisterEnumFromFormField(fieldKey, formFieldConfig)) {
      return true
    }
  }

  // 4. Pattern matching
  if (autoRegisterEnumFromPattern(fieldKey)) {
    return true
  }

  return false
}

