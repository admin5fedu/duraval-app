import { useEffect } from 'react'
import { useUserPreferencesStore } from '@/shared/stores/user-preferences-store'

// Primary color presets (HSL format: hue saturation lightness)
const primaryColors = [
  { value: 'red', label: 'Đỏ', hsl: '0 75 50' },
  { value: 'blue', label: 'Xanh dương', hsl: '217 91 60' },
  { value: 'green', label: 'Xanh lá', hsl: '142 71 45' },
  { value: 'purple', label: 'Tím', hsl: '262 83 58' },
  { value: 'orange', label: 'Cam', hsl: '25 95 53' },
  { value: 'pink', label: 'Hồng', hsl: '330 81 60' },
  { value: 'indigo', label: 'Chàm', hsl: '239 84 67' },
  { value: 'teal', label: 'Xanh ngọc', hsl: '173 80 40' },
]

// Font family presets
const fontFamilies = [
  { value: 'inter', label: 'Inter', font: 'Inter, sans-serif' },
  { value: 'roboto', label: 'Roboto', font: 'Roboto, sans-serif' },
  { value: 'open-sans', label: 'Open Sans', font: '"Open Sans", sans-serif' },
  { value: 'lato', label: 'Lato', font: 'Lato, sans-serif' },
  { value: 'montserrat', label: 'Montserrat', font: 'Montserrat, sans-serif' },
  { value: 'poppins', label: 'Poppins', font: 'Poppins, sans-serif' },
]

// Font size scale presets (scale factor for proportional scaling)
const fontSizes = {
  small: 0.875,   // 87.5% - Nhỏ
  medium: 1.0,    // 100% - Trung bình (mặc định)
  large: 1.125,   // 112.5% - Vừa
  xlarge: 1.25,   // 125% - Lớn
}

/**
 * Hook to sync user preferences (theme, primary color, font family, font size) globally
 * This hook automatically applies preferences to the document when store changes
 */
export function useUserPreferencesSync() {
  const { theme, primaryColor, fontFamily, fontSize } = useUserPreferencesStore()

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')

    let effectiveTheme = theme
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      effectiveTheme = prefersDark ? 'dark' : 'light'
    }

    root.classList.add(effectiveTheme)

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark')
        root.classList.add(e.matches ? 'dark' : 'light')
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  // Apply primary color
  useEffect(() => {
    const root = document.documentElement
    const colorPreset = primaryColors.find((c) => c.value === primaryColor)
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
  }, [primaryColor, theme])

  // Apply font family
  useEffect(() => {
    const root = document.documentElement
    const fontPreset = fontFamilies.find((f) => f.value === fontFamily)
    if (fontPreset) {
      root.style.setProperty('--font-sans', fontPreset.font)
      document.body.style.fontFamily = fontPreset.font
    }
  }, [fontFamily])

  // Apply font size scale
  useEffect(() => {
    const root = document.documentElement
    const scale = fontSizes[fontSize]
    if (scale !== undefined) {
      // Set CSS variable for font size scale - CSS will automatically apply it
      root.style.setProperty('--font-size-scale', String(scale))
    }
  }, [fontSize])
}

// Export presets for use in other components (e.g., SettingsPage)
export { primaryColors, fontFamilies, fontSizes }

