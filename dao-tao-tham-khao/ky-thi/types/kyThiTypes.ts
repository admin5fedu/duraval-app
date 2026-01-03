/**
 * KyThi Module Types
 * 
 * Centralized type definitions for KyThi module
 */

import { 
  type KyThi, 
  type BaiThiLam, 
  type ShuffledQuestion,
  type CauHoi,
  type Employee,
  type DonViToChuc,
  type ChucVu,
  type Crumb
} from '@src/types';
import { type BaiThiFilters } from '@components/shared/hooks/useBaiThiTableFilter';

// ========== View Types ==========

/**
 * Available views in KyThi module
 */
export type KyThiView = 'list' | 'detail' | 'form' | 'test' | 'result';

/**
 * Available tabs in KyThi list view
 */
export type KyThiTab = 'all' | 'my';

// ========== State Interfaces ==========

/**
 * Complete state interface for KyThi module
 */
export interface KyThiState {
  view: KyThiView;
  selectedKyThi: KyThi | null;
  itemToEdit: Partial<KyThi> | null;
  isFormModalOpen: boolean;
  itemToEditInModal: Partial<KyThi> | null;
  activeTab: KyThiTab;
  deleteModal: { items: KyThi[]; isBulk: boolean } | null;
  
  // Test states
  currentTest: BaiThiLam | null;
  shuffledQuestions: ShuffledQuestion[];
  currentQuestionIndex: number;
  userAnswers: (number | null)[];
  timeLeft: number;
  finalResult: BaiThiLam | null;
  isTimeWarning: boolean;
}

// ========== Data Hook Types ==========

/**
 * Options for useKyThiData hook
 */
export interface UseKyThiDataOptions {
  activeTab: 'all' | 'my';
}

/**
 * Return type for useKyThiData hook
 */
export interface KyThiData {
  kyThiList: KyThi[];
  baiThiLamList: BaiThiLam[];
  employeeMap: Map<number, string>;
  enhancedItems: (KyThi & { trang_thai_tham_gia: string })[];
  getMyStatus: (kyThi: KyThi) => string;
  filteredItems: (KyThi & { trang_thai_tham_gia: string })[];
  isLoading: boolean;
}

// ========== Handlers Hook Types ==========

/**
 * Options for useKyThiHandlers hook
 */
export interface UseKyThiHandlersOptions {
  // State setters
  setSelectedKyThi: (item: KyThi | null) => void;
  setShuffledQuestions: (questions: ShuffledQuestion[]) => void;
  setCurrentTest: (test: BaiThiLam | null) => void;
  setUserAnswers: (answers: (number | null)[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setTimeLeft: (time: number) => void;
  setIsTimeWarning: (warning: boolean) => void;
  setView: (view: KyThiView) => void;
  setFinalResult: (result: BaiThiLam | null) => void;
  
  // Callbacks
  onViewBaiThiDetails?: (baiThi: BaiThiLam) => void;
}

// ========== Router Types ==========

/**
 * Props for KyThiRouter component
 */
export interface KyThiRouterProps {
  onBack?: () => void;
  goBackToMenu?: () => void;
  goToHomeWithModule?: () => void;
  onViewMyTests?: (filter: Partial<BaiThiFilters>) => void;
  onViewBaiThiDetails?: (baiThi: BaiThiLam) => void;
  setCrumbs?: (crumbs: Crumb[]) => void;
  goToHome?: () => void;
  donViToChuc?: DonViToChuc[];
  chucVu?: ChucVu[];
}

// ========== Component Types ==========

/**
 * Props for BaiThiInlineView component (in KyThi module - displays test attempts)
 */
export interface BaiThiInlineViewProps {
  attempts: BaiThiLam[];
  employeeMap: Map<number, Employee>;
  onView?: (baiThi: BaiThiLam) => void;
}

