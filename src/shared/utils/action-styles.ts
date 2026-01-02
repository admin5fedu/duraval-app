/**
 * Action Styles Utilities
 * 
 * Utility functions để làm việc với action hierarchy system
 */

import { cn } from "@/lib/utils"
import {
  ActionLevel,
  ACTION_LEVEL_VARIANTS,
  ACTION_LEVEL_SIZES,
} from "@/shared/constants/action-levels"
import type { VariantProps } from "class-variance-authority"
import { buttonVariants } from "@/components/ui/button"
import type React from "react"

/**
 * Get button variant cho action level
 */
export function getActionVariant(
  level: ActionLevel
): VariantProps<typeof buttonVariants>["variant"] {
  return ACTION_LEVEL_VARIANTS[level]
}

/**
 * Get button size cho action level
 */
export function getActionSize(
  level: ActionLevel
): VariantProps<typeof buttonVariants>["size"] {
  return ACTION_LEVEL_SIZES[level]
}

/**
 * Generate className cho action button theo level
 * Kết hợp với các utility classes hiện có
 */
export function getActionButtonClass(
  level: ActionLevel,
  additionalClasses?: string
): string {
  const variant = getActionVariant(level)
  const size = getActionSize(level)

  return cn(buttonVariants({ variant, size }), additionalClasses)
}

/**
 * Action configuration interface
 * Sử dụng trong ActionGroup component
 */
export interface ActionConfig {
  /** Label hiển thị trên button */
  label: string
  /** Handler khi click */
  onClick?: () => void | Promise<void>
  /** Action level (mặc định: "default") */
  level?: ActionLevel
  /** Icon component (Lucide icons) */
  icon?: React.ComponentType<{ className?: string }>
  /** Disabled state */
  disabled?: boolean
  /** Loading state */
  loading?: boolean
  /** Override variant (chủ yếu cho destructive actions) */
  variant?: "destructive"
  /** Button type - nếu "submit" thì sẽ submit form gần nhất */
  type?: "button" | "submit" | "reset"
}

/**
 * Group actions theo level để render theo thứ tự ưu tiên
 */
export function groupActionsByLevel(
  actions: ActionConfig[]
): Record<ActionLevel, ActionConfig[]> {
  const grouped: Record<ActionLevel, ActionConfig[]> = {
    primary: [],
    secondary: [],
    tertiary: [],
    default: [],
  }

  actions.forEach((action) => {
    const level = action.level || "default"
    grouped[level].push(action)
  })

  return grouped
}

