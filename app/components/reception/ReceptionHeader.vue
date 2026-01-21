<script setup lang="ts">
import { useBattery } from "~/composables/useBattery";

// Batterie
const {
  isSupported: batterySupported,
  level: batteryLevel,
  charging,
  getBatteryColor,
} = useBattery();
</script>

<template>
  <header class="space-y-2 text-center lg:text-left">
    <div class="flex items-center justify-between">
      <p class="text-sm uppercase tracking-[0.3em] text-emerald-400">
        Salon de discussion
      </p>
      <!-- Batterie -->
      <div
        v-if="batterySupported"
        class="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-xs font-semibold"
        :class="getBatteryColor()"
      >
        <span>{{ charging ? "🔌" : "🔋" }}</span>
        <span>{{ batteryLevel }}%</span>
      </div>
    </div>
    <h1 class="text-3xl font-semibold sm:text-4xl">Préparez votre arrivée</h1>
    <p class="text-sm text-slate-400 sm:text-base">
      Personnalisez votre profil et choisissez un salon pour démarrer la
      conversation.
    </p>
  </header>
</template>
