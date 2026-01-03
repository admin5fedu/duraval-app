/**
 * Helper functions for Bài thi test functionality
 * Handles shuffling questions and answers, calculating scores, etc.
 */

import type { KyThi } from "../../ky-thi/schema"
import type { CauHoi } from "../../cau-hoi/schema"
import type { BaiThi } from "../schema"

/**
 * Shuffled answer with original index
 */
export interface ShuffledAnswer {
  text: string
  originalIndex: 1 | 2 | 3 | 4
}

/**
 * Question with shuffled answers
 */
export interface ShuffledQuestion extends CauHoi {
  shuffledAnswers: ShuffledAnswer[]
}

/**
 * Chi tiết bài làm (format trong chi_tiet_bai_lam JSONB)
 */
export interface ChiTietBaiLam {
  cau_hoi_id: number
  thu_tu_dap_an: number[] // [3, 2, 4, 1] - thứ tự đáp án đã shuffle
  dap_an_da_chon: number | null // 1-4 (original index, null nếu chưa chọn)
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Create shuffled questions from kỳ thi
 * - Filters questions by chuyen_de_ids
 * - Shuffles question order
 * - Shuffles answer order for each question
 */
export const createShuffledQuestions = (
  kyThi: KyThi,
  allQuestions: CauHoi[]
): ShuffledQuestion[] => {
  // Filter questions by chuyen_de_ids
  const relevantQuestions = allQuestions.filter((q) =>
    kyThi.chuyen_de_ids?.includes(q.chuyen_de_id)
  )

  if (relevantQuestions.length === 0) {
    return []
  }

  // Shuffle and select questions
  const shuffledQuestions = shuffleArray(relevantQuestions)
  const selectedQuestions = shuffledQuestions.slice(0, kyThi.so_cau_hoi || 10)

  // Shuffle answers for each question
  const preparedQuestions: ShuffledQuestion[] = selectedQuestions.map((q) => {
    const answers: ShuffledAnswer[] = shuffleArray([
      { text: q.dap_an_1, originalIndex: 1 as const },
      { text: q.dap_an_2, originalIndex: 2 as const },
      { text: q.dap_an_3, originalIndex: 3 as const },
      { text: q.dap_an_4, originalIndex: 4 as const },
    ])

    return {
      ...q,
      shuffledAnswers: answers,
    }
  })

  return preparedQuestions
}

/**
 * Restore shuffled questions from bài thi chi_tiet_bai_lam
 * Used when continuing an unfinished test
 */
export const restoreShuffledQuestions = (
  baiThi: BaiThi,
  allQuestions: CauHoi[]
): ShuffledQuestion[] => {
  if (!baiThi.chi_tiet_bai_lam || !Array.isArray(baiThi.chi_tiet_bai_lam)) {
    return []
  }

  const allQuestionsMap = new Map<number, CauHoi>(
    allQuestions.map((q) => [q.id!, q])
  )

  return baiThi.chi_tiet_bai_lam
    .map((detail: ChiTietBaiLam) => {
      const question = allQuestionsMap.get(detail.cau_hoi_id)
      if (!question) return null

      const originalAnswers: ShuffledAnswer[] = [
        { text: question.dap_an_1, originalIndex: 1 as const },
        { text: question.dap_an_2, originalIndex: 2 as const },
        { text: question.dap_an_3, originalIndex: 3 as const },
        { text: question.dap_an_4, originalIndex: 4 as const },
      ]

      // Restore shuffled order from thu_tu_dap_an
      const shuffledAnswers: ShuffledAnswer[] = detail.thu_tu_dap_an.map(
        (originalIndex) => {
          return originalAnswers.find((a) => a.originalIndex === originalIndex)!
        }
      )

      return {
        ...question,
        shuffledAnswers,
      }
    })
    .filter((q): q is ShuffledQuestion => q !== null)
}

/**
 * Calculate score from user answers
 */
export const calculateScore = (
  shuffledQuestions: ShuffledQuestion[],
  userAnswers: (number | null)[]
): number => {
  let score = 0

  shuffledQuestions.forEach((question, index) => {
    const chosenAnswer = userAnswers[index]
    if (chosenAnswer !== null && chosenAnswer === question.dap_an_dung) {
      score++
    }
  })

  return score
}

/**
 * Determine test status (Đạt/Không đạt)
 * - Đạt: >= 85% và không hết giờ
 * - Không đạt: < 85% hoặc hết giờ
 */
export const determineStatus = (
  score: number,
  totalQuestions: number,
  isTimeUp: boolean
): "Đạt" | "Không đạt" => {
  if (isTimeUp) {
    return "Không đạt"
  }

  const passRate = (score / totalQuestions) * 100
  return passRate >= 85 ? "Đạt" : "Không đạt"
}

/**
 * Convert shuffled questions to chi_tiet_bai_lam format
 */
export const createChiTietBaiLam = (
  shuffledQuestions: ShuffledQuestion[]
): ChiTietBaiLam[] => {
  return shuffledQuestions.map((q) => ({
    cau_hoi_id: q.id!,
    thu_tu_dap_an: q.shuffledAnswers.map((a) => a.originalIndex),
    dap_an_da_chon: null,
  }))
}

/**
 * Update chi_tiet_bai_lam with user answers
 */
export const updateChiTietBaiLamWithAnswers = (
  chiTietBaiLam: ChiTietBaiLam[],
  userAnswers: (number | null)[]
): ChiTietBaiLam[] => {
  return chiTietBaiLam.map((detail, index) => ({
    ...detail,
    dap_an_da_chon: userAnswers[index] ?? null,
  }))
}

/**
 * Answer labels for display
 */
export const ANSWER_LABELS = ["A", "B", "C", "D"] as const

/**
 * Format duration from start and end time
 */
export const formatDuration = (
  startTime: string | null | undefined,
  endTime: string | null | undefined
): string => {
  if (!startTime || !endTime) return "Không rõ"

  try {
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    const diffSeconds = Math.round((end - start) / 1000)
    const minutes = Math.floor(diffSeconds / 60)
    const seconds = diffSeconds % 60
    return `${minutes} phút ${seconds} giây`
  } catch {
    return "Không rõ"
  }
}

/**
 * Calculate percentage
 */
export const calculatePercentage = (score: number, total: number): number => {
  if (total === 0) return 0
  return (score / total) * 100
}

