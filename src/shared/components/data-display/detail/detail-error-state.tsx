"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface DetailErrorStateProps {
  /** Tiêu đề lỗi */
  title?: string
  /** Mô tả chi tiết lỗi */
  message?: string
  /** URL hoặc callback để quay lại */
  onBack?: () => void
  backUrl?: string
  /** Label cho nút quay lại */
  backLabel?: string
  /** Custom action buttons */
  actions?: React.ReactNode
}

/**
 * Component hiển thị error state cho detail views
 * 
 * ✅ Chuẩn hóa UI/UX cho error states
 * ✅ Hỗ trợ cả callback và URL navigation
 * 
 * @example
 * ```tsx
 * <DetailErrorState
 *   title="Không tìm thấy nhân sự"
 *   message="Nhân sự với ID này không tồn tại hoặc đã bị xóa."
 *   backUrl="/nhan-su"
 * />
 * ```
 */
export function DetailErrorState({
  title = "Không tìm thấy dữ liệu",
  message = "Dữ liệu không tồn tại hoặc đã bị xóa.",
  onBack,
  backUrl,
  backLabel = "Quay lại",
  actions,
}: DetailErrorStateProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backUrl) {
      navigate(backUrl)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2 text-destructive">{title}</h3>
      
      {message && (
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
          {message}
        </p>
      )}

      <div className="flex items-center gap-2">
        {(onBack || backUrl) && (
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>
        )}
        {actions}
      </div>
    </div>
  )
}

