/**
 * BaiThi Module Types
 * 
 * Centralized type definitions for BaiThi module
 */

import { 
  type BaiThiLam,
  type DanhGia,
  type KyThi,
  type CauHoi,
  type Employee,
  type Crumb
} from '@src/types';
import { type BaiThiFilters, type BaiThiLamEnhanced } from '@components/shared/hooks/useBaiThiTableFilter';

// Re-export types from main types file for convenience
export type { BaiThiLam, DanhGia } from '@src/types';

// ========== View Types ==========

/**
 * Available views in BaiThi module
 */
export type BaiThiView = 'list' | 'detail';

/**
 * Available tabs in BaiThi list view
 */
export type BaiThiTab = 'all' | 'my';

// ========== State Interfaces ==========

/**
 * Delete modal state
 */
export interface DeleteModalState {
  isOpen: boolean;
  items: BaiThiLam[];
  isBulk: boolean;
}

/**
 * Complete state interface for BaiThi module
 */
export interface BaiThiState {
  view: BaiThiView;
  isFormOpen: boolean;
  activeTab: BaiThiTab;
  selectedBaiThi: BaiThiLam | null;
  itemToEdit: Partial<BaiThiLam> | null;
  deleteModal: DeleteModalState | null;
  initialFilter: Partial<BaiThiFilters> | null;
  detailOrigin: string | null;
}

// ========== Data Hook Types ==========

/**
 * Options for useBaiThiData hook
 */
export interface UseBaiThiDataOptions {
  activeTab: 'all' | 'my';
  filters: Partial<BaiThiFilters>;
}

/**
 * Return type for useBaiThiData hook
 */
export interface BaiThiData {
  baiThiLamList: BaiThiLam[];
  enhancedItems: BaiThiLamEnhanced[];
  filteredItems: BaiThiLamEnhanced[];
  employeeMap: Map<number, string>;
  kyThiMap: Map<number, string>;
  myBaiThiList: BaiThiLam[];
  isLoading: boolean;
  kyThiList: KyThi[];
  questionList: CauHoi[];
}

// ========== Handlers Hook Types ==========

/**
 * Return type for useBaiThiHandlers hook
 */
export interface BaiThiHandlers {
  handleSave: (item: Partial<BaiThiLam>) => Promise<BaiThiLam | null>;
  handleDelete: (items: BaiThiLam[]) => Promise<boolean>;
  handleSaveDanhGia: (baiThiId: number, danhGia: DanhGia | null) => Promise<BaiThiLam | null>;
}

// ========== Router Types ==========

/**
 * Props for BaiThiRouter component
 */
export interface BaiThiRouterProps {
  onBack?: () => void;
  goBackToMenu?: () => void;
  goToHomeWithModule?: () => void;
  setCrumbs?: (crumbs: Crumb[]) => void;
  goToHome?: () => void;
  
  // Optional: initial filter when navigating from other modules (e.g., KyThiRouter)
  initialFilter?: Partial<BaiThiFilters> | null;
  onFilterApplied?: () => void; // Callback to clear initial filter after it's been applied
}

// ========== Component Types ==========

/**
 * Chi tiết bài làm (answer detail)
 */
export interface ChiTietBaiLam {
  cau_hoi_id: number;
  dap_an_da_chon: number | null;
  thu_tu_dap_an: (1 | 2 | 3 | 4)[];
}

/**
 * Props for BaiThiInlineView component (for displaying answer details)
 */
export interface BaiThiInlineViewProps {
  answers: ChiTietBaiLam[];
  questionMap: Map<number, CauHoi>;
  onView?: (answer: ChiTietBaiLam) => void;
}

