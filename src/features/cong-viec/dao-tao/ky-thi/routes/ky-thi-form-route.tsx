/**
 * Kỳ thi Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { KyThiFormView } from "../components/ky-thi-form-view"

export default function KyThiFormRoute() {
  const params = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Extract id from params
  const id = params.id ? parseInt(params.id, 10) : undefined
  
  // Check if it's "moi" route
  const isNew = params.id === "moi" || !id

  const handleComplete = () => {
    const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
    if (returnTo === 'list') {
      navigate("/cong-viec/ky-thi")
    } else if (id) {
      navigate(`/cong-viec/ky-thi/${id}`)
    } else {
      navigate("/cong-viec/ky-thi")
    }
  }

  const handleCancel = () => {
    const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
    if (returnTo === 'list') {
      navigate("/cong-viec/ky-thi")
    } else if (id) {
      navigate(`/cong-viec/ky-thi/${id}`)
    } else {
      navigate("/cong-viec/ky-thi")
    }
  }

  return (
    <KyThiFormView
      id={isNew ? undefined : id}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

