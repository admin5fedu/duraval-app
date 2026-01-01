"use client"

import { useParams, useNavigate } from "react-router-dom"
import { NhomApDoanhSoDetailView } from "../components/nhom-ap-doanh-so-detail-view"
import { nhomApDoanhSoConfig } from "../config"

export default function NhomApDoanhSoDetailRoute() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    if (!id) {
        navigate(nhomApDoanhSoConfig.routePath)
        return null
    }

    const nhomApDoanhSoId = Number(id)
    if (isNaN(nhomApDoanhSoId)) {
        navigate(nhomApDoanhSoConfig.routePath)
        return null
    }

    const handleEdit = () => {
        navigate(`${nhomApDoanhSoConfig.routePath}/${id}/sua`)
    }

    const handleBack = () => {
        navigate(nhomApDoanhSoConfig.routePath)
    }

    return (
        <NhomApDoanhSoDetailView
            id={nhomApDoanhSoId}
            onEdit={handleEdit}
            onBack={handleBack}
        />
    )
}

