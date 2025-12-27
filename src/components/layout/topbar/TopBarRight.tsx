"use client"

import { NotificationBell } from "../NotificationBell"
import { UserNav } from "../UserNav"
import { DateTimeDisplay } from "../DateTimeDisplay"

/**
 * TopBarRight Component
 * 
 * Phần bên phải của TopBar
 * Chứa: DateTimeDisplay (desktop only), NotificationBell (desktop only), UserNav
 */
export function TopBarRight() {
  return (
    <div className="ml-auto flex items-center gap-2 shrink-0">
      {/* DateTimeDisplay chỉ hiển thị trên desktop */}
      <DateTimeDisplay />
      {/* NotificationBell chỉ hiển thị trên desktop, mobile sẽ dùng trong MobileFooterNav */}
      <div className="hidden md:block">
        <NotificationBell />
      </div>
      <UserNav />
    </div>
  )
}

