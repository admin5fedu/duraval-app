/**
 * TabGroup Component - Generic Tab Group for List Views
 * 
 * Một component generic để quản lý tabs trong list views, theo quy chuẩn của hệ thống.
 * Hỗ trợ cả hai patterns:
 * 1. Internal tabs - switch giữa các views trong cùng component (dùng value/onValueChange)
 * 2. Navigation tabs - navigate giữa các routes khác nhau (dùng route paths)
 * 
 * @example
 * ```tsx
 * // Internal tabs pattern
 * <TabGroup
 *   tabs={[
 *     { value: "month", label: "Theo tháng", content: <MonthView /> },
 *     { value: "year", label: "Theo năm", content: <YearView /> },
 *   ]}
 *   value={activeTab}
 *   onValueChange={setActiveTab}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // Navigation tabs pattern
 * <TabGroup
 *   tabs={[
 *     { value: "loai-phieu", label: "Loại phiếu", route: "/kinh-doanh/loai-phieu", icon: FileText },
 *     { value: "hang-muc", label: "Hạng mục", route: "/kinh-doanh/hang-muc", icon: Tag },
 *   ]}
 *   mode="navigation"
 * />
 * ```
 */

"use client"

import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export interface TabItem {
  value: string
  label: string
  icon?: LucideIcon
  content?: React.ReactNode
  route?: string // For navigation mode
  disabled?: boolean
}

interface TabGroupProps {
  /**
   * Danh sách các tabs
   */
  tabs: TabItem[]
  
  /**
   * Mode: "internal" hoặc "navigation"
   * - "internal": Switch giữa các views trong cùng component (dùng với value/onValueChange)
   * - "navigation": Navigate giữa các routes khác nhau
   */
  mode?: "internal" | "navigation"
  
  /**
   * Value hiện tại (chỉ dùng cho internal mode)
   */
  value?: string
  
  /**
   * Callback khi value thay đổi (chỉ dùng cho internal mode)
   */
  onValueChange?: (value: string) => void
  
  /**
   * Default value (chỉ dùng cho internal mode)
   */
  defaultValue?: string
  
  /**
   * Custom className cho container
   */
  className?: string
  
  /**
   * Custom className cho TabsList
   */
  tabsListClassName?: string
  
  /**
   * Custom className cho TabsContent
   */
  tabsContentClassName?: string
}

/**
 * TabGroup Component
 * 
 * Component generic để quản lý tabs trong list views theo quy chuẩn của hệ thống
 */
export function TabGroup({
  tabs,
  mode = "internal",
  value,
  onValueChange,
  defaultValue,
  className,
  tabsListClassName,
  tabsContentClassName,
}: TabGroupProps) {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Navigation mode: Xác định active tab dựa trên route
  const activeTabFromRoute = React.useMemo(() => {
    if (mode !== "navigation") return undefined
    
    const pathname = location.pathname
    for (const tab of tabs) {
      if (tab.route && pathname.startsWith(tab.route)) {
        return tab.value
      }
    }
    return tabs[0]?.value
  }, [location.pathname, mode, tabs])
  
  // Handle tab change cho navigation mode
  const handleNavigationTabChange = React.useCallback((value: string) => {
    const tab = tabs.find((t) => t.value === value)
    if (tab?.route) {
      navigate(tab.route)
    }
  }, [tabs, navigate])
  
  // Render navigation tabs (button group style như LoaiPhieuHangMucTabs)
  if (mode === "navigation") {
    const activeTab = activeTabFromRoute || tabs[0]?.value
    
    return (
      <div className={cn(
        "w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}>
        <div className="mx-auto w-full px-4 pt-1 pb-2">
          <div className={cn(
            "inline-flex h-8 items-center justify-start rounded-lg border bg-muted p-0.5 text-muted-foreground",
            tabsListClassName
          )}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value
              const Icon = tab.icon
              
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleNavigationTabChange(tab.value)}
                  disabled={tab.disabled}
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium",
                    "ring-offset-background transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-background/80 hover:text-foreground"
                  )}
                  aria-pressed={isActive}
                  aria-label={tab.label}
                >
                  {Icon && (
                    <Icon className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )} />
                  )}
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
  
  // Render internal tabs (dùng Tabs từ Radix UI)
  return (
    <Tabs
      value={value || defaultValue}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <TabsList className={cn("mb-4", tabsListClassName)}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={tab.disabled}
              className="gap-2"
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{tab.label}</span>
            </TabsTrigger>
          )
        })}
      </TabsList>
      
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={cn("mt-0", tabsContentClassName)}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

