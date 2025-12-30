"use client"

import { useParams, useNavigate } from "react-router-dom"
import { LoaiTaiLieuDetailView } from "../components/loai-tai-lieu-detail-view"
import { loaiTaiLieuConfig } from "../config"

export default function LoaiTaiLieuDetailRoute() {
    const params = useParams()
    const navigate = useNavigate()
    const id = params.id ? parseInt(params.id, 10) : undefined

    if (!id || isNaN(id)) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-destructive mb-2">ID không hợp lệ</p>
                    <button 
                        onClick={() => navigate(loaiTaiLieuConfig.routePath)}
                        className="text-primary hover:underline"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        )
    }

    const handleEdit = () => {
        navigate(`${loaiTaiLieuConfig.routePath}/${id}/sua?returnTo=detail`)
    }

    const handleBack = () => {
        navigate(loaiTaiLieuConfig.routePath)
    }

    return (
        <LoaiTaiLieuDetailView
            id={id}
            onEdit={handleEdit}
            onBack={handleBack}
        />
    )
}

