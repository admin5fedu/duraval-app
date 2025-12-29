/**
 * TypeScript Types for Design System Utilities
 * 
 * Strict types cho các utility functions và design tokens
 */

import type { ClassValue } from "clsx"

/**
 * Type for additional classes parameter in utility functions
 */
export type AdditionalClasses = ClassValue | undefined

/**
 * Type for utility function return value
 */
export type UtilityClass = string

/**
 * Typography size keys
 */
export type TypographySize = keyof typeof import("../constants/typography").TYPOGRAPHY.sizes

/**
 * Typography weight keys
 */
export type TypographyWeight = keyof typeof import("../constants/typography").TYPOGRAPHY.weights

/**
 * Spacing gap keys
 */
export type SpacingGap = keyof typeof import("../constants/spacing").SPACING.gap

/**
 * Spacing padding keys
 */
export type SpacingPadding = keyof typeof import("../constants/spacing").SPACING.padding

/**
 * Border radius keys
 */
export type BorderRadius = keyof typeof import("../constants/border-radius").BORDER_RADIUS

/**
 * Shadow keys
 */
export type Shadow = keyof typeof import("../constants/shadows").SHADOWS

/**
 * Utility function signature
 */
export type UtilityFunction = (additionalClasses?: AdditionalClasses) => UtilityClass

/**
 * Component-specific utility function signature
 */
export type ComponentUtilityFunction = UtilityFunction

