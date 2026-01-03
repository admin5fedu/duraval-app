/**
 * ChuyenDe Module
 * 
 * Public API exports for ChuyenDe (Chuyên đề) domain module.
 * 
 * This module has been refactored into 3 sub-domains:
 * - nhom-chuyen-de (Nhóm chuyên đề)
 * - chuyen-de (Chuyên đề)
 * - cau-hoi (Câu hỏi)
 * 
 * The main entry point is ChuyenDeMainRouter which orchestrates all 3 sub-domains.
 * 
 * Pattern: Domain-Driven Design (DDD) - each sub-domain is a bounded context
 */

// Main Router (orchestrates 3 sub-domains)
export { default as ChuyenDeMainRouter } from './components/ChuyenDeMainRouter';

// Sub-domains
export * from './nhom-chuyen-de';
export * from './chuyen-de';
export * from './cau-hoi';

// Shared utils
export * from './utils';
