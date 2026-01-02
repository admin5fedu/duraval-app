/**
 * Quỹ HTBH theo tháng Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { QuyHTBHTheoThangFormView } from "../components/quy-htbh-theo-thang-form-view"
import { quyHTBHTheoThangConfig } from "../config"

export default function QuyHTBHTheoThangFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')

  const handleComplete = () => {
    if (returnTo === 'detail' && id) {
      navigate(`${quyHTBHTheoThangConfig.routePath}/${id}`)
    } else {
      navigate(quyHTBHTheoThangConfig.routePath)
    }
  }

  const handleCancel = () => {
    if (returnTo === 'detail' && id) {
      navigate(`${quyHTBHTheoThangConfig.routePath}/${id}`)
    } else {
      navigate(quyHTBHTheoThangConfig.routePath)
    }
  }

  return (
    <QuyHTBHTheoThangFormView
      id={id ? Number(id) : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

