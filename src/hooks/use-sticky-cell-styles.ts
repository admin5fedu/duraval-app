interface StickyMeta {
    stickyLeft?: boolean
    stickyLeftOffset?: number
    stickyRight?: boolean
    minWidth?: number
    maxWidth?: number
}

/**
 * Helper function để tính toán styles cho sticky cells
 * Đảm bảo z-index và positioning đúng cho sticky columns
 * (Không phải hook để có thể gọi trong map functions)
 */
export function getStickyCellStyles(
    meta: StickyMeta | undefined,
    minWidth: number,
    width: number
): { cellStyle: React.CSSProperties; isSticky: boolean } {
    const isSticky = meta?.stickyLeft || meta?.stickyRight
    
    const cellStyle: React.CSSProperties = {
        minWidth: `${minWidth}px`,
        width: `${width}px`,
        // ✅ KHÔNG đặt backgroundColor ở đây - để overlay xử lý
        // ✅ Z-index cho non-sticky để đảm bảo chúng nằm dưới sticky
        position: 'relative',
        zIndex: 1,
        ...(isSticky ? {
            position: 'sticky',
            zIndex: 100, // Tăng z-index lên 100 để đảm bảo che khuất
            isolation: 'isolate',
            // ✅ GPU layer riêng để che khuất hoàn toàn nội dung bên dưới
            transform: 'translateZ(0)',
            willChange: 'transform',
            // ✅ Đảm bảo background không bị transparent
            backgroundClip: 'padding-box'
        } : {}),
        ...(meta?.stickyLeft ? { 
            left: meta.stickyLeftOffset ?? 0,
            boxShadow: '2px 0 6px -2px rgba(0, 0, 0, 0.15)',
            borderRight: '1px solid hsl(var(--border) / 0.5)'
        } : {}),
        ...(meta?.stickyRight ? { 
            right: 0,
            boxShadow: '-2px 0 6px -2px rgba(0, 0, 0, 0.15)',
            borderLeft: '1px solid hsl(var(--border) / 0.5)'
        } : {})
    }
    
    return { 
        cellStyle, 
        isSticky
    }
}

