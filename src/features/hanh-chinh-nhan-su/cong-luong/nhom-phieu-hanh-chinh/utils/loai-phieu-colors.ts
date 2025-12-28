/**
 * Utility function to get color class for loại phiếu badge
 * Maps different loại phiếu to different colors for easy distinction
 */

export function getLoaiPhieuBadgeClass(loaiPhieu: string | null | undefined): string {
    if (!loaiPhieu) {
        return "bg-muted text-muted-foreground border-transparent"
    }

    // Normalize to lowercase for comparison
    const normalized = loaiPhieu.toLowerCase().trim()

    // Color mapping for common loại phiếu
    const colorMap: Record<string, string> = {
        "vân tay": "bg-blue-50 text-blue-700 border-blue-200",
        "van tay": "bg-blue-50 text-blue-700 border-blue-200",
        "đi muộn về sớm": "bg-amber-50 text-amber-700 border-amber-200",
        "di muon ve som": "bg-amber-50 text-amber-700 border-amber-200",
        "nghỉ phép": "bg-green-50 text-green-700 border-green-200",
        "nghi phep": "bg-green-50 text-green-700 border-green-200",
        "nghỉ ốm": "bg-red-50 text-red-700 border-red-200",
        "nghi om": "bg-red-50 text-red-700 border-red-200",
        "công tác": "bg-purple-50 text-purple-700 border-purple-200",
        "cong tac": "bg-purple-50 text-purple-700 border-purple-200",
        "tăng ca": "bg-orange-50 text-orange-700 border-orange-200",
        "tang ca": "bg-orange-50 text-orange-700 border-orange-200",
        "điều chỉnh": "bg-indigo-50 text-indigo-700 border-indigo-200",
        "dieu chinh": "bg-indigo-50 text-indigo-700 border-indigo-200",
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
    // This ensures same loại phiếu always gets same color
    const hash = normalized.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)

    const colors = [
        "bg-blue-50 text-blue-700 border-blue-200",
        "bg-amber-50 text-amber-700 border-amber-200",
        "bg-green-50 text-green-700 border-green-200",
        "bg-red-50 text-red-700 border-red-200",
        "bg-purple-50 text-purple-700 border-purple-200",
        "bg-orange-50 text-orange-700 border-orange-200",
        "bg-indigo-50 text-indigo-700 border-indigo-200",
        "bg-pink-50 text-pink-700 border-pink-200",
        "bg-cyan-50 text-cyan-700 border-cyan-200",
        "bg-teal-50 text-teal-700 border-teal-200",
    ]

    return colors[Math.abs(hash) % colors.length]
}

