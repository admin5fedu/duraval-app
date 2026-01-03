/**
 * Đào Tạo Service
 * Handles all CRUD operations for training-related entities:
 * - Nhóm Chuyên Đề (dao_tao_nhom_chuyen_de)
 * - Chuyên Đề (dao_tao_chuyen_de)
 * - Câu Hỏi (dao_tao_cau_hoi)
 * - Kỳ Thi (dao_tao_ky_thi)
 * - Bài Thi (dao_tao_bai_thi)
 */

import { supabase } from '@lib/services/supabase';
import { ChuyenDeNhom, ChuyenDe, CauHoi, KyThi, BaiThiLam } from '@src/types';

// --- Nhóm Chuyên Đề ---

/**
 * Fetch all nhóm chuyên đề from database
 */
export const fetchChuyenDeNhom = async (): Promise<ChuyenDeNhom[]> => {
    try {
        const { data, error } = await supabase
            .from('dao_tao_nhom_chuyen_de')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error: any) {
        throw new Error(error.message || 'Không thể tải danh sách nhóm chuyên đề');
    }
};

/**
 * Create a new nhóm chuyên đề
 */
export const createChuyenDeNhom = async (item: Partial<ChuyenDeNhom>): Promise<ChuyenDeNhom> => {
    try {
        const { data, error } = await supabase
            .from('dao_tao_nhom_chuyen_de')
            .insert([item])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        throw new Error(error.message || 'Không thể thêm nhóm chuyên đề');
    }
};

/**
 * Update an existing nhóm chuyên đề
 */
export const patchChuyenDeNhom = async (item: Partial<ChuyenDeNhom>): Promise<ChuyenDeNhom> => {
    try {
        if (!item.id) {
            throw new Error('ID nhóm chuyên đề là bắt buộc');
        }

        const { id, ...updates } = item;
        const { data, error } = await supabase
            .from('dao_tao_nhom_chuyen_de')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        throw new Error(error.message || 'Không thể cập nhật nhóm chuyên đề');
    }
};

/**
 * Delete nhóm chuyên đề by IDs
 */
export const removeChuyenDeNhom = async (ids: number[]): Promise<void> => {
    try {
        if (!ids || ids.length === 0) {
            throw new Error('Danh sách ID nhóm chuyên đề không hợp lệ');
        }

        const { error } = await supabase
            .from('dao_tao_nhom_chuyen_de')
            .delete()
            .in('id', ids);

        if (error) throw error;
    } catch (error: any) {
        throw new Error(error.message || 'Không thể xóa nhóm chuyên đề');
    }
};

// --- Chuyên Đề ---

/**
 * Fetch all chuyên đề from database
 */
export const fetchChuyenDe = async (): Promise<ChuyenDe[]> => {
    try {
        const { data, error } = await supabase
            .from('dao_tao_chuyen_de')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error: any) {
        throw new Error(error.message || 'Không thể tải danh sách chuyên đề');
    }
};

/**
 * Create a new chuyên đề
 */
export const createChuyenDe = async (item: Partial<ChuyenDe>): Promise<ChuyenDe> => {
    try {
        const { data, error } = await supabase
            .from('dao_tao_chuyen_de')
            .insert([item])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        throw new Error(error.message || 'Không thể thêm chuyên đề');
    }
};

/**
 * Update an existing chuyên đề
 */
export const patchChuyenDe = async (item: Partial<ChuyenDe>): Promise<ChuyenDe> => {
    try {
        if (!item.id) {
            throw new Error('ID chuyên đề là bắt buộc');
        }

        const { id, ...updates } = item;
        const { data, error } = await supabase
            .from('dao_tao_chuyen_de')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        throw new Error(error.message || 'Không thể cập nhật chuyên đề');
    }
};

/**
 * Delete chuyên đề by IDs
 */
export const removeChuyenDe = async (ids: number[]): Promise<void> => {
    try {
        if (!ids || ids.length === 0) {
            throw new Error('Danh sách ID chuyên đề không hợp lệ');
        }

        const { error } = await supabase
            .from('dao_tao_chuyen_de')
            .delete()
            .in('id', ids);

        if (error) throw error;
    } catch (error: any) {
        throw new Error(error.message || 'Không thể xóa chuyên đề');
    }
};

// --- Câu Hỏi ---

/**
 * Fetch all câu hỏi from database
 */
export const fetchCauHoi = async (): Promise<CauHoi[]> => {
    try {
        const { data, error } = await supabase
            .from('dao_tao_cau_hoi')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error: any) {
        throw new Error(error.message || 'Không thể tải danh sách câu hỏi');
    }
};

/**
 * Create a new câu hỏi
 */
export const createCauHoi = async (item: Partial<CauHoi>): Promise<CauHoi> => {
    try {
        const { data, error } = await supabase
            .from('dao_tao_cau_hoi')
            .insert([item])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        throw new Error(error.message || 'Không thể thêm câu hỏi');
    }
};

/**
 * Update an existing câu hỏi
 */
export const patchCauHoi = async (item: Partial<CauHoi>): Promise<CauHoi> => {
    try {
        if (!item.id) {
            throw new Error('ID câu hỏi là bắt buộc');
        }

        const { id, ...updates } = item;
        const { data, error } = await supabase
            .from('dao_tao_cau_hoi')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        throw new Error(error.message || 'Không thể cập nhật câu hỏi');
    }
};

/**
 * Delete câu hỏi by IDs
 */
export const removeCauHoi = async (ids: number[]): Promise<void> => {
    try {
        if (!ids || ids.length === 0) {
            throw new Error('Danh sách ID câu hỏi không hợp lệ');
        }

        const { error } = await supabase
            .from('dao_tao_cau_hoi')
            .delete()
            .in('id', ids);

        if (error) throw error;
    } catch (error: any) {
        throw new Error(error.message || 'Không thể xóa câu hỏi');
    }
};

// --- Kỳ Thi ---

/**
 * Fetch all kỳ thi from database
 */
export const fetchKyThi = async (): Promise<KyThi[]> => {
    try {
        const { data, error } = await supabase
            .from('dao_tao_ky_thi')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error: any) {
        throw new Error(error.message || 'Không thể tải danh sách kỳ thi');
    }
};

/**
 * Create a new kỳ thi
 */
export const createKyThi = async (item: Partial<KyThi>): Promise<KyThi> => {
    try {
        const { data, error } = await supabase
            .from('dao_tao_ky_thi')
            .insert([item])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        throw new Error(error.message || 'Không thể thêm kỳ thi');
    }
};

/**
 * Update an existing kỳ thi
 */
export const patchKyThi = async (item: Partial<KyThi>): Promise<KyThi> => {
    try {
        if (!item.id) {
            throw new Error('ID kỳ thi là bắt buộc');
        }

        const { id, ...updates } = item;
        const { data, error } = await supabase
            .from('dao_tao_ky_thi')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        throw new Error(error.message || 'Không thể cập nhật kỳ thi');
    }
};

/**
 * Delete kỳ thi by IDs
 */
export const removeKyThi = async (ids: number[]): Promise<void> => {
    try {
        if (!ids || ids.length === 0) {
            throw new Error('Danh sách ID kỳ thi không hợp lệ');
        }

        const { error } = await supabase
            .from('dao_tao_ky_thi')
            .delete()
            .in('id', ids);

        if (error) throw error;
    } catch (error: any) {
        throw new Error(error.message || 'Không thể xóa kỳ thi');
    }
};

// --- Bài Thi ---

/**
 * Fetch all bài thi from database
 */
export const fetchBaiThi = async (): Promise<BaiThiLam[]> => {
    try {
        const { data, error } = await supabase
            .from('dao_tao_bai_thi')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error: any) {
        throw new Error(error.message || 'Không thể tải danh sách bài thi');
    }
};

/**
 * Create a new bài thi
 */
export const createBaiThi = async (item: Partial<BaiThiLam>): Promise<BaiThiLam> => {
    try {
        const { data, error } = await supabase
            .from('dao_tao_bai_thi')
            .insert([item])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        throw new Error(error.message || 'Không thể thêm bài thi');
    }
};

/**
 * Update an existing bài thi
 */
export const patchBaiThi = async (item: Partial<BaiThiLam>): Promise<BaiThiLam> => {
    try {
        if (!item.id) {
            throw new Error('ID bài thi là bắt buộc');
        }

        const { id, ...updates } = item;
        const { data, error } = await supabase
            .from('dao_tao_bai_thi')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error: any) {
        throw new Error(error.message || 'Không thể cập nhật bài thi');
    }
};

/**
 * Delete bài thi by IDs
 */
export const removeBaiThi = async (ids: number[]): Promise<void> => {
    try {
        if (!ids || ids.length === 0) {
            throw new Error('Danh sách ID bài thi không hợp lệ');
        }

        const { error } = await supabase
            .from('dao_tao_bai_thi')
            .delete()
            .in('id', ids);

        if (error) throw error;
    } catch (error: any) {
        throw new Error(error.message || 'Không thể xóa bài thi');
    }
};
