import { useRef } from 'react'
import { AppSidebar } from './AppSidebar'
import { TopBar } from './topbar'
import { MobileFooterNav } from './MobileFooterNav'
import { BreadcrumbProvider } from '@/components/providers/BreadcrumbProvider'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { useUserPreferencesSync } from '@/hooks/use-user-preferences-sync'
import { ScrollRestoration } from '@/shared/components/scroll-restoration'

export function Layout({ children }: { children: React.ReactNode }) {
  // Sync user preferences globally (theme, primary color, font family)
  useUserPreferencesSync()
  
  // Ref cho scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  return (
    <BreadcrumbProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="w-full max-w-full min-w-0 flex flex-col h-screen overflow-hidden">
          {/* TopBar: Fixed trên mobile để không bị trôi khi scroll, sticky trên desktop */}
          <TopBar />
          {/* Content area: Scroll cho detail pages, listview sẽ tự quản lý scroll của table body */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 w-full max-w-full pt-16 md:pt-0 pb-16 md:pb-0"
          >
            <div className="flex flex-col gap-2 md:gap-4 p-3 md:p-4 pt-3 md:pt-4 min-w-0 w-full max-w-full">
              {children}
            </div>
          </div>
          <MobileFooterNav />
        </SidebarInset>
      </SidebarProvider>
      {/* Scroll Restoration: Tự động quản lý scroll behavior khi chuyển route */}
      <ScrollRestoration 
        scrollContainerRef={scrollContainerRef}
        scrollBehavior="auto"
        scrollDelay={0}
        smooth={false}
      />
    </BreadcrumbProvider>
  )
}

