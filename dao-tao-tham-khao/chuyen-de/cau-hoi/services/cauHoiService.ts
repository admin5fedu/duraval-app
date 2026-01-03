/**
 * cauHoiService
 * 
 * Service layer for CauHoi (Câu hỏi) sub-module API calls
 * Handles all CRUD operations for CauHoi entities
 */

import { supabase } from '@lib/services/supabase';
import { type CauHoi } from '@src/types';

/**
 * Fetch all CauHoi records
 */
export const fetchCauHoi = async (): Promise<CauHoi[]> => {
  const { data, error } = await supabase
    .from('dao_tao_cau_hoi')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

/**
 * Fetch a single CauHoi by ID
 */
export const fetchCauHoiById = async (id: number): Promise<CauHoi | null> => {
  const { data, error } = await supabase
    .from('dao_tao_cau_hoi')
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
 * Create a new CauHoi
 */
export const createCauHoi = async (item: Partial<CauHoi>): Promise<CauHoi> => {
  const { data, error } = await supabase
    .from('dao_tao_cau_hoi')
    .insert([item])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Update an existing CauHoi
 */
export const updateCauHoi = async (item: Partial<CauHoi>): Promise<CauHoi> => {
  const { id, ...updates } = item;
  
  if (!id) {
    throw new Error('ID is required for update');
  }
  
  const { data, error } = await supabase
    .from('dao_tao_cau_hoi')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Delete one or more CauHoi records
 */
export const deleteCauHoi = async (ids: number[]): Promise<void> => {
  const { error } = await supabase
    .from('dao_tao_cau_hoi')
    .delete()
    .in('id', ids);
  
  if (error) throw error;
};

// Export service object for convenience
export const cauHoiService = {
  fetchCauHoi,
  fetchCauHoiById,
  createCauHoi,
  updateCauHoi,
  deleteCauHoi,
};

