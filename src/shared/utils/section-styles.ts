/**
 * Section Style Utilities
 * 
 * Utility functions để tạo consistent styling cho section components
 * Sử dụng design tokens từ constants
 */

import { cn } from "@/lib/utils"
import { TYPOGRAPHY } from "@/shared/constants/typography"
import { SPACING } from "@/shared/constants/spacing"

/**
 * Section title className
 * Responsive: text-base on mobile, text-lg on desktop
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 * 
 * @example
 * ```tsx
 * <h3 className={sectionTitleClass("font-semibold text-primary")}>
 *   Section Title
 * </h3>
 * ```
 */
export const sectionTitleClass = (additionalClasses?: string) => {
  return cn(
    TYPOGRAPHY.responsive.sectionTitle, // text-base sm:text-lg
    additionalClasses
  )
}

/**
 * Form section container gap
 * 
 * @returns Gap class string
 */
export const formSectionGapClass = () => {
  return SPACING.form.sectionGap // gap-4
}

/**
 * Form section container className
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const formSectionContainerClass = (additionalClasses?: string) => {
  return cn(
    "grid",
    formSectionGapClass(), // gap-4
    additionalClasses
  )
}

/**
 * Section spacing (space-y) for vertical sections
 * 
 * @returns Space-y class string
 */
export const sectionSpacingClass = () => {
  return "space-y-4" // space-y-4 (16px)
}

