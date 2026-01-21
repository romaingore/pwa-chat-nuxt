<script setup lang="ts">
import { useBattery } from "~/composables/useBattery";

defineProps<{
  roomName: string;
  stats: {
    total: number;
    mediaCount: number;
    lastActivity: string | null;
  };
}>();

defineEmits<{
  (e: "leave"): void;
}>();

// Batterie (géré localement dans le header)
const { isSupported: batterySupported, level: batteryLevel, charging, getBatteryColor } = useBattery();
</script>

<template>
  <header class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p class="text-xs uppercase tracking-[0.4em] text-emerald-300/70">
        Salon
      </p>
      <h1 class="text-3xl font-semibold text-white">
        #{{ roomName }}
      </h1>
      <p class="mt-2 text-sm text-slate-400">
        Historique disponible hors ligne. Dernière activité
        <span v-if="stats.lastActivity" class="font-medium text-slate-200">
          {{ stats.lastActivity }}
        </span>
        <span v-else class="font-medium text-slate-200">inconnue</span>.
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <div
        class="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200"
      >
        {{ stats.total }} message{{ stats.total === 1 ? "" : "s" }}
      </div>
      <div
        class="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-xs font-semibold text-slate-300"
      >
        {{ stats.mediaCount }} média{{ stats.mediaCount === 1 ? "" : "s" }}
      </div>
      <!-- Batterie -->
      <div
        v-if="batterySupported"
        class="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-xs font-semibold"
        :class="getBatteryColor()"
      >
        <span>{{ charging ? '🔌' : '🔋' }}</span>
        <span>{{ batteryLevel }}%</span>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-full border border-red-500/70 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
        @click="$emit('leave')"
      >
        ✕ Quitter
      </button>
    </div>
  </header>
</template>
