/**
 * BaiThi Module
 * 
 * Public API exports for BaiThi (Bài thi) domain module.
 */

// Components
export { default as BaiThiDetailView } from './components/BaiThiDetailView';
export { default as BaiThiFormView } from './components/BaiThiFormView';
export { default as BaiThiListView } from './components/BaiThiListView';
export { default as BaiThiRouter } from './components/BaiThiRouter';

// Contexts
export * from './contexts';

// Types
export type {
    BaiThiData,
    BaiThiHandlers, BaiThiInlineViewProps, BaiThiRouterProps, BaiThiState, BaiThiTab, BaiThiView, ChiTietBaiLam,
    DanhGia, DeleteModalState, UseBaiThiDataOptions
} from './types';

// Re-export BaiThiLam from main types (for backward compatibility)
export type { BaiThiLam } from '@src/types';

// Hooks
export { useBaiThiData } from './hooks/useBaiThiData';
export { useBaiThiHandlers } from './hooks/useBaiThiHandlers';
export { useBaiThiState } from './hooks/useBaiThiState';

// Schemas
export * from './schemas';

// Services
export * as baiThiService from './services/baiThiService';

// Utils
export * from './utils/baiThiHelpers';

