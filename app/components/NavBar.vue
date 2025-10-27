<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "#imports";

const route = useRoute();

const links = [
  { to: "/", label: "Accueil" },
  { to: "/reception", label: "Réception" },
  { to: "/gallery", label: "Galerie" },
];

const currentPath = computed(() => route.path);
</script>

<template>
  <nav
    class="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur"
  >
    <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
      <NuxtLink to="/" class="flex items-center gap-2">
        <span
          class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-lg font-semibold text-slate-950 shadow-glow"
        >
          ✦
        </span>
        <div class="leading-tight">
          <p class="text-sm uppercase tracking-[0.35em] text-emerald-300/80">
            PWA Chat
          </p>
          <p class="text-base font-semibold text-white">Nuxt Messenger</p>
        </div>
      </NuxtLink>

      <div class="flex items-center gap-2 sm:gap-4">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition"
          :class="
            currentPath.startsWith(link.to) && link.to !== '/'
              ? 'bg-emerald-500/15 text-white'
              : currentPath === link.to
              ? 'bg-emerald-500/15 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
          "
        >
          {{ link.label }}
          <span
            v-if="
              (link.to !== '/' && currentPath.startsWith(link.to)) ||
              currentPath === link.to
            "
            class="absolute inset-0 rounded-full ring-1 ring-emerald-400/60"
          ></span>
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>
