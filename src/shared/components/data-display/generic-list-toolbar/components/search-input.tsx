/**
 * Search Input Component
 * 
 * Reusable search input with suggestions support
 */

"use client"

import { X, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { SearchSuggestions } from "../../search-suggestions"
import type { UseSearchInputReturn } from "../hooks/use-search-input"

interface SearchInputProps<TData> {
  // Search input hook return
  search: UseSearchInputReturn
  // Props
  placeholder?: string
  filterColumn?: string
  searchFields?: (keyof TData)[]
  module?: string
  enableSuggestions?: boolean
  // Data for suggestions
  data?: Record<string, any>[]
  // Layout
  className?: string
  containerClassName?: string
  showKeyboardHint?: boolean
  variant?: "mobile" | "desktop"
}

export function SearchInput<TData>({
  search,
  placeholder = "Tìm kiếm...",
  filterColumn = "name",
  searchFields,
  module,
  enableSuggestions = true,
  data = [],
  className,
  containerClassName,
  showKeyboardHint = false,
  variant = "desktop",
}: SearchInputProps<TData>) {
  const {
    inputValue,
    showSuggestions,
    searchInputRef,
    suggestionsContainerRef,
    recentSearches,
    isLoading,
    handleClearSearch,
    handleSuggestionSelect,
    handleSearchKeyDown,
    handleCompositionStart,
    handleCompositionEnd,
    handleChange,
    handleFocus,
    handleBlur,
  } = search

  const inputId = variant === "mobile" ? "table-search-input" : "table-search-input-desktop"
  
  // Tính toán padding-right dựa trên trạng thái:
  // - Nếu có cả inputValue và loading: pr-16 (cho cả clear button ở right-8 và spinner ở right-1)
  // - Nếu chỉ có inputValue (không loading): pr-8 (cho clear button)
  // - Nếu chỉ có loading (không inputValue): pr-8 (cho spinner)
  // - Mặc định: pr-3 (chỉ có search icon bên trái)
  const rightPadding = inputValue && isLoading 
    ? "pr-16"  // Cả clear button và spinner
    : (inputValue || isLoading) 
      ? "pr-8"  // Chỉ một trong hai
      : "pr-3"  // Không có gì
  
  const inputClassName = variant === "mobile" 
    ? cn("h-8 flex-1 min-w-0 pl-8", rightPadding, "relative z-0", className)
    : cn("h-8 w-full pl-8", rightPadding, "relative z-0", className)

  return (
    <div className={cn("relative", variant === "desktop" && "w-[140px] lg:w-[180px] xl:w-[220px] flex-shrink", containerClassName)} ref={suggestionsContainerRef}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
      <Input
        ref={searchInputRef}
        id={inputId}
        name="table-search"
        placeholder={placeholder}
        value={inputValue}
        autoComplete="off"
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onChange={handleChange}
        onKeyDown={handleSearchKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={inputClassName}
      />
      {/* Loading spinner - hiển thị khi đang debounce/searching */}
      {isLoading && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center pointer-events-none">
          <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
        </div>
      )}
      
      {/* Clear button - hiển thị khi có input value và không loading */}
      {inputValue && !isLoading && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-transparent"
          onClick={handleClearSearch}
          type="button"
          title="Xóa tìm kiếm (Esc)"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
        </Button>
      )}
      
      {/* Clear button khi có cả input và loading - đặt bên trái spinner */}
      {inputValue && isLoading && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-transparent"
          onClick={handleClearSearch}
          type="button"
          title="Xóa tìm kiếm (Esc)"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
        </Button>
      )}
      {/* Keyboard shortcut hint */}
      {showKeyboardHint && !inputValue && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1">
          <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      )}
      {/* Search suggestions */}
      {showSuggestions && enableSuggestions && searchFields && (
        <SearchSuggestions
          data={data}
          searchFields={(searchFields || [filterColumn as keyof TData]).map(f => String(f))}
          query={inputValue}
          onSelect={handleSuggestionSelect}
          maxSuggestions={5}
          showRecentSearches={!!module}
          recentSearches={recentSearches}
          onRecentSearchSelect={handleSuggestionSelect}
        />
      )}
    </div>
  )
}

