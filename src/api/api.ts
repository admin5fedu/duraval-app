import { supabase } from '@/lib/supabase'

// Base API service class
export class ApiService {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  async getAll() {
    const { data, error } = await supabase.from(this.tableName).select('*')
    if (error) throw error
    return data
  }

  async getById(id: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  async create(payload: any) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async update(id: string, payload: any) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async delete(id: string) {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id)
    if (error) throw error
  }
}

