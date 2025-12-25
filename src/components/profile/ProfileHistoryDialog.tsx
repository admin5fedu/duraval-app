/**
 * Profile History Dialog
 * Displays change history for employee profile
 * Note: This is a simplified version. For full audit log, you would need an audit_log table in Supabase
 */

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { NhanSu } from '@/features/he-thong/nhan-su/danh-sach-nhan-su/schema'

interface ProfileHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: number
}

interface HistoryEntry {
  field: string
  oldValue: string | null
  newValue: string | null
  changedAt: string
  changedBy?: string
}

export function ProfileHistoryDialog({
  open,
  onOpenChange,
  employeeId,
}: ProfileHistoryDialogProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [currentData, setCurrentData] = useState<NhanSu | null>(null)

  useEffect(() => {
    if (open && employeeId) {
      fetchHistory()
    }
  }, [open, employeeId])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      // Fetch current employee data
      const { data: employeeData } = await supabase
        .from('var_nhan_su')
        .select('*')
        .eq('ma_nhan_vien', employeeId)
        .single()

      if (employeeData) {
        setCurrentData(employeeData as NhanSu)
        
        // Generate history from timestamps
        // Note: This is a simplified version. In production, you should have an audit_log table
        const entries: HistoryEntry[] = []
        
        if (employeeData.tg_tao) {
          entries.push({
            field: 'Tạo hồ sơ',
            oldValue: null,
            newValue: 'Hồ sơ được tạo',
            changedAt: employeeData.tg_tao,
          })
        }
        
        if (employeeData.tg_cap_nhat && employeeData.tg_cap_nhat !== employeeData.tg_tao) {
          entries.push({
            field: 'Cập nhật lần cuối',
            oldValue: null,
            newValue: 'Hồ sơ được cập nhật',
            changedAt: employeeData.tg_cap_nhat,
          })
        }

        setHistory(entries)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Lịch Sử Thay Đổi</DialogTitle>
          <DialogDescription>
            Lịch sử các thay đổi trong hồ sơ nhân viên
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Chưa có lịch sử thay đổi nào</p>
            <p className="text-sm mt-2">
              Lưu ý: Tính năng này cần bảng audit_log trong database để hiển thị đầy đủ lịch sử
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{entry.field}</div>
                    <Badge variant="outline">
                      {format(new Date(entry.changedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </Badge>
                  </div>
                  {entry.oldValue && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Từ: </span>
                      <span className="line-through text-muted-foreground">{entry.oldValue}</span>
                    </div>
                  )}
                  {entry.newValue && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Đến: </span>
                      <span className="font-medium">{entry.newValue}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

