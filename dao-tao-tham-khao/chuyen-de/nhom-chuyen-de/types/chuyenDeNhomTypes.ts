/**
 * ChuyenDeNhom Module Types
 * 
 * Centralized type definitions for ChuyenDeNhom (Nhóm chuyên đề) sub-module
 */

import { type CauHoi, type ChuyenDe, type ChuyenDeNhom } from '@src/types';

// ========== View Types ==========

/**
 * Available views in ChuyenDeNhom module
 */
export type ChuyenDeNhomView = 'list' | 'detail' | 'form';

// ========== State Interfaces ==========

/**
 * Complete state interface for ChuyenDeNhom module
 */
export interface ChuyenDeNhomState {
  view: ChuyenDeNhomView;
  selectedId: number | null;
  itemToEdit: Partial<ChuyenDeNhom> | null;
  // Form modal state (for InlineListTable - child table forms)
  isFormModalOpen: boolean;
  itemToEditInModal: Partial<ChuyenDeNhom> | null;
  deleteModal: { items: ChuyenDeNhom[]; isBulk: boolean } | null;
}

/**
 * Statistics for a group
 */
export interface GroupStats {
  topicCount: number;
  questionCount: number;
}

// ========== Data Hook Types ==========

/**
 * Return type for useChuyenDeNhomData hook
 */
export interface ChuyenDeNhomData {
  groupList: ChuyenDeNhom[];
  topicList: ChuyenDe[];
  questionList: CauHoi[];
  employeeMap: Map<number, string>;
  groupStats: Record<number, GroupStats>;
}

// ========== Router Types ==========

/**
 * Props for ChuyenDeNhomRouter component
 */
export interface ChuyenDeNhomRouterProps {
  onBack?: () => void;
  
  // Navigation callbacks (for integration with parent router)
  onViewTopicDetails?: (topicId: number) => void;
  onAddTopic?: (groupId: number) => void;
  
  // Breadcrumb management callback
  onViewChange?: (view: {
    type: 'list' | 'detail' | 'form';
    section: string;
    selectedItems?: Array<{ id: number; name: string; type: string }>;
    formMode?: 'add' | 'edit';
  }) => void;
  
  // Navigation from breadcrumb (optional - for breadcrumb navigation)
  navigateToId?: number | null;
}

