/**
 * Advanced Search Operators Utilities
 * 
 * Hỗ trợ các operators chuyên nghiệp cho search:
 * - Quotes: "exact match"
 * - AND, OR, NOT operators
 * - Wildcards: *, ?
 * - Field-specific: field:value
 */

export interface SearchToken {
    type: 'exact' | 'and' | 'or' | 'not' | 'wildcard' | 'field' | 'text'
    value: string
    field?: string
}

/**
 * Parse search query thành tokens
 */
export function parseSearchQuery(query: string): SearchToken[] {
    if (!query.trim()) return []

    const tokens: SearchToken[] = []
    let currentToken = ''
    let inQuotes = false
    let i = 0

    while (i < query.length) {
        const char = query[i]

        // Handle quotes
        if (char === '"') {
            if (inQuotes) {
                if (currentToken.trim()) {
                    tokens.push({ type: 'exact', value: currentToken.trim() })
                }
                currentToken = ''
                inQuotes = false
            } else {
                if (currentToken.trim()) {
                    tokens.push(...parseToken(currentToken.trim()))
                }
                currentToken = ''
                inQuotes = true
            }
            i++
            continue
        }

        if (inQuotes) {
            currentToken += char
            i++
            continue
        }

        // Handle operators (case-insensitive)
        const remaining = query.slice(i).toUpperCase()
        if (remaining.startsWith(' AND ') && currentToken.trim()) {
            tokens.push(...parseToken(currentToken.trim()))
            tokens.push({ type: 'and', value: 'AND' })
            currentToken = ''
            i += 5
            continue
        }
        if (remaining.startsWith(' OR ') && currentToken.trim()) {
            tokens.push(...parseToken(currentToken.trim()))
            tokens.push({ type: 'or', value: 'OR' })
            currentToken = ''
            i += 4
            continue
        }
        if (remaining.startsWith(' NOT ') && currentToken.trim()) {
            tokens.push(...parseToken(currentToken.trim()))
            tokens.push({ type: 'not', value: 'NOT' })
            currentToken = ''
            i += 5
            continue
        }

        currentToken += char
        i++
    }

    // Handle remaining token
    if (currentToken.trim()) {
        if (inQuotes) {
            tokens.push({ type: 'exact', value: currentToken.trim() })
        } else {
            tokens.push(...parseToken(currentToken.trim()))
        }
    }

    return tokens
}

/**
 * Parse một token thành các subtokens (field:value, wildcards, etc.)
 */
function parseToken(token: string): SearchToken[] {
    const tokens: SearchToken[] = []
    
    // Check for field:value pattern
    const fieldMatch = token.match(/^(\w+):(.+)$/)
    if (fieldMatch) {
        const [, field, value] = fieldMatch
        tokens.push({ type: 'field', field, value })
        return tokens
    }

    // Check for wildcards
    if (token.includes('*') || token.includes('?')) {
        tokens.push({ type: 'wildcard', value: token })
        return tokens
    }

    // Regular text
    tokens.push({ type: 'text', value: token })
    return tokens
}

/**
 * Match text với search token
 */
export function matchToken(text: string, token: SearchToken, caseSensitive = false): boolean {
    const searchText = caseSensitive ? text : text.toLowerCase()
    const searchValue = caseSensitive ? token.value : token.value.toLowerCase()

    switch (token.type) {
        case 'exact':
            return searchText === searchValue

        case 'wildcard': {
            const pattern = searchValue
                .replace(/\*/g, '.*')
                .replace(/\?/g, '.')
            const regex = new RegExp(`^${pattern}$`, caseSensitive ? '' : 'i')
            return regex.test(text)
        }

        case 'text':
            return searchText.includes(searchValue)

        default:
            return false
    }
}

/**
 * Evaluate search query against text
 */
export function evaluateSearchQuery(query: string, text: string, caseSensitive = false): boolean {
    const tokens = parseSearchQuery(query)
    if (tokens.length === 0) return true

    let result = true
    let currentOperator: 'and' | 'or' | 'not' | null = null

    for (const token of tokens) {
        if (token.type === 'and' || token.type === 'or' || token.type === 'not') {
            currentOperator = token.type
            continue
        }

        const matches = matchToken(text, token, caseSensitive)
        
        if (currentOperator === 'or') {
            result = result || matches
        } else if (currentOperator === 'not') {
            result = result && !matches
        } else {
            result = result && matches
        }

        if (currentOperator) {
            currentOperator = null
        }
    }

    return result
}

/**
 * Extract search suggestions from data based on search fields
 */
export function extractSearchSuggestions<TData extends Record<string, any>>(
    data: TData[],
    searchFields: string[],
    query: string,
    maxSuggestions: number = 5
): string[] {
    if (!query.trim() || query.length < 2) return []

    const queryLower = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const suggestions = new Set<string>()

    for (const item of data) {
        for (const field of searchFields) {
            const value = item[field]
            if (value == null) continue

            const valueStr = String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            
            if (valueStr.includes(queryLower)) {
                const displayValue = String(value).trim()
                if (displayValue && !suggestions.has(displayValue)) {
                    suggestions.add(displayValue)
                    if (suggestions.size >= maxSuggestions) {
                        return Array.from(suggestions)
                    }
                }
            }
        }
    }

    return Array.from(suggestions)
}

