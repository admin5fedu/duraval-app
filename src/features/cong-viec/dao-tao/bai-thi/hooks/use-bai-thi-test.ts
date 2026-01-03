"use client"

import { useState, useCallback, useEffect } from "react"
import type { KyThi } from "../../ky-thi/schema"
import type { CauHoi } from "../../cau-hoi/schema"
import type { BaiThi } from "../schema"
import type {
  ShuffledQuestion,
  ChiTietBaiLam,
} from "../utils/bai-thi-test-helpers"
import {
  createShuffledQuestions,
  restoreShuffledQuestions,
  createChiTietBaiLam,
  updateChiTietBaiLamWithAnswers,
  calculateScore,
  determineStatus,
} from "../utils/bai-thi-test-helpers"
import { useCreateBaiThi, useUpdateBaiThi } from "./use-bai-thi-mutations"
import { useAuthStore } from "@/shared/stores/auth-store"

export type TestView = "start" | "test" | "result"

export interface BaiThiTestState {
  // Current test
  currentTest: BaiThi | null
  // Shuffled questions
  shuffledQuestions: ShuffledQuestion[]
  // User answers (array of originalIndex: 1-4 or null)
  userAnswers: (number | null)[]
  // Current question index
  currentQuestionIndex: number
  // Time left in seconds
  timeLeft: number
  // Time warning (when < 5 minutes)
  isTimeWarning: boolean
  // Current view
  view: TestView
  // Final result
  finalResult: BaiThi | null
  // Selected kỳ thi
  selectedKyThi: KyThi | null
}

export interface BaiThiTestActions {
  // Start new test
  startTest: (kyThi: KyThi, allQuestions: CauHoi[]) => Promise<void>
  // Continue unfinished test
  continueTest: (baiThi: BaiThi, kyThi: KyThi, allQuestions: CauHoi[]) => void
  // Start timer and begin test
  startTimer: () => Promise<void>
  // Select answer
  selectAnswer: (originalIndex: number | null) => void
  // Navigate questions
  goToQuestion: (index: number) => void
  goToNextQuestion: () => void
  goToPreviousQuestion: () => void
  // Submit test
  submitTest: (forceSubmit?: boolean) => Promise<void>
  // Exit test (back to detail)
  exitTest: () => void
  // Reset state
  resetState: () => void
}

export function useBaiThiTest(): BaiThiTestState & BaiThiTestActions {
  const { employee } = useAuthStore()
  const createMutation = useCreateBaiThi()
  const updateMutation = useUpdateBaiThi()

  // State
  const [currentTest, setCurrentTest] = useState<BaiThi | null>(null)
  const [shuffledQuestions, setShuffledQuestions] = useState<
    ShuffledQuestion[]
  >([])
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isTimeWarning, setIsTimeWarning] = useState(false)
  const [view, setView] = useState<TestView>("start")
  const [finalResult, setFinalResult] = useState<BaiThi | null>(null)
  const [selectedKyThi, setSelectedKyThi] = useState<KyThi | null>(null)

  // Start new test
  const startTest = useCallback(
    async (kyThi: KyThi, allQuestions: CauHoi[]) => {
      if (!employee?.ma_nhan_vien) {
        throw new Error("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.")
      }

      // Create shuffled questions
      const preparedQuestions = createShuffledQuestions(kyThi, allQuestions)

      if (preparedQuestions.length === 0) {
        throw new Error("Không có câu hỏi phù hợp cho kỳ thi này.")
      }

      // Create chi_tiet_bai_lam
      const chiTietBaiLam = createChiTietBaiLam(preparedQuestions)

      // Create test payload
      const newTestPayload = {
        ky_thi_id: kyThi.id!,
        nhan_vien_id: employee.ma_nhan_vien,
        ngay_lam_bai: new Date().toISOString().split("T")[0],
        thoi_gian_bat_dau: null,
        thoi_gian_ket_thuc: null,
        diem_so: 0,
        tong_so_cau: preparedQuestions.length,
        trang_thai: "Chưa thi",
        chi_tiet_bai_lam: chiTietBaiLam,
        trao_doi: null,
      }

      // Create test in database
      const result = await createMutation.mutateAsync(newTestPayload)

      // Update state
      setSelectedKyThi(kyThi)
      setShuffledQuestions(preparedQuestions)
      setCurrentTest(result)
      setUserAnswers(new Array(preparedQuestions.length).fill(null))
      setCurrentQuestionIndex(0)
      setTimeLeft(kyThi.so_phut_lam_bai * 60)
      setIsTimeWarning(false)
      setView("start")
      setFinalResult(null)
    },
    [employee, createMutation]
  )

  // Continue unfinished test
  const continueTest = useCallback(
    (baiThi: BaiThi, kyThi: KyThi, allQuestions: CauHoi[]) => {
      // Restore shuffled questions
      const restoredQuestions = restoreShuffledQuestions(baiThi, allQuestions)

      // Get user answers from chi_tiet_bai_lam
      const answersFromData =
        baiThi.chi_tiet_bai_lam && Array.isArray(baiThi.chi_tiet_bai_lam)
          ? (baiThi.chi_tiet_bai_lam as ChiTietBaiLam[]).map(
              (detail) => detail.dap_an_da_chon
            )
          : new Array(restoredQuestions.length).fill(null)

      // Update state
      setSelectedKyThi(kyThi)
      setShuffledQuestions(restoredQuestions)
      setCurrentTest(baiThi)
      setUserAnswers(answersFromData)
      setCurrentQuestionIndex(0)
      setFinalResult(null)

      // Calculate time left
      if (baiThi.trang_thai === "Đang thi" && baiThi.thoi_gian_bat_dau) {
        const startTime = new Date(baiThi.thoi_gian_bat_dau).getTime()
        const now = new Date().getTime()
        const elapsedSeconds = Math.floor((now - startTime) / 1000)
        const totalSeconds = kyThi.so_phut_lam_bai * 60
        setTimeLeft(Math.max(0, totalSeconds - elapsedSeconds))
        setView("test")
      } else {
        setTimeLeft(kyThi.so_phut_lam_bai * 60)
        setView("start")
      }

      setIsTimeWarning(false)
    },
    []
  )

  // Start timer and begin test
  const startTimer = useCallback(async () => {
    if (!currentTest) return

    const updatedTest = {
      ...currentTest,
      trang_thai: "Đang thi",
      thoi_gian_bat_dau: new Date().toISOString(),
    }

    const result = await updateMutation.mutateAsync({
      id: currentTest.id!,
      input: updatedTest,
    })

    setCurrentTest(result)
    setView("test")
  }, [currentTest, updateMutation])

  // Select answer
  const selectAnswer = useCallback((originalIndex: number | null) => {
    setUserAnswers((prev) => {
      const newAnswers = [...prev]
      newAnswers[currentQuestionIndex] = originalIndex
      return newAnswers
    })
  }, [currentQuestionIndex])

  // Navigate questions
  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < shuffledQuestions.length) {
      setCurrentQuestionIndex(index)
    }
  }, [shuffledQuestions.length])

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }, [currentQuestionIndex, shuffledQuestions.length])

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }, [currentQuestionIndex])

  // Submit test
  const submitTest = useCallback(async (forceSubmit = false) => {
    if (!currentTest || !selectedKyThi) return

    // Check if all questions are answered (skip if forceSubmit)
    if (!forceSubmit) {
      const firstUnanswered = userAnswers.findIndex((answer) => answer === null)
      if (firstUnanswered !== -1) {
        setCurrentQuestionIndex(firstUnanswered)
        throw new Error(
          `Bạn còn ${userAnswers.filter((a) => a === null).length} câu chưa trả lời. Vui lòng trả lời hết trước khi nộp bài.`
        )
      }
    }

    // Calculate score
    const score = calculateScore(shuffledQuestions, userAnswers)
    const isTimeUp = timeLeft <= 0 || forceSubmit
    const status = determineStatus(score, shuffledQuestions.length, isTimeUp)

    // Update chi_tiet_bai_lam with answers
    const updatedChiTiet = updateChiTietBaiLamWithAnswers(
      currentTest.chi_tiet_bai_lam as ChiTietBaiLam[],
      userAnswers
    )

    // Final test result
    const finalTestResult = {
      ...currentTest,
      diem_so: score,
      chi_tiet_bai_lam: updatedChiTiet,
      thoi_gian_ket_thuc: new Date().toISOString(),
      trang_thai: status,
    }

    // Update in database
    const result = await updateMutation.mutateAsync({
      id: currentTest.id!,
      input: finalTestResult,
    })

    setFinalResult(result)
    setView("result")
    setIsTimeWarning(false)
  }, [
    currentTest,
    selectedKyThi,
    shuffledQuestions,
    userAnswers,
    timeLeft,
    updateMutation,
  ])

  // Exit test (back to detail)
  const exitTest = useCallback(() => {
    resetState()
  }, [])

  // Reset state
  const resetState = useCallback(() => {
    setCurrentTest(null)
    setShuffledQuestions([])
    setUserAnswers([])
    setCurrentQuestionIndex(0)
    setTimeLeft(0)
    setIsTimeWarning(false)
    setView("start")
    setFinalResult(null)
    setSelectedKyThi(null)
  }, [])

  // Timer effect
  useEffect(() => {
    if (view !== "test" || currentTest?.trang_thai !== "Đang thi") {
      return
    }

    if (timeLeft <= 0) {
      // Auto submit when time is up (force submit - allow even if not all answered)
      submitTest(true).catch((error) => {
        console.error("Lỗi khi tự động nộp bài:", error)
      })
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1

        // Show warning when < 5 minutes
        if (newTime <= 300) {
          setIsTimeWarning(true)
        } else {
          setIsTimeWarning(false)
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [view, currentTest?.trang_thai, timeLeft, submitTest])

  // Auto-save effect - save answers every 30 seconds
  useEffect(() => {
    if (view !== "test" || currentTest?.trang_thai !== "Đang thi") {
      return
    }

    // Only auto-save if there are answers to save
    const hasAnswers = userAnswers.some((answer) => answer !== null)
    if (!hasAnswers || !currentTest || !selectedKyThi) {
      return
    }

    const autoSaveInterval = setInterval(async () => {
      try {
        // Update chi_tiet_bai_lam with current answers
        const updatedChiTiet = updateChiTietBaiLamWithAnswers(
          currentTest.chi_tiet_bai_lam as ChiTietBaiLam[],
          userAnswers
        )

        // Update in database (silently, don't show loading/toast)
        await updateMutation.mutateAsync({
          id: currentTest.id!,
          input: {
            ...currentTest,
            chi_tiet_bai_lam: updatedChiTiet,
          },
        })
      } catch (error) {
        // Silently fail - don't interrupt user's test
        console.error("Lỗi khi tự động lưu câu trả lời:", error)
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [view, currentTest, userAnswers, selectedKyThi, updateMutation])

  return {
    // State
    currentTest,
    shuffledQuestions,
    userAnswers,
    currentQuestionIndex,
    timeLeft,
    isTimeWarning,
    view,
    finalResult,
    selectedKyThi,
    // Actions
    startTest,
    continueTest,
    startTimer,
    selectAnswer,
    goToQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    submitTest,
    exitTest,
    resetState,
  }
}

