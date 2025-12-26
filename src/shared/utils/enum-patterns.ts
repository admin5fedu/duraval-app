/**
 * Enum Pattern Detection System
 * 
 * Automatically detects enum fields based on naming patterns
 * and provides default color suggestions.
 */

import { EnumColorConfig, registerEnumColors } from "./enum-color-registry"

/**
 * Pattern rules for detecting enum fields
 * Each pattern is a regex that matches field keys
 */
export interface EnumPatternRule {
  pattern: RegExp
  defaultColors?: EnumColorConfig
  priority: number // Higher priority = checked first
}

/**
 * Default pattern rules for common enum naming conventions
 */
const DEFAULT_PATTERN_RULES: EnumPatternRule[] = [
  // Status patterns (highest priority)
  {
    pattern: /_status$|_trang_thai$/i,
    defaultColors: {
      "Active": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "Inactive": "bg-slate-50 text-slate-700 border-slate-200",
      "Pending": "bg-amber-50 text-amber-700 border-amber-200",
      "Cancelled": "bg-red-50 text-red-700 border-red-200",
    },
    priority: 100,
  },
  // Type patterns
  {
    pattern: /_type$|_loai$/i,
    defaultColors: {
      "Default": "bg-slate-50 text-slate-700 border-slate-200",
      "Premium": "bg-purple-50 text-purple-700 border-purple-200",
      "Standard": "bg-blue-50 text-blue-700 border-blue-200",
    },
    priority: 90,
  },
  // State patterns
  {
    pattern: /_state$|_tinh_trang$/i,
    defaultColors: {
      "New": "bg-blue-50 text-blue-700 border-blue-200",
      "Processing": "bg-amber-50 text-amber-700 border-amber-200",
      "Completed": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "Failed": "bg-red-50 text-red-700 border-red-200",
    },
    priority: 80,
  },
  // Result patterns
  {
    pattern: /_result$|_ket_qua$/i,
    defaultColors: {
      "Success": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "Error": "bg-red-50 text-red-700 border-red-200",
      "Warning": "bg-amber-50 text-amber-700 border-amber-200",
    },
    priority: 70,
  },
  // Boolean-like patterns
  {
    pattern: /^(is_|has_|can_|should_|ap_dung|enabled|disabled)/i,
    defaultColors: {
      "true": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "false": "bg-slate-50 text-slate-600 border-slate-200",
      "1": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "0": "bg-slate-50 text-slate-600 border-slate-200",
      "có": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "không": "bg-slate-50 text-slate-600 border-slate-200",
    },
    priority: 60,
  },
]

/**
 * Check if a field key matches any enum pattern
 */
export function matchesEnumPattern(fieldKey: string): boolean {
  return DEFAULT_PATTERN_RULES.some(rule => rule.pattern.test(fieldKey))
}

/**
 * Get matching pattern rule for a field key
 */
export function getMatchingPatternRule(fieldKey: string): EnumPatternRule | undefined {
  // Sort by priority (highest first)
  const sortedRules = [...DEFAULT_PATTERN_RULES].sort((a, b) => b.priority - a.priority)
  
  return sortedRules.find(rule => rule.pattern.test(fieldKey))
}

/**
 * Get default colors for a field key based on pattern matching
 */
export function getDefaultColorsForPattern(fieldKey: string): EnumColorConfig | undefined {
  const rule = getMatchingPatternRule(fieldKey)
  return rule?.defaultColors
}

/**
 * Auto-register enum colors based on pattern matching
 * This is called when a new enum field is detected
 */
export function autoRegisterEnumFromPattern(fieldKey: string): boolean {
  const defaultColors = getDefaultColorsForPattern(fieldKey)
  
  if (defaultColors) {
    registerEnumColors(fieldKey, defaultColors)
    return true
  }
  
  return false
}

/**
 * Add custom pattern rule
 */
export function addPatternRule(rule: EnumPatternRule): void {
  DEFAULT_PATTERN_RULES.push(rule)
  // Re-sort by priority
  DEFAULT_PATTERN_RULES.sort((a, b) => b.priority - a.priority)
}

/**
 * Get all pattern rules (for inspection/debugging)
 */
export function getAllPatternRules(): ReadonlyArray<EnumPatternRule> {
  return DEFAULT_PATTERN_RULES
}

