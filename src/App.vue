<template>
  <div class="emr-app-shell min-h-screen bg-slate-50 flex flex-col">
    <!-- Header (ซ่อนบนหน้า login) -->
    <header v-if="!isLoginPage" class="emr-app-header bg-gradient-to-r from-[#1a4f7a] to-[#2563a8] text-white px-5 py-2 flex items-center gap-3 shadow-md">
      <img src="/logo.png" class="emr-brand-logo rounded object-cover" alt="BIT" />
      <div class="emr-brand-copy">
        <h1 class="text-sm font-semibold">EMR Document System</h1>
        <p class="text-xs opacity-80">{{ appTitle }} <span v-if="activePageTitle">· {{ activePageTitle }}</span></p>
      </div>
      <div class="flex-1" />
      <!-- OCS mode: ซ่อน UserPanel (กดไม่ได้) แสดงแค่ชื่อ user ที่ login อยู่ -->
      <div v-if="authStore.ocsMode" class="flex items-center gap-2 text-white/90">
        <i class="bi bi-person-circle" />
        <span class="text-sm">{{ authStore.user?.name }}</span>
        <span class="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">OCS</span>
      </div>
      <UserPanel v-else />
    </header>

    <!-- App switcher + Tabs + HN bar (ซ่อนบนหน้า login) -->
    <nav v-if="!isLoginPage" class="emr-app-nav bg-white border-b-2 border-gray-200 px-5 flex items-center min-h-[48px] overflow-visible">
      <!-- App switcher — ซ่อนทั้งหมดใน OCS mode (เหลือเฉพาะ Viewer) -->
      <div v-if="!authStore.ocsMode" class="emr-app-switcher flex border-r border-gray-200 pr-4 mr-2 gap-1">
        <RouterLink to="/scan"
          class="px-3 py-2 text-xs font-semibold rounded-md transition-colors"
          :class="isScanApp ? 'bg-[#1a4f7a] text-white' : 'text-gray-500 hover:text-[#1a4f7a]'">
          <i class="bi bi-scanner mr-1" />Scan
        </RouterLink>
        <RouterLink to="/viewer"
          class="px-3 py-2 text-xs font-semibold rounded-md transition-colors"
          :class="isViewerApp ? 'bg-[#1a4f7a] text-white' : 'text-gray-500 hover:text-[#1a4f7a]'">
          <i class="bi bi-eye mr-1" />Viewer
        </RouterLink>
      </div>

      <!-- Tabs for current app -->
      <template v-for="tab in currentTabs" :key="tab.to">
        <span v-if="tab.adminOnly && !authStore.isAdmin"
          class="flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-gray-300 border-b-[3px] border-transparent -mb-[2px] cursor-not-allowed select-none"
          :title="'ต้องการสิทธิ์ Admin'">
          <i :class="['bi', tab.icon]" /> {{ tab.label }}
        </span>
        <RouterLink v-else :to="tab.to"
          class="flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-gray-500 border-b-[3px] border-transparent -mb-[2px] hover:text-[#1a4f7a] transition-colors"
          active-class="!text-[#1a4f7a] !border-sky-400 font-semibold">
          <i :class="['bi', tab.icon]" /> {{ tab.label }}
        </RouterLink>
      </template>

    <!-- HN bar (viewer only) -->
      <template v-if="isViewerApp && authStore.isLoggedIn">
        <div class="flex-1" />
        <div class="py-1.5 border-l border-gray-200 pl-4 ml-2">
          <ViewerHnBar @treat-selected="onTreatSelected" />
        </div>
      </template>
      <div v-else class="flex-1" />
    </nav>

    <!-- Content (login = เต็มจอ ไม่มี padding) -->
    <main class="flex-1" :class="{ 'p-5': !isLoginPage }">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patient'
import { useAuthStore } from '@/stores/auth'
import { useScanStore } from '@/stores/scan'
import UserPanel from '@/components/common/UserPanel.vue'
import ViewerHnBar from '@/components/common/ViewerHnBar.vue'

const route  = useRoute()
const router = useRouter()
const patientStore = usePatientStore()
const scanStore    = useScanStore()
const authStore    = useAuthStore()

const isScanApp   = computed(() => route.path.startsWith('/scan'))
const isViewerApp = computed(() => route.path.startsWith('/viewer'))
// login = ซ่อน header + navbar ให้เห็นเฉพาะ body
const isLoginPage = computed(() => route.path === '/login' || route.name === 'login')

// Clear state when switching apps
let prevApp = ''
watch(() => route.path, (newPath) => {
  const currentApp = newPath.startsWith('/scan') ? 'scan' : newPath.startsWith('/viewer') ? 'viewer' : ''
  if (prevApp && prevApp !== currentApp && currentApp) {
    patientStore.clearPatient()
    scanStore.clearFiles()
    scanStore.clearTreatments()
    scanStore.selectedFormCode = ''
    if (currentApp !== 'viewer') patientStore.clearViewer()
  }
  if (currentApp) prevApp = currentApp
})

const appTitle = computed(() => isScanApp.value ? 'Scan เอกสาร' : 'ดูเอกสาร')

const scanTabs = [
  { to: '/scan',           icon: 'bi-scanner',       label: 'Scan',       adminOnly: true },
  { to: '/scan/security',  icon: 'bi-shield-lock',   label: 'Security',   adminOnly: true },
  { to: '/scan/rent',      icon: 'bi-box-arrow-up',  label: 'Rent',       adminOnly: true },
  { to: '/scan/ocrreturn', icon: 'bi-arrow-return-left', label: 'OCR Return', adminOnly: true },
  { to: '/scan/printneed', icon: 'bi-printer', label: 'Print need', adminOnly: true },
]
const viewerTabs = [
  { to: '/viewer',       icon: 'bi-eye',     label: 'ดูเอกสาร',  adminOnly: false },
  { to: '/viewer/print', icon: 'bi-printer', label: 'OCR Print', adminOnly: false },
]
const currentTabs = computed(() => isScanApp.value ? scanTabs : viewerTabs)
const activePageTitle = computed(() => currentTabs.value.find(tab => tab.to === route.path)?.label || '')

// When treat is selected from HnBar — viewer will watch patientStore reactively
function onTreatSelected() {
  // ViewerView and ViewerPrintView watch patientStore.viewerPatient
}

onMounted(async () => {
  authStore.init()
  if (authStore.isLoggedIn) {
    await patientStore.loadHnConfig()
    await scanStore.loadForms()
  }
})

watch(() => authStore.isLoggedIn, async (loggedIn) => {
  if (loggedIn) {
    await patientStore.loadHnConfig()
    await scanStore.loadForms()
  }
})
</script>

<style scoped>
.emr-app-header { min-height: 68px; padding-inline: clamp(1rem, 2.5vw, 2.25rem); background-image: linear-gradient(105deg, #123753 0%, #155e9a 58%, #1689ad 100%); }
.emr-brand-logo { width: auto; height: 42px; max-width: clamp(64px, 8vw, 116px); object-fit: contain; box-shadow: 0 2px 8px rgba(4, 25, 42, .28); }
.emr-brand-copy h1 { font-size: 1rem; letter-spacing: .01em; }
.emr-brand-copy p { font-size: .8125rem; }
.emr-app-nav { min-height: 56px; padding-inline: clamp(.75rem, 2vw, 2rem); gap: .2rem; box-shadow: 0 2px 5px rgba(15, 42, 60, .04); }
.emr-app-switcher { padding-right: .8rem; margin-right: .3rem; }
.emr-app-switcher a { padding: .5rem .9rem; font-size: .875rem; }
.emr-app-nav > a, .emr-app-nav > span { min-height: 54px; }
.emr-app-nav > a[aria-current="page"] { color: #155e9a; border-color: #19a6bf; background: linear-gradient(180deg, transparent, rgba(22,137,173,.06)); }
.emr-app-shell main { background: radial-gradient(ellipse at 50% 0, rgba(207,232,241,.25), transparent 70%), #f1f6fa; }
@media (max-width: 1050px) {
  .emr-app-nav { overflow-x: auto; overflow-y: visible; white-space: nowrap; }
  .emr-app-shell main.p-5 { padding: .75rem; }
}
@media (max-width: 680px) {
  .emr-app-header { min-height: 58px; padding: .5rem .75rem; gap: .55rem; }
  .emr-brand-logo { width: auto; height: 34px; max-width: 86px; }
  .emr-brand-copy h1 { font-size: .9rem; }
  .emr-brand-copy p { font-size: .75rem; }
  .emr-app-nav { padding-inline: .5rem; }
  .emr-app-switcher { padding-right: .35rem; margin-right: .2rem; }
  .emr-app-switcher a { padding-inline: .55rem; }
}
</style>
