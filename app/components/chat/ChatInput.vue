<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  isLoadingGeo: boolean;
}>();

const emit = defineEmits<{
  (e: "send", text: string): void;
  (e: "toggleCamera"): void;
  (e: "shareLocation"): void;
}>();

const messageInput = ref("");

function onSend() {
  const text = messageInput.value.trim();
  if (!text) return;

  emit("send", text);
  messageInput.value = "";
}
</script>

<template>
  <form
    @submit.prevent="onSend"
    class="flex items-center gap-4 border-t border-slate-800/60 bg-slate-950/30 p-4 sm:px-6 sm:py-5"
  >
    <button
      type="button"
      class="rounded-full bg-slate-800 p-3 text-slate-400 transition hover:bg-slate-700 hover:text-white"
      @click="$emit('toggleCamera')"
      title="Prendre une photo"
    >
      📸
    </button>

    <button
      type="button"
      class="rounded-full bg-slate-800 p-3 text-slate-400 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
      :disabled="isLoadingGeo"
      @click="$emit('shareLocation')"
      title="Partager ma position"
    >
      {{ isLoadingGeo ? '⏳' : '📍' }}
    </button>

    <input
      v-model="messageInput"
      type="text"
      placeholder="Écrivez votre message..."
      class="w-full flex-1 rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
    />

    <button
      type="submit"
      :disabled="!messageInput.trim()"
      class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Envoyer
    </button>
  </form>
</template>
