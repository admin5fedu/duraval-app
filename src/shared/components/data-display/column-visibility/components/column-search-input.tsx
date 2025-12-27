/**
 * Column Search Input Component
 */

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { smallTextClass } from "@/shared/utils/text-styles"

interface ColumnSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function ColumnSearchInput({
  value,
  onChange,
  placeholder = "Tìm kiếm cột...",
}: ColumnSearchInputProps) {
  const inputId = React.useId()
  
  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <Input
        id={inputId}
        name="column-search"
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("h-8 pl-7 pr-2", smallTextClass())}
      />
    </div>
  )
}

