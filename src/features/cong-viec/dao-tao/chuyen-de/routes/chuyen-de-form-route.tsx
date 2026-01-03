/**
 * Chuyên đề Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { ChuyenDeFormView } from "../components/chuyen-de-form-view"

export default function ChuyenDeFormRoute() {
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
      navigate("/cong-viec/chuyen-de")
    } else if (id) {
      navigate(`/cong-viec/chuyen-de/${id}`)
    } else {
      navigate("/cong-viec/chuyen-de")
    }
  }

  const handleCancel = () => {
    const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
    if (returnTo === 'list') {
      navigate("/cong-viec/chuyen-de")
    } else if (id) {
      navigate(`/cong-viec/chuyen-de/${id}`)
    } else {
      navigate("/cong-viec/chuyen-de")
    }
  }

  return (
    <ChuyenDeFormView
      id={isNew ? undefined : id}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

