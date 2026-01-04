/**
 * Tỉnh thành TSN Detail Route
 * 
 * Route component for detail view
 */

"use client"

import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { TinhThanhTSNDetailView } from "../components/tinh-thanh-tsn-detail-view"

export default function TinhThanhTSNDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  if (!id) {
    return <div>ID không hợp lệ</div>
  }

  const numericId = parseInt(id, 10)
  if (isNaN(numericId)) {
    return <div>ID không hợp lệ</div>
  }

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

  const handleEdit = () => {
    const query = buildReturnQuery()
    navigate(`/he-thong/tinh-thanh-tsn/${numericId}/sua?returnTo=detail${query.replace('?', '&')}`)
  }

  const handleBack = () => {
    navigate(`/he-thong/tinh-thanh-tsn${buildReturnQuery()}`)
  }

  return (
    <TinhThanhTSNDetailView
      id={numericId}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}

