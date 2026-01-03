"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CheckCircle2, AlertCircle, Send, ChevronLeft, ChevronRight, List } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BaiThiTestState, BaiThiTestActions } from "../hooks/use-bai-thi-test"
import { ANSWER_LABELS } from "../utils/bai-thi-test-helpers"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface BaiThiTestViewProps {
  testState: BaiThiTestState & BaiThiTestActions
}

export function BaiThiTestView({ testState }: BaiThiTestViewProps) {
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false)
  
  const {
    selectedKyThi,
    shuffledQuestions,
    userAnswers,
    currentQuestionIndex,
    timeLeft,
    isTimeWarning,
    selectAnswer,
    goToQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    submitTest,
  } = testState

  if (!selectedKyThi || shuffledQuestions.length === 0) {
    return null
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex]
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const answeredCount = userAnswers.filter((answer) => answer !== null).length
  const totalQuestions = shuffledQuestions.length
  const canFinish = answeredCount === totalQuestions
  const isFirstQuestion = currentQuestionIndex === 0
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const progressPercentage = Math.round((answeredCount / totalQuestions) * 100)

  const handleGoToQuestion = (index: number) => {
    goToQuestion(index)
    setIsNavigatorOpen(false)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-background border-b px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-base sm:text-xl font-bold truncate max-w-[150px] sm:max-w-none">
            {selectedKyThi.ten_ky_thi}
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Timer */}
          <div
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border font-mono font-bold text-xs sm:text-base",
              isTimeWarning
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800 animate-pulse"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
            )}
          >
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
          {/* Submit Button */}
          <Button onClick={() => submitTest()} disabled={!canFinish} size="sm" className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9">
            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Nộp bài</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 p-3 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-4 sm:gap-6 overflow-y-auto pb-32 sm:pb-20 lg:pb-6">
          {/* Question Card */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            {/* Question Header */}
            <div className="bg-muted px-4 sm:px-6 py-2 sm:py-4 border-b flex justify-between items-center">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider text-xs sm:text-sm">
                Câu hỏi {currentQuestionIndex + 1} / {totalQuestions}
              </span>
            </div>

            <CardContent className="flex flex-col flex-grow p-3 sm:p-6 lg:p-10 overflow-y-auto min-h-0">
              {/* Question Text */}
              <h2 className="text-xl lg:text-2xl font-medium leading-relaxed mb-4 sm:mb-8 text-foreground">
                {currentQuestion.cau_hoi}
              </h2>

              {/* Answers */}
              <div className="space-y-3 sm:space-y-4">
                {currentQuestion.shuffledAnswers.map((answer, index) => {
                  const isSelected =
                    userAnswers[currentQuestionIndex] === answer.originalIndex
                  return (
                    <button
                      key={`answer-${currentQuestion.id}-${answer.originalIndex}-${index}`}
                      type="button"
                      onClick={() => selectAnswer(answer.originalIndex)}
                      className={cn(
                        "group flex items-center text-left p-3.5 sm:p-5 rounded-xl border-2 transition-all w-full",
                        "cursor-pointer touch-manipulation select-none min-h-[64px] sm:min-h-auto",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border hover:border-primary/50 hover:bg-muted/50 active:bg-muted"
                      )}
                    >
                      {/* Badge cho option (A, B, C, D) */}
                      <div
                        className={cn(
                          "w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold mr-4 shrink-0 transition-colors text-base sm:text-base",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/20"
                        )}
                      >
                        {ANSWER_LABELS[index]}
                      </div>
                      {/* Answer Text */}
                      <span
                        className={cn(
                          "text-base sm:text-lg flex-1 leading-relaxed",
                          isSelected
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {answer.text}
                      </span>
                      {/* Check icon khi selected */}
                      {isSelected && (
                        <CheckCircle2 className="ml-auto text-primary shrink-0" size={24} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Warning Alert */}
              {!canFinish && (
                <Alert variant="destructive" className="mt-4 sm:mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Bạn còn {totalQuestions - answeredCount} câu chưa trả lời.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Question Navigator Sidebar - Hidden on mobile */}
          <Card className="hidden lg:flex lg:w-80 flex-col overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Danh sách câu hỏi</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {answeredCount}/{totalQuestions}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 overflow-hidden p-6">
              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-primary rounded-full" />
                  Hiện tại
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-primary/20 rounded-full border border-primary/30" />
                  Đã làm
                </div>
              </div>

              {/* Question Grid */}
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-8 sm:grid-cols-5 gap-1 sm:gap-2">
                  {shuffledQuestions.map((question, index) => {
                    const answer = userAnswers[index]
                    const isCurrent = index === currentQuestionIndex
                    const isAnswered = typeof answer === "number"

                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => goToQuestion(index)}
                        className={cn(
                          "aspect-square rounded-md sm:rounded-lg flex items-center justify-center text-[10px] sm:text-sm font-bold transition-all border",
                          isCurrent
                            ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20 scale-110 z-10"
                            : isAnswered
                            ? "bg-primary/10 text-primary border-primary/30 hover:border-primary/50"
                            : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Progress Bar - Full trên desktop */}
              <div className="hidden sm:block mt-6 pt-6 border-t">
                <div className="bg-muted p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Tiến độ bài làm</p>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-lg font-bold">
                      {answeredCount}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        / {totalQuestions}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-primary">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-muted-foreground/20 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-16 left-0 right-0 z-[60] bg-background border-t p-3 sm:p-4 flex justify-between items-center shadow-lg lg:sticky lg:bottom-0 lg:z-auto">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={isFirstQuestion}
            className="flex items-center gap-2 h-9 sm:h-10"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <Button
            variant="outline"
            onClick={goToNextQuestion}
            disabled={isLastQuestion}
            className="flex items-center gap-2 h-9 sm:h-10"
          >
            Tiếp theo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Floating Button for Navigator on Mobile */}
      <Button
        onClick={() => setIsNavigatorOpen(true)}
        size="icon"
        className="fixed bottom-32 right-4 z-50 h-12 w-12 rounded-full shadow-lg lg:hidden"
        aria-label="Mở danh sách câu hỏi"
      >
        <List className="h-5 w-5" />
      </Button>

      {/* Sheet Navigator for Mobile */}
      <Sheet open={isNavigatorOpen} onOpenChange={setIsNavigatorOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Danh sách câu hỏi</SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex flex-col h-[calc(80vh-120px)]">
            {/* Legend và Progress Bar */}
            <div className="flex flex-col gap-4 mb-4 pb-4 border-b">
              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-primary rounded-full" />
                  Hiện tại
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-primary/20 rounded-full border border-primary/30" />
                  Đã làm
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-muted p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-bold">
                    {answeredCount} / {totalQuestions}
                  </span>
                  <span className="text-sm font-semibold text-primary">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-muted-foreground/20 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Question Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-6 gap-2">
                {shuffledQuestions.map((question, index) => {
                  const answer = userAnswers[index]
                  const isCurrent = index === currentQuestionIndex
                  const isAnswered = typeof answer === "number"

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => handleGoToQuestion(index)}
                      className={cn(
                        "aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all border",
                        isCurrent
                          ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20 scale-110 z-10"
                          : isAnswered
                          ? "bg-primary/10 text-primary border-primary/30 active:border-primary/50"
                          : "bg-background text-muted-foreground border-border active:border-primary/50 active:bg-muted/50"
                      )}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
