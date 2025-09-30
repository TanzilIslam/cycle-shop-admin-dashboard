<template>
  <div class="d-flex justify-end">
    <v-btn color="primary">Add Shop</v-btn>
  </div>
  <v-data-table :items="items" :headers="headers">
    <template #item.logo="{ item }">
      <v-img :src="item.logo" width="100" height="100"></v-img>
    </template>
    <template #item.action="{ item }">
      <div class="d-flex ga-2">
        <v-btn size="x-small" icon>
          <v-icon size="15">mdi-pencil</v-icon>
        </v-btn>
        <v-btn size="x-small" icon>
          <v-icon size="15">mdi-delete</v-icon>
        </v-btn>
      </div>
    </template>
  </v-data-table>
</template>

<script setup>
import { onMounted } from 'vue'
import { useShopStore } from '@/stores/shop'
import { computed } from 'vue'
const shopStore = useShopStore()
const items = computed(() => shopStore.shops)
const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Logo', key: 'logo' },
  { title: 'Address', key: 'address' },
  { title: 'Phone', key: 'phone' },
  { title: 'email', key: 'email' },
  { title: 'Description', key: 'description' },
  { title: 'Action', key: 'action' },
]
onMounted(() => {
  shopStore.fetchAll()
})
</script>
