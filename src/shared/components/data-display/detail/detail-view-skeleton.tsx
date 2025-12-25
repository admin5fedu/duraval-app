"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

interface DetailViewSkeletonProps {
  showAvatar?: boolean
  sectionsCount?: number
  fieldsPerSection?: number
}

export function DetailViewSkeleton({
  showAvatar = true,
  sectionsCount = 3,
  fieldsPerSection = 6
}: DetailViewSkeletonProps) {
  const skeletonId = React.useId()

  return (
    <div
      className="space-y-6 sm:space-y-8 pb-6 sm:pb-10 animate-in fade-in duration-300"
      role="status"
      aria-live="polite"
      aria-label="Đang tải chi tiết"
      aria-busy="true"
    >
      {/* Hidden text for screen readers */}
      <span className="sr-only" id={skeletonId}>
        Đang tải thông tin chi tiết, vui lòng đợi...
      </span>
      {/* Header Skeleton */}
      <div
        className="sticky top-16 z-20 -mx-3 sm:-mx-4 px-3 sm:px-4 bg-background/95 backdrop-blur border-b py-3 sm:py-4 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between"
        aria-label="Header đang tải"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <Skeleton className="h-8 w-8 rounded-full" aria-label="Nút quay lại" />
          <div className="flex items-center gap-3 sm:gap-4">
            {showAvatar && (
              <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-full" aria-label="Ảnh đại diện" />
            )}
            <div className="space-y-2">
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" aria-label="Tiêu đề" />
              <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" aria-label="Phụ đề" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2" aria-label="Các nút thao tác">
          <Skeleton className="h-9 w-16 sm:w-20" aria-label="Nút thao tác" />
          <Skeleton className="h-9 w-16 sm:w-20" aria-label="Nút thao tác" />
        </div>
      </div>

      {/* Sections Skeleton */}
      <div className="grid gap-6 sm:gap-8" aria-label="Các section đang tải">
        {Array.from({ length: sectionsCount }).map((_, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3 sm:space-y-4" role="region" aria-label={`Section ${sectionIndex + 1} đang tải`}>
            <div className="flex items-center gap-2 sm:gap-2.5 px-1">
              <Skeleton className="h-7 w-7 rounded-md" aria-label="Icon section" />
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" aria-label="Tiêu đề section" />
            </div>
            <Card className="shadow-sm border bg-card/50">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6">
                  {Array.from({ length: fieldsPerSection }).map((_, fieldIndex) => (
                    <div key={fieldIndex} className="space-y-1.5">
                      <Skeleton
                        className="h-3 w-20 sm:w-24"
                        aria-label={`Nhãn trường ${fieldIndex + 1}`}
                      />
                      <Skeleton
                        className="h-4 sm:h-5 w-full"
                        aria-label={`Giá trị trường ${fieldIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

