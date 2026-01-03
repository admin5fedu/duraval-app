/**
 * kyThiService
 * 
 * Service layer for KyThi (Kỳ thi) module API calls
 * Handles all CRUD operations for KyThi and BaiThiLam entities
 */

import { supabase } from '@lib/services/supabase';
import { type KyThi, type BaiThiLam } from '@src/types';

// --- Kỳ Thi (KyThi) ---

/**
 * Fetch all KyThi records
 */
export const fetchKyThi = async (): Promise<KyThi[]> => {
  const { data, error } = await supabase
    .from('dao_tao_ky_thi')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

/**
 * Fetch a single KyThi by ID
 */
export const fetchKyThiById = async (id: number): Promise<KyThi | null> => {
  const { data, error } = await supabase
    .from('dao_tao_ky_thi')
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
 * Create a new KyThi
 */
export const createKyThi = async (item: Partial<KyThi>): Promise<KyThi> => {
  const { data, error } = await supabase
    .from('dao_tao_ky_thi')
    .insert([item])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Update an existing KyThi
 */
export const updateKyThi = async (item: Partial<KyThi>): Promise<KyThi> => {
  const { id, ...updates } = item;
  
  if (!id) {
    throw new Error('ID is required for update');
  }
  
  const { data, error } = await supabase
    .from('dao_tao_ky_thi')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Delete one or more KyThi records
 */
export const deleteKyThi = async (ids: number[]): Promise<void> => {
  const { error } = await supabase
    .from('dao_tao_ky_thi')
    .delete()
    .in('id', ids);
  
  if (error) throw error;
};

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
export const kyThiService = {
  fetchKyThi,
  fetchKyThiById,
  createKyThi,
  updateKyThi,
  deleteKyThi,
  fetchBaiThiLam,
  fetchBaiThiLamByKyThiId,
  fetchBaiThiLamByNhanVienId,
  fetchBaiThiLamById,
  createBaiThiLam,
  updateBaiThiLam,
  deleteBaiThiLam,
};

