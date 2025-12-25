/**
 * Shadow Style Utilities
 * 
 * Utility functions để tạo consistent shadows
 * Sử dụng design tokens từ constants
 */

import { cn } from "@/lib/utils"
import { SHADOWS, SHADOW_PRESETS } from "@/shared/constants/shadows"

/**
 * Card shadow
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const cardShadowClass = (additionalClasses?: string) => {
  return cn(
    SHADOW_PRESETS.card, // shadow-sm
    additionalClasses
  )
}

/**
 * Button shadow
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const buttonShadowClass = (additionalClasses?: string) => {
  return cn(
    SHADOW_PRESETS.button, // shadow-sm
    additionalClasses
  )
}

/**
 * Dropdown shadow
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const dropdownShadowClass = (additionalClasses?: string) => {
  return cn(
    SHADOW_PRESETS.dropdown, // shadow-lg
    additionalClasses
  )
}

/**
 * Dialog shadow
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const dialogShadowClass = (additionalClasses?: string) => {
  return cn(
    SHADOW_PRESETS.dialog, // shadow-xl
    additionalClasses
  )
}

/**
 * Tooltip shadow
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const tooltipShadowClass = (additionalClasses?: string) => {
  return cn(
    SHADOW_PRESETS.tooltip, // shadow-md
    additionalClasses
  )
}

/**
 * Popover shadow
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const popoverShadowClass = (additionalClasses?: string) => {
  return cn(
    SHADOW_PRESETS.popover, // shadow-lg
    additionalClasses
  )
}

/**
 * Toolbar shadow
 * 
 * @param additionalClasses - Additional classes to merge
 * @returns Combined className string
 */
export const toolbarShadowClass = (additionalClasses?: string) => {
  return cn(
    SHADOW_PRESETS.toolbar, // shadow-sm
    additionalClasses
  )
}

