"use client"

import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { useCallback } from "react"

/**
 * Hook để quản lý navigation cho form view
 * Tự động xử lý query param `returnTo` để quay về đúng trang:
 * - returnTo=list: quay về list page (bỏ 2 cấp cuối: /sua và /{id})
 * - returnTo=detail: quay về detail page (bỏ cấp cuối: /sua)
 */
export function useFormNavigation({
  onCancel,
  cancelUrl
}: {
  onCancel?: () => void
  cancelUrl?: string
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const handleCancel = useCallback(() => {
    // Ưu tiên 1: onCancel callback (nếu được chỉ định)
    if (onCancel) {
      onCancel()
      return
    }
    
    // Ưu tiên 2: cancelUrl prop (nếu được chỉ định)
    if (cancelUrl) {
      navigate(cancelUrl)
      return
    }
    
    // Ưu tiên 3: Xử lý returnTo query param (nếu có)
    const returnTo = searchParams.get("returnTo")
    if (returnTo) {
      if (returnTo === "list") {
        // Quay về list: bỏ 2 cấp cuối (/sua và /{id})
        // Ví dụ: /he-thong/danh-sach-nhan-su/123/sua -> /he-thong/danh-sach-nhan-su
        const pathParts = location.pathname.split("/").filter(Boolean)
        if (pathParts.length >= 2) {
          // Bỏ 2 phần cuối (id và "sua")
          const listPath = "/" + pathParts.slice(0, -2).join("/")
          navigate(listPath)
          return
        }
      } else if (returnTo === "detail") {
        // Quay về detail: bỏ cấp cuối (/sua)
        // Ví dụ: /he-thong/danh-sach-nhan-su/123/sua -> /he-thong/danh-sach-nhan-su/123
        const pathParts = location.pathname.split("/").filter(Boolean)
        if (pathParts.length >= 1) {
          // Bỏ phần cuối ("sua")
          const detailPath = "/" + pathParts.slice(0, -1).join("/")
          navigate(detailPath)
          return
        }
      }
    }
    
    // Fallback: quay lại trang trước trong history
    navigate(-1)
  }, [onCancel, cancelUrl, location.pathname, navigate, searchParams])

  return { handleCancel }
}

