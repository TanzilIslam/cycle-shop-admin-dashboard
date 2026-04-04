<template>
  <v-row>
    <v-col cols="12" md="10">
      <h2 class="mb-6">My Shop Profile</h2>
      <v-form ref="form" @submit.prevent="submitForm">

        <!-- Basic Info -->
        <p class="text-subtitle-1 font-weight-bold mb-3">Basic Info</p>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field label="Shop Name" v-model="formData.name" :rules="[requiredRule]" required></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field label="Slug" v-model="formData.slug"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-textarea label="Description" v-model="formData.description" rows="3"></v-textarea>
          </v-col>
        </v-row>

        <!-- Images -->
        <p class="text-subtitle-1 font-weight-bold mb-3 mt-2">Images</p>
        <v-row>
          <v-col cols="12" md="6">
            <v-img v-if="formData.logo_url" :src="formData.logo_url" height="80" width="80" cover class="rounded mb-2"></v-img>
            <div class="d-flex ga-2 align-center">
              <v-text-field label="Logo URL" v-model="formData.logo_url" hide-details></v-text-field>
              <v-btn icon size="small" color="primary" :loading="uploadingLogo" @click="triggerLogoUpload">
                <v-icon size="18">mdi-upload</v-icon>
                <input ref="logoInput" type="file" accept="image/*" class="d-none" @change="uploadLogo" />
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <v-img v-if="formData.cover_url" :src="formData.cover_url" height="80" cover class="rounded mb-2"></v-img>
            <div class="d-flex ga-2 align-center">
              <v-text-field label="Cover Image URL" v-model="formData.cover_url" hide-details></v-text-field>
              <v-btn icon size="small" color="primary" :loading="uploadingCover" @click="triggerCoverUpload">
                <v-icon size="18">mdi-upload</v-icon>
                <input ref="coverInput" type="file" accept="image/*" class="d-none" @change="uploadCover" />
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12" v-if="fileManager.error">
            <p class="text-error text-caption">{{ fileManager.error }}</p>
          </v-col>
        </v-row>

        <!-- Contact -->
        <p class="text-subtitle-1 font-weight-bold mb-3 mt-4">Contact</p>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field label="Phone" v-model="formData.phone" prepend-inner-icon="mdi-phone"></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field label="WhatsApp" v-model="formData.whatsapp" prepend-inner-icon="mdi-whatsapp"></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field label="Email" v-model="formData.email" prepend-inner-icon="mdi-email"></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field label="Website" v-model="formData.website" prepend-inner-icon="mdi-web"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-textarea label="Address" v-model="formData.address" rows="2" prepend-inner-icon="mdi-map-marker"></v-textarea>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field label="Google Maps Link" v-model="formData.map_link" prepend-inner-icon="mdi-google-maps"></v-text-field>
          </v-col>
        </v-row>

        <!-- Social Media -->
        <p class="text-subtitle-1 font-weight-bold mb-3 mt-2">Social Media</p>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field label="Facebook" v-model="formData.facebook" prepend-inner-icon="mdi-facebook"></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field label="Instagram" v-model="formData.instagram" prepend-inner-icon="mdi-instagram"></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field label="YouTube" v-model="formData.youtube" prepend-inner-icon="mdi-youtube"></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" class="d-flex justify-end">
            <v-btn color="primary" type="submit" :loading="loading">Save Changes</v-btn>
          </v-col>
        </v-row>

      </v-form>
    </v-col>
  </v-row>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useShopStore } from '@/stores/shop'
import { useAppStore } from '@/stores/app'
import { useFileManagerStore } from '@/stores/fileManager'
import { CKEDITOR_STORAGE_BUCKET } from '@/lib/dbTable'

const shopStore = useShopStore()
const appStore = useAppStore()
const fileManager = useFileManagerStore()

const loading = ref(false)
const uploadingLogo = ref(false)
const uploadingCover = ref(false)
const logoInput = ref(null)
const coverInput = ref(null)
const form = ref(null)

const requiredRule = (value) => !!value || 'This field is required.'

const getInitialFormData = () => ({
  name: '',
  slug: '',
  description: '',
  logo_url: '',
  cover_url: '',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
  address: '',
  map_link: '',
  facebook: '',
  instagram: '',
  youtube: '',
})

const formData = ref(getInitialFormData())

onMounted(async () => {
  await shopStore.fetchMyShop()
  if (shopStore.shop) {
    const s = shopStore.shop
    formData.value = {
      name:        s.name ?? '',
      slug:        s.slug ?? '',
      description: s.description ?? '',
      logo_url:    s.logo_url ?? '',
      cover_url:   s.cover_url ?? '',
      phone:       s.phone ?? '',
      whatsapp:    s.whatsapp ?? '',
      email:       s.email ?? '',
      website:     s.website ?? '',
      address:     s.address ?? '',
      map_link:    s.map_link ?? '',
      facebook:    s.facebook ?? '',
      instagram:   s.instagram ?? '',
      youtube:     s.youtube ?? '',
    }
  }
})

const triggerLogoUpload = () => logoInput.value.click()
const triggerCoverUpload = () => coverInput.value.click()

const uploadLogo = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  uploadingLogo.value = true
  fileManager.error = null
  const url = await fileManager.uploadFile(file, CKEDITOR_STORAGE_BUCKET)
  if (url) formData.value.logo_url = url
  uploadingLogo.value = false
  event.target.value = ''
}

const uploadCover = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  uploadingCover.value = true
  fileManager.error = null
  const url = await fileManager.uploadFile(file, CKEDITOR_STORAGE_BUCKET)
  if (url) formData.value.cover_url = url
  uploadingCover.value = false
  event.target.value = ''
}

const submitForm = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await shopStore.saveMyShop(formData.value)
    appStore.showSnackbar({ text: 'Shop profile saved', color: 'success' })
  } catch (error) {
    appStore.showSnackbar({ text: `Failed to save: ${error.message}`, color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>
