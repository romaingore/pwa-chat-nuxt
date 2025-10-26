<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useProfile } from "~/stores/useProfile";
import { useCamera } from "~/composables/useCamera";
import type { Room } from "~/types/chat";

const profileStore = useProfile();
const { data: profile } = storeToRefs(profileStore);

const pseudo = ref(profile.value.pseudo);
const photo = ref<string | undefined>(profile.value.photoDataUrl);

const availableRooms = ref<Room[]>([
  { id: "general", name: "Général", joined: false },
  { id: "random", name: "Random", joined: false },
]);

const roomDescriptions: Record<string, string> = {
  general: "Le salon principal pour discuter de tout et de rien.",
  random: "Partagez vos trouvailles, memes et inspirations.",
};

watch(
  profile,
  (value) => {
    pseudo.value = value.pseudo;
    photo.value = value.photoDataUrl;
  },
  { deep: true }
);

const pseudoInitial = computed(() => {
  const initial = pseudo.value.trim().charAt(0);
  return initial ? initial.toUpperCase() : "?";
});

const {
  videoEl: previewVideoEl,
  isPreviewing,
  startPreview,
  stopPreview,
  capture,
} = useCamera();

async function handleCapture() {
  try {
    photo.value = await capture();
  } catch (error) {
    console.warn("Capture impossible", error);
  }
}

function saveProfile() {
  profileStore.save({ pseudo: pseudo.value, photoDataUrl: photo.value });
}
</script>

<template>
  <section
    class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100"
  >
    <div class="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
      <header class="space-y-2 text-center lg:text-left">
        <p class="text-sm uppercase tracking-[0.3em] text-emerald-400">
          Salon de discussion
        </p>
        <h1 class="text-3xl font-semibold sm:text-4xl">
          Préparez votre arrivée
        </h1>
        <p class="text-sm text-slate-400 sm:text-base">
          Personnalisez votre profil et choisissez un salon pour démarrer la
          conversation.
        </p>
      </header>

      <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          class="group relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/60 px-8 py-10 shadow-xl shadow-slate-950/40 backdrop-blur"
          @submit.prevent="saveProfile"
        >
          <div
            class="absolute inset-x-10 top-0 h-20 rounded-b-full bg-emerald-500/10 blur-3xl"
          ></div>
          <div class="relative flex flex-col gap-8">
            <div>
              <h2 class="text-lg font-semibold">Mon profil</h2>
              <p class="mt-1 text-sm text-slate-400">
                Un pseudo clair et une photo rendent les échanges plus
                chaleureux.
              </p>
            </div>

            <label class="flex flex-col gap-2">
              <span
                class="text-xs font-medium uppercase tracking-widest text-slate-400"
                >Pseudo</span
              >
              <input
                class="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="Votre pseudo"
                v-model="pseudo"
              />
            </label>

            <div class="space-y-3">
              <span
                class="text-xs font-medium uppercase tracking-widest text-slate-400"
                >Photo de profil</span
              >
              <div class="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div class="flex flex-col items-center gap-3">
                  <div
                    class="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-3xl font-semibold text-slate-500"
                  >
                    <video
                      v-if="isPreviewing"
                      ref="previewVideoEl"
                      autoplay
                      playsinline
                      muted
                      class="h-full w-full object-cover"
                    ></video>
                    <img
                      v-else-if="photo"
                      :src="photo"
                      alt="photo de profil"
                      class="h-full w-full object-cover"
                    />
                    <span v-else>{{ pseudoInitial }}</span>
                  </div>
                  <div class="flex flex-wrap justify-center gap-2">
                    <button
                      v-if="!isPreviewing"
                      type="button"
                      class="inline-flex items-center gap-2 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      @click="startPreview"
                    >
                      🎥 Prévisualiser
                    </button>
                    <button
                      v-else
                      type="button"
                      class="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      @click="stopPreview"
                    >
                      ✕ Fermer
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                      @click="handleCapture"
                    >
                      📸 Capturer
                    </button>
                  </div>
                </div>
                <p class="text-sm text-slate-400 sm:max-w-[15rem]">
                  Utilisez la caméra pour une prise de vue instantanée. Vous
                  pourrez toujours revenir mettre à jour votre photo.
                </p>
              </div>
            </div>

            <div
              class="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 px-5 py-4 text-sm text-slate-400"
            >
              <div class="flex items-center gap-3 text-slate-200">
                <span
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-300"
                >
                  i
                </span>
                <p class="text-sm font-medium text-slate-200">Conseil</p>
              </div>
              <p>
                Gardez votre pseudo court et facile à retenir. Les autres
                participants vous identifieront en un coup d'oeil.
              </p>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                class="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              >
                💾 Enregistrer mon profil
              </button>
            </div>
          </div>
        </form>

        <aside
          class="flex flex-col gap-6 rounded-3xl border border-slate-800/60 bg-slate-900/50 px-8 py-10 shadow-xl shadow-slate-950/40 backdrop-blur"
        >
          <div>
            <h3 class="text-lg font-semibold">Rooms disponibles</h3>
            <p class="mt-1 text-sm text-slate-400">
              Découvrez les salons publics et rejoignez la discussion qui vous
              inspire le plus.
            </p>
          </div>

          <div class="space-y-4">
            <NuxtLink
              v-for="r in availableRooms"
              :key="r.id"
              :to="`/room/${r.id}`"
              class="group flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 px-5 py-4 transition hover:border-emerald-400/70 hover:bg-emerald-500/10"
            >
              <div>
                <p
                  class="text-base font-medium text-slate-100 group-hover:text-white"
                >
                  {{ r.name }}
                </p>
                <p class="text-xs text-slate-400">
                  {{
                    roomDescriptions[r.id] ??
                    "Rejoignez la conversation en temps réel."
                  }}
                </p>
              </div>
              <span
                class="rounded-full border border-emerald-500/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-300 transition group-hover:border-emerald-400 group-hover:text-emerald-200"
              >
                Entrer
              </span>
            </NuxtLink>
          </div>

          <div
            class="rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/30 px-5 py-4 text-sm text-slate-400"
          >
            De nouveaux salons thématiques arrivent bientôt. Vous pouvez
            conserver vos conversations hors ligne: elles seront synchronisées
            dès que possible.
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>
