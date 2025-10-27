<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useChat } from "~/stores/useChat";

const chat = useChat();
chat.ensureHydrated(); // recharge les messages si besoin

const search = ref("");

const photos = computed(() =>
  chat.messages
    .filter((m) => m.photoDataUrl)
    .filter((m) =>
      [m.author, m.roomId].some((field) =>
        field?.toLowerCase().includes(search.value.toLowerCase())
      )
    )
    .sort((a, b) => b.ts - a.ts)
);
</script>

<template>
  <section class="p-6 space-y-4">
    <h2 class="text-xl font-semibold">Galerie de photos</h2>

    <input
      v-model="search"
      placeholder="Rechercher par auteur ou room..."
      class="border rounded p-2 w-full max-w-md"
    />

    <div v-if="photos.length === 0" class="text-center text-gray-500 py-10">
      Aucune photo enregistrée.
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div
        v-for="m in photos"
        :key="m.id"
        class="border rounded overflow-hidden shadow-sm bg-white"
      >
        <img
          :src="m.photoDataUrl"
          alt="photo"
          class="object-cover w-full aspect-square"
        />
        <div class="p-2 text-xs text-gray-600">
          <div class="font-semibold">{{ m.author }}</div>
          <div class="italic">{{ m.roomId }}</div>
          <div class="text-[10px]">
            {{ new Date(m.ts).toLocaleString() }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
