import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabaseClient'
import { PRODUCT_TABLE, CATEGORY_TABLE, PRODUCT_SPECIFICATION_TABLE } from '../lib/dbTable'
import { useFileManagerStore } from './fileManager'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const product = ref(null)
  const productSpecs = ref([])

  const fetchAll = async () => {
    try {
      const { data, error } = await supabase
        .from(PRODUCT_TABLE)
        .select(`*, ${CATEGORY_TABLE}(*)`)
      if (error) throw error
      products.value = data
    } catch (error) {
      console.error('Error fetching products:', error.message)
    }
  }

  const fetchBySlug = async (slug) => {
    try {
      const { data, error } = await supabase
        .from(PRODUCT_TABLE)
        .select('*')
        .eq('slug', slug)
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error fetching product with slug ${slug}:`, error.message)
      return null
    }
  }

  const fetchById = async (id) => {
    try {
      const { data, error } = await supabase
        .from(PRODUCT_TABLE)
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      product.value = data
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error.message)
      return null
    }
  }

  const create = async (newProduct) => {
    try {
      const { data, error } = await supabase
        .from(PRODUCT_TABLE)
        .insert(newProduct)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating product:', error.message)
    }
  }

  const update = async (id, updatedProduct) => {
    try {
      const { data, error } = await supabase
        .from(PRODUCT_TABLE)
        .update(updatedProduct)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error updating product with id ${id}:`, error.message)
    }
  }

  const createProductSpecs = async (newSpecs) => {
    try {
      const { data, error } = await supabase
        .from(PRODUCT_SPECIFICATION_TABLE)
        .insert(newSpecs)
        .select()
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating product specs:', error.message)
      return null
    }
  }

  const removeProductSpecs = async (productId) => {
    try {
      const { error } = await supabase
        .from(PRODUCT_SPECIFICATION_TABLE)
        .delete()
        .eq('product_id', productId)
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing product specs:', error.message)
      return false
    }
  }

  const fetchProductSpecs = async (productId) => {
    try {
      const { data, error } = await supabase
        .from(PRODUCT_SPECIFICATION_TABLE)
        .select('spec_key_id, value')
        .eq('product_id', productId)
      if (error) throw error
      productSpecs.value = data
    } catch (error) {
      console.error(`Error fetching product specs for product id ${productId}:`, error.message)
      return null
    }
  }

  const remove = async (id) => {
    try {
      // Fetch images + videos before deleting so we can clean up storage
      const { data: p } = await supabase
        .from(PRODUCT_TABLE)
        .select('images, videos')
        .eq('id', id)
        .single()

      const { error } = await supabase.from(PRODUCT_TABLE).delete().eq('id', id)
      if (error) throw error

      if (p) {
        const fileManager = useFileManagerStore()
        await fileManager.deleteFiles([...(p.images ?? []), ...(p.videos ?? [])])
      }

      return true
    } catch (error) {
      console.error(`Error deleting product with id ${id}:`, error.message)
      return false
    }
  }

  return {
    product,
    products,
    productSpecs,
    fetchAll,
    fetchBySlug,
    fetchById,
    create,
    createProductSpecs,
    removeProductSpecs,
    update,
    remove,
    fetchProductSpecs,
  }
})
