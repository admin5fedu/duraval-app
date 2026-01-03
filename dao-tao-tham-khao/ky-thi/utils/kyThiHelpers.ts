/**
 * KyThi Helper Functions
 * 
 * Utility functions for KyThi module
 */

import { BaiThiLam, CauHoi, KyThi, ShuffledAnswer, ShuffledQuestion } from '@src/types';

export const shuffleArray = <T,>(array: T[]): T[] => {
  return array.map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

export const createShuffledQuestions = (kyThi: KyThi, allQuestions: CauHoi[]): ShuffledQuestion[] => {
  const relevantQuestions = allQuestions.filter(q => kyThi.chuyen_de_ids.includes(q.chuyen_de_id));
  const selectedQuestions = shuffleArray(relevantQuestions).slice(0, kyThi.so_cau_hoi);

  const preparedQuestions: ShuffledQuestion[] = selectedQuestions.map(q => {
    const answers: ShuffledAnswer[] = shuffleArray([
      { text: q.dap_an_1, originalIndex: 1 },
      { text: q.dap_an_2, originalIndex: 2 },
      { text: q.dap_an_3, originalIndex: 3 },
      { text: q.dap_an_4, originalIndex: 4 },
    ]);
    return { ...q, shuffledAnswers: answers };
  });

  return preparedQuestions;
};

export const restoreShuffledQuestions = (baiThi: BaiThiLam, allQuestions: CauHoi[]): ShuffledQuestion[] => {
  const allQuestionsMap = new Map<number, CauHoi>(allQuestions.map(q => [q.id, q]));

  return baiThi.chi_tiet_bai_lam.map(detail => {
    const question = allQuestionsMap.get(detail.cau_hoi_id);
    if (!question) return null;

    const originalAnswers = [
      { text: question.dap_an_1, originalIndex: 1 as const },
      { text: question.dap_an_2, originalIndex: 2 as const },
      { text: question.dap_an_3, originalIndex: 3 as const },
      { text: question.dap_an_4, originalIndex: 4 as const },
    ];

    const shuffledAnswers: ShuffledAnswer[] = detail.thu_tu_dap_an.map(originalIndex => {
      return originalAnswers.find(a => a.originalIndex === originalIndex)!;
    });

    return { ...question, shuffledAnswers };
  }).filter((q): q is ShuffledQuestion => q !== null);
};

export const ANSWER_LABELS = ['A', 'B', 'C', 'D'] as const;

export const getKyThiTabLabel = (tab: 'all' | 'my') => {
  switch (tab) {
    case 'my':
      return 'Của tôi';
    case 'all':
    default:
      return 'Tất cả';
  }
};
