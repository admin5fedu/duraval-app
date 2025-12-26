/**
 * Reset Button Component
 */

import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { smallTextClass } from "@/shared/utils/text-styles"

interface ResetButtonProps {
  onReset: () => void
  label?: string
}

export function ResetButton({
  onReset,
  label = "Mặc định",
}: ResetButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onReset}
      className={cn("w-full justify-start h-8 px-2", smallTextClass())}
    >
      <RotateCcw className="mr-2 h-3.5 w-3.5" />
      {label}
    </Button>
  )
}

