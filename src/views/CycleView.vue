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
      <v-select
        max-width="200"
        label="Brand Filter"
        :items="brandStore.brands"
        item-title="name"
        item-value="id"
        v-model="selectedBrand"
        clearable
        @update:modelValue="handleBrandChange"
      ></v-select>

      <v-btn color="primary" @click="$router.push({ name: 'cycle', query: { mode: 'form' } })"
        >Add {{ moduleName }}</v-btn
      >
    </div>
    <v-data-table :items="filteredItems" :headers="headers">
      <template #item.action="{ item }">
        <div class="d-flex ga-2">
          <v-btn
            size="x-small"
            icon
            @click="$router.push({ name: 'cycle', query: { mode: 'form', id: item.id } })"
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
                    label="Select Brand"
                    :items="brandStore.brands"
                    item-title="name"
                    item-value="id"
                    v-model="formData.brand_id"
                    :rules="[requiredRule]"
                    required
                  ></v-select>
                </v-col>
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
                    label="Model Name"
                    v-model="formData.model_name"
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
                <v-col cols="12">
                  <v-textarea
                    label="Description"
                    v-model="formData.description"
                    :rules="[requiredRule]"
                    required
                    rows="10"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="gallery">
              <v-row class="pb-4">
                <v-col cols="12">
                  <v-card class="pa-4 rounded-lg" height="100%">
                    <div class="d-flex ga-2 overflow-y-auto flex-nowrap">
                      <v-img
                        v-for="(photo, index) in formData.photos"
                        :key="index"
                        :src="photo"
                        height="200"
                        width="200"
                        class="flex-1 shrink-0"
                      />
                    </div>

                    <div class="d-flex justify-space-between mb-5">
                      <p class="text-h5">Photos</p>
                      <v-btn color="primary" @click="addPhoto" icon size="x-small">
                        <v-icon size="18">mdi-plus</v-icon>
                      </v-btn>
                    </div>
                    <v-row v-for="(photo, index) in formData.photos" :key="index">
                      <v-col cols="10">
                        <v-text-field v-model="formData.photos[index]" label="Photo"></v-text-field>
                      </v-col>
                      <v-col cols="2" class="text-right">
                        <v-btn color="primary" @click="removePhoto(index)" icon size="x-small">
                          <v-icon size="18">mdi-trash-can</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
                <v-col cols="12">
                  <v-card class="pa-4 rounded-lg" height="100%">
                    <div class="d-flex ga-2 overflow-y-auto flex-nowrap mb-5">
                      <video
                        v-for="(video, index) in formData.videos"
                        :key="index"
                        :src="video"
                        height="400"
                        width="100%"
                        controls
                      />
                    </div>
                    <div class="d-flex justify-space-between mb-5">
                      <p class="text-h5">Videos</p>
                      <v-btn color="primary" @click="addVideo" icon size="x-small">
                        <v-icon size="18">mdi-plus</v-icon>
                      </v-btn>
                    </div>
                    <v-row v-for="(video, index) in formData.videos" :key="index">
                      <v-col cols="10">
                        <v-text-field v-model="formData.videos[index]" label="Video">
                        </v-text-field>
                      </v-col>
                      <v-col cols="2" class="text-right">
                        <v-btn color="primary" @click="removeVideo(index)" icon size="x-small">
                          <v-icon size="18">mdi-trash-can</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
            </v-tabs-window-item>

            <v-tabs-window-item value="specification">
              <v-tabs v-model="specificationTab" class="mt-4">
                <v-tab
                  :value="specificationSection.id"
                  v-for="specificationSection in specificationSectionStore.specificationSections"
                  :key="specificationSection.id"
                >
                  {{ specificationSection.name }}
                </v-tab>
              </v-tabs>
              <v-tabs-window v-model="specificationTab">
                <v-tabs-window-item
                  :value="specificationSection.id"
                  v-for="specificationSection in specificationSectionStore.specificationSections"
                  :key="specificationSection.id"
                >
                  <v-card flat>
                    <v-card-text>
                      <v-row>
                        <v-col
                          v-for="specKey in filteredSpecKeys(specificationSection.id)"
                          :key="specKey.id"
                          cols="12"
                          sm="6"
                          md="4"
                        >
                          <template v-if="specKey.data_type === 'text'">
                            <v-text-field
                              :label="specKey.name"
                              v-model="specsData[specKey.id]"
                              :placeholder="`Enter value for ${specKey.name}`"
                              variant="outlined"
                            ></v-text-field>
                          </template>
                          <template v-else-if="specKey.data_type === 'number'">
                            <v-text-field
                              :label="specKey.name"
                              v-model="specsData[specKey.id]"
                              :placeholder="`Enter value for ${specKey.name}`"
                              variant="outlined"
                            ></v-text-field>
                          </template>
                          <template v-else-if="specKey.data_type === 'select'">
                            <v-select
                              :label="specKey.name"
                              v-model="specsData[specKey.id]"
                              :placeholder="`Enter value for ${specKey.name}`"
                              variant="outlined"
                              :items="specKey.select_options?.split(',')"
                            ></v-select>
                          </template>
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
          <v-btn color="primary" @click="submitForm">Save</v-btn>
        </div>
      </v-col>
    </v-row>
  </template>
  <template v-else-if="isDetailView"> Detail </template>
</template>

<script setup>
import { onMounted, ref, computed, reactive } from 'vue'
import { useAppStore } from '@/stores/app'
import { useCycleStore } from '@/stores/cycle'
import { useCategoryStore } from '@/stores/category'
import { useBrandStore } from '@/stores/brand'
import { useSpecificationSectionStore } from '@/stores/specificationSection'
import { useSpecificationKeyStore } from '@/stores/specificationKey'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { VVideo } from 'vuetify/labs/VVideo'

import { BRAND_TABLE, CATEGORY_TABLE } from '@/lib/dbTable'

const moduleName = 'Cycle'

const router = useRouter()
const route = useRoute()
const cycleStore = useCycleStore()
const categoryStore = useCategoryStore()
const brandStore = useBrandStore()
const specificationSectionStore = useSpecificationSectionStore()
const appStore = useAppStore()
const specificationKeyStore = useSpecificationKeyStore()

const isListView = computed(() => !route.query?.mode)
const isCreateView = computed(() => route.query.mode === 'form' && !route.query.id)
const isEditView = computed(() => route.query.mode === 'form' && route.query.id)
const isDetailView = computed(() => route.query.mode === 'detail' && route.query.id)
const resourceId = computed(() => route.query.id)

const tab = ref('basic')
const specificationTab = ref('basic')

const headers = [
  { title: 'Model Name', key: 'model_name' },
  { title: 'Brand', key: `${BRAND_TABLE}.name` },
  { title: 'Category', key: `${CATEGORY_TABLE}.name` },
  { title: 'price', key: 'price' },
  { title: 'Action', key: 'action' },
]

const requiredRule = (value) => !!value || 'This field is required.'

const items = ref([])
const filteredItems = ref([])
const selectedCategory = ref(null)
const selectedBrand = ref(null)
const loading = ref(false)
const form = ref(null)

const filteredSpecKeys = computed(() => (sectionId) => {
  return specificationKeyStore.specificationKeys.filter(
    (specKey) => specKey.spec_section_id === sectionId,
  )
})

const getInitialFormData = () => {
  return {
    brand_id: null,
    category_id: null,
    model_name: '',
    slug: '',
    price: 0,
    description: '',
    photos: [],
    videos: [],
  }
}
const formData = ref(getInitialFormData())
const specsData = reactive({})

const handleCategoryChange = (value) => {
  if (value) {
    filteredItems.value = items.value.filter((item) => item.category_id === value)
  } else {
    filteredItems.value = items.value
  }
}
const handleBrandChange = (value) => {
  if (value) {
    filteredItems.value = items.value.filter((item) => item.brand_id === value)
  } else {
    filteredItems.value = items.value
  }
}
const addPhoto = () => {
  formData.value.photos.push('')
}
const addVideo = () => {
  formData.value.videos.push('')
}
const removePhoto = (index) => {
  formData.value.photos.splice(index, 1)
}
const removeVideo = (index) => {
  formData.value.videos.splice(index, 1)
}
const getFormattedSpecsData = () => {
  const formattedSpecs = []
  for (const specKeyId in specsData) {
    const value = specsData[specKeyId]
    // Only include specs with a value
    if (value) {
      formattedSpecs.push({
        spec_key_id: specKeyId,
        value: value,
      })
    }
  }
  return formattedSpecs
}
const submitForm = async () => {
  const { valid } = await form.value.validate()
  if (!valid) {
    appStore.showSnackbar({
      text: 'Please fill all required fields',
      color: 'error',
    })
    return
  }
  loading.value = true
  if (isCreateView.value) {
    await cycleStore.create(formData.value)
  } else if (isEditView.value) {
    await cycleStore.update(resourceId.value, formData.value)
    await cycleStore.removeCycleSpecs(resourceId.value)
    const formattedSpecs = getFormattedSpecsData()
    const specsPayload = formattedSpecs.map((spec) => ({
      ...spec,
      cycle_id: resourceId.value,
    }))
    await cycleStore.createCycleSpecs(specsPayload)
  }
  appStore.showSnackbar({
    text: 'Cycle saved successfully',
    color: 'success',
  })
  loading.value = false
  router.push({ name: 'cycle' })
}
async function confirmDelete(item) {
  const confirmed = await appStore.showConfirmDialog({
    title: 'Delete Cycle',
    message: `Are you sure you want to delete "${item.model_name}"?`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
  })

  if (confirmed) {
    try {
      await cycleStore.removeCycleSpecs(item.id)
      await cycleStore.remove(item.id)
      await fetchCycle()
      appStore.showSnackbar({ text: 'Deleted successfully' })
    } catch (err) {
      appStore.handleError(err, 'delete cycle')
    }
  }
}
const fetchCycle = async () => {
  Promise.all([
    cycleStore.fetchAll(),
    categoryStore.fetchAll(),
    brandStore.fetchAll(),
    specificationSectionStore.fetchAll(),
    specificationKeyStore.fetchAll(),
  ]).then(() => {
    items.value = cycleStore.cycles
    filteredItems.value = cycleStore.cycles
  })
}

onMounted(async () => {
  await fetchCycle()
  if (isEditView.value || isDetailView.value) {
    await cycleStore.fetchById(route.query.id)
    formData.value.brand_id = cycleStore.cycle.brand_id
    formData.value.category_id = cycleStore.cycle.category_id
    formData.value.model_name = cycleStore.cycle.model_name
    formData.value.slug = cycleStore.cycle.slug
    formData.value.price = cycleStore.cycle.price
    formData.value.description = cycleStore.cycle.description
    formData.value.photos = cycleStore.cycle.photos
    formData.value.videos = cycleStore.cycle.videos

    await cycleStore.fetchCycleSpecs(route.query.id)

    cycleStore.cycleSpecs.forEach((spec) => {
      specsData[spec.spec_key_id] = spec.value
    })
    if (specificationSectionStore.specificationSections.length > 0) {
      specificationTab.value = specificationSectionStore.specificationSections[0].id
    }
  }
})
</script>
