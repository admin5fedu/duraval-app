"use client"

import * as React from "react"
import { Search, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { extractSearchSuggestions } from "@/shared/utils/search-operators"
import { smallTextClass, bodyTextClass, smallMediumTextClass } from "@/shared/utils/text-styles"
import { compactPaddingClass, standardPaddingClass } from "@/shared/utils/spacing-styles"
import { toolbarGapClass } from "@/shared/utils/toolbar-styles"

interface SearchSuggestionsProps<TData extends Record<string, any>> {
    data: TData[]
    searchFields: string[]
    query: string
    onSelect: (value: string) => void
    maxSuggestions?: number
    showRecentSearches?: boolean
    recentSearches?: string[]
    onRecentSearchSelect?: (value: string) => void
}

export function SearchSuggestions<TData extends Record<string, any>>({
    data,
    searchFields,
    query,
    onSelect,
    maxSuggestions = 5,
    showRecentSearches = true,
    recentSearches = [],
    onRecentSearchSelect,
}: SearchSuggestionsProps<TData>) {
    const [selectedIndex, setSelectedIndex] = React.useState(0)

    // Extract suggestions from data
    const suggestions = React.useMemo(() => {
        if (!query.trim() || query.length < 2) return []
        return extractSearchSuggestions(data, searchFields, query, maxSuggestions)
    }, [data, searchFields, query, maxSuggestions])

    // Show recent searches if no query or query is too short
    const showRecent = showRecentSearches && (!query.trim() || query.length < 2) && recentSearches.length > 0
    const hasSuggestions = suggestions.length > 0 || showRecent

    // Reset selected index when query changes
    React.useEffect(() => {
        setSelectedIndex(0)
    }, [query, suggestions.length])

    if (!hasSuggestions) return null

    const items = showRecent ? recentSearches : suggestions
    const displayItems = items.slice(0, maxSuggestions)

    const handleSelect = (value: string) => {
        if (showRecent && onRecentSearchSelect) {
            onRecentSearchSelect(value)
        } else {
            onSelect(value)
        }
    }

    return (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-[300px] overflow-auto">
            {showRecent && (
                <div className={cn(compactPaddingClass(), "border-b")}>
                    <div className={cn("flex items-center px-2 py-1 text-muted-foreground", toolbarGapClass(), smallMediumTextClass())}>
                        <Clock className="h-3 w-3" />
                        <span>Tìm kiếm gần đây</span>
                    </div>
                </div>
            )}
            <div className="p-1">
                {displayItems.map((item, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                            "w-full flex items-center rounded-sm text-left",
                            toolbarGapClass(), // gap-2
                            "px-2 py-1.5",
                            bodyTextClass(), // text-sm
                            "hover:bg-accent hover:text-accent-foreground",
                            "transition-colors",
                            selectedIndex === index && "bg-accent text-accent-foreground"
                        )}
                    >
                        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="flex-1 truncate">{item}</span>
                    </button>
                ))}
            </div>
            {!showRecent && query.length >= 2 && suggestions.length === 0 && (
                <div className={cn(standardPaddingClass(), "text-center text-muted-foreground", bodyTextClass())}>
                    Không tìm thấy gợi ý
                </div>
            )}
        </div>
    )
}

