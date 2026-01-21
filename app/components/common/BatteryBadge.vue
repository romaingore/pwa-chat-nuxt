<script setup lang="ts">
import { useBattery } from "~/composables/useBattery";

const { isSupported, level, charging, getBatteryColor } = useBattery();
</script>

<template>
  <div
    v-if="isSupported"
    class="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-xs font-semibold"
    :class="getBatteryColor()"
  >
    <span>{{ charging ? "🔌" : "🔋" }}</span>
    <span>{{ level }}%</span>
  </div>
</template>
