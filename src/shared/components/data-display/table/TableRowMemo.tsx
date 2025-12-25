import { memo } from 'react'
import { TableRow } from '@/components/ui/table'

/**
 * Memoized TableRow Component
 * 
 * Prevents unnecessary re-renders of table rows
 */
export const TableRowMemo = memo(TableRow, (prevProps, nextProps) => {
  // Custom comparison logic if needed
  return prevProps.className === nextProps.className
})

TableRowMemo.displayName = 'TableRowMemo'

