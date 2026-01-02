/**
 * Tabs Component cho Tỉnh thành trước sát nhập
 * Hiển thị trên toolbar với style button group chuyên nghiệp
 * Tham khảo từ shadcn/ui button group patterns
 */

"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { Map, MapPin, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function TinhThanhTruocSatNhapTabs() {
  const location = useLocation()
  const navigate = useNavigate()

  // Xác định tab active dựa trên pathname
  const pathname = location.pathname
  const isQuanHuyen = pathname.startsWith("/he-thong/quan-huyen-tsn")
  const isPhuongXa = pathname.startsWith("/he-thong/phuong-xa-tsn")
  
  let activeTab = "tinh-thanh-tsn"
  if (isQuanHuyen) {
    activeTab = "quan-huyen-tsn"
  } else if (isPhuongXa) {
    activeTab = "phuong-xa-tsn"
  }

  const handleTabChange = (value: string) => {
    if (value === "tinh-thanh-tsn") {
      navigate("/he-thong/tinh-thanh-tsn")
    } else if (value === "quan-huyen-tsn") {
      navigate("/he-thong/quan-huyen-tsn")
    } else if (value === "phuong-xa-tsn") {
      navigate("/he-thong/phuong-xa-tsn")
    }
  }

  const tabs = [
    { value: "tinh-thanh-tsn", label: "Tỉnh thành TSN", icon: Map },
    { value: "quan-huyen-tsn", label: "Quận huyện TSN", icon: MapPin },
    { value: "phuong-xa-tsn", label: "Phường xã TSN", icon: Building2 },
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

