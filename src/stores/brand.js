import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'
import { BRAND_TABLE } from '@/lib/dbTable'
export const useBrandStore = defineStore('brand', () => {
  const brands = ref([])

  const fetchAll = async () => {
    try {
      const { data, error } = await supabase.from(BRAND_TABLE).select('*')
      if (error) throw error
      brands.value = data
    } catch (error) {
      console.error('Error fetching brands:', error.message)
    }
  }
  const fetchBySlug = async (slug) => {
    try {
      const { data, error } = await supabase.from(BRAND_TABLE).select('*').eq('slug', slug).single()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error fetching brand with slug ${slug}:`, error.message)
      return null
    }
  }
  const fetchById = async (id) => {
    try {
      const { data, error } = await supabase.from(BRAND_TABLE).select('*').eq('id', id).single()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error fetching brand with id ${id}:`, error.message)
      return null
    }
  }
  const create = async (newBrand) => {
    try {
      const { data, error } = await supabase.from(BRAND_TABLE).insert(newBrand).select().single()
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating shop:', error.message)
      throw error
    }
  }
  const update = async (id, updatedBrand) => {
    try {
      const { data, error } = await supabase
        .from(BRAND_TABLE)
        .update(updatedBrand)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error updating brand with id ${id}:`, error.message)
      throw error
    }
  }
  const remove = async (id) => {
    try {
      const { error } = await supabase.from(BRAND_TABLE).delete().eq('id', id)
      if (error) throw error
      console.log(`Brand with id ${id} deleted successfully.`)
      return true
    } catch (error) {
      console.error(`Error deleting brand with id ${id}:`, error.message)
      throw error
    }
  }

  return {
    brands,
    fetchAll,
    fetchBySlug,
    fetchById,
    create,
    update,
    remove,
  }
})
