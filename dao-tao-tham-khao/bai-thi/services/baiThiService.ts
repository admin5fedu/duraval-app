/**
 * baiThiService
 * 
 * Service layer for BaiThi (Bài thi) module API calls
 * Handles all CRUD operations for BaiThiLam entities
 */

import { supabase } from '@lib/services/supabase';
import { type BaiThiLam, type DanhGia } from '@src/types';

// Re-export types for backward compatibility
export type { BaiThiLam, DanhGia } from '@src/types';

// --- Bài Thi (BaiThiLam) ---

/**
 * Fetch all BaiThiLam records
 */
export const fetchBaiThiLam = async (): Promise<BaiThiLam[]> => {
  const { data, error } = await supabase
    .from('dao_tao_bai_thi')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

/**
 * Fetch BaiThiLam records by KyThi ID
 */
export const fetchBaiThiLamByKyThiId = async (kyThiId: number): Promise<BaiThiLam[]> => {
  const { data, error } = await supabase
    .from('dao_tao_bai_thi')
    .select('*')
    .eq('ky_thi_id', kyThiId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

/**
 * Fetch BaiThiLam records by NhanVien ID
 */
export const fetchBaiThiLamByNhanVienId = async (nhanVienId: number): Promise<BaiThiLam[]> => {
  const { data, error } = await supabase
    .from('dao_tao_bai_thi')
    .select('*')
    .eq('nhan_vien_id', nhanVienId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

/**
 * Fetch a single BaiThiLam by ID
 */
export const fetchBaiThiLamById = async (id: number): Promise<BaiThiLam | null> => {
  const { data, error } = await supabase
    .from('dao_tao_bai_thi')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

/**
 * Create a new BaiThiLam
 */
export const createBaiThiLam = async (item: Partial<BaiThiLam>): Promise<BaiThiLam> => {
  const { data, error } = await supabase
    .from('dao_tao_bai_thi')
    .insert([item])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Update an existing BaiThiLam
 */
export const updateBaiThiLam = async (item: Partial<BaiThiLam>): Promise<BaiThiLam> => {
  const { id, ...updates } = item;
  
  if (!id) {
    throw new Error('ID is required for update');
  }
  
  const { data, error } = await supabase
    .from('dao_tao_bai_thi')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Delete one or more BaiThiLam records
 */
export const deleteBaiThiLam = async (ids: number[]): Promise<void> => {
  const { error } = await supabase
    .from('dao_tao_bai_thi')
    .delete()
    .in('id', ids);
  
  if (error) throw error;
};

// Export service object for convenience
export const baiThiService = {
  fetchBaiThiLam,
  fetchBaiThiLamByKyThiId,
  fetchBaiThiLamByNhanVienId,
  fetchBaiThiLamById,
  createBaiThiLam,
  updateBaiThiLam,
  deleteBaiThiLam,
};

