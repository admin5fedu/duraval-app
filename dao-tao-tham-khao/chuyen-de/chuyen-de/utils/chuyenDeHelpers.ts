/**
 * ChuyenDe Helpers
 * 
 * Constants and helper functions for ChuyenDe sub-module
 */

import { ColumnDefinition } from '@components/business/filters/ColumnPickerDropdown';
import { SortOption } from '@components/business/filters/SortDropdown';
import { type EnhancedTopic } from '@src/types';

// ========== Column Definitions ==========

export type TopicColumnKey = 'ten_chuyen_de' | 'groupName' | 'questionCount' | 'nguoi_tao_id' | 'created_at';
export type TopicSortKey = 'ten_chuyen_de' | 'groupName' | 'questionCount' | 'nguoi_tao_id' | 'created_at';

export const TOPIC_COLUMN_DEFINITIONS: ColumnDefinition[] = [
  { key: 'ten_chuyen_de', label: 'Tên chuyên đề' },
  { key: 'groupName', label: 'Nhóm' },
  { key: 'questionCount', label: 'Số câu hỏi' },
  { key: 'nguoi_tao_id', label: 'Người tạo' },
  { key: 'created_at', label: 'Ngày tạo' },
];

export const TOPIC_SORT_OPTIONS: SortOption[] = [
  { key: 'ten_chuyen_de', label: 'Tên chuyên đề' },
  { key: 'groupName', label: 'Nhóm' },
  { key: 'questionCount', label: 'Số câu hỏi' },
  { key: 'nguoi_tao_id', label: 'Người tạo' },
  { key: 'created_at', label: 'Ngày tạo' },
];

export const TOPIC_COLUMN_WIDTHS: Record<string, number> = {
  ten_chuyen_de: 300,
  groupName: 200,
  questionCount: 150,
  nguoi_tao_id: 200,
  created_at: 150,
};

// ========== Helper Functions ==========

/**
 * Get searchable fields from a topic item
 */
export function getTopicSearchableFields(item: EnhancedTopic): (string | number | null | undefined)[] {
  return [item.ten_chuyen_de, item.groupName];
}

/**
 * Custom sort value extractor for topics
 */
export function getTopicSortValue(item: EnhancedTopic, sortKey: string): any {
  switch (sortKey) {
    case 'ten_chuyen_de':
      return item.ten_chuyen_de;
    case 'groupName':
      return item.groupName;
    case 'questionCount':
      return item.questionCount;
    case 'nguoi_tao_id':
      return item.nguoi_tao_id;
    case 'created_at':
      return item.created_at;
    default:
      return (item as any)[sortKey];
  }
}

