"use client"

import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { PhuongXaTSNFormView } from "../components/phuong-xa-tsn-form-view"
import { phuongXaTSNConfig } from "../config"

export default function PhuongXaTSNFormRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const idNumber = id ? parseInt(id, 10) : undefined
  if (id && isNaN(idNumber!)) {
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

  const handleComplete = () => {
    const query = buildReturnQuery()
    if (idNumber) {
      navigate(`${phuongXaTSNConfig.routePath}/${idNumber}${query}`)
    } else {
      navigate(`${phuongXaTSNConfig.routePath}${query}`)
    }
  }

  const handleCancel = () => {
    const query = buildReturnQuery()
    if (idNumber) {
      navigate(`${phuongXaTSNConfig.routePath}/${idNumber}${query}`)
    } else {
      navigate(`${phuongXaTSNConfig.routePath}${query}`)
    }
  }

  return <PhuongXaTSNFormView id={idNumber} onComplete={handleComplete} onCancel={handleCancel} />
}

