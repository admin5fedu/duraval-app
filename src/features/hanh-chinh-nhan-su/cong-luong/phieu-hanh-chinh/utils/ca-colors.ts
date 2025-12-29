/**
 * Utility function to get color class for ca badge
 * Maps different ca values to different colors for easy distinction
 */

export function getCaBadgeClass(ca: string | null | undefined): string {
    if (!ca) {
        return "bg-muted text-muted-foreground border-transparent"
    }

    // Normalize to lowercase for comparison
    const normalized = ca.toLowerCase().trim()

    // Color mapping for ca values
    const colorMap: Record<string, string> = {
        "sáng": "bg-yellow-50 text-yellow-700 border-yellow-200",
        "sang": "bg-yellow-50 text-yellow-700 border-yellow-200",
        "chiều": "bg-orange-50 text-orange-700 border-orange-200",
        "chieu": "bg-orange-50 text-orange-700 border-orange-200",
        "tối": "bg-indigo-50 text-indigo-700 border-indigo-200",
        "toi": "bg-indigo-50 text-indigo-700 border-indigo-200",
        "cả ngày": "bg-emerald-50 text-emerald-700 border-emerald-200",
        "ca ngay": "bg-emerald-50 text-emerald-700 border-emerald-200",
    }

    // Check exact match first
    if (colorMap[normalized]) {
        return colorMap[normalized]
    }

    // Check partial match for variations
    for (const [key, color] of Object.entries(colorMap)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return color
        }
    }

    // Default: use hash-based color for consistent coloring of unknown values
    const hash = normalized.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)

    const colors = [
        "bg-yellow-50 text-yellow-700 border-yellow-200",
        "bg-orange-50 text-orange-700 border-orange-200",
        "bg-indigo-50 text-indigo-700 border-indigo-200",
        "bg-emerald-50 text-emerald-700 border-emerald-200",
        "bg-blue-50 text-blue-700 border-blue-200",
        "bg-purple-50 text-purple-700 border-purple-200",
    ]

    return colors[Math.abs(hash) % colors.length]
}

