<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, navigateTo } from "#imports";
import { useChat } from "~/stores/useChat";
import { useProfile } from "~/stores/useProfile";
import { useCamera } from "~/composables/useCamera";

const route = useRoute();
const roomId = route.params.id as string;

const chat = useChat();
const profileStore = useProfile();
const { data: profile } = storeToRefs(profileStore);

// S'assurer que les données sont hydratées
chat.ensureHydrated();

// Rejoindre la room au montage de la page
onMounted(() => {
  const pseudo = profile.value.pseudo || "Anonyme";
  chat.joinRoom(roomId, pseudo);
});

const { rooms } = storeToRefs(chat);

const roomMeta = computed(() => {
  const target = rooms.value.find((r) => r.id === roomId);
  return {
    name: target?.name ?? roomId,
    joined: target?.joined ?? false,
  };
});

// Messages de cette room uniquement
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

// ===== ENVOI DE MESSAGE =====
const messageInput = ref("");

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  chat.sendMessage(text, roomId);
  messageInput.value = "";
}

// ===== CAMERA =====
const {
  videoEl: previewVideoEl,
  startPreview,
  stopPreview,
  capture,
} = useCamera();

const showCamera = ref(false);

async function toggleCamera() {
  if (showCamera.value) {
    closeCamera();
  } else {
    showCamera.value = true;
    await startPreview();
  }
}

function closeCamera() {
  showCamera.value = false;
  stopPreview();
}

async function capturePhoto() {
  try {
    const photo = await capture();
    if (photo) {
      chat.sendMessage("", roomId, photo);
    }
  } catch (error) {
    console.warn("Capture impossible", error);
  } finally {
    closeCamera();
  }
}

// ===== QUITTER =====
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
      <!-- Header -->
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

      <!-- Zone de chat -->
      <div
        class="flex min-h-[26rem] flex-col overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/50 shadow-xl shadow-slate-950/40"
      >
        <!-- Messages -->
        <div class="flex-1 space-y-5 overflow-y-auto px-6 py-10">
          <div
            v-if="formattedMessages.length === 0"
            class="text-center text-sm text-slate-400"
          >
            Aucun message dans ce salon. Soyez le premier à écrire !
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

        <!-- Camera popup -->
        <div v-if="showCamera" class="relative flex flex-col items-center">
          <div
            class="absolute bottom-20 z-20 flex w-72 flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl"
          >
            <div class="relative overflow-hidden rounded-lg bg-black">
              <video
                ref="previewVideoEl"
                autoplay
                playsinline
                muted
                class="aspect-square w-full object-cover"
              ></video>
            </div>
            <div class="flex justify-between gap-2">
              <button
                type="button"
                class="flex-1 rounded-lg border border-slate-600 bg-slate-800 py-2 text-xs font-semibold hover:bg-slate-700"
                @click="closeCamera"
              >
                Annuler
              </button>
              <button
                type="button"
                class="flex-1 rounded-lg bg-emerald-500 py-2 text-xs font-semibold text-slate-900 hover:bg-emerald-400"
                @click="capturePhoto"
              >
                Capturer
              </button>
            </div>
          </div>
        </div>

        <!-- Barre d'envoi -->
        <form
          @submit.prevent="sendMessage"
          class="flex items-center gap-4 border-t border-slate-800/60 bg-slate-950/30 p-4 sm:px-6 sm:py-5"
        >
          <button
            type="button"
            class="rounded-full bg-slate-800 p-3 text-slate-400 transition hover:bg-slate-700 hover:text-white"
            @click="toggleCamera"
            title="Prendre une photo"
          >
            📸
          </button>

          <input
            v-model="messageInput"
            type="text"
            placeholder="Écrivez votre message..."
            class="w-full flex-1 rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />

          <button
            type="submit"
            :disabled="!messageInput.trim()"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
