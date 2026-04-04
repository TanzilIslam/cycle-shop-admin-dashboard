import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'
import { CKEDITOR_STORAGE_BUCKET } from '@/lib/dbTable'

const MAX_IMAGE_BYTES = (Number(import.meta.env.VITE_MAX_IMAGE_SIZE_MB) || 2) * 1024 * 1024
const MAX_VIDEO_BYTES = (Number(import.meta.env.VITE_MAX_VIDEO_SIZE_MB) || 10) * 1024 * 1024

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg']

function getStoragePath(publicUrl) {
  // Extract the file path from a Supabase public URL
  // e.g. https://xxx.supabase.co/storage/v1/object/public/store-public/abc.jpg → abc.jpg
  const marker = `/object/public/${CKEDITOR_STORAGE_BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  return publicUrl.slice(idx + marker.length)
}

export const useFileManagerStore = defineStore('fileManager', () => {
  const error = ref(null)

  const uploadFile = async (file, bucket) => {
    error.value = null

    const isImage = IMAGE_TYPES.includes(file.type)
    const isVideo = VIDEO_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
      error.value = 'Unsupported file type.'
      return null
    }

    if (isImage && file.size > MAX_IMAGE_BYTES) {
      error.value = `Image must be under ${import.meta.env.VITE_MAX_IMAGE_SIZE_MB || 2}MB.`
      return null
    }

    if (isVideo && file.size > MAX_VIDEO_BYTES) {
      error.value = `Video must be under ${import.meta.env.VITE_MAX_VIDEO_SIZE_MB || 10}MB.`
      return null
    }

    try {
      const ext = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
      return data.publicUrl
    } catch (err) {
      error.value = err.message
      return null
    }
  }

  // Delete one or more public URLs from storage (ignores non-storage URLs)
  const deleteFiles = async (urls) => {
    const paths = (Array.isArray(urls) ? urls : [urls])
      .filter(Boolean)
      .map(getStoragePath)
      .filter(Boolean)

    if (paths.length === 0) return

    const { error: deleteError } = await supabase.storage
      .from(CKEDITOR_STORAGE_BUCKET)
      .remove(paths)

    if (deleteError) {
      console.error('Error deleting files from storage:', deleteError.message)
    }
  }

  return { error, uploadFile, deleteFiles }
})
