import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'
import { CYCLE_TABLE, BRAND_TABLE, CATEGORY_TABLE, CYCLE_SPECIFICATION_TABLE } from '../lib/dbTable'
export const useCycleStore = defineStore('cycle', () => {
  const cycles = ref([])
  const cycle = ref(null)
  const cycleSpecs = ref([])

  const fetchAll = async () => {
    try {
      const { data, error } = await supabase
        .from(CYCLE_TABLE)
        .select(`*,${BRAND_TABLE}(*) ,${CATEGORY_TABLE}(*)`)
      if (error) throw error
      cycles.value = data
    } catch (error) {
      console.error('Error fetching cycles:', error.message)
    }
  }

  const fetchBySlug = async (slug) => {
    try {
      const { data, error } = await supabase.from(CYCLE_TABLE).select('*').eq('slug', slug).single()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error fetching cycle with slug ${slug}:`, error.message)
      return null
    }
  }

  const fetchById = async (id) => {
    try {
      const { data, error } = await supabase.from(CYCLE_TABLE).select('*').eq('id', id).single()
      if (error) throw error
      cycle.value = data
    } catch (error) {
      console.error(`Error fetching cycle with id ${id}:`, error.message)
      return null
    }
  }

  const create = async (newCycle) => {
    try {
      const { data, error } = await supabase.from(CYCLE_TABLE).insert(newCycle).select().single()
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating cycle:', error.message)
    }
  }
  const update = async (id, updatedCycle) => {
    try {
      const { data, error } = await supabase
        .from(CYCLE_TABLE)
        .update(updatedCycle)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error updating cycle with id ${id}:`, error.message)
    }
  }
  const createCycleSpecs = async (newSpecs) => {
    try {
      const { data, error } = await supabase
        .from(CYCLE_SPECIFICATION_TABLE)
        .insert(newSpecs)
        .select()
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating cycle specs:', error.message)
      return null
    }
  }
  const removeCycleSpecs = async (cycleId) => {
    try {
      const { error } = await supabase
        .from(CYCLE_SPECIFICATION_TABLE)
        .delete()
        .eq('cycle_id', cycleId)
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing cycle specs:', error.message)
      return false
    }
  }
  const fetchCycleSpecs = async (cycleId) => {
    try {
      const { data, error } = await supabase
        .from(CYCLE_SPECIFICATION_TABLE)
        .select('spec_key_id, value')
        .eq('cycle_id', cycleId)
      if (error) throw error
      cycleSpecs.value = data
    } catch (error) {
      console.error(`Error fetching cycle specs with cycle id ${cycleId}:`, error.message)
      return null
    }
  }

  const remove = async (id) => {
    try {
      const { error } = await supabase.from(CYCLE_TABLE).delete().eq('id', id)
      if (error) throw error
      console.log(`Cycle with id ${id} deleted successfully.`)
      return true
    } catch (error) {
      console.error(`Error deleting cycle with id ${id}:`, error.message)
      return false
    }
  }

  return {
    cycle,
    cycles,
    cycleSpecs,
    fetchAll,
    fetchBySlug,
    fetchById,
    create,
    createCycleSpecs,
    removeCycleSpecs,
    update,
    remove,
    fetchCycleSpecs,
  }
})
