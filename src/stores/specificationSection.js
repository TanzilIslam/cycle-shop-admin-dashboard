import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'
import { SPECIFICATION_SECTION_TABLE } from '../lib/dbTable'
export const useSpecificationSectionStore = defineStore('specificationSection', () => {
  // State: stores the list of brands
  const specificationSections = ref([])

  // Actions: functions to interact with the database
  const fetchAll = async () => {
    try {
      const { data, error } = await supabase.from(SPECIFICATION_SECTION_TABLE).select('*')
      if (error) throw error
      specificationSections.value = data
    } catch (error) {
      console.error('Error fetching specification sections:', error.message)
    }
  }

  const fetchBySlug = async (slug) => {
    try {
      const { data, error } = await supabase
        .from(SPECIFICATION_SECTION_TABLE)
        .select('*')
        .eq('slug', slug)
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error fetching specification section with slug ${slug}:`, error.message)
      return null
    }
  }

  const fetchById = async (id) => {
    try {
      const { data, error } = await supabase
        .from(SPECIFICATION_SECTION_TABLE)
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

  const create = async (newSpecificationSection) => {
    try {
      const { data, error } = await supabase
        .from(SPECIFICATION_SECTION_TABLE)
        .insert(newSpecificationSection)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating specification key:', error.message)
    }
  }

  const update = async (id, updatedSpecificationSection) => {
    try {
      const { data, error } = await supabase
        .from(SPECIFICATION_SECTION_TABLE)
        .update(updatedSpecificationSection)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error updating specification key with id ${id}:`, error.message)
    }
  }

  const remove = async (id) => {
    try {
      const { error } = await supabase.from(SPECIFICATION_SECTION_TABLE).delete().eq('id', id)
      if (error) throw error
      console.log(`Specification section with id ${id} deleted successfully.`)
      return true
    } catch (error) {
      console.error(`Error deleting specification section with id ${id}:`, error.message)
      return false
    }
  }

  return {
    specificationSections,
    fetchAll,
    fetchBySlug,
    fetchById,
    create,
    update,
    remove,
  }
})
