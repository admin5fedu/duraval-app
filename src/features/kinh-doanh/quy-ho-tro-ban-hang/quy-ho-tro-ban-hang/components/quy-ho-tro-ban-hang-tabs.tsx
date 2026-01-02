/**
 * Tabs Component cho Quỹ hỗ trợ bán hàng
 * Hiển thị trên toolbar với style button group chuyên nghiệp
 * Tham khảo từ module Loại phiếu & Hạng mục
 */

"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { BarChart3, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export function QuyHoTroBanHangTabs() {
  const location = useLocation()
  const navigate = useNavigate()

  // Xác định tab active dựa trên pathname
  const pathname = location.pathname
  const isTheoThang = pathname.startsWith("/kinh-doanh/quy-htbh-theo-thang")
  
  const activeTab = isTheoThang ? "theo-thang" : "tong-quan"

  const handleTabChange = (value: string) => {
    if (value === "tong-quan") {
      navigate("/kinh-doanh/tong-quan-quy-htbh")
    } else if (value === "theo-thang") {
      navigate("/kinh-doanh/quy-htbh-theo-thang")
    }
  }

  const tabs = [
    { value: "tong-quan", label: "Tổng quan quỹ HTBH", icon: BarChart3 },
    { value: "theo-thang", label: "Quỹ HTBH theo tháng", icon: Calendar },
  ]

  return (
    <div className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full px-4 pt-1 pb-2">
        <div className="inline-flex h-8 items-center justify-start rounded-lg border bg-muted p-0.5 text-muted-foreground">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value
            const Icon = tab.icon
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
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
                <Icon className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground"
                )} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

