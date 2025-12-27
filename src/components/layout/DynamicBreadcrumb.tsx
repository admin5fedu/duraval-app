"use client"

import React from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { Home, MoreHorizontal, ArrowLeft, List } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { getParentRouteFromBreadcrumb } from "@/lib/utils"

/**
 * Dynamic Breadcrumb Component
 * 
 * Tự động tạo breadcrumb từ URL pathname
 * Sử dụng routing-config để format labels và skip segments
 * Mobile-friendly: chỉ hiển thị 2 items cuối, còn lại trong dropdown
 * Professional: Thêm "Back to List" button cho detail pages
 */
export function DynamicBreadcrumb() {
  const location = useLocation()
  const pathname = location.pathname
  const segments = pathname.split('/').filter(Boolean)
  const { detailTitle } = useBreadcrumb()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  
  // Check if current page is a detail page (has numeric ID as last segment)
  const lastSegment = segments[segments.length - 1]
  const isDetailPage = /^\d+$/.test(lastSegment)
  const listPath = isDetailPage ? getParentRouteFromBreadcrumb(pathname) : null
  
  // Nếu là trang chủ
  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'trang-chu')) {
    return (
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-wrap items-center gap-1">
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate flex items-center gap-1">
              <Home className="h-3.5 w-3.5 shrink-0" />
              <span className={cn(isMobile && "sr-only")}>Trang Chủ</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  const breadcrumbItems: Array<{ label: string; href: string }> = []
  let currentPath = ""

  segments.forEach((segment, index) => {
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
      breadcrumbItems.push({
        label,
        href: currentPath
      })
    }
  })

  // Handle back to list
  const handleBackToList = () => {
    if (listPath) {
      navigate(listPath)
    }
  }

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
        
        {/* Back to List button for detail pages on mobile */}
        {isDetailPage && listPath && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToList}
            className="h-7 px-2 text-xs shrink-0"
            title="Về danh sách"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    )
  }

  // Desktop: hiển thị đầy đủ với Back to List button
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
      
      {/* Back to List button for detail pages on desktop */}
      {isDetailPage && listPath && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackToList}
          className="h-8 px-3 shrink-0 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Về danh sách</span>
          <List className="h-4 w-4 sm:hidden" />
        </Button>
      )}
    </div>
  )
}
