"use client"

import { useParams, useNavigate } from "react-router-dom"
import { ChucVuDetailView } from "../components/chuc-vu-detail-view"
import { chucVuConfig } from "../config"

export default function ChucVuDetailRoute() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    if (!id) {
        navigate(chucVuConfig.routePath)
        return null
    }

    const chucVuId = Number(id)
    if (isNaN(chucVuId)) {
        navigate(chucVuConfig.routePath)
        return null
    }

    const handleEdit = () => {
        navigate(`${chucVuConfig.routePath}/${id}/sua`)
    }

    const handleBack = () => {
        navigate(chucVuConfig.routePath)
    }

    return (
        <ChucVuDetailView
            id={chucVuId}
            onEdit={handleEdit}
            onBack={handleBack}
        />
    )
}

