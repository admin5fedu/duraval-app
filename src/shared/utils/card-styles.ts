/**
 * Card Style Utilities
 * 
 * Utility functions để tạo consistent styling cho card components
 * Sử dụng design tokens từ constants
 */

import { cn } from "@/lib/utils"
import { CARD_SPACING } from "@/shared/constants/spacing"
import { cardRadiusClass } from "./border-radius-styles"
import { cardShadowClass } from "./shadow-styles"

/**
 * Standard card padding className
 * Compact padding: p-4 (16px)
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 * 
 * @example
 * ```tsx
 * <CardContent className={cardPaddingClass()}>
 *   Content
 * </CardContent>
 * ```
 */
export const cardPaddingClass = (additionalClasses?: string) => {
  return cn(
    CARD_SPACING.padding, // p-4
    additionalClasses
  )
}

/**
 * Card component className with standard styling
 * Includes border radius and shadow
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const cardClass = (additionalClasses?: string) => {
  return cn(
    "border bg-card/50", // Base card styling
    cardRadiusClass(),   // rounded-lg
    cardShadowClass(),   // shadow-sm
    additionalClasses
  )
}

