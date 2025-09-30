import { ref } from 'vue';
import { defineStore } from 'pinia';
import { supabase } from '../lib/supabaseClient';
import { SHOP_TABLE } from '../lib/dbTable';
export const useShopStore = defineStore('shop', () => {
    // State: stores the list of shops
    const shops = ref([]);
  
    // Actions: functions to interact with the database
    const fetchAll = async () => {
      try {
        const { data, error } = await supabase.from(SHOP_TABLE).select('*');
        if (error) throw error;
        shops.value = data;
      } catch (error) {
        console.error('Error fetching shops:', error.message);
      }
    };
  
    const fetchBySlug = async (slug) => {
      try {
        const { data, error } = await supabase.from(SHOP_TABLE).select('*').eq('slug', slug).single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.error(`Error fetching shop with slug ${slug}:`, error.message);
        return null;
      }
    };
  
    const fetchById = async (id) => {
      try {
        const { data, error } = await supabase.from(SHOP_TABLE).select('*').eq('id', id).single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.error(`Error fetching shop with id ${id}:`, error.message);
        return null;
      }
    };
  
    const create = async (newShop) => {
      try {
        const { data, error } = await supabase.from(SHOP_TABLE).insert(newShop).select().single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating shop:', error.message);
      }
    };
  
    const update = async (id, updatedShop) => {
      try {
        const { data, error } = await supabase.from(SHOP_TABLE).update(updatedShop).eq('id', id).select().single();
        if (error) throw error;
        return data;
      } catch (error) {
        console.error(`Error updating shop with id ${id}:`, error.message);
      }
    };
  
    const remove = async (id) => {
      try {
        const { error } = await supabase.from(SHOP_TABLE).delete().eq('id', id);
        if (error) throw error;
        console.log(`Shop with id ${id} deleted successfully.`);
        return true;
      } catch (error) {
        console.error(`Error deleting shop with id ${id}:`, error.message);
        return false;
      }
    };
  
    return {
      shops,
      fetchAll,
      fetchBySlug,
      fetchById,
      create,
      update,
      remove
    };
  });