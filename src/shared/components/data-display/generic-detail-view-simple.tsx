"use client"

import { Button } from "@/components/ui/button"
import { FileText, ArrowLeft } from "lucide-react"
import { useEffect } from "react"
import { DetailViewSkeleton } from "./detail/detail-view-skeleton"
import { useDetailNavigation } from "@/hooks/use-detail-navigation"
import { DetailHeader } from "./detail/detail-header"
import { DetailSectionCard } from "./detail/detail-section-card"
import { DetailField, DetailSection } from "./generic-detail-view/"
import { useBreadcrumb } from "@/components/providers/BreadcrumbProvider"

interface GenericDetailViewSimpleProps {
  title: string
  subtitle?: string
  avatarUrl?: string | null
  sections: DetailSection[]
  onBack?: () => void
  backUrl?: string // URL để quay lại (nếu không có sẽ tính từ pathname)
  actions?: React.ReactNode
  isLoading?: boolean
}

/**
 * Simplified GenericDetailView - matches StandardDetailView API
 * Đơn giản hơn GenericDetailView với config object
 */
export function GenericDetailViewSimple({
  title,
  subtitle,
  avatarUrl,
  sections,
  onBack,
  backUrl,
  actions,
  isLoading = false
}: GenericDetailViewSimpleProps) {
  const { handleBack } = useDetailNavigation({ onBack, backUrl })
  const { setDetailTitle } = useBreadcrumb()

  // Set breadcrumb title when component mounts
  useEffect(() => {
    setDetailTitle(title)
    // Clear title when component unmounts
    return () => {
      setDetailTitle(null)
    }
  }, [title, setDetailTitle])

  // Show skeleton if loading
  if (isLoading) {
    return <DetailViewSkeleton showAvatar={!!avatarUrl} sectionsCount={sections.length || 3} />
  }

  // Empty state
  if (!sections || sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Không có dữ liệu</h3>
        <p className="text-sm text-muted-foreground mb-4">Không tìm thấy thông tin để hiển thị.</p>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    )
  }

  return (
    <>
      <DetailHeader
        title={title}
        subtitle={subtitle}
        avatarUrl={avatarUrl}
        onBack={handleBack}
        actions={actions}
      />
      
      <div className="space-y-6 sm:space-y-8 pb-6 sm:pb-10 print:space-y-4 print:pb-4 pt-0">
        {/* Sections */}
        <div className="grid gap-6 sm:gap-8 print:gap-4">
          {sections.map((section, sectionIndex) => (
            <DetailSectionCard key={sectionIndex} section={section} />
          ))}
        </div>
      </div>
    </>
  )
}

