/**
 * Câu hỏi Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { CauHoiFormView } from "../components/cau-hoi-form-view"

export default function CauHoiFormRoute() {
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
      navigate("/cong-viec/cau-hoi")
    } else if (id) {
      navigate(`/cong-viec/cau-hoi/${id}`)
    } else {
      navigate("/cong-viec/cau-hoi")
    }
  }

  const handleCancel = () => {
    const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
    if (returnTo === 'list') {
      navigate("/cong-viec/cau-hoi")
    } else if (id) {
      navigate(`/cong-viec/cau-hoi/${id}`)
    } else {
      navigate("/cong-viec/cau-hoi")
    }
  }

  return (
    <CauHoiFormView
      id={isNew ? undefined : id}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

