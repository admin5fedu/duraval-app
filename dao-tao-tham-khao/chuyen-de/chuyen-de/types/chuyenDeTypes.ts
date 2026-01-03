/**
 * ChuyenDe Module Types
 * 
 * Centralized type definitions for ChuyenDe (Chuyên đề) sub-module
 */

import {
    type CauHoi,
    type ChuyenDe,
    type ChuyenDeNhom
} from '@src/types';

// ========== View Types ==========

export type ChuyenDeView = 'list' | 'detail' | 'form';

// ========== State Interfaces ==========

export interface ChuyenDeState {
  view: ChuyenDeView;
  selectedId: number | null;
  itemToEdit: Partial<ChuyenDe> | null;
  // Form modal state (for InlineListTable - child table forms)
  isFormModalOpen: boolean;
  itemToEditInModal: Partial<ChuyenDe> | null;
  deleteModal: { items: ChuyenDe[]; isBulk: boolean } | null;
}

export interface EnhancedTopic extends ChuyenDe {
  groupName: string;
  questionCount: number;
}

// ========== Data Hook Types ==========

export interface ChuyenDeData {
  topicList: ChuyenDe[];
  groupList: ChuyenDeNhom[];
  questionList: CauHoi[];
  employeeMap: Map<number, string>;
  groupMap: Map<number, string>;
  questionCountByTopic: Map<number, number>;
  enhancedTopics: EnhancedTopic[];
}

// ========== Router Types ==========

export interface ChuyenDeRouterProps {
  onBack?: () => void;
  
  // Navigation callbacks
  onViewQuestionDetails?: (questionId: number) => void;
  onAddQuestion?: (topicId: number) => void;
  
  // Initial values for form (when opening from InlineListTable)
  initialGroupId?: number | null;
  
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

