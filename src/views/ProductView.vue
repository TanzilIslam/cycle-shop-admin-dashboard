<template>
  <template v-if="isListView">
    <div class="d-flex ga-4 justify-end">
      <v-select
        max-width="200"
        label="Category Filter"
        :items="categoryStore.categories"
        item-title="name"
        item-value="id"
        v-model="selectedCategory"
        clearable
        @update:modelValue="handleCategoryChange"
      ></v-select>

      <v-btn color="primary" @click="$router.push({ name: 'product', query: { mode: 'form' } })"
        >Add {{ moduleName }}</v-btn
      >
    </div>
    <v-data-table :items="filteredItems" :headers="headers">
      <template #item.action="{ item }">
        <div class="d-flex ga-2">
          <v-btn
            size="x-small"
            icon
            @click="$router.push({ name: 'product', query: { mode: 'form', id: item.id } })"
          >
            <v-icon size="15">mdi-pencil</v-icon>
          </v-btn>
          <v-btn size="x-small" icon @click="confirmDelete(item)">
            <v-icon size="15">mdi-delete</v-icon>
          </v-btn>
        </div>
      </template>
    </v-data-table>
  </template>
  <template v-else-if="isCreateView || isEditView">
    <v-row>
      <v-col cols="12">
        <div class="d-flex ga-2">
          <v-btn color="primary" @click="$router.back()" icon size="x-small">
            <v-icon size="18">mdi-arrow-left</v-icon>
          </v-btn>
          <h2>{{ isCreateView ? 'Add' : 'Edit' }} {{ moduleName }}</h2>
        </div>
        <v-tabs v-model="tab" class="mt-4">
          <v-tab value="basic"> Basic Information </v-tab>
          <v-tab value="gallery">Gallery</v-tab>
          <v-tab value="specification" v-if="isEditView">Specification</v-tab>
        </v-tabs>
        <v-tabs-window v-model="tab">
          <v-form @submit.prevent="submitForm" ref="form" class="mt-8">
            <v-tabs-window-item value="basic">
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    label="Select Category"
                    :items="categoryStore.categories"
                    item-title="name"
                    item-value="id"
                    v-model="formData.category_id"
                    :rules="[requiredRule]"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    label="Name"
                    v-model="formData.name"
                    :rules="[requiredRule]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    label="Slug"
                    v-model="formData.slug"
                    :rules="[requiredRule]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    label="Price"
                    v-model="formData.price"
                    type="number"
                    :rules="[requiredRule]"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    label="Active"
                    v-model="formData.is_active"
                    color="primary"
                  ></v-switch>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    label="Description"
                    v-model="formData.description"
                    rows="10"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="gallery">
              <v-row class="pb-4">
                <v-col cols="12">
                  <v-card class="pa-4 rounded-lg">
                    <div class="d-flex ga-2 overflow-x-auto flex-nowrap mb-4">
                      <v-img
                        v-for="(image, index) in formData.images"
                        :key="index"
                        :src="image"
                        height="200"
                        width="200"
                        class="flex-shrink-0"
                      />
                    </div>
                    <div class="d-flex justify-space-between mb-5">
                      <p class="text-h5">Images</p>
                      <v-btn color="primary" @click="addImage" icon size="x-small">
                        <v-icon size="18">mdi-plus</v-icon>
                      </v-btn>
                    </div>
                    <v-row v-for="(image, index) in formData.images" :key="index">
                      <v-col cols="9">
                        <v-text-field v-model="formData.images[index]" label="Image URL" hide-details></v-text-field>
                      </v-col>
                      <v-col cols="3" class="d-flex ga-1 align-center justify-end">
                        <v-btn
                          color="primary"
                          icon
                          size="x-small"
                          :loading="uploadingImageIndex === index"
                          @click="triggerImageUpload(index)"
                        >
                          <v-icon size="15">mdi-upload</v-icon>
                          <input
                            :ref="el => imageInputs[index] = el"
                            type="file"
                            accept="image/*"
                            class="d-none"
                            @change="uploadImage($event, index)"
                          />
                        </v-btn>
                        <v-btn color="error" @click="removeImage(index)" icon size="x-small">
                          <v-icon size="15">mdi-trash-can</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                    <p v-if="fileManager.error" class="text-error text-caption mt-1">{{ fileManager.error }}</p>
                  </v-card>
                </v-col>
                <v-col cols="12">
                  <v-card class="pa-4 rounded-lg">
                    <div class="d-flex ga-2 overflow-x-auto flex-nowrap mb-4">
                      <video
                        v-for="(video, index) in formData.videos"
                        :key="index"
                        :src="video"
                        height="200"
                        controls
                        class="flex-shrink-0"
                      />
                    </div>
                    <div class="d-flex justify-space-between mb-5">
                      <p class="text-h5">Videos</p>
                      <v-btn color="primary" @click="addVideo" icon size="x-small">
                        <v-icon size="18">mdi-plus</v-icon>
                      </v-btn>
                    </div>
                    <v-row v-for="(video, index) in formData.videos" :key="index">
                      <v-col cols="9">
                        <v-text-field v-model="formData.videos[index]" label="Video URL" hide-details></v-text-field>
                      </v-col>
                      <v-col cols="3" class="d-flex ga-1 align-center justify-end">
                        <v-btn
                          color="primary"
                          icon
                          size="x-small"
                          :loading="uploadingVideoIndex === index"
                          @click="triggerVideoUpload(index)"
                        >
                          <v-icon size="15">mdi-upload</v-icon>
                          <input
                            :ref="el => videoInputs[index] = el"
                            type="file"
                            accept="video/*"
                            class="d-none"
                            @change="uploadVideo($event, index)"
                          />
                        </v-btn>
                        <v-btn color="error" @click="removeVideo(index)" icon size="x-small">
                          <v-icon size="15">mdi-trash-can</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                    <p v-if="fileManager.error" class="text-error text-caption mt-1">{{ fileManager.error }}</p>
                  </v-card>
                </v-col>
              </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="specification">
              <v-tabs v-model="specificationTab" class="mt-4">
                <v-tab
                  :value="section.id"
                  v-for="section in specificationSectionStore.specificationSections"
                  :key="section.id"
                >
                  {{ section.name }}
                </v-tab>
              </v-tabs>
              <v-tabs-window v-model="specificationTab">
                <v-tabs-window-item
                  :value="section.id"
                  v-for="section in specificationSectionStore.specificationSections"
                  :key="section.id"
                >
                  <v-card flat>
                    <v-card-text>
                      <v-row>
                        <v-col
                          v-for="specKey in filteredSpecKeys(section.id)"
                          :key="specKey.id"
                          cols="12"
                          sm="6"
                          md="4"
                        >
                          <v-text-field
                            :label="specKey.unit ? `${specKey.name} (${specKey.unit})` : specKey.name"
                            v-model="specsData[specKey.id]"
                            :placeholder="`Enter value for ${specKey.name}`"
                            variant="outlined"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-tabs-window-item>
              </v-tabs-window>
            </v-tabs-window-item>
          </v-form>
        </v-tabs-window>
        <div class="d-flex justify-end">
          <v-btn color="primary" @click="submitForm" :loading="loading">Save</v-btn>
        </div>
      </v-col>
    </v-row>
  </template>
</template>

<script setup>
import { onMounted, ref, computed, reactive } from 'vue'
import { useAppStore } from '@/stores/app'
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import { useSpecificationSectionStore } from '@/stores/specificationSection'
import { useSpecificationKeyStore } from '@/stores/specificationKey'
import { useFileManagerStore } from '@/stores/fileManager'
import { useRouter, useRoute } from 'vue-router'
import { CKEDITOR_STORAGE_BUCKET } from '@/lib/dbTable'

const moduleName = 'Product'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const specificationSectionStore = useSpecificationSectionStore()
const appStore = useAppStore()
const specificationKeyStore = useSpecificationKeyStore()
const fileManager = useFileManagerStore()

const isListView = computed(() => !route.query?.mode)
const isCreateView = computed(() => route.query.mode === 'form' && !route.query.id)
const isEditView = computed(() => route.query.mode === 'form' && route.query.id)
const resourceId = computed(() => route.query.id)

const tab = ref('basic')
const specificationTab = ref(null)

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Category', key: 'store_categories.name' },
  { title: 'Price', key: 'price' },
  { title: 'Active', key: 'is_active' },
  { title: 'Action', key: 'action' },
]

const requiredRule = (value) => !!value || 'This field is required.'

const items = ref([])
const filteredItems = ref([])
const selectedCategory = ref(null)
const loading = ref(false)
const form = ref(null)

const filteredSpecKeys = computed(() => (sectionId) => {
  return specificationKeyStore.specificationKeys.filter(
    (specKey) => specKey.section_id === sectionId,
  )
})

const getInitialFormData = () => ({
  category_id: null,
  name: '',
  slug: '',
  price: 0,
  description: '',
  images: [],
  videos: [],
  is_active: true,
})

const formData = ref(getInitialFormData())
const specsData = reactive({})

const handleCategoryChange = (value) => {
  if (value) {
    filteredItems.value = items.value.filter((item) => item.category_id === value)
  } else {
    filteredItems.value = items.value
  }
}

const imageInputs = ref([])
const videoInputs = ref([])
const uploadingImageIndex = ref(null)
const uploadingVideoIndex = ref(null)

const addImage = () => formData.value.images.push('')
const removeImage = (index) => formData.value.images.splice(index, 1)
const addVideo = () => formData.value.videos.push('')
const removeVideo = (index) => formData.value.videos.splice(index, 1)

const triggerImageUpload = (index) => imageInputs.value[index]?.click()
const triggerVideoUpload = (index) => videoInputs.value[index]?.click()

const uploadImage = async (event, index) => {
  const file = event.target.files[0]
  if (!file) return
  uploadingImageIndex.value = index
  fileManager.error = null
  const url = await fileManager.uploadFile(file, CKEDITOR_STORAGE_BUCKET)
  if (url) formData.value.images[index] = url
  uploadingImageIndex.value = null
  event.target.value = ''
}

const uploadVideo = async (event, index) => {
  const file = event.target.files[0]
  if (!file) return
  uploadingVideoIndex.value = index
  fileManager.error = null
  const url = await fileManager.uploadFile(file, CKEDITOR_STORAGE_BUCKET)
  if (url) formData.value.videos[index] = url
  uploadingVideoIndex.value = null
  event.target.value = ''
}

const getFormattedSpecsData = () => {
  const formattedSpecs = []
  for (const specKeyId in specsData) {
    const value = specsData[specKeyId]
    if (value) {
      formattedSpecs.push({ spec_key_id: specKeyId, value })
    }
  }
  return formattedSpecs
}

const submitForm = async () => {
  const { valid } = await form.value.validate()
  if (!valid) {
    appStore.showSnackbar({ text: 'Please fill all required fields', color: 'error' })
    return
  }
  loading.value = true
  try {
    if (isCreateView.value) {
      await productStore.create(formData.value)
    } else if (isEditView.value) {
      await productStore.update(resourceId.value, formData.value)
      await productStore.removeProductSpecs(resourceId.value)
      const specsPayload = getFormattedSpecsData().map((spec) => ({
        ...spec,
        product_id: resourceId.value,
      }))
      if (specsPayload.length > 0) {
        await productStore.createProductSpecs(specsPayload)
      }
    }
    appStore.showSnackbar({ text: 'Product saved successfully', color: 'success' })
    router.push({ name: 'product' })
  } finally {
    loading.value = false
  }
}

async function confirmDelete(item) {
  const confirmed = await appStore.showConfirmDialog({
    title: 'Delete Product',
    message: `Are you sure you want to delete "${item.name}"?`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
  })

  if (confirmed) {
    try {
      await productStore.removeProductSpecs(item.id)
      await productStore.remove(item.id)
      await loadData()
      appStore.showSnackbar({ text: 'Deleted successfully' })
    } catch (err) {
      appStore.handleError(err, 'delete product')
    }
  }
}

const loadData = async () => {
  await Promise.all([
    productStore.fetchAll(),
    categoryStore.fetchAll(),
    specificationSectionStore.fetchAll(),
    specificationKeyStore.fetchAll(),
  ])
  items.value = productStore.products
  filteredItems.value = productStore.products
}

onMounted(async () => {
  await loadData()
  if (isEditView.value) {
    await productStore.fetchById(route.query.id)
    const p = productStore.product
    formData.value = {
      category_id: p.category_id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      description: p.description,
      images: p.images ?? [],
      videos: p.videos ?? [],
      is_active: p.is_active,
    }

    await productStore.fetchProductSpecs(route.query.id)
    productStore.productSpecs.forEach((spec) => {
      specsData[spec.spec_key_id] = spec.value
    })

    if (specificationSectionStore.specificationSections.length > 0) {
      specificationTab.value = specificationSectionStore.specificationSections[0].id
    }
  }
})
</script>
