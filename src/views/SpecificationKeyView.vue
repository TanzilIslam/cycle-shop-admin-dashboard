<template>
  <div class="d-flex ga-4 justify-end">
    <v-select
      max-width="200"
      label="Filter Section"
      :items="specificationSections"
      item-title="name"
      item-value="id"
      v-model="selectedSection"
      clearable
      @update:modelValue="handleSectionChange"
    ></v-select>
    <v-btn color="primary" @click="openFormDialog(null)">Add {{ moduleName }}</v-btn>
  </div>
  <v-data-table :items="filteredItems" :headers="headers">
    <template #item.specification_section_name="{ item }">
      {{ item[`${SPECIFICATION_SECTION_TABLE}`]?.name }}
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
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.data_type"
                label="Data Type"
                :items="['text', 'number', 'boolean', 'select']"
                :rules="[requiredRule]"
                required
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.select_options" label="Select Options"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.spec_section_id"
                label="Specification Section"
                :items="specificationSections"
                item-title="name"
                item-value="id"
                :rules="[requiredRule]"
                required
              ></v-select>
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
import { computed, onMounted, ref } from 'vue'
import { useSpecificationKeyStore } from '@/stores/specificationKey'
import { SPECIFICATION_SECTION_TABLE } from '@/lib/dbTable'
import { useSpecificationSectionStore } from '@/stores/specificationSection'
import { useAppStore } from '@/stores/app'

const moduleName = 'Specification Key'

const specificationKeyStore = useSpecificationKeyStore()
const specificationSectionStore = useSpecificationSectionStore()
const appStore = useAppStore()

const selectedSection = ref(null)
const items = ref([])
const filteredItems = ref([])
const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Section', key: 'specification_section_name' },
  { title: 'Type', key: 'data_type' },
  { title: 'Action', key: 'action' },
]
const requiredRule = (value) => !!value || 'This field is required.'

const specificationSections = computed(() => specificationSectionStore.specificationSections)

const getInitialFormData = () => {
  return {
    name: '',
    slug: '',
    data_type: '',
    spec_section_id: null,
  }
}

const formData = ref(getInitialFormData())
const isEdit = ref(false)
const showFromDialog = ref(false)
const form = ref(null)
const loading = ref(false)
const resourceId = ref(null)

const handleSectionChange = (value) => {
  if (!value) {
    filteredItems.value = items.value
  } else {
    filteredItems.value = items.value.filter(
      (item) => item[`${SPECIFICATION_SECTION_TABLE}`]?.id == value,
    )
  }
}
const loadItems = async () => {
  await specificationKeyStore.fetchAll()
  await specificationSectionStore.fetchAll()
  items.value = specificationKeyStore.specificationKeys
  filteredItems.value = items.value
}

onMounted(async () => {
  await loadItems()
})

const closeFormDialog = () => {
  showFromDialog.value = false
  isEdit.value = false
  form.value.resetValidation()
  form.value.reset()
  resourceId.value = null
  formData.value = getInitialFormData()
  loadItems()
}

const openFormDialog = (item = null) => {
  formData.value = getInitialFormData()
  showFromDialog.value = true
  if (item) {
    console.log(item)
    formData.value = {
      name: item?.name,
      slug: item?.slug,
      data_type: item?.data_type,
      select_options: item?.select_options,
      spec_section_id: item[`${SPECIFICATION_SECTION_TABLE}`]?.id,
    }
    isEdit.value = true
    resourceId.value = item?.id
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
      await specificationKeyStore.remove(item.id)
      appStore.showSnackbar({ text: 'Deleted successfully' })
      await loadItems()
    } catch (err) {
      appStore.showSnackbar({
        text: `Failed to delete. ${err.message}`,
        color: 'error',
      })
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
      await specificationKeyStore.update(resourceId.value, formData.value)
    } else {
      await specificationKeyStore.create(formData.value)
    }
    appStore.showSnackbar({
      text: `${moduleName} saved successfully`,
      color: 'success',
    })
    closeFormDialog()
    await loadItems()
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
