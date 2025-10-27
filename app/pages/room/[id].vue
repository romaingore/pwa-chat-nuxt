<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, navigateTo } from "#imports";
import { useChat } from "~/stores/useChat";
import { useProfile } from "~/stores/useProfile";

const route = useRoute();
const roomId = route.params.id as string;

const chat = useChat();
const profileStore = useProfile();
const { data: profile } = storeToRefs(profileStore);

chat.ensureHydrated();

const { rooms } = storeToRefs(chat);

const roomMeta = computed(() => {
  const target = rooms.value.find((r) => r.id === roomId);
  return {
    name: target?.name ?? roomId,
    joined: target?.joined ?? false,
  };
});

// on affiche uniquement les messages appartenant à cette room
const list = computed(() => chat.byRoom(roomId));

const stats = computed(() => {
  const messages = list.value;
  const withMedia = messages.filter((m) => Boolean(m.photoDataUrl));
  const lastTs = messages.at(-1)?.ts;
  return {
    total: messages.length,
    mediaCount: withMedia.length,
    lastActivity: lastTs ? new Date(lastTs).toLocaleString() : null,
  };
});

const selfPseudo = computed(() => profile.value.pseudo.trim().toLowerCase());

const formattedMessages = computed(() =>
  list.value.map((message) => {
    const isSelf =
      message.author.trim().toLowerCase() === selfPseudo.value &&
      !!selfPseudo.value;
    return {
      ...message,
      isSelf,
      time: new Date(message.ts).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: new Date(message.ts).toLocaleDateString(),
    };
  })
);

function unsubscribe() {
  chat.leaveRoom(roomId);
  navigateTo("/reception");
}
</script>

<template>
  <section
    class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100"
  >
    <div class="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12">
      <header
        class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-emerald-300/70">
            Salon
          </p>
          <h1 class="text-3xl font-semibold text-white">
            #{{ roomMeta.name }}
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
          <button
            class="inline-flex items-center gap-2 rounded-full border border-red-500/70 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
            @click="unsubscribe"
          >
            ✕ Quitter
          </button>
        </div>
      </header>

      <div
        class="flex min-h-[26rem] flex-col overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/50 shadow-xl shadow-slate-950/40"
      >
        <div class="flex-1 space-y-5 overflow-y-auto px-6 py-10">
          <div
            v-if="formattedMessages.length === 0"
            class="text-center text-sm text-slate-400"
          >
            Aucun message enregistré pour ce salon. Rejoignez la conversation
            depuis la réception.
          </div>

          <template v-else>
            <div
              v-for="message in formattedMessages"
              :key="message.id"
              class="flex"
              :class="message.isSelf ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[80%] space-y-2 rounded-3xl border px-5 py-4 shadow-lg transition"
                :class="
                  message.isSelf
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-50 shadow-emerald-950/50'
                    : 'border-slate-800 bg-slate-900/80 text-slate-100 shadow-slate-950/40'
                "
              >
                <div
                  class="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.3em]"
                >
                  <span
                    class="font-semibold"
                    :class="
                      message.isSelf ? 'text-emerald-200' : 'text-slate-300'
                    "
                  >
                    {{ message.author }}
                  </span>
                  <span
                    :class="
                      message.isSelf ? 'text-emerald-200/70' : 'text-slate-400'
                    "
                  >
                    {{ message.time }}
                  </span>
                </div>

                <p v-if="message.text" class="text-sm leading-relaxed">
                  {{ message.text }}
                </p>

                <img
                  v-if="message.photoDataUrl"
                  :src="message.photoDataUrl"
                  alt="photo envoyée"
                  class="max-h-56 w-full rounded-2xl border border-white/10 object-cover"
                  loading="lazy"
                />

                <p
                  class="text-[0.65rem] uppercase tracking-[0.3em]"
                  :class="
                    message.isSelf ? 'text-emerald-200/60' : 'text-slate-500'
                  "
                >
                  {{ message.date }}
                </p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
