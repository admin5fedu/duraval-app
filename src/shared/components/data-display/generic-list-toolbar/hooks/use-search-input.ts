/**
 * useSearchInput Hook
 * 
 * Manages search input state, IME composition, and keyboard shortcuts
 */

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { extractSearchSuggestions } from "@/shared/utils/search-operators"
import { useFiltersStore } from "@/shared/stores/filters-store"

export interface UseSearchInputOptions<TData> {
  table: Table<TData>
  filterColumn?: string
  placeholder?: string
  searchFields?: (keyof TData)[]
  module?: string
  enableSuggestions?: boolean
}

export interface UseSearchInputReturn {
  inputValue: string
  setInputValue: (value: string) => void
  showSuggestions: boolean
  setShowSuggestions: (show: boolean) => void
  suggestionIndex: number
  setSuggestionIndex: (index: number) => void
  recentSearches: string[]
  suggestions: string[]
  searchInputRef: React.RefObject<HTMLInputElement>
  suggestionsContainerRef: React.RefObject<HTMLDivElement>
  handleClearSearch: () => void
  handleSuggestionSelect: (value: string) => void
  handleSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  handleCompositionStart: () => void
  handleCompositionEnd: (e: React.CompositionEvent<HTMLInputElement>) => void
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleFocus: () => void
  handleBlur: () => void
}

export function useSearchInput<TData>({
  table,
  filterColumn = "name",
  placeholder = "Tìm kiếm...",
  searchFields,
  module,
  enableSuggestions = true,
}: UseSearchInputOptions<TData>): UseSearchInputReturn {
  const { addRecentSearch, getRecentSearches } = useFiltersStore()
  
  // State
  const [inputValue, setInputValue] = React.useState(
    (table.getState().globalFilter as string) ?? ""
  )
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [suggestionIndex, setSuggestionIndex] = React.useState(0)
  const isComposingRef = React.useRef(false)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const suggestionsContainerRef = React.useRef<HTMLDivElement>(null)

  // Recent searches
  const recentSearches = React.useMemo(() => {
    if (!module) return []
    return getRecentSearches(module, 5)
  }, [module, getRecentSearches])

  // Get suggestions
  const suggestions = React.useMemo(() => {
    if (!enableSuggestions || !searchFields || inputValue.length < 2) {
      return []
    }
    const data = table.getRowModel().rows.map(row => row.original) as Record<string, any>[]
    const fields = (searchFields || [filterColumn as keyof TData]).map(f => String(f))
    return extractSearchSuggestions(data, fields, inputValue, 5)
  }, [table, searchFields, filterColumn, inputValue, enableSuggestions])

  // Sync input value with table state
  React.useEffect(() => {
    if (!isComposingRef.current) {
      const tableFilter = (table.getState().globalFilter as string) ?? ""
      if (tableFilter !== inputValue) {
        setInputValue(tableFilter)
      }
    }
  }, [table.getState().globalFilter, inputValue])

  // Keyboard shortcuts (Ctrl/Cmd+K, Esc)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        const activeElement = document.activeElement
        const isInputFocused = activeElement?.tagName === "INPUT" || activeElement?.tagName === "TEXTAREA"
        
        if (!isInputFocused && searchInputRef.current) {
          e.preventDefault()
          searchInputRef.current.focus()
          searchInputRef.current.select()
        }
      }
      
      // Esc to clear search if focused on search input
      if (e.key === 'Escape' && searchInputRef.current && document.activeElement === searchInputRef.current) {
        e.preventDefault()
        setInputValue("")
        table.setGlobalFilter("")
        searchInputRef.current.blur()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [table])

  // Handlers
  const handleClearSearch = React.useCallback(() => {
    setInputValue("")
    table.setGlobalFilter("")
    setShowSuggestions(false)
    searchInputRef.current?.focus()
  }, [table])

  const handleSuggestionSelect = React.useCallback((value: string) => {
    setInputValue(value)
    table.setGlobalFilter(value)
    setShowSuggestions(false)
    if (module && value.trim()) {
      addRecentSearch(module, value.trim())
    }
    searchInputRef.current?.focus()
  }, [table, module, addRecentSearch])

  const handleSearchKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || !enableSuggestions) {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClearSearch()
      }
      return
    }

    const items = inputValue.length < 2 && recentSearches.length > 0 ? recentSearches : suggestions
    const maxIndex = items.length - 1

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSuggestionIndex(prev => Math.min(prev + 1, maxIndex))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSuggestionIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        if (suggestionIndex >= 0 && suggestionIndex < items.length) {
          e.preventDefault()
          handleSuggestionSelect(items[suggestionIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        break
    }
  }, [showSuggestions, enableSuggestions, inputValue, recentSearches, suggestions, suggestionIndex, handleSuggestionSelect, handleClearSearch])

  const handleCompositionStart = React.useCallback(() => {
    isComposingRef.current = true
  }, [])

  const handleCompositionEnd = React.useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false
    const value = e.currentTarget.value
    setInputValue(value)
    table.setGlobalFilter(value)
  }, [table])

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    if (enableSuggestions) {
      setShowSuggestions(true)
    }
    
    if (!isComposingRef.current) {
      table.setGlobalFilter(value)
    }
  }, [table, enableSuggestions])

  const handleFocus = React.useCallback(() => {
    if (enableSuggestions && (inputValue.length >= 2 || recentSearches.length > 0)) {
      setShowSuggestions(true)
    }
  }, [enableSuggestions, inputValue, recentSearches])

  const handleBlur = React.useCallback(() => {
    setTimeout(() => {
      if (!suggestionsContainerRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
      }
    }, 200)
  }, [])

  return {
    inputValue,
    setInputValue,
    showSuggestions,
    setShowSuggestions,
    suggestionIndex,
    setSuggestionIndex,
    recentSearches,
    suggestions,
    searchInputRef,
    suggestionsContainerRef,
    handleClearSearch,
    handleSuggestionSelect,
    handleSearchKeyDown,
    handleCompositionStart,
    handleCompositionEnd,
    handleChange,
    handleFocus,
    handleBlur,
  }
}

