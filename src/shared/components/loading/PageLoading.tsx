import { Loader2 } from "lucide-react"

/**
 * Page Loading Component
 * 
 * Skeleton loader cho pages khi lazy loading
 */
export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    </div>
  )
}

/**
 * Component Loading Component
 * 
 * Small loader cho components
 */
export function ComponentLoading() {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
    </div>
  )
}

/**
 * Table Loading Component
 * 
 * Skeleton loader cho tables
 */
export function TableLoading() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

