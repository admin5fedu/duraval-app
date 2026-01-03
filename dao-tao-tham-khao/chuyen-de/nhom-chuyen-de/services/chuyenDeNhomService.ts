/**
 * chuyenDeNhomService
 * 
 * Service layer for ChuyenDeNhom (Nhóm chuyên đề) sub-module API calls
 * Handles all CRUD operations for ChuyenDeNhom entities
 */

import { supabase } from '@lib/services/supabase';
import { type ChuyenDeNhom } from '@src/types';

/**
 * Fetch all ChuyenDeNhom records
 */
export const fetchChuyenDeNhom = async (): Promise<ChuyenDeNhom[]> => {
  const { data, error } = await supabase
    .from('dao_tao_nhom_chuyen_de')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

/**
 * Fetch a single ChuyenDeNhom by ID
 */
export const fetchChuyenDeNhomById = async (id: number): Promise<ChuyenDeNhom | null> => {
  const { data, error } = await supabase
    .from('dao_tao_nhom_chuyen_de')
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
 * Create a new ChuyenDeNhom
 */
export const createChuyenDeNhom = async (item: Partial<ChuyenDeNhom>): Promise<ChuyenDeNhom> => {
  const { data, error } = await supabase
    .from('dao_tao_nhom_chuyen_de')
    .insert([item])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Update an existing ChuyenDeNhom
 */
export const updateChuyenDeNhom = async (item: Partial<ChuyenDeNhom>): Promise<ChuyenDeNhom> => {
  const { id, ...updates } = item;
  
  if (!id) {
    throw new Error('ID is required for update');
  }
  
  const { data, error } = await supabase
    .from('dao_tao_nhom_chuyen_de')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Delete one or more ChuyenDeNhom records
 */
export const deleteChuyenDeNhom = async (ids: number[]): Promise<void> => {
  const { error } = await supabase
    .from('dao_tao_nhom_chuyen_de')
    .delete()
    .in('id', ids);
  
  if (error) throw error;
};

// Export service object for convenience
export const chuyenDeNhomService = {
  fetchChuyenDeNhom,
  fetchChuyenDeNhomById,
  createChuyenDeNhom,
  updateChuyenDeNhom,
  deleteChuyenDeNhom,
};

