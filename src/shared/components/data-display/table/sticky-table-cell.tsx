"use client"

import { TableCell } from "@/components/ui/table"

interface StickyTableCellProps {
    isSticky: boolean
    bgColor: string
    children: React.ReactNode
    style: React.CSSProperties
    isActionsColumn?: boolean
}

/**
 * Component reusable cho sticky cells với backdrop
 * Đảm bảo che khuất hoàn toàn nội dung scroll qua và hover effect đồng bộ
 */
export function StickyTableCell({
    isSticky,
    bgColor,
    children,
    style,
    isActionsColumn = false
}: StickyTableCellProps) {
    // Xử lý background rõ ràng
    const finalBgColor = bgColor && bgColor !== '' 
        ? bgColor 
        : 'hsl(var(--background))'
    
    const hasHoverBg = bgColor && bgColor !== ''
    
    // Với actions column, không nên clip nội dung
    const cellStyle = isActionsColumn 
        ? { ...style, overflow: 'visible' as const }
        : style
    
    return (
        <TableCell style={cellStyle}>
            {/* ✅ Sticky cells: Backdrop trắng + overlay hover */}
            {isSticky ? (
                <>
                    {/* Lớp backdrop trắng đặc - LUÔN CÓ */}
                    <div 
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'white',
                            zIndex: 0,
                            pointerEvents: 'none'
                        }}
                    />
                    {/* Lớp màu hover/select - LUÔN render */}
                    <div 
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: finalBgColor,
                            opacity: hasHoverBg ? 1 : 0,
                            zIndex: 1,
                            pointerEvents: 'none',
                            transition: 'opacity 0.2s ease-in-out'
                        }}
                    />
                </>
            ) : (
                /* ✅ Non-sticky cells: Chỉ 1 overlay (trắng hoặc màu hover) */
                <>
                    {/* Backdrop trắng */}
                    <div 
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'white',
                            zIndex: 0,
                            pointerEvents: 'none'
                        }}
                    />
                    {/* Overlay hover - LUÔN render */}
                    <div 
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: finalBgColor,
                            opacity: hasHoverBg ? 1 : 0,
                            zIndex: 1,
                            pointerEvents: 'none',
                            transition: 'opacity 0.2s ease-in-out'
                        }}
                    />
                </>
            )}
            {/* Content - z-index cao nhất */}
            <div style={{ position: 'relative', zIndex: 2, overflow: isActionsColumn ? 'visible' : undefined }}>
                {children}
            </div>
        </TableCell>
    )
}

