"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LichDang } from "../schema"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface PreviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: LichDang | null
}

export function PreviewDialog({ open, onOpenChange, data }: PreviewDialogProps) {
    const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null)
    const [isSubmitted, setIsSubmitted] = React.useState(false)
    const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null)
    const [showRetryMessage, setShowRetryMessage] = React.useState(false)

    // Reset state when dialog opens/closes or data changes
    React.useEffect(() => {
        if (!open) {
            setSelectedAnswer(null)
            setIsSubmitted(false)
            setIsCorrect(null)
            setShowRetryMessage(false)
        }
    }, [open, data])

    if (!data) return null

    const handleAnswerSelect = (answerNumber: number) => {
        if (isSubmitted) return
        setSelectedAnswer(answerNumber)
        setShowRetryMessage(false)
    }

    const handleSubmit = () => {
        if (selectedAnswer === null) return
        
        setIsSubmitted(true)
        const correct = selectedAnswer === data.dap_an_dung
        
        if (correct) {
            setIsCorrect(true)
        } else {
            setIsCorrect(false)
            setShowRetryMessage(true)
        }
    }

    const handleReset = () => {
        setSelectedAnswer(null)
        setIsSubmitted(false)
        setIsCorrect(null)
        setShowRetryMessage(false)
    }

    const answers = [
        { number: 1, text: data.dap_an_1 },
        { number: 2, text: data.dap_an_2 },
        { number: 3, text: data.dap_an_3 },
        { number: 4, text: data.dap_an_4 },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90vw] max-w-[700px] h-[90vh] flex flex-col p-0">
                {/* Sticky Header */}
                <div className="sticky top-0 z-[5] bg-background border-b px-6 py-4 pr-14 flex-shrink-0">
                    <DialogHeader className="pb-0">
                        <DialogTitle className="text-xl font-semibold">
                            Preview Câu Hỏi
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-3">
                        <h3 className="text-lg font-medium leading-relaxed">
                            {data.cau_hoi || "-"}
                        </h3>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
                    <div className="space-y-6">
                        {/* Nhóm câu hỏi */}
                        {data.nhom_cau_hoi_ten && (
                            <div>
                                <span className="text-sm text-muted-foreground">Nhóm câu hỏi:</span>
                                <Badge variant="secondary" className="ml-2">
                                    {data.nhom_cau_hoi_ten}
                                </Badge>
                            </div>
                        )}

                        {/* Hình ảnh */}
                        {data.hinh_anh && (
                            <div className="relative w-full h-64 rounded-lg border overflow-hidden bg-muted">
                                <img
                                    src={data.hinh_anh}
                                    alt="Câu hỏi"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}

                        {/* Các đáp án */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Chọn đáp án:
                            </h4>
                            <div className="grid gap-3">
                                {answers.map((answer) => {
                                    const isSelected = selectedAnswer === answer.number
                                    // Chỉ hiển thị đáp án đúng nếu trả lời đúng
                                    const showResult = isSubmitted && isCorrect && answer.number === data.dap_an_dung
                                    
                                    return (
                                        <button
                                            key={answer.number}
                                            type="button"
                                            onClick={() => handleAnswerSelect(answer.number)}
                                            disabled={isSubmitted}
                                            className={cn(
                                                "relative flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all",
                                                "hover:bg-accent hover:border-primary/50",
                                                "disabled:cursor-not-allowed disabled:opacity-60",
                                                isSelected && !isSubmitted && "border-primary bg-primary/5",
                                                isSelected && isSubmitted && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                                                isSelected && isSubmitted && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-950",
                                                showResult && !isSelected && "border-green-500 bg-green-50 dark:bg-green-950"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center font-semibold text-sm",
                                                isSelected && "bg-primary text-primary-foreground border-primary",
                                                !isSelected && "border-muted-foreground/30"
                                            )}>
                                                {answer.number}
                                            </div>
                                            <span className="flex-1 text-sm leading-relaxed">
                                                {answer.text}
                                            </span>
                                            {showResult && (
                                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                            )}
                                            {isSelected && isSubmitted && !isCorrect && (
                                                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Thông báo lỗi */}
                        {showRetryMessage && (
                            <div className="flex items-start gap-3 p-4 rounded-lg border border-red-500 bg-red-50 dark:bg-red-950">
                                <Clock className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    Đáp án không đúng. Hãy thử lại sau 15 phút.
                                </p>
                            </div>
                        )}

                        {/* Thông báo đúng */}
                        {isSubmitted && isCorrect && (
                            <div className="flex items-start gap-3 p-4 rounded-lg border border-green-500 bg-green-50 dark:bg-green-950">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    Chúc mừng! Bạn đã trả lời đúng.
                                </p>
                            </div>
                        )}

                        {/* Người tạo */}
                        {data.nguoi_tao_ten && (
                            <div className="pt-4 border-t">
                                <span className="text-sm text-muted-foreground">
                                    Người tạo: <span className="font-medium text-foreground">{data.nguoi_tao_ten}</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer với nút Gửi đáp án - cố định ở dưới */}
                <div className="flex-shrink-0 bg-background border-t px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                        {isSubmitted ? (
                            <Button onClick={handleReset} variant="outline">
                                Thử lại
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleSubmit} 
                                disabled={selectedAnswer === null}
                                className="min-w-[120px]"
                            >
                                Gửi đáp án
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

