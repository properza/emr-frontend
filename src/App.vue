<template>
  <div class="emr-shell" :class="{ 'emr-shell--login': isLoginPage }">
    <template v-if="!isLoginPage">
      <header class="emr-topbar">
        <RouterLink class="emr-brand" to="/viewer" aria-label="bitEMR home"><img src="/logo.png" alt="bitEMR" /></RouterLink>
        <nav class="emr-primary-nav" aria-label="Main navigation">
          <RouterLink v-if="!authStore.ocsMode && authStore.isAdmin" to="/scan" :aria-current="isScanApp ? 'page' : undefined"><i class="bi bi-scanner"/> Scan</RouterLink>
          <RouterLink to="/viewer" :aria-current="isViewerApp ? 'page' : undefined"><i class="bi bi-eye"/> Viewer</RouterLink>
          <RouterLink to="/viewer/print" :aria-current="route.path === '/viewer/print' ? 'page' : undefined"><i class="bi bi-printer"/> OCR Print</RouterLink>
          <div v-if="authStore.isAdmin && !authStore.ocsMode" class="emr-nav-menu" ref="opsMenu">
            <button type="button" :aria-expanded="opsOpen" @click="opsOpen = !opsOpen" @keydown.esc="opsOpen = false">
              <i class="bi bi-grid"/> {{ operationLabel }} <i class="bi bi-chevron-down emr-chevron"/>
            </button>
            <div v-if="opsOpen" class="emr-nav-dropdown" role="menu">
              <RouterLink v-for="item in operationLinks" :key="item.to" :to="item.to" role="menuitem" @click="opsOpen = false" :aria-current="route.path === item.to ? 'page' : undefined"><i :class="['bi', item.icon]"/> {{ item.label }}</RouterLink>
            </div>
          </div>
          <RouterLink v-if="authStore.isAdmin && !authStore.ocsMode" class="emr-settings-link" :to="settingsPath" :aria-current="route.path.startsWith('/settings') ? 'page' : undefined"><i class="bi bi-gear"/> Settings</RouterLink>
        </nav>
        <div class="emr-topbar-spacer"/>
        <div v-if="authStore.ocsMode" class="emr-ocs-user"><i class="bi bi-person-circle"/> {{ authStore.user?.name }} <span>OCS</span></div>
        <UserPanel v-else />
      </header>
      <div class="emr-contextbar">
        <div class="emr-breadcrumb"><span>bitEMR</span><i class="bi bi-chevron-right"/><strong>{{ pageTitle }}</strong></div>
        <ViewerHnBar v-if="isViewerApp && authStore.isLoggedIn" @treat-selected="onTreatSelected" />
      </div>
    </template>
    <main class="emr-main"><RouterView /></main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { usePatientStore } from '@/stores/patient'
import { useAuthStore } from '@/stores/auth'
import { useScanStore } from '@/stores/scan'
import UserPanel from '@/components/common/UserPanel.vue'
import ViewerHnBar from '@/components/common/ViewerHnBar.vue'

const route = useRoute()
const patientStore = usePatientStore()
const scanStore = useScanStore()
const authStore = useAuthStore()
const opsOpen = ref(false)
const opsMenu = ref<HTMLElement>()
const isScanApp = computed(() => route.path.startsWith('/scan'))
const isViewerApp = computed(() => route.path.startsWith('/viewer'))
const isLoginPage = computed(() => route.path === '/login' || route.name === 'login')
const operationLinks = [
  { to: '/scan/security', label: 'Security', icon: 'bi-shield-lock' },
  { to: '/scan/rent', label: 'Rent', icon: 'bi-box-arrow-up' },
  { to: '/scan/ocrreturn', label: 'OCR Return', icon: 'bi-arrow-return-left' },
  { to: '/scan/printneed', label: 'Print need', icon: 'bi-printer' },
]
const operationLabel = computed(() => operationLinks.find(x => x.to === route.path)?.label || 'Operations')
const settingsPath = computed(() => route.path.startsWith('/settings') ? route.path : '/settings/users')
const pageTitle = computed(() => {
  const titles: Record<string, string> = { '/scan': 'Scan', '/viewer': 'Viewer', '/viewer/print': 'OCR Print', '/scan/security': 'Security', '/scan/rent': 'Rent', '/scan/ocrreturn': 'OCR Return', '/scan/printneed': 'Print need' }
  return route.path.startsWith('/settings') ? 'Settings' : (titles[route.path] || 'Viewer')
})
let prevApp = ''
watch(() => route.path, (newPath) => {
  opsOpen.value = false
  const currentApp = newPath.startsWith('/scan') ? 'scan' : newPath.startsWith('/viewer') ? 'viewer' : ''
  if (prevApp && prevApp !== currentApp && currentApp) {
    patientStore.clearPatient(); scanStore.clearFiles(); scanStore.clearTreatments(); scanStore.selectedFormCode = ''
    if (currentApp !== 'viewer') patientStore.clearViewer()
  }
  if (currentApp) prevApp = currentApp
})
function onTreatSelected() { /* Viewer views react to patientStore.viewerPatient. */ }
function outsideClick(event: MouseEvent) { if (opsMenu.value && !opsMenu.value.contains(event.target as Node)) opsOpen.value = false }
onMounted(async () => {
  document.addEventListener('click', outsideClick)
  authStore.init()
  if (authStore.isLoggedIn) { await patientStore.loadHnConfig(); await scanStore.loadForms() }
})
watch(() => authStore.isLoggedIn, async loggedIn => { if (loggedIn) { await patientStore.loadHnConfig(); await scanStore.loadForms() } })
</script>
