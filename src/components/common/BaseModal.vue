<template>
  <Teleport to="body" :disabled="embedded">
    <Transition name="modal">
      <div
        v-if="modelValue"
        :class="embedded ? 'emr-embedded-modal' : 'fixed inset-0 z-50 flex items-center justify-center'"
        :style="{ zIndex }"
        @mousedown.self="onBackdropDown"
        @mouseup.self="onBackdropUp"
      >
        <!-- Backdrop -->
        <div v-if="!embedded" class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

        <!-- Panel -->
        <div
          class="emr-modal-panel relative bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
          :style="{ width: embedded ? '100%' : `min(${width}, calc(100vw - 24px))`, maxHeight: embedded ? 'none' : '90dvh' }"
        >
          <!-- Header -->
          <div class="emr-modal-header flex items-center gap-2 px-5 py-3 border-b border-gray-100 shrink-0">
            <i v-if="icon" :class="['bi', icon, 'text-blue-800']" />
            <span class="font-semibold text-blue-900 text-sm">{{ title }}</span>
            <div class="ml-auto flex items-center gap-2">
              <slot name="header-actions" />
              <button
                v-if="!embedded"
                class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded p-1"
                @click="emit('update:modelValue', false)"
              >
                <i class="bi bi-x-lg text-sm" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-5 py-4">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-5 py-3 border-t border-gray-100 flex gap-2 justify-end shrink-0">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  icon?: string
  width?: string
  zIndex?: number
  closeOnBackdrop?: boolean
  embedded?: boolean
}>(), {
  width: '500px',
  zIndex: 5000,
  closeOnBackdrop: true,
  embedded: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

// ปิดเฉพาะเมื่อทั้ง mousedown และ mouseup เกิดบน backdrop ตัวเดียวกัน
// ป้องกันกรณีลาก select ข้อความในช่อง input แล้วปล่อยเมาส์เลยออกมาโดน backdrop (จะไม่ปิด)
const downOnBackdrop = ref(false)

function onBackdropDown() {
  downOnBackdrop.value = true
}

function onBackdropUp() {
  if (props.closeOnBackdrop && downOnBackdrop.value) {
    emit('update:modelValue', false)
  }
  downOnBackdrop.value = false
}
</script>

<style scoped>
.emr-modal-panel { border: 1px solid #dce8ef; border-radius: 16px; box-shadow: 0 24px 80px rgba(12,45,68,.2); }
.emr-embedded-modal { width:100%; }
.emr-embedded-modal .emr-modal-panel { border:0; border-radius:0; box-shadow:none; }
.emr-modal-header { min-height: 58px; background: linear-gradient(180deg, #f4f9fb, #fff); }
.emr-modal-header > span { font-size: .95rem; color: #123753; }
.emr-modal-panel :deep(.form-input), .emr-modal-panel :deep(.form-select) { min-height: 42px; }
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .relative, .modal-leave-to .relative { transform: scale(0.96) translateY(8px); }
</style>
