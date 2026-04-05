import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import { USER_TABLE } from '@/lib/dbTable'

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!user.value)

  async function fetchSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Failed to get session:', error.message)
    } else {
      user.value = data.session?.user || null
      token.value = data.session?.access_token || null
    }
  }

  async function loginWithEmail(email, password) {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const { data: shop, error: shopError } = await supabase
        .from(USER_TABLE)
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle()

      if (shopError) throw shopError

      if (!shop) {
        await supabase.auth.signOut()
        throw new Error('No store account found for this user. Please register first.')
      }

      user.value = data.user
      token.value = data.session?.access_token || null
    } finally {
      loading.value = false
    }
  }

  async function signupWithEmail(shopName, email, password) {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      // session is null when email confirmation is required —
      // insert would fail (anon role, no auth.uid()); user must confirm first,
      // then come back and register again to create the store_users row.
      if (!data.session) {
        const err = new Error('Please check your email to confirm your account, then return here to complete registration.')
        err.type = 'confirmation_required'
        throw err
      }

      const { error: shopError } = await supabase
        .from(USER_TABLE)
        .insert({ id: data.user.id, name: shopName })
      if (shopError) throw shopError

      user.value = data.user
      token.value = data.session.access_token
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    token.value = null
    router.push({ name: 'login' })
  }

  async function checkAuth() {
    await fetchSession()
    return !!user.value
  }

  // Optional: Watch auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      user.value = session?.user || null
      token.value = session?.access_token || null
    } else if (event === 'SIGNED_OUT') {
      user.value = null
      token.value = null
    }
  })

  return {
    user,
    token,
    loading,
    isLoggedIn,
    loginWithEmail,
    signupWithEmail,
    logout,
    checkAuth,
    fetchSession,
  }
})
