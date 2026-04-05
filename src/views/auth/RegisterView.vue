<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card width="400" elevation="4" class="pa-4">
      <v-card-text>
        <v-form @submit.prevent="handleRegister" ref="formRef" validate-on="submit">
          <v-text-field
            v-model="shopName"
            label="Shop Name"
            :rules="[(v) => !!v || 'Shop name is required']"
            required
            prepend-inner-icon="mdi-store"
          />
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            :rules="[(v) => !!v || 'Email is required']"
            required
            prepend-inner-icon="mdi-email"
          />
          <v-text-field
            v-model="password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            :rules="[(v) => (!!v && v.length >= 6) || 'Password must be at least 6 characters']"
            required
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
          />
          <v-btn :loading="userStore.loading" type="submit" color="primary" block>
            Create Account
          </v-btn>
          <div class="text-center mt-4 text-body-2">
            Already have an account?
            <router-link :to="{ name: 'login' }" class="text-primary">Login</router-link>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const appStore = useAppStore()
const router = useRouter()

const shopName = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const formRef = ref(null)

const handleRegister = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  try {
    await userStore.signupWithEmail(shopName.value, email.value, password.value)
    appStore.showSnackbar({ text: 'Account created successfully', color: 'success' })
    router.push({ name: 'dashboard' })
  } catch (err) {
    const color = err.type === 'confirmation_required' ? 'info' : 'error'
    appStore.showSnackbar({ text: err.message || 'Registration failed', color })
  }
}
</script>
