/**
 * Border Radius Style Utilities
 * 
 * Utility functions để tạo consistent border radius
 * Sử dụng design tokens từ constants
 */

import { cn } from "@/lib/utils"
import { BORDER_RADIUS, RADIUS_PRESETS } from "@/shared/constants/border-radius"

/**
 * Button border radius
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const buttonRadiusClass = (additionalClasses?: string) => {
  return cn(
    RADIUS_PRESETS.button, // rounded-md
    additionalClasses
  )
}

/**
 * Card border radius
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const cardRadiusClass = (additionalClasses?: string) => {
  return cn(
    RADIUS_PRESETS.card, // rounded-lg
    additionalClasses
  )
}

/**
 * Input border radius
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const inputRadiusClass = (additionalClasses?: string) => {
  return cn(
    RADIUS_PRESETS.input, // rounded-md
    additionalClasses
  )
}

/**
 * Badge border radius
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const badgeRadiusClass = (additionalClasses?: string) => {
  return cn(
    RADIUS_PRESETS.badge, // rounded-sm
    additionalClasses
  )
}

/**
 * Avatar border radius
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const avatarRadiusClass = (additionalClasses?: string) => {
  return cn(
    RADIUS_PRESETS.avatar, // rounded-full
    additionalClasses
  )
}

/**
 * Dialog border radius
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const dialogRadiusClass = (additionalClasses?: string) => {
  return cn(
    RADIUS_PRESETS.dialog, // rounded-lg
    additionalClasses
  )
}

/**
 * Popover border radius
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const popoverRadiusClass = (additionalClasses?: string) => {
  return cn(
    RADIUS_PRESETS.popover, // rounded-lg
    additionalClasses
  )
}

