"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  ActionConfig,
  getActionVariant,
  getActionSize,
} from "@/shared/utils/action-styles"
import type { ActionLevel } from "@/shared/constants/action-levels"
import { cn } from "@/lib/utils"

export interface ActionGroupProps {
  /** Danh sách actions cần render */
  actions: ActionConfig[]
  /**
   * Layout direction
   * - "horizontal": Actions trong một hàng
   * - "vertical": Actions trong một cột (mobile-friendly)
   * - "auto": Tự động chọn dựa trên screen size
   */
  direction?: "horizontal" | "vertical" | "auto"
  /**
   * Có render separator giữa các groups không
   * Separator sẽ xuất hiện giữa các nhóm actions có level khác nhau
   */
  showSeparators?: boolean
  /**
   * Có sắp xếp theo level không (primary -> secondary -> tertiary -> default)
   * Mặc định: true
   */
  sortByLevel?: boolean
  /** Additional className cho container */
  className?: string
}

/**
 * Component để render một nhóm actions với hierarchy rõ ràng
 *
 * @example
 * ```tsx
 * <ActionGroup
 *   actions={[
 *     { label: "Lưu", onClick: handleSave, level: "primary" },
 *     { label: "Hủy", onClick: handleCancel, level: "secondary" },
 *     { label: "Xem trước", onClick: handlePreview, level: "default" },
 *   ]}
 * />
 * ```
 */
export function ActionGroup({
  actions,
  direction = "horizontal",
  showSeparators = false,
  sortByLevel = true,
  className,
}: ActionGroupProps) {
  // Sort actions by level nếu cần
  const sortedActions = React.useMemo(() => {
    if (!sortByLevel) return actions

    const order: ActionLevel[] = ["primary", "secondary", "tertiary", "default"]

    return [...actions].sort((a, b) => {
      const aLevel = a.level || "default"
      const bLevel = b.level || "default"
      return order.indexOf(aLevel) - order.indexOf(bLevel)
    })
  }, [actions, sortByLevel])

  // Group by level để render separators
  const groups = React.useMemo(() => {
    if (!showSeparators) return { all: sortedActions }

    const grouped: Record<string, ActionConfig[]> = {}
    sortedActions.forEach((action) => {
      const level = action.level || "default"
      if (!grouped[level]) grouped[level] = []
      grouped[level].push(action)
    })
    return grouped
  }, [sortedActions, showSeparators])

  // Detect screen size for auto direction
  const [isHorizontal, setIsHorizontal] = React.useState(() => {
    if (direction === "horizontal") return true
    if (direction === "vertical") return false
    if (typeof window === "undefined") return true
    return window.innerWidth >= 768
  })

  React.useEffect(() => {
    if (direction !== "auto") return

    const handleResize = () => {
      setIsHorizontal(window.innerWidth >= 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [direction])

  const finalDirection = isHorizontal ? "horizontal" : "vertical"

  return (
    <div
      className={cn(
        "flex gap-2",
        finalDirection === "horizontal" ? "flex-row" : "flex-col",
        className
      )}
    >
      {showSeparators ? (
        Object.entries(groups).map(([level, levelActions], groupIndex) => (
          <React.Fragment key={level}>
            {levelActions.map((action, index) => {
              const Icon = action.icon
              const ButtonComponent = action.loading ? LoadingButton : Button
              const buttonProps: any = {
                type: action.type || "button",
                variant:
                  action.variant === "destructive"
                    ? "destructive"
                    : getActionVariant(action.level || "default"),
                size: getActionSize(action.level || "default"),
                onClick: action.onClick,
                disabled: action.disabled,
              }

              // Only pass isLoading to LoadingButton, not to regular Button
              if (action.loading && ButtonComponent === LoadingButton) {
                buttonProps.isLoading = action.loading
              }

              return (
                <ButtonComponent key={`${level}-${index}`} {...buttonProps}>
                  {Icon && <Icon className="h-4 w-4" />}
                  {action.label}
                </ButtonComponent>
              )
            })}
            {groupIndex < Object.keys(groups).length - 1 && (
              <div
                className={cn(
                  "self-stretch bg-border",
                  finalDirection === "horizontal"
                    ? "w-px my-1"
                    : "h-px w-full"
                )}
              />
            )}
          </React.Fragment>
        ))
      ) : (
        sortedActions.map((action, index) => {
          const Icon = action.icon
          const ButtonComponent = action.loading ? LoadingButton : Button
          const buttonProps: any = {
            type: action.type || "button",
            variant:
              action.variant === "destructive"
                ? "destructive"
                : getActionVariant(action.level || "default"),
            size: getActionSize(action.level || "default"),
            onClick: action.onClick,
            disabled: action.disabled,
          }

          // Only pass isLoading to LoadingButton, not to regular Button
          if (action.loading && ButtonComponent === LoadingButton) {
            buttonProps.isLoading = action.loading
          }

          return (
            <ButtonComponent key={index} {...buttonProps}>
              {Icon && <Icon className="h-4 w-4" />}
              {action.label}
            </ButtonComponent>
          )
        })
      )}
    </div>
  )
}

