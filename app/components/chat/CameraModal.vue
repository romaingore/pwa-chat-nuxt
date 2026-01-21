<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useCamera } from "~/composables/useCamera";

const emit = defineEmits<{
  (e: "capture", photo: string): void;
  (e: "close"): void;
}>();

const {
  videoEl,
  startPreview,
  stopPreview,
  capture,
} = useCamera();

async function handleCapture() {
  const photo = await capture();
  if (photo) {
    emit("capture", photo);
  }
}

onMounted(() => {
  startPreview();
});

onUnmounted(() => {
  stopPreview();
});
</script>

<template>
  <div class="relative flex flex-col items-center">
    <div
      class="absolute bottom-20 z-20 flex w-72 flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl"
    >
      <div class="relative overflow-hidden rounded-lg bg-black">
        <video
          ref="videoEl"
          autoplay
          playsinline
          muted
          class="aspect-square w-full object-cover"
        ></video>
      </div>
      <div class="flex justify-between gap-2">
        <button
          type="button"
          class="flex-1 rounded-lg border border-slate-600 bg-slate-800 py-2 text-xs font-semibold hover:bg-slate-700"
          @click="$emit('close')"
        >
          Annuler
        </button>
        <button
          type="button"
          class="flex-1 rounded-lg bg-emerald-500 py-2 text-xs font-semibold text-slate-900 hover:bg-emerald-400"
          @click="handleCapture"
        >
          Capturer
        </button>
      </div>
    </div>
  </div>
</template>
