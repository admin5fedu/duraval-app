"use client"

import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { QuanHuyenTSNFormView } from "../components/quan-huyen-tsn-form-view"
import { quanHuyenTSNConfig } from "../config"

export default function QuanHuyenTSNFormRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const idNumber = id ? parseInt(id, 10) : undefined
  if (id && isNaN(idNumber!)) {
    navigate(quanHuyenTSNConfig.routePath)
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
      navigate(`${quanHuyenTSNConfig.routePath}/${idNumber}${query}`)
    } else {
      navigate(`${quanHuyenTSNConfig.routePath}${query}`)
    }
  }

  const handleCancel = () => {
    const query = buildReturnQuery()
    if (idNumber) {
      navigate(`${quanHuyenTSNConfig.routePath}/${idNumber}${query}`)
    } else {
      navigate(`${quanHuyenTSNConfig.routePath}${query}`)
    }
  }

  return <QuanHuyenTSNFormView id={idNumber} onComplete={handleComplete} onCancel={handleCancel} />
}

