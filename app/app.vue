<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useChat } from "~/stores/useChat";

const online = ref(true);
const chat = useChat();

onMounted(() => {
  chat.ensureHydrated();
  online.value = navigator.onLine;
  window.addEventListener("online", () => (online.value = true));
  window.addEventListener("offline", () => (online.value = false));
});
</script>

<template>
  <div>
    <NavBar />
    <div v-if="!online" class="bg-amber-400 text-black px-4 py-2 text-center">
      Mode hors-ligne — consultation et recherche disponibles
    </div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
