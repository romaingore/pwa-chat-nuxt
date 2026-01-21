<script setup lang="ts">
import type { Room } from "~/types/chat";

defineProps<{
  rooms: Room[];
  isLoading: boolean;
  isPseudoValid: boolean;
}>();

// Descriptions par défaut pour certaines rooms connues
const roomDescriptions: Record<string, string> = {
  general: "Le salon principal pour discuter de tout et de rien.",
  random: "Partagez vos trouvailles, memes et inspirations.",
};
</script>

<template>
  <aside
    class="flex flex-col gap-6 rounded-3xl border border-slate-800/60 bg-slate-900/50 px-8 py-10 shadow-xl shadow-slate-950/40 backdrop-blur w-full min-w-0"
  >
    <div>
      <h3 class="text-lg font-semibold">Rooms disponibles</h3>
      <p class="mt-1 text-sm text-slate-400">
        Découvrez les salons publics et rejoignez la discussion qui vous inspire
        le plus.
      </p>
    </div>

    <div class="space-y-4">
      <!-- État de chargement -->
      <div
        v-if="isLoading"
        class="flex items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 px-5 py-8"
      >
        <div
          class="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"
        ></div>
        <span class="text-sm text-slate-400">Chargement des salons...</span>
      </div>

      <!-- Aucune room disponible -->
      <div
        v-else-if="rooms.length === 0"
        class="rounded-2xl border border-slate-800 bg-slate-950/40 px-5 py-8 text-center text-sm text-slate-400"
      >
        Aucun salon disponible pour le moment.
      </div>

      <!-- Liste des rooms -->
      <template v-else>
        <NuxtLink
          v-for="r in rooms"
          :key="r.id"
          :to="isPseudoValid ? `/room/${r.id}` : undefined"
          :class="[
            'group flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 transition',
            isPseudoValid
              ? 'border-slate-800 bg-slate-950/40 hover:border-emerald-400/70 hover:bg-emerald-500/10 cursor-pointer'
              : 'border-slate-800/50 bg-slate-950/20 opacity-50 cursor-not-allowed',
          ]"
          @click.prevent="!isPseudoValid && undefined"
        >
          <div class="flex-1 min-w-0">
            <p
              class="text-base font-medium text-slate-100 group-hover:text-white truncate"
            >
              {{ r.name }}
            </p>
            <p class="text-xs text-slate-400 truncate">
              {{
                roomDescriptions[r.id] ??
                "Rejoignez la conversation en temps réel."
              }}
            </p>
          </div>
          <span
            class="shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest transition"
            :class="
              isPseudoValid
                ? 'border-emerald-500/60 text-emerald-300 group-hover:border-emerald-400 group-hover:text-emerald-200'
                : 'border-slate-700 text-slate-500'
            "
          >
            {{ isPseudoValid ? "Entrer" : "Pseudo requis" }}
          </span>
        </NuxtLink>
      </template>
    </div>

    <div
      class="rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/30 px-5 py-4 text-sm text-slate-400"
    >
      De nouveaux salons thématiques arrivent bientôt. Vous pouvez conserver vos
      conversations hors ligne: elles seront synchronisées dès que possible.
    </div>
  </aside>
</template>
