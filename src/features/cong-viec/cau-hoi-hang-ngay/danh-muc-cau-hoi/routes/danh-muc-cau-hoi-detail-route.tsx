"use client"

import { useParams, useNavigate } from "react-router-dom"
import { DanhMucCauHoiDetailView } from "../components/danh-muc-cau-hoi-detail-view"
import { danhMucCauHoiConfig } from "../config"

export default function DanhMucCauHoiDetailRoute() {
    const params = useParams()
    const navigate = useNavigate()
    const id = params.id ? parseInt(params.id, 10) : undefined

    if (!id || isNaN(id)) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-destructive mb-2">ID không hợp lệ</p>
                    <button 
                        onClick={() => navigate(danhMucCauHoiConfig.routePath)}
                        className="text-primary hover:underline"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        )
    }

    const handleEdit = () => {
        navigate(`${danhMucCauHoiConfig.routePath}/${id}/sua?returnTo=detail`)
    }

    const handleBack = () => {
        navigate(danhMucCauHoiConfig.routePath)
    }

    return (
        <DanhMucCauHoiDetailView
            id={id}
            onEdit={handleEdit}
            onBack={handleBack}
        />
    )
}

