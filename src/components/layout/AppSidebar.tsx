import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Users,
  Briefcase,
  Settings,
  LayoutDashboard,
  PieChart,
  ShoppingCart,
  Calculator,
  Truck,
  Megaphone,
  ChevronRight,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AppLogo } from '@/components/shared/AppLogo'
import { APP_NAME, APP_VERSION } from '@/lib/app-config'
import { cn } from '@/lib/utils'

interface NavSubItem {
  title: string
  url: string
}

interface NavSubGroup {
  title: string
  items: NavSubItem[]
}

interface NavItem {
  title: string
  url?: string
  icon: React.ComponentType<{ className?: string }>
  subGroups?: NavSubGroup[]
}

interface NavGroup {
  title: string
  url?: string
  icon?: React.ComponentType<{ className?: string }>
  items?: NavItem[]
}

const data: { navMain: NavGroup[] } = {
  navMain: [
    {
      title: 'Menu',
      url: '#',
      icon: LayoutDashboard,
      items: [
        {
          title: 'Trang chủ',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Công việc',
          url: '/cong-viec',
          icon: Briefcase,
        },
        {
          title: 'Hành chính nhân sự',
          url: '/hanh-chinh-nhan-su',
          icon: Users,
        },
        {
          title: 'Kinh doanh',
          url: '/kinh-doanh',
          icon: PieChart,
        },
        {
          title: 'Marketing',
          url: '/marketing',
          icon: Megaphone,
        },
        {
          title: 'Mua hàng',
          url: '/mua-hang',
          icon: ShoppingCart,
        },
        {
          title: 'Kế toán',
          url: '/ke-toan',
          icon: Calculator,
        },
        {
          title: 'Kho vận',
          url: '/kho-van',
          icon: Truck,
        },
        {
          title: 'Hệ thống',
          url: '/he-thong',
          icon: Settings,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const pathname = location.pathname
  
  // Track open state for collapsible menu items
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({})

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <AppLogo size="md" />
          <div className="flex flex-col gap-0.5 leading-none overflow-hidden">
            <span className="font-semibold truncate">{APP_NAME}</span>
            <span className="text-xs text-muted-foreground truncate">v{APP_VERSION}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items ? (
                  group.items.map((item) => {
                    const Icon = item.icon
                    
                    // Check if item has submenus
                    if (item.subGroups && item.subGroups.length > 0) {
                      // Check if any submenu item is active
                      const isSubmenuActive = item.subGroups.some(subGroup =>
                        subGroup.items.some(subItem =>
                          pathname === subItem.url || pathname.startsWith(subItem.url + '/')
                        )
                      )
                      
                      // Initialize open state if not already set, default to true if active
                      const menuKey = item.title
                      const isOpen = openMenus[menuKey] ?? isSubmenuActive
                      
                      return (
                        <SidebarMenuItem key={item.title}>
                          <Collapsible
                            defaultOpen={isSubmenuActive}
                            open={isOpen}
                            onOpenChange={(open) => {
                              setOpenMenus(prev => ({ ...prev, [menuKey]: open }))
                            }}
                          >
                            <div className="flex items-center gap-1">
                              {item.url ? (
                                <Link 
                                  to={item.url}
                                  className="flex-1"
                                >
                                  <SidebarMenuButton
                                    isActive={isSubmenuActive || pathname === item.url}
                                    className="gap-3 transition-all duration-200 ease-in-out hover:pl-4"
                                  >
                                    {Icon && <Icon className="size-4" />}
                                    <span className="font-medium">{item.title}</span>
                                  </SidebarMenuButton>
                                </Link>
                              ) : (
                                <SidebarMenuButton
                                  isActive={isSubmenuActive}
                                  className="gap-3 transition-all duration-200 ease-in-out hover:pl-4 flex-1"
                                >
                                  {Icon && <Icon className="size-4" />}
                                  <span className="font-medium">{item.title}</span>
                                </SidebarMenuButton>
                              )}
                              <CollapsibleTrigger asChild>
                                <button
                                  className="p-1.5 hover:bg-sidebar-accent rounded-md transition-colors flex items-center justify-center"
                                  aria-label="Toggle submenu"
                                >
                                  <ChevronRight className={cn(
                                    "h-4 w-4 transition-transform duration-200",
                                    isOpen && "rotate-90"
                                  )} />
                                </button>
                              </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {item.subGroups.map((subGroup) => (
                                  <React.Fragment key={subGroup.title}>
                                    <SidebarMenuSubItem>
                                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {subGroup.title}
                                      </div>
                                    </SidebarMenuSubItem>
                                    {subGroup.items.map((subItem) => {
                                      const isSubItemActive =
                                        pathname === subItem.url ||
                                        (subItem.url !== '/' && pathname.startsWith(subItem.url + '/'))
                                      
                                      return (
                                        <SidebarMenuSubItem key={subItem.title}>
                                          <SidebarMenuSubButton
                                            asChild
                                            isActive={isSubItemActive}
                                          >
                                            <Link to={subItem.url}>
                                              <span>{subItem.title}</span>
                                            </Link>
                                          </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                      )
                                    })}
                                  </React.Fragment>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>
                        </SidebarMenuItem>
                      )
                    }
                    
                    // Regular menu item without submenu
                    const isActive = Boolean(
                      pathname === item.url ||
                      (item.url && item.url !== '/' && pathname.startsWith(item.url))
                    )

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className="gap-3 transition-all duration-200 ease-in-out hover:pl-4"
                        >
                          <Link 
                            to={item.url || '#'} 
                            className="flex items-center"
                          >
                            {Icon && <Icon className="size-4" />}
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === group.url}
                    >
                      <Link to={group.url || '#'}>
                        {group.icon && <group.icon className="size-4" />}
                        <span>{group.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2 border-t">
          <div className="flex items-center justify-center">
            <span className="text-xs text-muted-foreground">
              Version {APP_VERSION}
            </span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

