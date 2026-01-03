/**
 * chuyenDeService
 * 
 * Service layer for ChuyenDe (Chuyên đề) sub-module API calls
 * Handles all CRUD operations for ChuyenDe entities
 */

import { supabase } from '@lib/services/supabase';
import { type ChuyenDe } from '@src/types';

/**
 * Fetch all ChuyenDe records
 */
export const fetchChuyenDe = async (): Promise<ChuyenDe[]> => {
  const { data, error } = await supabase
    .from('dao_tao_chuyen_de')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

/**
 * Fetch a single ChuyenDe by ID
 */
export const fetchChuyenDeById = async (id: number): Promise<ChuyenDe | null> => {
  const { data, error } = await supabase
    .from('dao_tao_chuyen_de')
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
 * Create a new ChuyenDe
 */
export const createChuyenDe = async (item: Partial<ChuyenDe>): Promise<ChuyenDe> => {
  const { data, error } = await supabase
    .from('dao_tao_chuyen_de')
    .insert([item])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Update an existing ChuyenDe
 */
export const updateChuyenDe = async (item: Partial<ChuyenDe>): Promise<ChuyenDe> => {
  const { id, ...updates } = item;
  
  if (!id) {
    throw new Error('ID is required for update');
  }
  
  const { data, error } = await supabase
    .from('dao_tao_chuyen_de')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Delete one or more ChuyenDe records
 */
export const deleteChuyenDe = async (ids: number[]): Promise<void> => {
  const { error } = await supabase
    .from('dao_tao_chuyen_de')
    .delete()
    .in('id', ids);
  
  if (error) throw error;
};

// Export service object for convenience
export const chuyenDeService = {
  fetchChuyenDe,
  fetchChuyenDeById,
  createChuyenDe,
  updateChuyenDe,
  deleteChuyenDe,
};

