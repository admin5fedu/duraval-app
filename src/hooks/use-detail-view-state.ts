"use client"

import { UseQueryResult } from "@tanstack/react-query"

/**
 * Hook để chuẩn hóa logic loading/error state cho detail views
 * 
 * ✅ Giải quyết vấn đề: Không hiển thị error khi đang loading
 * ✅ Pattern nhất quán cho tất cả detail views
 * 
 * @example
 * ```tsx
 * const { data, isLoading, isError } = useNhanSuById(id, initialData)
 * const viewState = useDetailViewState({ data, isLoading, isError, initialData })
 * 
 * if (viewState.isLoading) return <LoadingSkeleton />
 * if (viewState.isError) return <ErrorState />
 * if (!viewState.data) return null
 * 
 * return <DetailView data={viewState.data} />
 * ```
 */
export function useDetailViewState<TData>({
  data,
  isLoading,
  isError,
  initialData,
}: {
  data: TData | null | undefined
  isLoading: boolean
  isError: boolean
  initialData?: TData | null
}): {
  /** Hiển thị loading state - chỉ true khi đang load và không có initialData */
  isLoading: boolean
  /** Hiển thị error state - chỉ true khi đã load xong và có lỗi hoặc không có data */
  isError: boolean
  /** Data đã được đảm bảo tồn tại (TypeScript safe) */
  data: TData | null
  /** Có thể render content - data tồn tại và không đang loading */
  canRender: boolean
} {
  // ✅ FIX: Chỉ hiển thị loading khi đang tải và không có initialData
  const showLoading = isLoading && !initialData

  // ✅ FIX: Chỉ hiển thị error khi đã load xong và có lỗi hoặc không có data
  const showError = !isLoading && (isError || !data)

  // Data an toàn để sử dụng (có thể null nếu chưa load xong)
  const safeData = data ?? null

  // Có thể render content khi có data và không đang loading
  const canRender = !showLoading && !showError && !!safeData

  return {
    isLoading: showLoading,
    isError: showError,
    data: safeData,
    canRender,
  }
}

/**
 * Hook helper để extract state từ UseQueryResult
 * 
 * @example
 * ```tsx
 * const query = useNhanSuById(id, initialData)
 * const viewState = useDetailViewStateFromQuery(query, initialData)
 * ```
 */
export function useDetailViewStateFromQuery<TData, TError = Error>(
  query: UseQueryResult<TData, TError>,
  initialData?: TData | null
) {
  return useDetailViewState({
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    initialData,
  })
}

