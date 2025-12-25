import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {
  /** ARIA label cho screen readers */
  "aria-label"?: string
}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      {...props}
    />
  )
}

export { Skeleton }

