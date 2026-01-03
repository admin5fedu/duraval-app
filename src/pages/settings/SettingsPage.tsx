import { useEffect, useMemo, useState, useRef } from 'react'
import { GenericDetailViewSimple } from '@/shared/components/data-display/generic-detail-view-simple'
import { DetailSection } from '@/shared/components/data-display/generic-detail-view/types'
import { useUserPreferencesStore } from '@/shared/stores/user-preferences-store'
import { Palette, Moon, Sun, Monitor, Type, Text, Save, RotateCcw, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { primaryColors, fontFamilies, fontSizes } from '@/hooks/use-user-preferences-sync'
import { cn } from '@/lib/utils'

// Default values
const DEFAULT_THEME = 'light'
const DEFAULT_PRIMARY_COLOR = 'red'
const DEFAULT_FONT_FAMILY = 'inter'
const DEFAULT_FONT_SIZE = 'medium'

/**
 * Helper function to apply global styles (theme, color, font) to document
 * This function is used for preview, save, and cleanup
 */
function applyGlobalStyles(
  themeValue: string,
  primaryColorValue: string,
  fontFamilyValue: string,
  fontSizeValue: string
) {
  const root = document.documentElement

  // Apply theme
  root.classList.remove('light', 'dark')
  let effectiveTheme = themeValue
  if (themeValue === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    effectiveTheme = prefersDark ? 'dark' : 'light'
  }
  root.classList.add(effectiveTheme)

  // Apply primary color
  const colorPreset = primaryColors.find((c) => c.value === primaryColorValue)
  if (colorPreset) {
    const [h, s, l] = colorPreset.hsl.split(' ').map((v) => parseFloat(v))
    const isDark = root.classList.contains('dark')
    const adjustedL = isDark ? Math.min(l + 10, 100) : l
    const primaryHsl = `${h} ${s}% ${adjustedL}%`
    root.style.setProperty('--brand-primary', primaryHsl)
    root.style.setProperty('--primary', `var(--brand-primary)`)
    root.style.setProperty('--ring', `var(--brand-primary)`)
    root.style.setProperty('--sidebar-primary', `var(--brand-primary)`)
    root.style.setProperty('--sidebar-ring', `var(--brand-primary)`)
    root.style.setProperty('--accent-foreground', `var(--brand-primary)`)
    root.style.setProperty('--sidebar-accent-foreground', `var(--brand-primary)`)
    root.style.setProperty('--chart-1', `var(--brand-primary)`)
  }

  // Apply font family
  const fontPreset = fontFamilies.find((f) => f.value === fontFamilyValue)
  if (fontPreset) {
    root.style.setProperty('--font-sans', fontPreset.font)
    document.body.style.fontFamily = fontPreset.font
  }

  // Apply font size
  const scale = fontSizes[fontSizeValue as keyof typeof fontSizes]
  if (scale !== undefined) {
    root.style.setProperty('--font-size-scale', String(scale))
  }
}

export default function SettingsPage() {
  const { 
    theme, setTheme, 
    primaryColor, setPrimaryColor, 
    fontFamily, setFontFamily,
    fontSize, setFontSize
  } = useUserPreferencesStore()

  // Track if user has saved changes (to prevent cleanup on unmount if saved)
  const isSavedRef = useRef(false)

  // Temporary state for preview (not saved until user clicks Save)
  // Initialize from store values
  const [tempTheme, setTempTheme] = useState(() => theme)
  const [tempPrimaryColor, setTempPrimaryColor] = useState(() => primaryColor)
  const [tempFontFamily, setTempFontFamily] = useState(() => fontFamily)
  const [tempFontSize, setTempFontSize] = useState(() => fontSize)

  // Sync temp state when store values change (e.g., from localStorage or external changes)
  useEffect(() => {
    setTempTheme(theme)
    setTempPrimaryColor(primaryColor)
    setTempFontFamily(fontFamily)
    setTempFontSize(fontSize)
    // Reset saved flag when store values change externally
    isSavedRef.current = false
  }, [theme, primaryColor, fontFamily, fontSize])

  // Check if there are changes
  const hasChanges =
    tempTheme !== theme || 
    tempPrimaryColor !== primaryColor || 
    tempFontFamily !== fontFamily ||
    tempFontSize !== fontSize

  // Reset saved flag when user makes new changes after saving
  useEffect(() => {
    if (hasChanges && isSavedRef.current) {
      isSavedRef.current = false
    }
  }, [hasChanges])

  // Apply preview styles (only when there are unsaved changes)
  // When saved, useUserPreferencesSync in Layout will handle it
  useEffect(() => {
    if (!hasChanges) return // No preview needed when values match store

    // Apply preview using temp values
    applyGlobalStyles(tempTheme, tempPrimaryColor, tempFontFamily, tempFontSize)

    // Setup system theme listener if needed
    if (tempTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(e.matches ? 'dark' : 'light')
        // Re-apply color when theme changes (for dark mode adjustment)
        applyGlobalStyles(tempTheme, tempPrimaryColor, tempFontFamily, tempFontSize)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [tempTheme, tempPrimaryColor, tempFontFamily, tempFontSize, hasChanges])

  // Cleanup: Restore store values when component unmounts if user hasn't saved
  useEffect(() => {
    return () => {
      // If user hasn't saved, restore to store values
      if (!isSavedRef.current) {
        applyGlobalStyles(theme, primaryColor, fontFamily, fontSize)
      }
    }
  }, [theme, primaryColor, fontFamily, fontSize])

  // Handle save
  const handleSave = () => {
    // Mark as saved to prevent cleanup on unmount
    isSavedRef.current = true
    
    // Update store values - useUserPreferencesSync in Layout will automatically apply them
    setTheme(tempTheme)
    setPrimaryColor(tempPrimaryColor)
    setFontFamily(tempFontFamily)
    setFontSize(tempFontSize)
    
    // Force immediate application to ensure changes are visible right away
    // This ensures the values are applied even if useUserPreferencesSync hasn't run yet
    applyGlobalStyles(tempTheme, tempPrimaryColor, tempFontFamily, tempFontSize)
    
    toast.success('Đã lưu cài đặt thành công!')
  }

  // Handle reset to default
  const handleReset = () => {
    setTempTheme(DEFAULT_THEME)
    setTempPrimaryColor(DEFAULT_PRIMARY_COLOR)
    setTempFontFamily(DEFAULT_FONT_FAMILY)
    setTempFontSize(DEFAULT_FONT_SIZE)
    toast.info('Đã khôi phục về mặc định')
  }

  // Build sections for generic detail view
  const sections: DetailSection[] = useMemo(() => [
    {
      title: 'Chế độ hiển thị',
      description: 'Chọn chế độ sáng, tối hoặc theo hệ thống',
      icon: tempTheme === 'dark' ? Moon : tempTheme === 'light' ? Sun : Monitor,
      fields: [
        {
          key: 'theme',
          label: '',
          value: tempTheme,
          type: 'text',
          format: () => (
            <div className="inline-flex items-center rounded-full border border-input bg-muted/30 p-1 gap-1">
              {[
                { value: 'light', label: 'Sáng', icon: Sun },
                { value: 'dark', label: 'Tối', icon: Moon },
                { value: 'system', label: 'Hệ thống', icon: Monitor },
              ].map((option) => {
                const Icon = option.icon
                const isSelected = tempTheme === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTempTheme(option.value as 'light' | 'dark' | 'system')}
                    className={cn(
                      "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                      "h-8 min-w-[80px]",
                      isSelected
                        ? "bg-background text-foreground shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-label={`Chọn ${option.label}`}
                    aria-pressed={isSelected}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{option.label}</span>
                  </button>
                )
              })}
            </div>
          ),
          colSpan: 3,
        },
      ],
    },
    {
      title: 'Màu chủ đạo',
      description: 'Chọn màu chủ đạo cho giao diện',
      icon: Palette,
      fields: [
        {
          key: 'primaryColor',
          label: '',
          value: tempPrimaryColor,
          type: 'text',
          format: () => (
            <div className="flex flex-wrap items-center gap-3">
              {primaryColors.map((color) => {
                const isSelected = tempPrimaryColor === color.value
                const colorHsl = `hsl(${color.hsl.split(' ').map((v, i) => i > 0 ? `${v}%` : v).join(' ')})`
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setTempPrimaryColor(color.value)}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 group",
                      "transition-all duration-200"
                    )}
                    aria-label={`Chọn màu ${color.label}`}
                    aria-pressed={isSelected}
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full transition-all duration-200 relative",
                        "border-2 shadow-sm",
                        isSelected
                          ? "border-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "border-border/50 group-hover:border-foreground/50"
                      )}
                      style={{ backgroundColor: colorHsl }}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="h-6 w-6 text-primary-foreground drop-shadow-lg" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span className={cn(
                      "text-xs font-medium transition-colors",
                      isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {color.label}
                    </span>
                  </button>
                )
              })}
            </div>
          ),
          colSpan: 3,
        },
      ],
    },
    {
      title: 'Font chữ',
      description: 'Chọn font chữ cho giao diện',
      icon: Type,
      fields: [
        {
          key: 'fontFamily',
          label: '',
          value: tempFontFamily,
          type: 'text',
          format: () => {
            const selectedFont = fontFamilies.find((f) => f.value === tempFontFamily)
            return (
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-input bg-muted/30 p-1 gap-1 flex-wrap">
                  {fontFamilies.map((font) => {
                    const isSelected = tempFontFamily === font.value
                    return (
                      <button
                        key={font.value}
                        type="button"
                        onClick={() => setTempFontFamily(font.value)}
                        className={cn(
                          "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                          "h-8 min-w-[90px]",
                          isSelected
                            ? "bg-background text-foreground shadow-sm border border-border"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        aria-label={`Chọn font ${font.label}`}
                        aria-pressed={isSelected}
                      >
                        <span style={{ fontFamily: font.font }}>Aa</span>
                        <span>{font.label}</span>
                      </button>
                    )
                  })}
                </div>
                <Card className="border-2">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-3">Xem trước:</p>
                    <div className="space-y-2">
                      <p
                        style={{ fontFamily: selectedFont?.font }}
                        className="text-lg font-semibold text-foreground"
                      >
                        The quick brown fox jumps over the lazy dog
                      </p>
                      <p
                        style={{ fontFamily: selectedFont?.font }}
                        className="text-sm text-foreground"
                      >
                        Con cáo nâu nhanh nhẹn nhảy qua con chó lười biếng
                      </p>
                      <p
                        style={{ fontFamily: selectedFont?.font }}
                        className="text-xs text-muted-foreground"
                      >
                        0123456789 !@#$%^&*()
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          },
          colSpan: 3,
        },
      ],
    },
    {
      title: 'Cỡ chữ',
      description: 'Chọn cỡ chữ cho toàn bộ ứng dụng',
      icon: Text,
      fields: [
        {
          key: 'fontSize',
          label: '',
          value: tempFontSize,
          type: 'text',
          format: () => {
            const sizeLabels = {
              small: { label: 'Nhỏ', scale: fontSizes.small, description: '87.5%' },
              medium: { label: 'Trung bình', scale: fontSizes.medium, description: '100%' },
              large: { label: 'Vừa', scale: fontSizes.large, description: '112.5%' },
              xlarge: { label: 'Lớn', scale: fontSizes.xlarge, description: '125%' },
            }
            return (
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-input bg-muted/30 p-1 gap-1">
                  {Object.entries(sizeLabels).map(([value, info]) => {
                    const isSelected = tempFontSize === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setTempFontSize(value as 'small' | 'medium' | 'large' | 'xlarge')}
                        className={cn(
                          "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                          "h-8 min-w-[90px]",
                          isSelected
                            ? "bg-background text-foreground shadow-sm border border-border"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        aria-label={`Chọn cỡ chữ ${info.label}`}
                        aria-pressed={isSelected}
                      >
                        <span
                          className="text-foreground font-medium"
                          style={{ fontSize: `${info.scale * 0.875}rem` }}
                        >
                          Aa
                        </span>
                        <span>{info.label}</span>
                      </button>
                    )
                  })}
                </div>
                <Card className="border-2">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-3">Xem trước:</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Tiêu đề lớn</p>
                        <p style={{ fontSize: `${fontSizes[tempFontSize] * 1.5}rem` }} className="font-semibold">
                          Cỡ chữ này sẽ được áp dụng cho toàn bộ ứng dụng
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Văn bản thông thường</p>
                        <p style={{ fontSize: `${fontSizes[tempFontSize] * 1}rem` }}>
                          Tất cả văn bản sẽ tự động điều chỉnh theo cỡ chữ bạn chọn. Điều này giúp bạn có trải nghiệm đọc tốt hơn.
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Văn bản nhỏ</p>
                        <p style={{ fontSize: `${fontSizes[tempFontSize] * 0.875}rem` }} className="text-muted-foreground">
                          Văn bản phụ và mô tả sẽ hiển thị ở kích thước này.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          },
          colSpan: 3,
        },
      ],
    },
  ], [tempTheme, tempPrimaryColor, tempFontFamily, tempFontSize])

  // Actions buttons
  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
        className="transition-all hover:scale-105"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Khôi phục mặc định</span>
        <span className="sm:hidden">Mặc định</span>
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={handleSave}
        disabled={!hasChanges}
        className="transition-all hover:scale-105"
      >
        <Save className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Lưu thay đổi</span>
        <span className="sm:hidden">Lưu</span>
      </Button>
    </div>
  )

  return (
    <GenericDetailViewSimple
      title="Cài đặt"
      subtitle="Tùy chỉnh giao diện và trải nghiệm của bạn"
      sections={sections}
      actions={actions}
      isLoading={false}
    />
  )
}
