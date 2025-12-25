"use client"

import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ArrowLeft, Home, Bell } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useNotificationStore } from "@/shared/stores/notification-store"
import { ScrollArea } from "@/components/ui/scroll-area"

/**
 * Mobile Footer Navigation Component
 * 
 * ⚡ Professional ERP Mobile Navigation:
 * - Sticky bottom navigation bar
 * - Large Home button in center (primary color)
 * - Back button on left
 * - Notification button on right
 * - Only visible on mobile devices (< 768px)
 * - Smooth animations and transitions
 */
export function MobileFooterNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const isMobile = useIsMobile()
  const [showNotifications, setShowNotifications] = React.useState(false)
  const { notifications, unreadCount, markAsRead } = useNotificationStore()

  // Check if we can go back
  const canGoBack = React.useMemo(() => {
    // Don't show back button on home page
    return pathname !== "/" && pathname !== "/trang-chu"
  }, [pathname])

  // Check if we're on home page
  const isHomePage = pathname === "/" || pathname === "/trang-chu"

  // Handle back navigation
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate("/")
    }
  }

  // Handle home navigation
  const handleHome = () => {
    if (!isHomePage) {
      navigate("/")
    }
  }

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
      setShowNotifications(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-primary'
      case 'error':
        return 'border-l-destructive'
      case 'warning':
        return 'border-l-[var(--warning)]'
      default:
        return 'border-l-secondary'
    }
  }

  // Don't render on desktop
  if (!isMobile) {
    return null
  }

  return (
    <>
      {/* Footer Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[55] md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg safe-area-inset-bottom">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full transition-all duration-200",
              canGoBack
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            )}
            onClick={handleBack}
            aria-label="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Home Button - Large, Primary */}
          <Button
            variant={isHomePage ? "default" : "outline"}
            size="icon"
            className={cn(
              "h-14 w-14 rounded-full shadow-lg transition-all duration-200",
              isHomePage
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-background hover:bg-primary hover:text-primary-foreground border-2 border-primary/20 hover:border-primary"
            )}
            onClick={handleHome}
            aria-label="Trang chủ"
          >
            <Home className="h-6 w-6" />
          </Button>

          {/* Notification Button */}
          <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full relative transition-all duration-200"
                aria-label="Thông báo"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold rounded-full"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Thông báo</SheetTitle>
                <SheetDescription>
                  Danh sách thông báo của bạn
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <ScrollArea className="h-[calc(80vh-120px)]">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Không có thông báo mới
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'p-4 rounded-lg border cursor-pointer transition-colors hover:bg-accent',
                            !notification.read && 'bg-accent/50',
                            getNotificationColor(notification.type),
                            'border-l-4'
                          )}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg shrink-0">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium leading-tight">
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.createdAt).toLocaleString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind footer */}
      <div className="h-16 md:hidden" />
    </>
  )
}

