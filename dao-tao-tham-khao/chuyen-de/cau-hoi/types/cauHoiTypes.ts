/**
 * CauHoi Module Types
 * 
 * Centralized type definitions for CauHoi (Câu hỏi) sub-module
 */

import {
    type CauHoi,
    type ChuyenDe
} from '@src/types';

// ========== View Types ==========

export type CauHoiView = 'list' | 'detail' | 'form';

// ========== State Interfaces ==========

export interface CauHoiState {
  view: CauHoiView;
  selectedId: number | null;
  itemToEdit: Partial<CauHoi> | null;
  // Form modal state (for InlineListTable - child table forms)
  isFormModalOpen: boolean;
  itemToEditInModal: Partial<CauHoi> | null;
  deleteModal: { items: CauHoi[]; isBulk: boolean } | null;
}

export interface EnhancedQuestion extends CauHoi {
  topicName: string;
}

// ========== Data Hook Types ==========

export interface CauHoiData {
  questionList: CauHoi[];
  topicList: ChuyenDe[];
  employeeMap: Map<number, string>;
  topicMap: Map<number, string>;
  enhancedQuestions: EnhancedQuestion[];
}

// ========== Router Types ==========

export interface CauHoiRouterProps {
  onBack?: () => void;
  
  // Initial values for form (when opening from InlineListTable)
  initialTopicId?: number | null;
  
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

