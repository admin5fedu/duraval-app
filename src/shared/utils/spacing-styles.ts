/**
 * Spacing Style Utilities
 * 
 * Utility functions để tạo consistent spacing
 * Sử dụng design tokens từ constants
 */

import { cn } from "@/lib/utils"
import { SPACING } from "@/shared/constants/spacing"

/**
 * Dialog content spacing (vertical spacing between elements)
 * 
 * @returns Space-y class string
 */
export const dialogContentSpacingClass = () => {
  return "space-y-4" // Consistent dialog spacing (16px)
}

/**
 * Dialog padding
 * Compact padding for dialog content
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const dialogPaddingClass = (additionalClasses?: string) => {
  return cn(
    SPACING.padding.base, // p-4 (16px)
    additionalClasses
  )
}

/**
 * Empty state container spacing
 * 
 * @returns Space-y class string
 */
export const emptyStateSpacingClass = () => {
  return "space-y-4" // space-y-4 (16px)
}

/**
 * Filter component spacing
 * 
 * @returns Gap class string
 */
export const filterGapClass = () => {
  return SPACING.gap.sm // gap-2 (8px)
}

/**
 * Filter container className
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const filterContainerClass = (additionalClasses?: string) => {
  return cn(
    "flex items-center",
    filterGapClass(), // gap-2
    additionalClasses
  )
}

/**
 * Small padding for compact elements
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const compactPaddingClass = (additionalClasses?: string) => {
  return cn(
    SPACING.padding.sm, // p-2 (8px)
    additionalClasses
  )
}

/**
 * Medium padding for standard elements
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const standardPaddingClass = (additionalClasses?: string) => {
  return cn(
    SPACING.padding.base, // p-4 (16px)
    additionalClasses
  )
}

