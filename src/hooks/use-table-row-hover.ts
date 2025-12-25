"use client"

import * as React from "react"

/**
 * Hook để quản lý hover state và background color cho table rows
 * Đảm bảo đồng bộ hover effect cho cả sticky và non-sticky cells
 */
export function useTableRowHover(isSelected: boolean) {
    const [isHovered, setIsHovered] = React.useState(false)
    
    // Determine background color based on state - same for all cells
    // ✅ Luôn dùng màu xám nhạt khi hover (bất kể selected hay không) để tránh màu đỏ
    const bgColor = React.useMemo(() => {
        // ✅ Removed: if (isSelected && isHovered) return 'hsl(var(--primary) / 0.2)' - không dùng màu primary khi hover
        // ✅ Removed: if (isSelected) return 'hsl(var(--primary) / 0.05)' - không hiển thị màu khi chỉ selected
        if (isHovered) return 'oklch(0.96 0.002 0)' // Slightly darker grey for better visibility - dùng cho cả selected và non-selected
        return ''
    }, [isSelected, isHovered])
    
    return { 
        isHovered, 
        setIsHovered, 
        bgColor 
    }
}

