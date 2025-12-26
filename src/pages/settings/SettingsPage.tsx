import { useEffect, useMemo, useState } from 'react'
import { GenericDetailViewSimple } from '@/shared/components/data-display/generic-detail-view-simple'
import { DetailSection } from '@/shared/components/data-display/generic-detail-view/types'
import { useUserPreferencesStore } from '@/shared/stores/user-preferences-store'
import { Palette, Moon, Sun, Monitor, Type, Save, RotateCcw } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { primaryColors, fontFamilies } from '@/hooks/use-user-preferences-sync'

// Default values
const DEFAULT_THEME = 'light'
const DEFAULT_PRIMARY_COLOR = 'red'
const DEFAULT_FONT_FAMILY = 'inter'

export default function SettingsPage() {
  const { theme, setTheme, primaryColor, setPrimaryColor, fontFamily, setFontFamily } =
    useUserPreferencesStore()

  // Temporary state for preview (not saved until user clicks Save)
  // Initialize from store values
  const [tempTheme, setTempTheme] = useState(() => theme)
  const [tempPrimaryColor, setTempPrimaryColor] = useState(() => primaryColor)
  const [tempFontFamily, setTempFontFamily] = useState(() => fontFamily)

  // Check if there are changes
  const hasChanges =
    tempTheme !== theme || tempPrimaryColor !== primaryColor || tempFontFamily !== fontFamily

  // Apply preview theme to document (only for preview, not saved)
  useEffect(() => {
    // Only apply preview if there are unsaved changes
    if (!hasChanges) return

    const root = document.documentElement
    root.classList.remove('light', 'dark')

    let effectiveTheme = tempTheme
    if (tempTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      effectiveTheme = prefersDark ? 'dark' : 'light'
    }

    root.classList.add(effectiveTheme)

    if (tempTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark')
        root.classList.add(e.matches ? 'dark' : 'light')
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [tempTheme, hasChanges])

  // Apply preview primary color (only for preview, not saved)
  useEffect(() => {
    // Only apply preview if there are unsaved changes
    if (!hasChanges) return

    const root = document.documentElement
    const colorPreset = primaryColors.find((c) => c.value === tempPrimaryColor)
    if (colorPreset) {
      // Parse HSL values (format: "h s l" without %)
      const [h, s, l] = colorPreset.hsl.split(' ').map((v) => parseFloat(v))
      
      // For light mode: use original lightness
      // For dark mode: increase lightness by 10-15%
      const isDark = document.documentElement.classList.contains('dark')
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
  }, [tempPrimaryColor, tempTheme, hasChanges])

  // Apply preview font family (only for preview, not saved)
  useEffect(() => {
    // Only apply preview if there are unsaved changes
    if (!hasChanges) return

    const root = document.documentElement
    const fontPreset = fontFamilies.find((f) => f.value === tempFontFamily)
    if (fontPreset) {
      root.style.setProperty('--font-sans', fontPreset.font)
      document.body.style.fontFamily = fontPreset.font
    }
  }, [tempFontFamily, hasChanges])

  // Handle save
  const handleSave = () => {
    setTheme(tempTheme)
    setPrimaryColor(tempPrimaryColor)
    setFontFamily(tempFontFamily)
    toast.success('Đã lưu cài đặt thành công!')
  }

  // Handle reset to default
  const handleReset = () => {
    setTempTheme(DEFAULT_THEME)
    setTempPrimaryColor(DEFAULT_PRIMARY_COLOR)
    setTempFontFamily(DEFAULT_FONT_FAMILY)
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
          label: 'Chủ đề',
          value: tempTheme,
          type: 'text',
          format: () => (
            <ToggleGroup
              type="single"
              value={tempTheme}
              onValueChange={(value: 'light' | 'dark' | 'system') => {
                if (value) setTempTheme(value)
              }}
            >
              <ToggleGroupItem value="light" aria-label="Chế độ sáng">
                <Sun className="h-4 w-4 mr-2" />
                Sáng
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" aria-label="Chế độ tối">
                <Moon className="h-4 w-4 mr-2" />
                Tối
              </ToggleGroupItem>
              <ToggleGroupItem value="system" aria-label="Theo hệ thống">
                <Monitor className="h-4 w-4 mr-2" />
                Hệ thống
              </ToggleGroupItem>
            </ToggleGroup>
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
          label: 'Màu sắc',
          value: tempPrimaryColor,
          type: 'text',
          format: () => (
            <div className="flex flex-wrap gap-2">
              {primaryColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setTempPrimaryColor(color.value)}
                  className={`h-12 w-12 rounded-full border-2 transition-all hover:scale-110 ${
                    tempPrimaryColor === color.value
                      ? 'border-foreground ring-2 ring-primary ring-offset-2'
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: `hsl(${color.hsl.split(' ').map((v, i) => i > 0 ? `${v}%` : v).join(' ')})` }}
                  aria-label={`Chọn màu ${color.label}`}
                  title={color.label}
                />
              ))}
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
          label: 'Phông chữ',
          value: tempFontFamily,
          type: 'text',
          format: () => (
            <div className="space-y-4">
              <ToggleGroup
                type="single"
                value={tempFontFamily}
                onValueChange={(value: string) => {
                  if (value) setTempFontFamily(value)
                }}
                className="flex flex-wrap gap-2"
              >
                {fontFamilies.map((font) => (
                  <ToggleGroupItem
                    key={font.value}
                    value={font.value}
                    aria-label={`Chọn font ${font.label}`}
                    style={{ fontFamily: font.font }}
                  >
                    {font.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <div className="p-4 rounded-lg border bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Xem trước:</p>
                <p
                  style={{ fontFamily: fontFamilies.find((f) => f.value === tempFontFamily)?.font }}
                  className="text-lg"
                >
                  The quick brown fox jumps over the lazy dog
                </p>
                <p
                  style={{ fontFamily: fontFamilies.find((f) => f.value === tempFontFamily)?.font }}
                  className="text-sm text-muted-foreground mt-2"
                >
                  Con cáo nâu nhanh nhẹn nhảy qua con chó lười biếng
                </p>
              </div>
            </div>
          ),
          colSpan: 3,
        },
      ],
    },
  ], [tempTheme, tempPrimaryColor, tempFontFamily])

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
