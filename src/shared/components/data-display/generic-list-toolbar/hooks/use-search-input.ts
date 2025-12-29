/**
 * useSearchInput Hook
 * 
 * Manages search input state, IME composition, and keyboard shortcuts
 * Optimized for fast typing with debounce and proper IME handling
 */

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { extractSearchSuggestions } from "@/shared/utils/search-operators"
import { useFiltersStore } from "@/shared/stores/filters-store"

export interface UseSearchInputOptions<TData> {
  table: Table<TData>
  filterColumn?: string
  _placeholder?: string
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
  isLoading: boolean
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
  _placeholder = "Tìm kiếm...", // Reserved for future use
  searchFields,
  module,
  enableSuggestions = true,
}: UseSearchInputOptions<TData>): UseSearchInputReturn {
  // Suppress unused parameter warning - reserved for future use
  void _placeholder
  const { addRecentSearch, getRecentSearches } = useFiltersStore()
  
  // State - Local state cho input value để responsive ngay lập tức
  const [inputValue, setInputValue] = React.useState(
    (table.getState().globalFilter as string) ?? ""
  )
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [suggestionIndex, setSuggestionIndex] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const isComposingRef = React.useRef(false)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const suggestionsContainerRef = React.useRef<HTMLDivElement>(null)
  
  // Debounce timer refs - dùng để đảm bảo chỉ giá trị cuối cùng được xử lý
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const suggestionsDebounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const lastTableFilterRef = React.useRef<string>("")
  const pendingValueRef = React.useRef<string>("") // Track giá trị đang chờ debounce
  
  // Debounced value cho suggestions calculation (tránh tính toán quá nhiều)
  const [debouncedInputForSuggestions, setDebouncedInputForSuggestions] = React.useState(inputValue)

  // Recent searches
  const recentSearches = React.useMemo(() => {
    if (!module) return []
    return getRecentSearches(module, 5)
  }, [module, getRecentSearches])

  // Debounce input value cho suggestions (150ms - nhanh hơn table filter)
  React.useEffect(() => {
    if (suggestionsDebounceTimerRef.current) {
      clearTimeout(suggestionsDebounceTimerRef.current)
    }
    
    suggestionsDebounceTimerRef.current = setTimeout(() => {
      setDebouncedInputForSuggestions(inputValue)
      suggestionsDebounceTimerRef.current = null
    }, 150)
    
    return () => {
      if (suggestionsDebounceTimerRef.current) {
        clearTimeout(suggestionsDebounceTimerRef.current)
      }
    }
  }, [inputValue])

  // Get suggestions - chỉ tính toán với debounced value để tránh lag
  const suggestions = React.useMemo(() => {
    if (!enableSuggestions || !searchFields || debouncedInputForSuggestions.length < 2) {
      return []
    }
    const data = table.getRowModel().rows.map(row => row.original) as Record<string, any>[]
    const fields = (searchFields || [filterColumn as keyof TData]).map(f => String(f))
    return extractSearchSuggestions(data, fields, debouncedInputForSuggestions, 5)
  }, [table, searchFields, filterColumn, debouncedInputForSuggestions, enableSuggestions])

  // Sync input value with table state (chỉ khi table state thay đổi từ bên ngoài)
  // Tối ưu: Chỉ sync khi thực sự cần, tránh re-render không cần thiết
  React.useEffect(() => {
    const tableFilter = (table.getState().globalFilter as string) ?? ""
    // Chỉ sync nếu:
    // 1. Table filter thay đổi từ bên ngoài (không phải từ input của chúng ta)
    // 2. Khác với giá trị hiện tại trong input
    // 3. Không đang composition
    // 4. Khác với giá trị cuối cùng đã được set
    if (
      tableFilter !== lastTableFilterRef.current && 
      tableFilter !== inputValue && 
      tableFilter !== pendingValueRef.current &&
      !isComposingRef.current
    ) {
      setInputValue(tableFilter)
      pendingValueRef.current = tableFilter
      lastTableFilterRef.current = tableFilter
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
        // Clear debounce timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
          debounceTimerRef.current = null
        }
        setInputValue("")
        pendingValueRef.current = ""
        table.setGlobalFilter("")
        lastTableFilterRef.current = ""
        setIsLoading(false) // Tắt loading khi clear
        searchInputRef.current.blur()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [table])

  // Handlers
  const handleClearSearch = React.useCallback(() => {
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    
    setInputValue("")
    pendingValueRef.current = ""
    table.setGlobalFilter("")
    lastTableFilterRef.current = ""
    setShowSuggestions(false)
    setIsLoading(false) // Tắt loading khi clear
    searchInputRef.current?.focus()
  }, [table])

  const handleSuggestionSelect = React.useCallback((value: string) => {
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    
    setInputValue(value)
    pendingValueRef.current = value
    table.setGlobalFilter(value)
    lastTableFilterRef.current = value
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
    // Clear debounce timer khi bắt đầu composition
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
  }, [])

  const handleCompositionEnd = React.useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false
    const value = e.currentTarget.value
    setInputValue(value)
    pendingValueRef.current = value
    lastTableFilterRef.current = value
    
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    
    // Apply filter ngay sau khi composition kết thúc (không debounce)
    // Vì composition đã hoàn thành, không cần chờ thêm
    setIsLoading(false) // Tắt loading vì không debounce
    table.setGlobalFilter(value)
  }, [table])

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // ⚡ Update input value ngay lập tức để UI responsive - KHÔNG debounce
    // Điều này đảm bảo user thấy text ngay khi gõ, không bị lag
    setInputValue(value)
    
    // Store pending value để đảm bảo luôn dùng giá trị mới nhất
    pendingValueRef.current = value
    
    // Show suggestions ngay (nhưng suggestions sẽ được tính với debounced value)
    if (enableSuggestions && value.length >= 2) {
      setShowSuggestions(true)
    } else if (value.length === 0) {
      setShowSuggestions(false)
    }
    
    // ⚡ CRITICAL: Debounce table filter update - CHỈ giá trị cuối cùng được xử lý
    // Clear existing timer để cancel các update trước đó - đảm bảo chỉ timer cuối cùng chạy
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    
    // Chỉ debounce khi không đang composition
    if (!isComposingRef.current) {
      // Set loading state khi bắt đầu debounce
      setIsLoading(true)
      
      // Debounce 400ms - CHỈ giá trị cuối cùng sau khi user ngừng gõ 400ms mới được apply
      // Mỗi lần gõ/xóa mới sẽ cancel timer cũ và tạo timer mới
      // Chỉ khi user ngừng gõ/xóa 400ms thì timer mới chạy và apply giá trị cuối cùng
      debounceTimerRef.current = setTimeout(() => {
        // Lấy giá trị từ pendingValueRef để đảm bảo là giá trị cuối cùng
        // pendingValueRef luôn được update mỗi lần onChange
        const finalValue = pendingValueRef.current
        table.setGlobalFilter(finalValue)
        lastTableFilterRef.current = finalValue
        debounceTimerRef.current = null
        setIsLoading(false) // Tắt loading khi hoàn thành
      }, 400)
    }
  }, [table, enableSuggestions])
  
  // Cleanup debounce timers on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (suggestionsDebounceTimerRef.current) {
        clearTimeout(suggestionsDebounceTimerRef.current)
      }
    }
  }, [])

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
    isLoading,
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

