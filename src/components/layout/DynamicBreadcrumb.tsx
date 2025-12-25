"use client"

import React from "react"
import { useLocation, Link } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  shouldSkipSegmentInBreadcrumb,
  formatSegmentLabel,
} from "@/lib/routing-config"
import { useBreadcrumb } from "@/components/providers/BreadcrumbProvider"

/**
 * Dynamic Breadcrumb Component
 * 
 * Tự động tạo breadcrumb từ URL pathname
 * Sử dụng routing-config để format labels và skip segments
 */
export function DynamicBreadcrumb() {
  const location = useLocation()
  const pathname = location.pathname
  const segments = pathname.split('/').filter(Boolean)
  const { detailTitle } = useBreadcrumb()
  
  // Nếu là trang chủ
  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'trang-chu')) {
    return (
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-wrap">
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate">Trang Chủ</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  const breadcrumbItems: Array<{ label: string; href: string }> = []
  let currentPath = ""

  segments.forEach((segment) => {
    // Bỏ qua các segment trong danh sách skip (như "nhan-su", "so-do", "thiet-lap")
    if (shouldSkipSegmentInBreadcrumb(segment)) {
      currentPath += `/${segment}` // Vẫn cộng vào path để giữ đúng URL
      return // Nhưng không thêm vào breadcrumb
    }
    
    const isNumericId = /^\d+$/.test(segment)
    const label = formatSegmentLabel(segment)
    
    // Nếu là ID số (detail page), sử dụng detailTitle từ context hoặc "Chi tiết"
    if (isNumericId) {
      currentPath += `/${segment}`
      breadcrumbItems.push({
        label: detailTitle || "Chi tiết",
        href: currentPath
      })
      return
    }
    
    // Skip các segment đặc biệt (form actions)
    if (segment === 'sua' || segment === 'them-moi') {
      currentPath += `/${segment}`
      return
    }
    
    // Nếu có label hợp lệ
    if (label) {
      currentPath += `/${segment}`
      breadcrumbItems.push({
        label,
        href: currentPath
      })
    }
  })

  return (
    <Breadcrumb className="min-w-0 flex-1">
      <BreadcrumbList className="flex-wrap">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="truncate">Trang Chủ</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbItems.length > 0 && (
          <>
            <BreadcrumbSeparator />
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1
              return (
                <React.Fragment key={index}>
                  <BreadcrumbItem className="min-w-0">
                    {isLast ? (
                      <BreadcrumbPage className="truncate">{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={item.href} className="truncate">
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

