"use client"

import { Construction } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

interface PlaceholderPageProps {
    title: string
    description?: string
}

export function PlaceholderPage({ 
    title, 
    description = "Chức năng này đang được phát triển." 
}: PlaceholderPageProps) {
    const navigate = useNavigate()

    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6 p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Construction className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <div className="space-y-2 max-w-md">
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground text-lg">
                    {description}
                    <br />
                    Vui lòng quay lại sau.
                </p>
            </div>
            <div className="flex gap-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    Quay lại
                </Button>
                <Button onClick={() => navigate("/")}>
                    Về trang chủ
                </Button>
            </div>
        </div>
    )
}

