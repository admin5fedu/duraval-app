import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Filters Store
 * Manages global filter state that can be shared across different views
 * Useful for maintaining filter state when navigating between pages
 */
interface FilterState {
    // Generic filters by module/page
    filters: Record<string, Record<string, any>>
    
    // Set filter for a specific module/page
    setFilter: (module: string, key: string, value: any) => void
    
    // Get filter for a specific module/page
    getFilter: (module: string, key: string) => any
    
    // Get all filters for a module
    getModuleFilters: (module: string) => Record<string, any>
    
    // Clear filters for a module
    clearModuleFilters: (module: string) => void
    
    // Clear all filters
    clearAllFilters: () => void

    // Search query by module
    searchQueries: Record<string, string>
    setSearchQuery: (module: string, query: string) => void
    getSearchQuery: (module: string) => string
    clearSearchQuery: (module: string) => void

    // Sort preferences by module
    sortPreferences: Record<string, { column: string; direction: 'asc' | 'desc' }>
    setSortPreference: (module: string, preference: { column: string; direction: 'asc' | 'desc' }) => void
    getSortPreference: (module: string) => { column: string; direction: 'asc' | 'desc' } | null
    clearSortPreference: (module: string) => void

    // Recent searches by module
    recentSearches: Record<string, string[]>
    addRecentSearch: (module: string, query: string) => void
    getRecentSearches: (module: string, limit?: number) => string[]
    clearRecentSearches: (module: string) => void
}

export const useFiltersStore = create<FilterState>()(
    persist(
        (set, get) => ({
            filters: {},
            searchQueries: {},
            sortPreferences: {},
            recentSearches: {},

            setFilter: (module, key, value) =>
                set((state) => ({
                    filters: {
                        ...state.filters,
                        [module]: {
                            ...state.filters[module],
                            [key]: value,
                        },
                    },
                })),

            getFilter: (module, key) => {
                const state = get()
                return state.filters[module]?.[key]
            },

            getModuleFilters: (module) => {
                const state = get()
                return state.filters[module] || {}
            },

            clearModuleFilters: (module) =>
                set((state) => {
                    const newFilters = { ...state.filters }
                    delete newFilters[module]
                    return { filters: newFilters }
                }),

            clearAllFilters: () => set({ filters: {}, searchQueries: {}, sortPreferences: {} }),

            setSearchQuery: (module, query) =>
                set((state) => ({
                    searchQueries: {
                        ...state.searchQueries,
                        [module]: query,
                    },
                })),

            getSearchQuery: (module) => {
                const state = get()
                return state.searchQueries[module] || ''
            },

            clearSearchQuery: (module) =>
                set((state) => {
                    const newSearchQueries = { ...state.searchQueries }
                    delete newSearchQueries[module]
                    return { searchQueries: newSearchQueries }
                }),

            setSortPreference: (module, preference) =>
                set((state) => ({
                    sortPreferences: {
                        ...state.sortPreferences,
                        [module]: preference,
                    },
                })),

            getSortPreference: (module) => {
                const state = get()
                return state.sortPreferences[module] || null
            },

            clearSortPreference: (module) =>
                set((state) => {
                    const newSortPreferences = { ...state.sortPreferences }
                    delete newSortPreferences[module]
                    return { sortPreferences: newSortPreferences }
                }),

            addRecentSearch: (module, query) =>
                set((state) => {
                    if (!query.trim()) return state
                    
                    const current = state.recentSearches[module] || []
                    // Remove duplicate and add to front
                    const filtered = current.filter(q => q !== query)
                    const updated = [query, ...filtered].slice(0, 10) // Keep last 10
                    
                    return {
                        recentSearches: {
                            ...state.recentSearches,
                            [module]: updated,
                        },
                    }
                }),

            getRecentSearches: (module, limit = 5) => {
                const state = get()
                const searches = state.recentSearches[module] || []
                return searches.slice(0, limit)
            },

            clearRecentSearches: (module) =>
                set((state) => {
                    const newRecentSearches = { ...state.recentSearches }
                    delete newRecentSearches[module]
                    return { recentSearches: newRecentSearches }
                }),
        }),
        {
            name: 'filters-storage',
            // Only persist filters, search queries, and sort preferences
            // Don't persist temporary UI state
        }
    )
)

