"use client"

import { TopBarLeft } from "./TopBarLeft"
import { TopBarRight } from "./TopBarRight"

/**
 * TopBar Component
 * 
 * Header/Topbar chính của ứng dụng
 * Fixed trên mobile để không bị trôi khi scroll, sticky trên desktop
 * Y hệt về giao diện và chức năng như app-tham-khao
 */
export function TopBar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-2 md:px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed md:sticky top-0 left-0 right-0 md:left-auto md:right-auto z-50 transition-all w-full max-w-full min-w-0 shadow-sm">
      <TopBarLeft />
      <TopBarRight />
    </header>
  )
}

