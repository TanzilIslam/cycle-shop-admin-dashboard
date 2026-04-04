import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'
import { SHOP_TABLE } from '../lib/dbTable'

export const useShopStore = defineStore('shop', () => {
  const shop = ref(null)

  const fetchMyShop = async () => {
    try {
      const { data, error } = await supabase
        .from(SHOP_TABLE)
        .select('*')
        .single()
      if (error && error.code !== 'PGRST116') throw error
      shop.value = data
    } catch (error) {
      console.error('Error fetching shop:', error.message)
    }
  }

  const saveMyShop = async (shopData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from(SHOP_TABLE)
        .upsert({ id: user.id, ...shopData })
        .select()
        .single()
      if (error) throw error
      shop.value = data
      return data
    } catch (error) {
      console.error('Error saving shop:', error.message)
      throw error
    }
  }

  return {
    shop,
    fetchMyShop,
    saveMyShop,
  }
})
