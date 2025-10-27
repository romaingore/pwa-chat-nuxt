<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useChat } from "~/stores/useChat";

const chat = useChat();
chat.ensureHydrated();

const search = ref("");

const { messages, rooms } = storeToRefs(chat);

const roomsById = computed(() =>
  rooms.value.reduce<Record<string, string>>((acc, room) => {
    acc[room.id] = room.name;
    return acc;
  }, {})
);

const allPhotos = computed(() =>
  messages.value
    .filter((m) => Boolean(m.photoDataUrl))
    .map((m) => ({
      id: m.id,
      roomId: m.roomId,
      roomName: roomsById.value[m.roomId] ?? m.roomId,
      author: m.author,
      src: m.photoDataUrl as string,
      ts: m.ts,
      timeLabel: new Date(m.ts).toLocaleString(),
    }))
    .sort((a, b) => b.ts - a.ts)
);

const galleryStats = computed(() => {
  const total = allPhotos.value.length;
  const roomCount = new Set(allPhotos.value.map((p) => p.roomId)).size;
  const authorCount = new Set(allPhotos.value.map((p) => p.author)).size;
  return { total, rooms: roomCount, authors: authorCount };
});

const photos = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return allPhotos.value;

  return allPhotos.value.filter((photo) =>
    [photo.author, photo.roomId, photo.roomName]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(term))
  );
});
</script>

<template>
  <section class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
    <div class="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-12">
      <header class="space-y-4 text-center sm:text-left">
        <p class="text-xs uppercase tracking-[0.4em] text-emerald-300/80">Souvenirs</p>
        <h1 class="text-3xl font-semibold text-white sm:text-4xl">Galerie partagée</h1>
        <p class="text-sm text-slate-400 sm:max-w-2xl">
          Toutes vos photos capturées dans les salons sont accessibles ici, même sans connexion. Filtrez par auteur ou par
          salon pour retrouver rapidement un instant clé.
        </p>
      </header>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="grid w-full gap-3 sm:w-auto sm:grid-flow-col sm:gap-4">
          <span class="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
            {{ galleryStats.total }} photo{{ galleryStats.total === 1 ? "" : "s" }}
          </span>
          <span class="rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
            {{ galleryStats.rooms }} salon{{ galleryStats.rooms === 1 ? "" : "s" }}
          </span>
          <span class="rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
            {{ galleryStats.authors }} auteur{{ galleryStats.authors === 1 ? "" : "s" }}
          </span>
        </div>

        <div class="w-full max-w-md">
          <label class="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm text-slate-300 focus-within:border-emerald-400/70 focus-within:ring-2 focus-within:ring-emerald-500/30">
            <span class="text-base text-slate-500">🔍</span>
            <input
              v-model="search"
              type="search"
              placeholder="Filtrer par auteur ou salon"
              class="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </label>
        </div>
      </div>

      <div
        v-if="photos.length === 0"
        class="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-700/80 bg-slate-950/40 px-10 py-20 text-center"
      >
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl text-emerald-300">
          📷
        </div>
        <h2 class="text-lg font-semibold text-white">Aucune photo ne correspond à votre recherche</h2>
        <p class="max-w-sm text-sm text-slate-400">
          Capturez un nouveau souvenir depuis la réception ou ajustez votre filtre pour afficher davantage de contenus.
        </p>
      </div>

      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="photo in photos"
          :key="photo.id"
          class="group relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/60 shadow-lg shadow-slate-950/40 transition hover:border-emerald-400/50 hover:shadow-glow"
        >
          <img
            :src="photo.src"
            :alt="`Photo partagée par ${photo.author}`"
            class="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div class="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-5">
            <div class="flex items-center justify-between text-xs text-slate-300">
              <span class="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 font-semibold">
                #{{ photo.roomName }}
              </span>
              <span class="text-slate-400">{{ photo.timeLabel }}</span>
            </div>
            <p class="text-sm font-medium text-white">
              Par {{ photo.author }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
