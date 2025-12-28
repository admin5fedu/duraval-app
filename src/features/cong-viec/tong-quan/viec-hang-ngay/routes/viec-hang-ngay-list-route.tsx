"use client"

import { useNavigate } from "react-router-dom"
import { ViecHangNgayListView } from "../components/viec-hang-ngay-list-view"
import { viecHangNgayConfig } from "../config"

export default function ViecHangNgayListRoute() {
    const navigate = useNavigate()

    const handleEdit = (id: number) => {
        navigate(`${viecHangNgayConfig.routePath}/${id}/sua?returnTo=list`)
    }

    const handleAddNew = () => {
        navigate(`${viecHangNgayConfig.routePath}/moi`)
    }

    const handleView = (id: number) => {
        navigate(`${viecHangNgayConfig.routePath}/${id}`)
    }

    return (
        <ViecHangNgayListView
            onEdit={handleEdit}
            onAddNew={handleAddNew}
            onView={handleView}
        />
    )
}

