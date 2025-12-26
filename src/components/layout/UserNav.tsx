import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown, Moon, Sun, LogOut } from 'lucide-react'
import { useUserPreferencesStore } from '@/shared/stores/user-preferences-store'
import { useAuthStore } from '@/shared/stores/auth-store'
import { transformCloudinaryUrl } from '@/lib/cloudinary'
import { Switch } from '@/components/ui/switch'

export function UserNav() {
  const { user, signOut } = useAuthStore()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const navigate = useNavigate()
  const { theme, setTheme } = useUserPreferencesStore()

  // Determine if dark mode is active (for switch UI only)
  // Theme application is handled by useUserPreferencesSync hook in Layout
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    if (theme === 'dark') return true
    if (theme === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Update isDarkMode when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      setIsDarkMode(true)
    } else if (theme === 'light') {
      setIsDarkMode(false)
    } else {
      // System theme - check media query
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setIsDarkMode(mediaQuery.matches)

      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  const handleClientCleanup = () => {
    // Clear local storage và cache
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
  }

  const handleLogout = async () => {
    handleClientCleanup()
    setShowLogoutDialog(false)
    await signOut()
    navigate('/login')
  }

  // Get employee data from auth store
  const { employee } = useAuthStore()

  // Determine display name and title from employee data
  const displayName = employee?.ho_ten || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Người dùng'
  const displayTitle = employee?.chuc_vu || 'Nhân viên'
  const rawAvatarUrl = employee?.avatar_url || user?.user_metadata?.avatar_url
  // Transform URL for optimized avatar display
  const avatarUrl = rawAvatarUrl ? transformCloudinaryUrl(rawAvatarUrl) : null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-auto px-3 py-2 gap-3 rounded-lg hover:bg-accent/50 transition-colors group"
          >
            <Avatar className="h-9 w-9 border-2 border-border/50 shrink-0 ring-2 ring-background group-hover:ring-accent/50 transition-all">
              <AvatarImage src={avatarUrl || '/avatars/01.png'} alt={displayName} />
              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                {displayName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start justify-center min-w-0 hidden sm:flex flex-1">
              <span className="text-sm font-semibold leading-tight truncate max-w-[160px] text-foreground">
                {displayName}
              </span>
              {displayTitle && (
                <span className="text-xs leading-tight truncate max-w-[160px] text-muted-foreground mt-0.5">
                  {displayTitle}
                </span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 opacity-60 group-hover:opacity-100 transition-opacity hidden sm:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-56" 
          align="end"
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {displayTitle}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={() => navigate('/ho-so')}
              className="cursor-pointer"
            >
              <span>Xem hồ sơ</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/doi-mat-khau')}
              className="cursor-pointer"
            >
              <span>Đổi mật khẩu</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/settings')}
              className="cursor-pointer"
            >
              <span>Cài đặt</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5" onSelect={(e) => e.preventDefault()}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {isDarkMode ? (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {isDarkMode ? 'Chế độ tối' : 'Chế độ sáng'}
                </span>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={handleThemeToggle}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowLogoutDialog(true)}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <span>Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đăng xuất</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

