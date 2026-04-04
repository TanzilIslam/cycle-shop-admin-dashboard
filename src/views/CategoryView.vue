<template>
  <div class="d-flex justify-end">
    <v-btn color="primary" @click="openFormDialog(null)">Add {{ moduleName }}</v-btn>
  </div>
  <v-data-table :items="items" :headers="headers">
    <template #item.image_url="{ item }">
      <v-img v-if="item.image_url" :src="item.image_url" width="60" height="60" cover class="my-1 rounded"></v-img>
      <span v-else class="text-grey">—</span>
    </template>
    <template #item.action="{ item }">
      <div class="d-flex ga-2">
        <v-btn size="x-small" icon @click="openFormDialog(item)">
          <v-icon size="15">mdi-pencil</v-icon>
        </v-btn>
        <v-btn size="x-small" icon @click="confirmDelete(item)">
          <v-icon size="15">mdi-delete</v-icon>
        </v-btn>
      </div>
    </template>
  </v-data-table>

  <v-dialog v-model="showFromDialog" max-width="600">
    <v-card class="pa-4 rounded-lg">
      <v-card-title>
        <span v-if="isEdit">Edit {{ moduleName }}</span>
        <span v-else>Add {{ moduleName }}</span>
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="submitForm" ref="form">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.name"
                label="Name"
                :rules="[requiredRule]"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.slug"
                label="Slug"
                :rules="[requiredRule]"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="formData.description" label="Description" rows="3"></v-textarea>
            </v-col>
            <v-col cols="12">
              <v-img
                v-if="formData.image_url"
                :src="formData.image_url"
                height="120"
                class="rounded mb-2"
                cover
              ></v-img>
              <div class="d-flex ga-2 align-center">
                <v-text-field
                  v-model="formData.image_url"
                  label="Image URL"
                  hide-details
                ></v-text-field>
                <v-btn
                  v-if="isEdit"
                  icon
                  size="small"
                  color="primary"
                  :loading="uploading"
                  @click="triggerImageUpload"
                >
                  <v-icon size="18">mdi-upload</v-icon>
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/*"
                    class="d-none"
                    @change="uploadImage"
                  />
                </v-btn>
              </div>
              <p v-if="fileManager.error" class="text-error text-caption mt-1">{{ fileManager.error }}</p>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
        <v-btn color="primary" @click="submitForm" :loading="loading">Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useCategoryStore } from '@/stores/category'
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useFileManagerStore } from '@/stores/fileManager'
import { CKEDITOR_STORAGE_BUCKET } from '@/lib/dbTable'

const moduleName = 'Category'

const categoryStore = useCategoryStore()
const appStore = useAppStore()
const fileManager = useFileManagerStore()

const getInitialFormData = () => ({
  name: '',
  slug: '',
  description: '',
  image_url: '',
})

const headers = [
  { title: 'Image', key: 'image_url', sortable: false },
  { title: 'Name', key: 'name' },
  { title: 'Slug', key: 'slug' },
  { title: 'Action', key: 'action', sortable: false },
]

const requiredRule = (value) => !!value || 'This field is required.'

const items = computed(() => categoryStore.categories)
const formData = ref(getInitialFormData())
const isEdit = ref(false)
const showFromDialog = ref(false)
const form = ref(null)
const loading = ref(false)
const uploading = ref(false)
const resourceId = ref(null)
const imageInput = ref(null)

onMounted(() => categoryStore.fetchAll())

const triggerImageUpload = () => imageInput.value.click()

const uploadImage = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  uploading.value = true
  fileManager.error = null
  const url = await fileManager.uploadFile(file, CKEDITOR_STORAGE_BUCKET)
  if (url) {
    formData.value.image_url = url
    await categoryStore.update(resourceId.value, { image_url: url })
  }
  uploading.value = false
  event.target.value = ''
}

const closeFormDialog = () => {
  showFromDialog.value = false
  isEdit.value = false
  form.value.resetValidation()
  form.value.reset()
  resourceId.value = null
  formData.value = getInitialFormData()
  categoryStore.fetchAll()
}

const openFormDialog = (item = null) => {
  formData.value = getInitialFormData()
  showFromDialog.value = true
  if (item) {
    formData.value = {
      name: item.name,
      slug: item.slug,
      description: item.description ?? '',
      image_url: item.image_url ?? '',
    }
    isEdit.value = true
    resourceId.value = item.id
  } else {
    isEdit.value = false
    resourceId.value = null
  }
}

async function confirmDelete(item) {
  const confirmed = await appStore.showConfirmDialog({
    title: `Delete ${moduleName}`,
    message: `Are you sure you want to delete "${item.name}"?`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
  })
  if (confirmed) {
    try {
      await categoryStore.remove(item.id)
      appStore.showSnackbar({ text: 'Deleted successfully' })
      categoryStore.fetchAll()
    } catch (err) {
      appStore.showSnackbar({ text: `Failed to delete. ${err.message}`, color: 'error' })
    }
  }
}

const submitForm = async () => {
  const { valid } = await form.value.validate()
  if (!valid) {
    appStore.showSnackbar({ text: 'Please fill all required fields', color: 'error' })
    return
  }
  loading.value = true
  try {
    if (isEdit.value) {
      await categoryStore.update(resourceId.value, formData.value)
    } else {
      await categoryStore.create(formData.value)
    }
    appStore.showSnackbar({ text: `${moduleName} saved successfully`, color: 'success' })
    closeFormDialog()
  } catch (error) {
    appStore.showSnackbar({
      text: `Failed to ${isEdit.value ? 'update' : 'save'}. ${error.message}`,
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>
