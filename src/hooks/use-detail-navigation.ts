"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { useCallback, useEffect } from "react"

/**
 * Hook để quản lý navigation và keyboard shortcuts cho detail view
 */
export function useDetailNavigation({
  onBack,
  backUrl
}: {
  onBack?: () => void
  backUrl?: string
}) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = useCallback(() => {
    // Ưu tiên 1: onBack callback (nếu được chỉ định)
    if (onBack) {
      onBack()
      return
    }
    
    // Ưu tiên 2: backUrl prop (nếu được chỉ định)
    if (backUrl) {
      navigate(backUrl)
      return
    }
    
    // Ưu tiên 3: Tính toán parent route từ pathname
    // Ví dụ: /he-thong/danh-sach-nhan-su/123 -> /he-thong/danh-sach-nhan-su
    const pathParts = location.pathname.split("/").filter(Boolean)
    if (pathParts.length >= 1) {
      // Bỏ phần cuối (id)
      const parentPath = "/" + pathParts.slice(0, -1).join("/")
      navigate(parentPath)
      return
    }
    
    // Fallback: quay lại trang trước trong history
    navigate(-1)
  }, [onBack, backUrl, location.pathname, navigate])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to go back (chỉ khi không đang nhập trong input/textarea)
      if (e.key === 'Escape' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement
        const isInputFocused = target.tagName === 'INPUT' || 
                              target.tagName === 'TEXTAREA' || 
                              target.isContentEditable
        
        if (!isInputFocused) {
          handleBack()
        }
      }
      // Ctrl/Cmd + E to edit (if actions contain edit button)
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault()
        const editButton = document.querySelector('[data-action="edit"]') as HTMLElement
        editButton?.click()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleBack])

  return { handleBack }
}

