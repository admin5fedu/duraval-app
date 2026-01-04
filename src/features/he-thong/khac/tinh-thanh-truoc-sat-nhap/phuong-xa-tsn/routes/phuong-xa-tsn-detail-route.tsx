"use client"

import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { PhuongXaTSNDetailView } from "../components/phuong-xa-tsn-detail-view"
import { phuongXaTSNConfig } from "../config"

export default function PhuongXaTSNDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  if (!id) {
    navigate(phuongXaTSNConfig.routePath)
    return null
  }

  const idNumber = parseInt(id, 10)
  if (isNaN(idNumber)) {
    navigate(phuongXaTSNConfig.routePath)
    return null
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

  const handleBack = () => {
    navigate(`${phuongXaTSNConfig.routePath}${buildReturnQuery()}`)
  }

  return <PhuongXaTSNDetailView id={idNumber} onBack={handleBack} />
}

