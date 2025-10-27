<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, navigateTo } from "#imports";
import { useChat } from "~/stores/useChat";

const route = useRoute();
const roomId = route.params.id as string;

const chat = useChat();
const { messages } = storeToRefs(chat);

chat.ensureHydrated();

// on affiche uniquement les messages appartenant à cette room
const list = computed(() => chat.byRoom(roomId));

function unsubscribe() {
  chat.leaveRoom(roomId);
  navigateTo("/reception");
}
</script>

<template>
  <section class="p-6 space-y-4">
    <h2 class="text-xl font-semibold">Room : {{ roomId }}</h2>

    <!-- Historique de la conversation -->
    <div
      class="space-y-2 max-h-[70vh] overflow-y-auto border p-2 rounded bg-gray-50"
    >
      <div v-if="list.length === 0" class="text-gray-500 text-center">
        Aucun message enregistré pour cette conversation.
      </div>

      <div v-for="m in list" :key="m.id" class="border-b pb-2 mb-2">
        <div class="text-xs text-gray-500">
          {{ new Date(m.ts).toLocaleString() }}
        </div>
        <strong>{{ m.author }}</strong>
        <p v-if="m.text">{{ m.text }}</p>
        <img
          v-if="m.photoDataUrl"
          :src="m.photoDataUrl"
          class="max-h-48 mt-2 rounded border"
        />
      </div>
    </div>

    <!-- Bouton de désinscription -->
    <div class="flex justify-end">
      <button
        class="border px-3 py-2 rounded text-red-600"
        @click="unsubscribe"
      >
        Quitter la conversation
      </button>
    </div>
  </section>
</template>
