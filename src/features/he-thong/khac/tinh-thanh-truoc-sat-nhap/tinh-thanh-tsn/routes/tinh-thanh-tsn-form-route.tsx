/**
 * Tỉnh thành TSN Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { TinhThanhTSNFormView } from "../components/tinh-thanh-tsn-form-view"

export default function TinhThanhTSNFormRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const isEditMode = id !== "moi" && id !== undefined
  const numericId = isEditMode ? parseInt(id, 10) : undefined

  if (isEditMode && (isNaN(numericId!) || !numericId)) {
    return <div>ID không hợp lệ</div>
  }

  const returnTo = searchParams.get('returnTo') || (isEditMode ? 'detail' : 'list')

  const handleComplete = () => {
    if (returnTo === 'list') {
      navigate("/he-thong/tinh-thanh-tsn")
    } else if (numericId) {
      navigate(`/he-thong/tinh-thanh-tsn/${numericId}`)
    } else {
      navigate("/he-thong/tinh-thanh-tsn")
    }
  }

  const handleCancel = () => {
    if (returnTo === 'list') {
      navigate("/he-thong/tinh-thanh-tsn")
    } else if (numericId) {
      navigate(`/he-thong/tinh-thanh-tsn/${numericId}`)
    } else {
      navigate("/he-thong/tinh-thanh-tsn")
    }
  }

  return (
    <TinhThanhTSNFormView
      id={numericId}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

