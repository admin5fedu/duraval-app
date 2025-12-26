import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * User Preferences Store
 * Manages user-specific preferences that should persist across sessions
 */
interface UserPreferences {
    // Theme preferences
    theme: 'light' | 'dark' | 'system'
    setTheme: (theme: 'light' | 'dark' | 'system') => void

    // Primary color preferences
    primaryColor: string
    setPrimaryColor: (color: string) => void

    // Font preferences
    fontFamily: string
    setFontFamily: (font: string) => void

    // Language preferences
    language: 'vi' | 'en'
    setLanguage: (language: 'vi' | 'en') => void

    // Table preferences
    defaultPageSize: number
    setDefaultPageSize: (size: number) => void

    // View preferences
    defaultView: 'list' | 'grid' | 'card'
    setDefaultView: (view: 'list' | 'grid' | 'card') => void

    // Date format preferences
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
    setDateFormat: (format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD') => void

    // Timezone
    timezone: string
    setTimezone: (timezone: string) => void

    // Notification preferences
    emailNotifications: boolean
    setEmailNotifications: (enabled: boolean) => void
    pushNotifications: boolean
    setPushNotifications: (enabled: boolean) => void

    // Dashboard preferences
    dashboardLayout: 'default' | 'compact' | 'spacious'
    setDashboardLayout: (layout: 'default' | 'compact' | 'spacious') => void
}

const defaultPreferences: Omit<UserPreferences, 
    | 'setTheme' 
    | 'setPrimaryColor'
    | 'setFontFamily'
    | 'setLanguage' 
    | 'setDefaultPageSize' 
    | 'setDefaultView' 
    | 'setDateFormat' 
    | 'setTimezone' 
    | 'setEmailNotifications' 
    | 'setPushNotifications' 
    | 'setDashboardLayout'
> = {
    theme: 'light', // Default light
    primaryColor: 'red', // Default red
    fontFamily: 'inter', // Default Inter
    language: 'vi',
    defaultPageSize: 50,
    defaultView: 'list',
    dateFormat: 'DD/MM/YYYY',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    emailNotifications: true,
    pushNotifications: true,
    dashboardLayout: 'default',
}

export const useUserPreferencesStore = create<UserPreferences>()(
    persist(
        (set) => ({
            ...defaultPreferences,
            setTheme: (theme) => set({ theme }),
            setPrimaryColor: (color) => set({ primaryColor: color }),
            setFontFamily: (font) => set({ fontFamily: font }),
            setLanguage: (language) => set({ language }),
            setDefaultPageSize: (size) => set({ defaultPageSize: size }),
            setDefaultView: (view) => set({ defaultView: view }),
            setDateFormat: (format) => set({ dateFormat: format }),
            setTimezone: (timezone) => set({ timezone }),
            setEmailNotifications: (enabled) => set({ emailNotifications: enabled }),
            setPushNotifications: (enabled) => set({ pushNotifications: enabled }),
            setDashboardLayout: (layout) => set({ dashboardLayout: layout }),
        }),
        {
            name: 'user-preferences-storage',
        }
    )
)

