"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BaiThiTestState, BaiThiTestActions } from "../hooks/use-bai-thi-test"
import { calculatePercentage } from "../utils/bai-thi-test-helpers"

interface BaiThiResultViewProps {
  testState: BaiThiTestState & BaiThiTestActions
}

export function BaiThiResultView({ testState }: BaiThiResultViewProps) {
  const { selectedKyThi, finalResult, resetState } = testState

  if (!finalResult || !selectedKyThi) {
    return null
  }

  const percentage = calculatePercentage(finalResult.diem_so || 0, finalResult.tong_so_cau || 0)
  const isPassed = finalResult.trang_thai === "Đạt"

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Kết quả bài thi</CardTitle>
          <CardDescription className="text-lg mt-2">
            {selectedKyThi.ten_ky_thi}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Circle */}
          <div className="flex justify-center">
            <div
              className={cn(
                "rounded-full w-40 h-40 flex flex-col justify-center items-center",
                isPassed
                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                  : "bg-red-500/10 text-red-700 dark:text-red-400"
              )}
            >
              <p className="text-4xl font-bold">
                {finalResult.diem_so}/{finalResult.tong_so_cau}
              </p>
              <p className="text-lg font-semibold">({percentage.toFixed(0)}%)</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex justify-center items-center gap-2">
            {isPassed ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            )}
            <p
              className={cn(
                "text-2xl font-bold",
                isPassed
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              )}
            >
              {finalResult.trang_thai}
            </p>
          </div>

          {/* Back Button */}
          <div className="pt-4">
            <Button onClick={resetState} className="w-full" size="lg">
              Quay về danh sách
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

