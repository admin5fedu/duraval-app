/**
 * Tỉnh thành SSN Form Route
 * 
 * Route component for form view (create/edit)
 */

"use client"

import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { TinhThanhSSNFormView } from "../components/tinh-thanh-ssn-form-view"

export default function TinhThanhSSNFormRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const isEditMode = id !== "moi" && id !== undefined
  const numericId = isEditMode ? parseInt(id, 10) : undefined

  if (isEditMode && (isNaN(numericId!) || !numericId)) {
    return <div>ID không hợp lệ</div>
  }

  const returnTo = searchParams.get('returnTo') || (isEditMode ? 'detail' : 'list')
  
  // Preserve page, pageSize, search, and filters from URL
  const page = searchParams.get('page') || '1'
  const pageSize = searchParams.get('pageSize') || '50'
  const search = searchParams.get('search') || ''
  const filters = searchParams.get('filters') || ''
  
  const buildReturnQuery = () => {
    const params = new URLSearchParams()
    params.set('page', page)
    params.set('pageSize', pageSize)
    if (search) params.set('search', search)
    if (filters) params.set('filters', filters)
    return `?${params.toString()}`
  }

  const handleComplete = () => {
    const query = buildReturnQuery()
    if (returnTo === 'list') {
      navigate(`/he-thong/tinh-thanh-ssn${query}`)
    } else if (numericId) {
      navigate(`/he-thong/tinh-thanh-ssn/${numericId}${query}`)
    } else {
      navigate(`/he-thong/tinh-thanh-ssn${query}`)
    }
  }

  const handleCancel = () => {
    const query = buildReturnQuery()
    if (returnTo === 'list') {
      navigate(`/he-thong/tinh-thanh-ssn${query}`)
    } else if (numericId) {
      navigate(`/he-thong/tinh-thanh-ssn/${numericId}${query}`)
    } else {
      navigate(`/he-thong/tinh-thanh-ssn${query}`)
    }
  }

  return (
    <TinhThanhSSNFormView
      id={numericId}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}

