"use client"

import { useNavigate } from "react-router-dom"
import { LoaiTaiLieuListView } from "../components/loai-tai-lieu-list-view"
import { loaiTaiLieuConfig } from "../config"

export default function LoaiTaiLieuListRoute() {
    const navigate = useNavigate()

    const handleEdit = (id: number) => {
        navigate(`${loaiTaiLieuConfig.routePath}/${id}/sua`)
    }

    const handleAddNew = () => {
        navigate(`${loaiTaiLieuConfig.routePath}/moi`)
    }

    const handleView = (id: number) => {
        navigate(`${loaiTaiLieuConfig.routePath}/${id}`)
    }

    return (
        <LoaiTaiLieuListView
            onEdit={handleEdit}
            onAddNew={handleAddNew}
            onView={handleView}
        />
    )
}

