/**
 * Text Style Utilities
 * 
 * Utility functions để tạo consistent text styling
 * Sử dụng design tokens từ constants
 */

import { cn } from "@/lib/utils"
import { TYPOGRAPHY } from "@/shared/constants/typography"

/**
 * Page title styling (for h1 elements)
 * Responsive: text-lg on mobile, text-xl on desktop
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 * 
 * @example
 * ```tsx
 * <h1 className={pageTitleClass("text-foreground")}>
 *   Page Title
 * </h1>
 * ```
 */
export const pageTitleClass = (additionalClasses?: string) => {
  return cn(
    "text-lg sm:text-xl font-bold tracking-tight",
    additionalClasses
  )
}

/**
 * Empty state title styling
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const emptyStateTitleClass = (additionalClasses?: string) => {
  return cn(
    TYPOGRAPHY.sizes.lg, // text-lg
    TYPOGRAPHY.weights.semibold, // font-semibold
    additionalClasses
  )
}

/**
 * Dialog/Modal title styling
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const dialogTitleClass = (additionalClasses?: string) => {
  return cn(
    TYPOGRAPHY.sizes.lg, // text-lg
    TYPOGRAPHY.weights.semibold, // font-semibold
    additionalClasses
  )
}

/**
 * Body text styling (default text size)
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const bodyTextClass = (additionalClasses?: string) => {
  return cn(
    TYPOGRAPHY.sizes.sm, // text-sm
    additionalClasses
  )
}

/**
 * Small text styling (labels, hints, secondary text)
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const smallTextClass = (additionalClasses?: string) => {
  return cn(
    TYPOGRAPHY.sizes.xs, // text-xs
    additionalClasses
  )
}

/**
 * Medium text with font-medium weight
 * Commonly used for labels, emphasized text
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const mediumTextClass = (additionalClasses?: string) => {
  return cn(
    TYPOGRAPHY.sizes.sm, // text-sm
    TYPOGRAPHY.weights.medium, // font-medium
    additionalClasses
  )
}

/**
 * Small text with font-medium weight
 * Commonly used for toolbar labels, badges
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const smallMediumTextClass = (additionalClasses?: string) => {
  return cn(
    TYPOGRAPHY.sizes.xs, // text-xs
    TYPOGRAPHY.weights.medium, // font-medium
    additionalClasses
  )
}

/**
 * Responsive text: xs on mobile, sm on desktop
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const responsiveTextClass = (additionalClasses?: string) => {
  return cn(
    "text-xs md:text-sm",
    additionalClasses
  )
}

