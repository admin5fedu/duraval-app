"use client"

import { TopBarLeft } from "./TopBarLeft"
import { TopBarRight } from "./TopBarRight"
import { TOPBAR_CLASSES } from "@/lib/app-config"
import { cn } from "@/lib/utils"

/**
 * TopBar Component
 * 
 * Header/Topbar chính của ứng dụng
 * Fixed trên mobile để không bị trôi khi scroll, sticky trên desktop
 */
export function TopBar() {
  return (
    <header className={cn(TOPBAR_CLASSES.container)}>
      <TopBarLeft />
      <TopBarRight />
    </header>
  )
}

