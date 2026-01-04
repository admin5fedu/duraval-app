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
    const headerStyle: React.CSSProperties = React.useMemo(() => {
        // ✅ Tất cả headers đều sticky top: 0
        const baseStyle: React.CSSProperties = {
            minWidth: `${minWidth}px`,
            width: `${width}px`,
            maxWidth: `${width}px`,
            boxSizing: 'border-box',
            backgroundColor: 'hsl(var(--background))',
            position: 'sticky',
            top: 0,
            zIndex: isStickyLeft || isStickyRight ? 110 : 30, // Sticky columns cao hơn header thường
        }

        // ✅ Sticky left columns
        if (isStickyLeft) {
            return {
                ...baseStyle,
                left: stickyLeftOffset ?? 0,
                boxShadow: '2px 0 6px -2px rgba(0, 0, 0, 0.15)',
                borderRight: '1px solid hsl(var(--border) / 0.5)',
                isolation: 'isolate',
                transform: 'translateZ(0)',
                willChange: 'transform',
                backgroundClip: 'padding-box'
            }
        }

        // ✅ Sticky right columns
        if (isStickyRight) {
            return {
                ...baseStyle,
                right: 0,
                boxShadow: '-2px 0 6px -2px rgba(0, 0, 0, 0.15)',
                borderLeft: '1px solid hsl(var(--border) / 0.5)',
                isolation: 'isolate',
                transform: 'translateZ(0)',
                willChange: 'transform',
                backgroundClip: 'padding-box'
            }
        }

        // ✅ Header thường (chỉ sticky top)
        return baseStyle
    }, [isStickyLeft, isStickyRight, stickyLeftOffset, minWidth, width])
    
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

