/**
 * Tabs Component cho Các chuyên đề
 * Hiển thị trên toolbar với style button group chuyên nghiệp
 * Tham khảo từ module Tỉnh thành sau sát nhập
 */

"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { FolderTree, BookOpen, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function CacChuyenDeTabs() {
  const location = useLocation()
  const navigate = useNavigate()

  // Xác định tab active dựa trên pathname
  const pathname = location.pathname
  const isNhomChuyenDe = pathname.startsWith("/cong-viec/nhom-chuyen-de")
  const isChuyenDe = pathname.startsWith("/cong-viec/chuyen-de")
  const isCauHoi = pathname.startsWith("/cong-viec/cau-hoi")
  
  let activeTab = "nhom-chuyen-de"
  if (isNhomChuyenDe) {
    activeTab = "nhom-chuyen-de"
  } else if (isChuyenDe) {
    activeTab = "chuyen-de"
  } else if (isCauHoi) {
    activeTab = "cau-hoi"
  }

  const handleTabChange = (value: string) => {
    if (value === "nhom-chuyen-de") {
      navigate("/cong-viec/nhom-chuyen-de")
    } else if (value === "chuyen-de") {
      navigate("/cong-viec/chuyen-de")
    } else if (value === "cau-hoi") {
      navigate("/cong-viec/cau-hoi")
    }
  }

  const tabs = [
    { value: "nhom-chuyen-de", label: "Nhóm chuyên đề", icon: FolderTree },
    { value: "chuyen-de", label: "Chuyên đề", icon: BookOpen },
    { value: "cau-hoi", label: "Câu hỏi", icon: HelpCircle },
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

