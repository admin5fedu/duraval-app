/**
 * ChuyenDeNhom Helpers
 * 
 * Constants and helper functions for ChuyenDeNhom sub-module
 */

import { ColumnDefinition } from '@components/business/filters/ColumnPickerDropdown';
import { SortOption } from '@components/business/filters/SortDropdown';
import { type ChuyenDeNhom } from '@src/types';
import { type GroupStats } from '@src/types';

// ========== Column Definitions ==========

export type GroupColumnKey = 'ten_nhom' | 'topic_count' | 'question_count' | 'created_at' | 'nguoi_tao_id';
export type GroupSortKey = 'ten_nhom' | 'topic_count' | 'question_count' | 'created_at' | 'nguoi_tao_id';

export const GROUP_COLUMN_DEFINITIONS: ColumnDefinition[] = [
  { key: 'ten_nhom', label: 'Tên Nhóm' },
  { key: 'topic_count', label: 'Số chuyên đề' },
  { key: 'question_count', label: 'Số câu hỏi' },
  { key: 'nguoi_tao_id', label: 'Người tạo' },
  { key: 'created_at', label: 'Ngày tạo' },
];

export const GROUP_SORT_OPTIONS: SortOption[] = [
  { key: 'ten_nhom', label: 'Tên Nhóm' },
  { key: 'topic_count', label: 'Số chuyên đề' },
  { key: 'question_count', label: 'Số câu hỏi' },
  { key: 'nguoi_tao_id', label: 'Người tạo' },
  { key: 'created_at', label: 'Ngày tạo' },
];

export const GROUP_COLUMN_WIDTHS: Record<string, number> = {
  ten_nhom: 250,
  topic_count: 150,
  question_count: 150,
  nguoi_tao_id: 200,
  created_at: 150,
};

// ========== Helper Functions ==========

/**
 * Get searchable fields from a group item
 */
export function getGroupSearchableFields(item: ChuyenDeNhom): (string | number | null | undefined)[] {
  return [item.ten_nhom];
}

/**
 * Custom sort value extractor for groups
 */
export function getGroupSortValue(
  item: ChuyenDeNhom, 
  sortKey: string, 
  stats?: Record<number, GroupStats>
): any {
  switch (sortKey) {
    case 'ten_nhom':
      return item.ten_nhom;
    case 'topic_count':
      return stats?.[item.id]?.topicCount ?? 0;
    case 'question_count':
      return stats?.[item.id]?.questionCount ?? 0;
    case 'nguoi_tao_id':
      return item.nguoi_tao_id;
    case 'created_at':
      return item.created_at;
    default:
      return (item as any)[sortKey];
  }
}

