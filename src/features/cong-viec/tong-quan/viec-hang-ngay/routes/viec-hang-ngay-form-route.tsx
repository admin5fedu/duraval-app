"use client"

import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { ViecHangNgayFormView } from "../components/viec-hang-ngay-form-view"
import { viecHangNgayConfig } from "../config"

export default function ViecHangNgayFormRoute() {
    const params = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const id = params.id ? parseInt(params.id, 10) : undefined
    const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')

    const handleComplete = () => {
        if (returnTo === 'list') {
            navigate(viecHangNgayConfig.routePath)
        } else if (returnTo === 'detail' && id) {
            navigate(`${viecHangNgayConfig.routePath}/${id}`)
        } else {
            navigate(viecHangNgayConfig.routePath)
        }
    }

    const handleCancel = () => {
        const cancelUrl = returnTo === 'list' 
            ? viecHangNgayConfig.routePath
            : (id ? `${viecHangNgayConfig.routePath}/${id}` : viecHangNgayConfig.routePath)
        navigate(cancelUrl)
    }

    return (
        <ViecHangNgayFormView
            id={id}
            onComplete={handleComplete}
            onCancel={handleCancel}
        />
    )
}

