/**
 * Tabs Component cho Thiết lập khách buôn
 * Hiển thị trên toolbar với style button group chuyên nghiệp
 * Tham khảo từ shadcn/ui button group patterns và LoaiPhieuHangMucTabs
 */

"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { Layers, Flag, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThietLapKhachBuonTabs() {
  const location = useLocation()
  const navigate = useNavigate()

  // Xác định tab active dựa trên pathname
  // Check exact match để tránh conflict với các route khác
  const pathname = location.pathname
  const isTrangThai = pathname.startsWith("/ban-buon/trang-thai-khach-buon")
  const isMucDangKy = pathname.startsWith("/ban-buon/muc-dang-ky")
  
  let activeTab = "giai-doan"
  if (isTrangThai) {
    activeTab = "trang-thai"
  } else if (isMucDangKy) {
    activeTab = "muc-dang-ky"
  }

  const handleTabChange = (value: string) => {
    if (value === "giai-doan") {
      navigate("/ban-buon/giai-doan-khach-buon")
    } else if (value === "trang-thai") {
      navigate("/ban-buon/trang-thai-khach-buon")
    } else if (value === "muc-dang-ky") {
      navigate("/ban-buon/muc-dang-ky")
    }
  }

  const tabs = [
    { value: "giai-doan", label: "Giai Đoạn", icon: Layers },
    { value: "trang-thai", label: "Trạng Thái", icon: Flag },
    { value: "muc-dang-ky", label: "Mức Đăng Ký", icon: TrendingUp },
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

