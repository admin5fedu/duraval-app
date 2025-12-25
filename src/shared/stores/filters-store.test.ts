import { describe, it, expect, beforeEach } from 'vitest'
import { useFiltersStore } from './filters-store'

describe('FiltersStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useFiltersStore.setState({
      filters: {},
      searchQueries: {},
      sortPreferences: {},
      recentSearches: {},
    })
  })

  describe('setFilter and getFilter', () => {
    it('should set and get filter correctly', () => {
      const { setFilter, getFilter } = useFiltersStore.getState()
      
      setFilter('test-module', 'status', 'active')
      
      expect(getFilter('test-module', 'status')).toBe('active')
    })

    it('should handle multiple filters for same module', () => {
      const { setFilter, getFilter } = useFiltersStore.getState()
      
      setFilter('test-module', 'status', 'active')
      setFilter('test-module', 'type', 'premium')
      
      expect(getFilter('test-module', 'status')).toBe('active')
      expect(getFilter('test-module', 'type')).toBe('premium')
    })

    it('should handle filters for different modules', () => {
      const { setFilter, getFilter } = useFiltersStore.getState()
      
      setFilter('module1', 'status', 'active')
      setFilter('module2', 'status', 'inactive')
      
      expect(getFilter('module1', 'status')).toBe('active')
      expect(getFilter('module2', 'status')).toBe('inactive')
    })
  })

  describe('getModuleFilters', () => {
    it('should return all filters for a module', () => {
      const { setFilter, getModuleFilters } = useFiltersStore.getState()
      
      setFilter('test-module', 'status', 'active')
      setFilter('test-module', 'type', 'premium')
      
      const filters = getModuleFilters('test-module')
      
      expect(filters).toEqual({
        status: 'active',
        type: 'premium',
      })
    })

    it('should return empty object for module with no filters', () => {
      const { getModuleFilters } = useFiltersStore.getState()
      
      const filters = getModuleFilters('empty-module')
      
      expect(filters).toEqual({})
    })
  })

  describe('clearModuleFilters', () => {
    it('should clear all filters for a module', () => {
      const { setFilter, clearModuleFilters, getModuleFilters } = useFiltersStore.getState()
      
      setFilter('test-module', 'status', 'active')
      setFilter('test-module', 'type', 'premium')
      
      clearModuleFilters('test-module')
      
      expect(getModuleFilters('test-module')).toEqual({})
    })

    it('should not affect other modules', () => {
      const { setFilter, clearModuleFilters, getModuleFilters } = useFiltersStore.getState()
      
      setFilter('module1', 'status', 'active')
      setFilter('module2', 'status', 'inactive')
      
      clearModuleFilters('module1')
      
      expect(getModuleFilters('module1')).toEqual({})
      expect(getModuleFilters('module2')).toEqual({ status: 'inactive' })
    })
  })

  describe('search queries', () => {
    it('should set and get search query', () => {
      const { setSearchQuery, getSearchQuery } = useFiltersStore.getState()
      
      setSearchQuery('test-module', 'john doe')
      
      expect(getSearchQuery('test-module')).toBe('john doe')
    })

    it('should clear search query', () => {
      const { setSearchQuery, clearSearchQuery, getSearchQuery } = useFiltersStore.getState()
      
      setSearchQuery('test-module', 'john doe')
      clearSearchQuery('test-module')
      
      expect(getSearchQuery('test-module')).toBe('')
    })
  })

  describe('recent searches', () => {
    it('should add recent search', () => {
      const { addRecentSearch, getRecentSearches } = useFiltersStore.getState()
      
      addRecentSearch('test-module', 'john')
      addRecentSearch('test-module', 'jane')
      
      const recent = getRecentSearches('test-module')
      
      expect(recent).toEqual(['jane', 'john'])
    })

    it('should limit recent searches to 10', () => {
      const { addRecentSearch, getRecentSearches } = useFiltersStore.getState()
      
      for (let i = 0; i < 15; i++) {
        addRecentSearch('test-module', `search-${i}`)
      }
      
      const recent = getRecentSearches('test-module')
      
      expect(recent.length).toBe(10)
      expect(recent[0]).toBe('search-14')
    })

    it('should remove duplicates and add to front', () => {
      const { addRecentSearch, getRecentSearches } = useFiltersStore.getState()
      
      addRecentSearch('test-module', 'john')
      addRecentSearch('test-module', 'jane')
      addRecentSearch('test-module', 'john')
      
      const recent = getRecentSearches('test-module')
      
      expect(recent).toEqual(['john', 'jane'])
    })

    it('should respect limit parameter', () => {
      const { addRecentSearch, getRecentSearches } = useFiltersStore.getState()
      
      addRecentSearch('test-module', 'search1')
      addRecentSearch('test-module', 'search2')
      addRecentSearch('test-module', 'search3')
      
      const recent = getRecentSearches('test-module', 2)
      
      expect(recent.length).toBe(2)
      expect(recent).toEqual(['search3', 'search2'])
    })
  })
})

