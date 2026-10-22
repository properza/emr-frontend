<template>
  <svg
    class="file-text-icon"
    :class="[{ 'animate-hover': animateOnHover }, `animation-${animation}`]"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      class="document-outline"
      pathLength="1"
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    />
    <path class="fold" pathLength="1" d="M14 2v6h6M8 13h8M8 17h8" />
  </svg>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ animateOnHover?: boolean; animation?: "path" }>(), {
  animateOnHover: true,
  animation: "path",
});
</script>
<style scoped>
.file-text-icon {
  width: 1.5em;
  height: 1.5em;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.document-outline,
.fold {
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  animation: draw 3s ease-in-out infinite;
}
.fold {
  animation-delay: 0.14s;
}
.animate-hover:hover .document-outline,
.animate-hover:hover .fold {
  animation-duration: 0.75s;
}
@keyframes draw {
  0%,
  72%,
  100% {
    stroke-dashoffset: 0;
  }
  35% {
    stroke-dashoffset: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .document-outline,
  .fold {
    animation: none;
  }
}
</style>
