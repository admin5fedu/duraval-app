/**
 * Tabs Component cho Loại phiếu & Hạng mục & Loại doanh thu
 * Hiển thị trên toolbar với style button group chuyên nghiệp
 * Tham khảo từ shadcn/ui button group patterns
 */

"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { FileText, Tag, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoaiPhieuHangMucTabs() {
  const location = useLocation()
  const navigate = useNavigate()

  // Xác định tab active dựa trên pathname
  // Check exact match để tránh conflict với các route khác có chứa "loai-phieu" hoặc "hang-muc"
  const pathname = location.pathname
  const isHangMuc = pathname.startsWith("/kinh-doanh/hang-muc")
  const isLoaiDoanhThu = pathname.startsWith("/kinh-doanh/loai-doanh-thu")
  
  let activeTab = "loai-phieu"
  if (isHangMuc) {
    activeTab = "hang-muc"
  } else if (isLoaiDoanhThu) {
    activeTab = "loai-doanh-thu"
  }

  const handleTabChange = (value: string) => {
    if (value === "loai-phieu") {
      navigate("/kinh-doanh/loai-phieu")
    } else if (value === "hang-muc") {
      navigate("/kinh-doanh/hang-muc")
    } else if (value === "loai-doanh-thu") {
      navigate("/kinh-doanh/loai-doanh-thu")
    }
  }

  const tabs = [
    { value: "loai-phieu", label: "Loại phiếu", icon: FileText },
    { value: "hang-muc", label: "Hạng mục", icon: Tag },
    { value: "loai-doanh-thu", label: "Loại doanh thu", icon: DollarSign },
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

