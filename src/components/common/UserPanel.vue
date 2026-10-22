<template>
  <div class="emr-user-panel" ref="panelRef">
    <button v-if="!authStore.isLoggedIn" class="emr-user-trigger" type="button" @click="router.push('/login')"><i class="bi bi-box-arrow-in-right"/> Sign in</button>
    <template v-else>
      <button class="emr-user-trigger" type="button" :aria-expanded="open" @click="open = !open" @keydown.esc="open = false">
        <span class="emr-user-avatar"><i class="bi bi-person"/></span><span class="emr-user-label"><strong>{{ authStore.user?.name || authStore.user?.userId }}</strong><small>{{ authStore.isAdmin ? 'Administrator' : 'Viewer' }}</small></span><i class="bi bi-chevron-down emr-chevron"/>
      </button>
      <div v-if="open" class="emr-user-dropdown">
        <div class="emr-user-dropdown__identity"><strong>{{ authStore.user?.name }}</strong><small>{{ authStore.user?.userId }}</small></div>
        <RouterLink v-if="authStore.isAdmin && !authStore.ocsMode" to="/settings/users" @click="open=false"><i class="bi bi-gear"/> Settings</RouterLink>
        <button type="button" @click="logout"><i class="bi bi-box-arrow-right"/> Log out</button>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const router = useRouter()
const authStore = useAuthStore()
const open = ref(false)
const panelRef = ref<HTMLElement>()
function logout() { open.value = false; authStore.logout(); router.push('/login') }
function outsideClick(e: MouseEvent) { if (panelRef.value && !panelRef.value.contains(e.target as Node)) open.value = false }
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') open.value = false }
onMounted(() => { document.addEventListener('click', outsideClick); document.addEventListener('keydown', onKey) })
onUnmounted(() => { document.removeEventListener('click', outsideClick); document.removeEventListener('keydown', onKey) })
</script>
