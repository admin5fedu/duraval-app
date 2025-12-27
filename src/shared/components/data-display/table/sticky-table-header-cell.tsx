"use client"

import * as React from "react"
import { TableHead } from "@/components/ui/table"

interface StickyTableHeaderCellProps {
    isStickyLeft?: boolean
    isStickyRight?: boolean
    stickyLeftOffset?: number
    minWidth: number
    width: number
    colSpan?: number
    children: React.ReactNode
}

/**
 * Component cho sticky header cells
 * Đảm bảo header sticky cố định cả khi cuộn dọc và ngang
 */
export function StickyTableHeaderCell({
    isStickyLeft,
    isStickyRight,
    stickyLeftOffset,
    minWidth,
    width,
    colSpan,
    children
}: StickyTableHeaderCellProps) {
    const headerStyle: React.CSSProperties = React.useMemo(() => ({
        minWidth: `${minWidth}px`,
        width: `${width}px`,
        maxWidth: `${width}px`,
        boxSizing: 'border-box',
        backgroundColor: 'hsl(var(--background))',
        ...(isStickyLeft ? {
            left: stickyLeftOffset ?? 0,
            top: 0, // ✅ Cần top: 0 để sticky cả 2 chiều (vertical + horizontal)
            position: 'sticky',
            zIndex: 110, // Tăng z-index lên 110 để cao hơn body cells (100)
            boxShadow: '2px 0 6px -2px rgba(0, 0, 0, 0.15)',
            borderRight: '1px solid hsl(var(--border) / 0.5)',
            isolation: 'isolate',
            transform: 'translateZ(0)',
            willChange: 'transform',
            backgroundClip: 'padding-box'
        } : {}),
        ...(isStickyRight ? {
            right: 0,
            top: 0, // ✅ Cần top: 0 để sticky cả 2 chiều (vertical + horizontal)
            position: 'sticky',
            zIndex: 110, // Tăng z-index lên 110 để cao hơn body cells (100)
            boxShadow: '-2px 0 6px -2px rgba(0, 0, 0, 0.15)',
            borderLeft: '1px solid hsl(var(--border) / 0.5)',
            isolation: 'isolate',
            transform: 'translateZ(0)',
            willChange: 'transform',
            backgroundClip: 'padding-box'
        } : {})
    }), [isStickyLeft, isStickyRight, stickyLeftOffset, minWidth, width])
    
    return (
        <TableHead colSpan={colSpan} style={headerStyle}>
            {/* ✅ Backdrop cho sticky header - che khuất chữ scroll qua */}
            {(isStickyLeft || isStickyRight) && (
                <div 
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'white',
                        zIndex: 0,
                        pointerEvents: 'none'
                    }}
                />
            )}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </TableHead>
    )
}

