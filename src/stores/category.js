import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'
import { CATEGORY_TABLE } from '../lib/dbTable'
export const useCategoryStore = defineStore('category', () => {
  // State: stores the list of shops
  const categories = ref([])

  // Actions: functions to interact with the database
  const fetchAll = async () => {
    try {
      const { data, error } = await supabase.from(CATEGORY_TABLE).select('*')
      if (error) throw error
      categories.value = data
    } catch (error) {
      console.error('Error fetching categories:', error.message)
    }
  }

  const fetchBySlug = async (slug) => {
    try {
      const { data, error } = await supabase
        .from(CATEGORY_TABLE)
        .select('*')
        .eq('slug', slug)
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error fetching category with slug ${slug}:`, error.message)
      return null
    }
  }

  const fetchById = async (id) => {
    try {
      const { data, error } = await supabase.from(CATEGORY_TABLE).select('*').eq('id', id).single()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error fetching category with id ${id}:`, error.message)
      return null
    }
  }

  const create = async (newCategory) => {
    try {
      const { data, error } = await supabase
        .from(CATEGORY_TABLE)
        .insert(newCategory)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating shop:', error.message)
    }
  }

  const update = async (id, updatedCategory) => {
    try {
      const { data, error } = await supabase
        .from(CATEGORY_TABLE)
        .update(updatedCategory)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error updating category with id ${id}:`, error.message)
    }
  }

  const remove = async (id) => {
    try {
      const { error } = await supabase.from(CATEGORY_TABLE).delete().eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error(`Error deleting category with id ${id}:`, error.message)
      throw error
    }
  }

  return {
    categories,
    fetchAll,
    fetchBySlug,
    fetchById,
    create,
    update,
    remove,
  }
})
