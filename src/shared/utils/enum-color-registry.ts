/**
 * Enum Color Registry System
 * 
 * Centralized system for managing enum color configurations across the app.
 * Supports automatic detection, pattern matching, and manual registration.
 */

/**
 * Enum color configuration mapping
 * Maps enum values to Tailwind CSS classes
 */
export interface EnumColorConfig {
  [value: string]: string // value -> className
}

/**
 * Registry to store color mappings for enum fields
 * Key: field key or enum identifier
 * Value: color mapping configuration
 */
const ENUM_COLOR_REGISTRY: Record<string, EnumColorConfig> = {}

/**
 * Default color for enum values not found in registry
 */
const DEFAULT_ENUM_COLOR = "bg-slate-50 text-slate-700 border-slate-200"
const EMPTY_ENUM_COLOR = "bg-muted text-muted-foreground border-transparent"

/**
 * Register enum color configuration for a field key
 * 
 * @example
 * ```ts
 * registerEnumColors("trang_thai_don_hang", {
 *   "Mới": "bg-blue-50 text-blue-700 border-blue-200",
 *   "Đang xử lý": "bg-amber-50 text-amber-700 border-amber-200",
 *   "Hoàn thành": "bg-emerald-50 text-emerald-700 border-emerald-200",
 * })
 * ```
 */
export function registerEnumColors(fieldKey: string, config: EnumColorConfig): void {
  ENUM_COLOR_REGISTRY[fieldKey] = config
}

/**
 * Register multiple enum color configurations at once
 */
export function registerMultipleEnumColors(configs: Record<string, EnumColorConfig>): void {
  Object.entries(configs).forEach(([fieldKey, config]) => {
    registerEnumColors(fieldKey, config)
  })
}

/**
 * Get color class for enum value based on field key
 * 
 * @param fieldKey - The field key (e.g., "tinh_trang", "gioi_tinh")
 * @param value - The enum value (string, number, boolean, null, undefined)
 * @returns Tailwind CSS classes for the badge
 */
export function getEnumBadgeClass(
  fieldKey: string,
  value: string | number | boolean | null | undefined
): string {
  // Handle null/undefined/empty
  if (value === null || value === undefined || value === "") {
    return EMPTY_ENUM_COLOR
  }

  // Get config for this field
  const config = ENUM_COLOR_REGISTRY[fieldKey]
  if (!config) {
    return DEFAULT_ENUM_COLOR
  }

  // Normalize value to string
  let valueStr: string
  if (typeof value === "boolean") {
    valueStr = value ? "true" : "false"
  } else {
    valueStr = String(value).trim()
  }

  // Try exact match first
  if (config[valueStr]) {
    return config[valueStr]
  }

  // Try case-insensitive match
  const lowerValue = valueStr.toLowerCase()
  for (const [key, className] of Object.entries(config)) {
    if (key.toLowerCase() === lowerValue) {
      return className
    }
  }

  // Fallback to default
  return DEFAULT_ENUM_COLOR
}

/**
 * Check if a field key has enum color configuration
 */
export function hasEnumColorConfig(fieldKey: string): boolean {
  return fieldKey in ENUM_COLOR_REGISTRY
}

/**
 * Get all registered enum field keys
 */
export function getRegisteredEnumKeys(): string[] {
  return Object.keys(ENUM_COLOR_REGISTRY)
}

/**
 * Get enum color config for a field key (for inspection/debugging)
 */
export function getEnumColorConfig(fieldKey: string): EnumColorConfig | undefined {
  return ENUM_COLOR_REGISTRY[fieldKey]
}

/**
 * Clear all registered enum colors (useful for testing)
 */
export function clearEnumColorRegistry(): void {
  Object.keys(ENUM_COLOR_REGISTRY).forEach(key => {
    delete ENUM_COLOR_REGISTRY[key]
  })
}

/**
 * Initialize registry with default enum colors
 * This should be called once at app startup
 */
export function initializeDefaultEnumColors(): void {
  // 1. Tình trạng nhân sự
  registerEnumColors("tinh_trang", {
    "Chính thức": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Thử việc": "bg-amber-50 text-amber-700 border-amber-200",
    "Nghỉ việc": "bg-red-50 text-red-700 border-red-200",
    "Tạm nghỉ": "bg-slate-50 text-slate-700 border-slate-200",
  })

  // 2. Mối quan hệ người thân
  registerEnumColors("moi_quan_he", {
    "Cha": "bg-blue-50 text-blue-700 border-blue-200",
    "Bố": "bg-blue-50 text-blue-700 border-blue-200", // Alias
    "Mẹ": "bg-pink-50 text-pink-700 border-pink-200",
    "Vợ/Chồng": "bg-purple-50 text-purple-700 border-purple-200",
    "Vợ / Chồng": "bg-purple-50 text-purple-700 border-purple-200", // Alias
    "Con": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Anh/Chị/Em": "bg-amber-50 text-amber-700 border-amber-200",
    "Khác": "bg-slate-50 text-slate-700 border-slate-200",
    "Người thân": "bg-slate-50 text-slate-700 border-slate-200", // Alias
  })

  // 3. Giới tính
  registerEnumColors("gioi_tinh", {
    "Nam": "bg-blue-50 text-blue-700 border-blue-200",
    "Nữ": "bg-pink-50 text-pink-700 border-pink-200",
    "Khác": "bg-purple-50 text-purple-700 border-purple-200",
  })

  // 4. Hôn nhân
  registerEnumColors("hon_nhan", {
    "Độc thân": "bg-slate-50 text-slate-700 border-slate-200",
    "Đã kết hôn": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Ly dị": "bg-amber-50 text-amber-700 border-amber-200",
  })

  // 5. Kết quả
  registerEnumColors("ket_qua", {
    "Đúng": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Sai": "bg-red-50 text-red-700 border-red-200",
    "Chưa chấm": "bg-slate-50 text-slate-700 border-slate-200",
  })

  // 6. Boolean / Áp dụng
  registerEnumColors("ap_dung", {
    "true": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "false": "bg-slate-50 text-slate-600 border-slate-200",
    "1": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "0": "bg-slate-50 text-slate-600 border-slate-200",
    "có": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "không": "bg-slate-50 text-slate-600 border-slate-200",
    "yes": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "no": "bg-slate-50 text-slate-600 border-slate-200",
  })

  // 7. Cấp độ phòng ban
  registerEnumColors("cap_do", {
    "Phòng": "bg-blue-50 text-blue-700 border-blue-200",
    "Bộ phận": "bg-amber-50 text-amber-700 border-amber-200",
    "Nhóm": "bg-purple-50 text-purple-700 border-purple-200",
  })

  // 8. Bậc cấp bậc (1-10)
  registerEnumColors("bac", {
    "1": "bg-red-50 text-red-700 border-red-200",
    "2": "bg-orange-50 text-orange-700 border-orange-200",
    "3": "bg-amber-50 text-amber-700 border-amber-200",
    "4": "bg-yellow-50 text-yellow-700 border-yellow-200",
    "5": "bg-lime-50 text-lime-700 border-lime-200",
    "6": "bg-green-50 text-green-700 border-green-200",
    "7": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "8": "bg-teal-50 text-teal-700 border-teal-200",
    "9": "bg-cyan-50 text-cyan-700 border-cyan-200",
    "10": "bg-blue-50 text-blue-700 border-blue-200",
  })
}

