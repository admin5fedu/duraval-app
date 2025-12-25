"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { DynamicBreadcrumb } from "../DynamicBreadcrumb"

/**
 * TopBarLeft Component
 * 
 * Phần bên trái của TopBar
 * Chứa: SidebarTrigger, Separator, DynamicBreadcrumb
 */
export function TopBarLeft() {
  return (
    <>
      <SidebarTrigger className="-ml-1 shrink-0" />
      <Separator orientation="vertical" className="mr-2 h-4 shrink-0 hidden sm:block" />
      <DynamicBreadcrumb />
    </>
  )
}

