import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'
import { SPECIFICATION_KEY_TABLE, SPECIFICATION_SECTION_TABLE } from '../lib/dbTable'
export const useSpecificationKeyStore = defineStore('specificationKey', () => {
  // State: stores the list of brands
  const specificationKeys = ref([])

  // Actions: functions to interact with the database
  const fetchAll = async () => {
    try {
      const { data, error } = await supabase.from(SPECIFICATION_KEY_TABLE).select(`
          *,
          ${SPECIFICATION_SECTION_TABLE}(*)
        `)
      if (error) throw error
      specificationKeys.value = data
    } catch (error) {
      console.error('Error fetching specification keys:', error.message)
    }
  }

  const fetchBySlug = async (slug) => {
    try {
      const { data, error } = await supabase
        .from(SPECIFICATION_KEY_TABLE)
        .select('*')
        .eq('slug', slug)
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error fetching specification key with slug ${slug}:`, error.message)
      return null
    }
  }

  const fetchById = async (id) => {
    try {
      const { data, error } = await supabase
        .from(SPECIFICATION_KEY_TABLE)
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error fetching specification key with id ${id}:`, error.message)
      return null
    }
  }

  const create = async (newSpecificationKey) => {
    try {
      const { data, error } = await supabase
        .from(SPECIFICATION_KEY_TABLE)
        .insert(newSpecificationKey)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating specification key:', error.message)
    }
  }

  const update = async (id, updatedSpecificationKey) => {
    try {
      const { data, error } = await supabase
        .from(SPECIFICATION_KEY_TABLE)
        .update(updatedSpecificationKey)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error updating specification key with id ${id}:`, error.message)
      throw error
    }
  }

  const remove = async (id) => {
    try {
      const { error } = await supabase.from(SPECIFICATION_KEY_TABLE).delete().eq('id', id)
      if (error) throw error
      console.log(`Specification key with id ${id} deleted successfully.`)
      return true
    } catch (error) {
      console.error(`Error deleting specification key with id ${id}:`, error.message)
      return false
    }
  }

  return {
    specificationKeys,
    fetchAll,
    fetchBySlug,
    fetchById,
    create,
    update,
    remove,
  }
})
