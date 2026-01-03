"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, FileText, ArrowLeft } from "lucide-react"
import type { BaiThiTestState, BaiThiTestActions } from "../hooks/use-bai-thi-test"

interface BaiThiStartViewProps {
  testState: BaiThiTestState & BaiThiTestActions
  onStart: () => void
  onBack: () => void
}

export function BaiThiStartView({ testState, onStart, onBack }: BaiThiStartViewProps) {
  const { selectedKyThi } = testState
  
  if (!selectedKyThi) {
    return null
  }
  
  const kyThi = selectedKyThi
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Bắt đầu bài thi</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
          <CardDescription className="text-lg mt-2">
            {kyThi.ten_ky_thi}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <FileText className="h-5 w-5" />
              <span>Số câu hỏi: <strong className="text-foreground">{kyThi.so_cau_hoi}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span>Thời gian làm bài: <strong className="text-foreground">{kyThi.so_phut_lam_bai} phút</strong></span>
            </div>
          </div>

          {kyThi.ghi_chu && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {kyThi.ghi_chu}
              </p>
            </div>
          )}

          <div className="pt-4">
            <Button
              onClick={onStart}
              className="w-full"
              size="lg"
            >
              Bắt đầu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

