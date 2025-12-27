"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog"

interface EmployeeNavigationCellProps {
    /** Mã nhân viên */
    maNhanVien: number
    /** Tên hiển thị (ví dụ: "100 - Nguyễn Văn A") */
    displayText: string
    /** Route path để navigate (mặc định: /he-thong/danh-sach-nhan-su) */
    routePath?: string
    /** Custom className cho button */
    className?: string
}

/**
 * Employee Navigation Cell Component
 * 
 * Component hiển thị cột nhân viên với khả năng click để navigate đến trang chi tiết.
 * Có popup xác nhận trước khi navigate.
 * 
 * Sử dụng button thay vì Link để tránh vấn đề với React Router Link navigation behavior.
 * TableRowWithHover đã có logic kiểm tra data-slot="action-button" để bỏ qua row click.
 * 
 * @example
 * ```tsx
 * <EmployeeNavigationCell
 *   maNhanVien={100}
 *   displayText="100 - Nguyễn Văn A"
 * />
 * ```
 */
export function EmployeeNavigationCell({
    maNhanVien,
    displayText,
    routePath = "/he-thong/danh-sach-nhan-su",
    className = "font-medium hover:underline text-blue-600 text-left",
}: EmployeeNavigationCellProps) {
    const navigate = useNavigate()
    const [confirmOpen, setConfirmOpen] = React.useState(false)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // ✅ QUAN TRỌNG: stopPropagation phải được gọi TRƯỚC preventDefault
        // để ngăn event bubble lên row ngay từ đầu
        e.stopPropagation()
        e.preventDefault()
        setConfirmOpen(true)
    }

    const handleConfirm = () => {
        navigate(`${routePath}/${maNhanVien}`)
    }

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                onMouseDown={(e) => {
                    // Ngăn event propagation ở capture phase
                    e.stopPropagation()
                }}
                onMouseUp={(e) => {
                    // Ngăn event propagation ở bubble phase
                    e.stopPropagation()
                }}
                className={className}
                data-slot="action-button"
            >
                {displayText}
            </button>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Lưu ý"
                description={
                    <span>
                        Bạn có muốn chuyển đến trang chi tiết nhân sự <strong>{displayText}</strong>?
                    </span>
                }
                onConfirm={handleConfirm}
                confirmLabel="Đồng ý"
                cancelLabel="Hủy"
            />
        </>
    )
}

