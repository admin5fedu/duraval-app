"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { useMemo, useCallback } from "react"

interface UseModuleNavigationOptions {
  basePath: string
}

export function useModuleNavigation({ basePath }: UseModuleNavigationOptions) {
  const navigate = useNavigate()
  const location = useLocation()

  // Xác định mode dựa trên URL
  const { isNew, isEdit, isDetail, currentId } = useMemo(() => {
    const pathname = location.pathname
    
    // Parse pathname để lấy id và mode
    // Ví dụ: /he-thong/danh-sach-nhan-su/123/sua
    const pathParts = pathname.split('/').filter(Boolean)
    const basePathParts = basePath.split('/').filter(Boolean)
    
    // Tìm phần còn lại sau basePath
    const remainingParts = pathParts.slice(basePathParts.length)
    
    // Check if it's new mode: /basePath/moi
    const isNew = remainingParts.length === 1 && remainingParts[0] === 'moi'
    
    // Check if it's edit mode: /basePath/:id/sua
    const isEdit = remainingParts.length === 2 && remainingParts[1] === 'sua'
    
    // Check if it's detail mode: /basePath/:id (but not /sua)
    const isDetail = remainingParts.length === 1 && remainingParts[0] !== 'moi' && !isEdit
    
    // Extract id từ remainingParts
    let id: string | undefined
    if (isEdit || isDetail) {
      id = remainingParts[0]
    }

    return {
      isNew,
      isEdit,
      isDetail,
      currentId: id ? Number(id) : null,
    }
  }, [location.pathname, basePath])

  const handleAddNew = useCallback(() => {
    navigate(`${basePath}/moi`)
  }, [navigate, basePath])

  const handleEdit = useCallback((id: number | string, source: 'list' | 'detail' = 'list') => {
    navigate(`${basePath}/${id}/sua?returnTo=${source}`)
  }, [navigate, basePath])

  const handleView = useCallback((id: number | string) => {
    navigate(`${basePath}/${id}`)
  }, [navigate, basePath])

  const handleComplete = useCallback(() => {
    if (isEdit && currentId) {
      navigate(`${basePath}/${currentId}`)
    } else {
      navigate(basePath)
    }
  }, [navigate, basePath, isEdit, currentId])

  const handleCancel = useCallback(() => {
    if (isEdit && currentId) {
      navigate(`${basePath}/${currentId}`)
    } else {
      navigate(basePath)
    }
  }, [navigate, basePath, isEdit, currentId])

  const navigateToList = useCallback(() => {
    navigate(basePath)
  }, [navigate, basePath])

  return {
    isNew,
    isEdit,
    isDetail,
    currentId,
    handleAddNew,
    handleEdit,
    handleView,
    handleComplete,
    handleCancel,
    navigateToList,
  }
}

