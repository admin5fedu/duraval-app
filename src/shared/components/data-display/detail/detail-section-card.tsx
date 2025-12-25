"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User, Briefcase, Clock, FileText, LucideIcon } from "lucide-react"
import { DetailSection } from "../generic-detail-view/"
import { DetailFieldRenderer } from "./detail-field-renderer"
import { sectionTitleClass } from "@/shared/utils/section-styles"
import { cardPaddingClass } from "@/shared/utils/card-styles"
import { cn } from "@/lib/utils"

/**
 * Helper function để lấy icon cho section dựa trên title
 */
function getSectionIcon(title: string): LucideIcon {
  const titleLower = title.toLowerCase()
  if (titleLower.includes('cơ bản') || titleLower.includes('thông tin') || titleLower.includes('chung')) {
    return User
  } else if (titleLower.includes('công việc') || titleLower.includes('chức vụ') || titleLower.includes('vị trí')) {
    return Briefcase
  } else if (titleLower.includes('thời gian') || titleLower.includes('ngày') || titleLower.includes('lịch')) {
    return Clock
  } else if (titleLower.includes('ghi chú') || titleLower.includes('mô tả') || titleLower.includes('khác')) {
    return FileText
  }
  return FileText // Default icon
}

/**
 * Helper function để lấy colSpan class
 */
function getColSpanClass(colSpan?: 1 | 2 | 3): string {
  if (!colSpan || colSpan === 1) return "col-span-1"
  const colSpanMap: Record<2 | 3, string> = {
    2: "col-span-1 md:col-span-2 lg:col-span-2",
    3: "col-span-1 md:col-span-2 lg:col-span-3 w-full"
  }
  return colSpanMap[colSpan]
}

/**
 * Component để render một section trong detail view
 */
export function DetailSectionCard({ section }: { section: DetailSection }) {
  const SectionIcon = section.icon || getSectionIcon(section.title)

  return (
    <div className="space-y-3 sm:space-y-4 print:space-y-2 print:break-inside-avoid scroll-mt-28">
      <div className="flex items-center gap-2 sm:gap-2.5 px-1">
        <div className="p-1.5 rounded-md bg-primary/10 print:bg-transparent print:border print:border-primary">
          <SectionIcon className="h-4 w-4 text-primary shrink-0" />
        </div>
        <h3 className={sectionTitleClass("font-semibold tracking-tight text-primary")}>{section.title}</h3>
      </div>
      <Card className="shadow-sm border bg-card hover:shadow-md transition-shadow duration-200 print:shadow-none print:border-2">
        <CardContent className={cn(cardPaddingClass(), "print:p-4")}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6 print:gap-x-4 print:gap-y-3">
            {section.fields.map((field, fieldIndex) => (
              <div
                key={`${field.key}-${fieldIndex}`}
                className={getColSpanClass(field.colSpan)}
              >
                <div className="flex flex-row items-start gap-2.5 group w-full md:flex-col md:gap-1.5">
                  <div className="w-28 shrink-0 md:w-full">
                    <Label className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider group-hover:text-primary/80 transition-colors">
                      {field.label}
                    </Label>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="min-h-[1.5rem] flex items-start flex-wrap w-full">
                      <DetailFieldRenderer field={field} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

