<template>
  <div class="relative w-full h-28 overflow-hidden bg-gray-100" :aria-busy="state === 'loading'">
    <div v-if="state === 'loading'" class="absolute inset-0 animate-pulse motion-reduce:animate-none bg-gray-200" aria-hidden="true" />
    <img
      ref="image"
      :key="src"
      :src="src"
      :alt="alt"
      loading="lazy"
      decoding="async"
      class="relative w-full h-full object-cover transition-opacity duration-150"
      :class="state === 'loaded' ? 'opacity-100' : 'opacity-0'"
      @load="onLoad"
      @error="onError"
    />
    <div v-if="state === 'error'" class="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-400" role="img" :aria-label="`${alt} โหลดไม่สำเร็จ`">
      <i class="bi bi-image-alt text-xl" aria-hidden="true" />
      <span class="text-[10px]">โหลดรูปไม่สำเร็จ</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'

const props = defineProps<{ src: string; alt: string }>()
const state = ref<'loading' | 'loaded' | 'error'>('loading')
const image = ref<HTMLImageElement | null>(null)
let requestId = 0

function syncCachedImage() {
  const id = ++requestId
  state.value = 'loading'
  nextTick(() => {
    if (id !== requestId) return
    if (image.value?.complete) state.value = image.value.naturalWidth > 0 ? 'loaded' : 'error'
  })
}

function onLoad(event: Event) {
  if ((event.currentTarget as HTMLImageElement).src === new URL(props.src, window.location.href).href) state.value = 'loaded'
}
function onError(event: Event) {
  if ((event.currentTarget as HTMLImageElement).src === new URL(props.src, window.location.href).href) state.value = 'error'
}

watch(() => props.src, syncCachedImage)
onMounted(syncCachedImage)
</script>
