<template>
  <div class="d-flex justify-end">
    <v-btn color="primary" @click="openFormDialog(null)">Add {{ moduleName }}</v-btn>
  </div>
  <v-data-table :items="items" :headers="headers">
    <template #item.logo="{ item }">
      <v-img :src="item.logo" width="100" height="100"></v-img>
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
  <v-dialog v-model="showFromDialog" max-width="1000">
    <v-card class="pa-4 md:pa-10 rounded-lg">
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
import { useBrandStore } from '@/stores/brand'
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const moduleName = 'Brand'

const brandStore = useBrandStore()
const appStore = useAppStore()

const getInitialFormData = () => {
  return {
    name: '',
    slug: '',
  }
}
const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Slug', key: 'slug' },
  { title: 'Action', key: 'action' },
]
const requiredRule = (value) => !!value || 'This field is required.'

const items = computed(() => brandStore.brands)
const formData = ref(getInitialFormData())
const isEdit = ref(false)
const showFromDialog = ref(false)
const form = ref(null)
const loading = ref(false)
const resourceId = ref(null)

onMounted(() => {
  brandStore.fetchAll()
})

const closeFormDialog = () => {
  showFromDialog.value = false
  isEdit.value = false
  form.value.resetValidation()
  form.value.reset()
  resourceId.value = null
  formData.value = getInitialFormData()
  brandStore.fetchAll()
}
const openFormDialog = (item = null) => {
  formData.value = getInitialFormData()
  showFromDialog.value = true
  if (item) {
    formData.value = { name: item?.name, slug: item?.slug }
    isEdit.value = true
    resourceId.value = item?.id
  } else {
    isEdit.value = false
    resourceId.value = null
  }
}
async function confirmDelete(item) {
  const confirmed = await appStore.showConfirmDialog({
    title: 'Delete Brand',
    message: `Are you sure you want to delete "${item.name}"?`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
  })

  if (confirmed) {
    try {
      await brandStore.remove(item.id)
      appStore.showSnackbar({ text: 'Deleted successfully' })
      brandStore.fetchAll()
    } catch (err) {
      appStore.handleError(err, 'delete brand')
    }
  }
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
  try {
    if (isEdit.value) {
      await brandStore.update(resourceId.value, formData.value)
    } else {
      await brandStore.create(formData.value)
    }
    appStore.showSnackbar({
      text: `${moduleName} saved successfully`,
      color: 'success',
    })
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
