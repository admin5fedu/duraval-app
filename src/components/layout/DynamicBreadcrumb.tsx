"use client"

import React from "react"
import { useLocation, Link } from "react-router-dom"
import { Home, MoreHorizontal } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  shouldSkipSegmentInBreadcrumb,
  formatSegmentLabel,
} from "@/lib/routing-config"
import { useBreadcrumb } from "@/components/providers/BreadcrumbProvider"
import { moduleRegistry } from "@/shared/config/module-registry"
import { useIsMobile } from "@/hooks/use-mobile"

/**
 * Dynamic Breadcrumb Component
 * 
 * Tự động tạo breadcrumb từ URL pathname
 * Sử dụng routing-config để format labels và skip segments
 * Mobile-friendly: chỉ hiển thị 2 items cuối, còn lại trong dropdown
 */
export function DynamicBreadcrumb() {
  const location = useLocation()
  const pathname = location.pathname
  const segments = pathname.split('/').filter(Boolean)
  const { detailTitle } = useBreadcrumb()
  const isMobile = useIsMobile()
  
  // Nếu là trang chủ
  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'trang-chu')) {
    return (
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-wrap items-center gap-1">
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate flex items-center gap-1">
              <Home className="h-3.5 w-3.5 shrink-0" />
              <span>Trang Chủ</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  const breadcrumbItems: Array<{ label: string; href: string }> = []
  let currentPath = ""

  segments.forEach((segment) => {
    // Build current path for module lookup
    const segmentPath = currentPath + `/${segment}`
    
    // Bỏ qua các segment trong danh sách skip (như "nhan-su", "so-do", "thiet-lap")
    if (shouldSkipSegmentInBreadcrumb(segment, segmentPath)) {
      currentPath += `/${segment}` // Vẫn cộng vào path để giữ đúng URL
      return // Nhưng không thêm vào breadcrumb
    }
    
    const isNumericId = /^\d+$/.test(segment)
    // Try to get label from module config first
    const moduleConfig = moduleRegistry.getByRoutePath(segmentPath)
    const label = moduleConfig?.breadcrumb?.label 
      || formatSegmentLabel(segment, segmentPath)
    
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
      
      // Xác định href cho breadcrumb item
      let href = currentPath
      
      // Danh sách các main category (segment chính) - điều hướng đến chính nó
      const mainCategories = ["ban-buon", "he-thong", "cong-viec", "hanh-chinh-nhan-su", "kinh-doanh", "marketing", "mua-hang", "ke-toan", "kho-van"]
      
      // Nếu là main category, dùng currentPath (điều hướng đến trang submenu)
      // Nếu không phải main category, tìm module con để điều hướng đến tab mặc định
      if (!mainCategories.includes(segment)) {
        const childModule = moduleRegistry.getAll().find(
          config => config.parentPath === currentPath
        )
        if (childModule) {
          // Sử dụng routePath của module con làm href (tab mặc định)
          // Ví dụ: khi click vào "Dữ liệu khách buôn" (/ban-buon/du-lieu-khach-buon)
          // thì điều hướng đến route của module con (danh sách KB)
          href = childModule.routePath
        }
      }
      
      breadcrumbItems.push({
        label,
        href
      })
    }
  })

  // Mobile: chỉ hiển thị 2 items cuối, còn lại trong dropdown
  if (isMobile && breadcrumbItems.length > 2) {
    const visibleItems = breadcrumbItems.slice(-2)
    const hiddenItems = breadcrumbItems.slice(0, -2)
    
    return (
      <div className="min-w-0 flex-1 flex items-center gap-2">
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList className="flex-wrap items-center gap-1">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="truncate flex items-center gap-1 text-xs">
                  <Home className="h-3.5 w-3.5 shrink-0" />
                  <span className="sr-only">Trang Chủ</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {hiddenItems.length > 0 && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-1.5 text-xs hover:bg-accent"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                        <span className="sr-only">Xem thêm</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
                      {hiddenItems.map((item, index) => (
                        <DropdownMenuItem key={index} asChild>
                          <BreadcrumbLink asChild>
                            <Link to={item.href} className="w-full">
                              {item.label}
                            </Link>
                          </BreadcrumbLink>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
              </>
            )}
            
            {visibleItems.map((item, index) => {
              const isLast = index === visibleItems.length - 1
              return (
                <React.Fragment key={index}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem className="min-w-0">
                    {isLast ? (
                      <BreadcrumbPage className="truncate text-xs font-medium">
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={item.href} className="truncate text-xs">
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    )
  }

  // Desktop: hiển thị đầy đủ
  return (
    <div className="min-w-0 flex-1 flex items-center gap-2">
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-wrap items-center gap-1.5">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="truncate flex items-center gap-1">
                <Home className="h-3.5 w-3.5 shrink-0" />
                <span>Trang Chủ</span>
              </Link>
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
    </div>
  )
}
