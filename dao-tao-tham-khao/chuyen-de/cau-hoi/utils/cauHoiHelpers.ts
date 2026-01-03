/**
 * CauHoi Helpers
 * 
 * Constants and helper functions for CauHoi sub-module
 */

import { ColumnDefinition } from '@components/business/filters/ColumnPickerDropdown';
import { SortOption } from '@components/business/filters/SortDropdown';
import { type EnhancedQuestion } from '@src/types';

// ========== Column Definitions ==========

export type QuestionColumnKey = 'cau_hoi' | 'topicName' | 'dap_an_dung' | 'nguoi_tao_id' | 'created_at';
export type QuestionSortKey = 'cau_hoi' | 'topicName' | 'dap_an_dung' | 'nguoi_tao_id' | 'created_at';

export const QUESTION_COLUMN_DEFINITIONS: ColumnDefinition[] = [
  { key: 'cau_hoi', label: 'Câu hỏi' },
  { key: 'topicName', label: 'Chuyên đề' },
  { key: 'dap_an_dung', label: 'Đáp án đúng' },
  { key: 'nguoi_tao_id', label: 'Người tạo' },
  { key: 'created_at', label: 'Ngày tạo' },
];

export const QUESTION_SORT_OPTIONS: SortOption[] = [
  { key: 'cau_hoi', label: 'Câu hỏi' },
  { key: 'topicName', label: 'Chuyên đề' },
  { key: 'dap_an_dung', label: 'Đáp án đúng' },
  { key: 'nguoi_tao_id', label: 'Người tạo' },
  { key: 'created_at', label: 'Ngày tạo' },
];

export const QUESTION_COLUMN_WIDTHS: Record<string, number> = {
  cau_hoi: 400,
  topicName: 250,
  dap_an_dung: 150,
  nguoi_tao_id: 200,
  created_at: 150,
};

// ========== Helper Functions ==========

/**
 * Get searchable fields from a question item
 */
export function getQuestionSearchableFields(item: EnhancedQuestion): (string | number | null | undefined)[] {
  return [item.cau_hoi, item.topicName];
}

/**
 * Custom sort value extractor for questions
 */
export function getQuestionSortValue(item: EnhancedQuestion, sortKey: string): any {
  switch (sortKey) {
    case 'cau_hoi':
      return item.cau_hoi;
    case 'topicName':
      return item.topicName;
    case 'dap_an_dung':
      return item.dap_an_dung;
    case 'nguoi_tao_id':
      return item.nguoi_tao_id;
    case 'created_at':
      return item.created_at;
    default:
      return (item as any)[sortKey];
  }
}

