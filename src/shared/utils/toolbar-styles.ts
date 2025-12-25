/**
 * Toolbar Style Utilities
 * 
 * Utility functions để tạo consistent styling cho toolbar components
 * Sử dụng design tokens từ constants
 */

import { cn } from "@/lib/utils"
import { BUTTON_TYPOGRAPHY } from "@/shared/constants/typography"
import { SPACING } from "@/shared/constants/spacing"
import { buttonRadiusClass } from "./border-radius-styles"

/**
 * Standard toolbar button className
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 * 
 * @example
 * ```tsx
 * <Button className={toolbarButtonClass("px-2.5")}>
 *   Click me
 * </Button>
 * ```
 */
export const toolbarButtonClass = (additionalClasses?: string) => {
  return cn(
    "h-8", // Standard toolbar button height
    "shrink-0",
    BUTTON_TYPOGRAPHY.toolbar.fontSize, // text-xs
    BUTTON_TYPOGRAPHY.toolbar.fontWeight, // font-medium
    buttonRadiusClass(), // rounded-md
    additionalClasses
  )
}

/**
 * Toolbar button with outline variant and destructive color
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 * 
 * @example
 * ```tsx
 * <Button 
 *   variant="outline" 
 *   className={toolbarButtonOutlineClass("px-2.5 lg:px-3")}
 * >
 *   Bỏ lọc
 * </Button>
 * ```
 */
export const toolbarButtonOutlineClass = (additionalClasses?: string) => {
  return cn(
    toolbarButtonClass(),
    "text-destructive hover:text-destructive bg-background",
    additionalClasses
  )
}

/**
 * Toolbar container gap
 * 
 * @returns Gap class string
 */
export const toolbarGapClass = () => {
  return SPACING.toolbar.gap // gap-2
}

/**
 * Toolbar container className
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const toolbarContainerClass = (additionalClasses?: string) => {
  return cn(
    "flex items-center",
    toolbarGapClass(),
    additionalClasses
  )
}

/**
 * Action button className (Sửa, Xóa, Thêm mới, Lưu, Hủy)
 * Uses text-sm for better readability, h-9 for better touch target
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 * 
 * @example
 * ```tsx
 * <Button 
 *   variant="outline" 
 *   size="sm"
 *   className={actionButtonClass()}
 * >
 *   <Edit className="mr-2 h-4 w-4" /> Sửa
 * </Button>
 * ```
 */
export const actionButtonClass = (additionalClasses?: string) => {
  return cn(
    "h-9", // Slightly taller than toolbar buttons for better touch target
    "shrink-0",
    BUTTON_TYPOGRAPHY.action.fontSize, // text-sm (14px) - Better readability
    BUTTON_TYPOGRAPHY.action.fontWeight, // font-medium
    buttonRadiusClass(), // rounded-md
    additionalClasses
  )
}

