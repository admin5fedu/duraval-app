/**
 * Utility function to get color class for phương tiện badge
 * Maps different phương tiện values to different colors for easy distinction
 */

export function getPhuongTienBadgeClass(phuongTien: string | null | undefined): string {
    if (!phuongTien) {
        return "bg-muted text-muted-foreground border-transparent"
    }

    // Normalize to lowercase for comparison
    const normalized = phuongTien.toLowerCase().trim()

    // Color mapping for phương tiện
    const colorMap: Record<string, string> = {
        "xe máy cá nhân": "bg-blue-50 text-blue-700 border-blue-200",
        "xe may ca nhan": "bg-blue-50 text-blue-700 border-blue-200",
        "xe ô tô cá nhân": "bg-indigo-50 text-indigo-700 border-indigo-200",
        "xe o to ca nhan": "bg-indigo-50 text-indigo-700 border-indigo-200",
        "xe máy công ty": "bg-green-50 text-green-700 border-green-200",
        "xe may cong ty": "bg-green-50 text-green-700 border-green-200",
        "xe ô tô công ty": "bg-teal-50 text-teal-700 border-teal-200",
        "xe o to cong ty": "bg-teal-50 text-teal-700 border-teal-200",
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
        "bg-blue-50 text-blue-700 border-blue-200",
        "bg-indigo-50 text-indigo-700 border-indigo-200",
        "bg-green-50 text-green-700 border-green-200",
        "bg-teal-50 text-teal-700 border-teal-200",
        "bg-purple-50 text-purple-700 border-purple-200",
        "bg-cyan-50 text-cyan-700 border-cyan-200",
    ]

    return colors[Math.abs(hash) % colors.length]
}

