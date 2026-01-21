<script setup lang="ts">
defineProps<{
  author: string;
  text?: string;
  photoDataUrl?: string;
  time: string;
  date: string;
  isSelf: boolean;
}>();
</script>

<template>
  <div class="flex" :class="isSelf ? 'justify-end' : 'justify-start'">
    <div
      class="max-w-[80%] space-y-2 rounded-3xl border px-5 py-4 shadow-lg transition message-bubble"
      :class="
        isSelf
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-50 shadow-emerald-950/50'
          : 'border-slate-800 bg-slate-900/80 text-slate-100 shadow-slate-950/40'
      "
    >
      <div
        class="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.3em]"
      >
        <span
          class="font-semibold"
          :class="isSelf ? 'text-emerald-200' : 'text-slate-300'"
        >
          {{ author }}
        </span>
        <span :class="isSelf ? 'text-emerald-200/70' : 'text-slate-400'">
          {{ time }}
        </span>
      </div>

      <p
        v-if="text"
        class="text-sm leading-relaxed break-words whitespace-pre-wrap"
      >
        {{ text }}
      </p>

      <img
        v-if="photoDataUrl"
        :src="photoDataUrl"
        alt="photo envoyée"
        class="max-h-56 w-full rounded-2xl border border-white/10 object-cover"
        loading="lazy"
      />

      <p
        class="text-[0.65rem] uppercase tracking-[0.3em]"
        :class="isSelf ? 'text-emerald-200/60' : 'text-slate-500'"
      >
        {{ date }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.message-bubble {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
}
</style>
