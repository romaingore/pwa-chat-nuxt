<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useProfile } from "~/stores/useProfile";
import { useChat } from "~/stores/useChat";
import { useBattery } from "~/composables/useBattery";
import type { Room } from "~/types/chat";

// Batterie
const { isSupported: batterySupported, level: batteryLevel, charging, getBatteryColor } = useBattery();

const profileStore = useProfile();
const chatStore = useChat();
const { data: profile } = storeToRefs(profileStore);
const { notificationsEnabled } = storeToRefs(chatStore);

// Etat des notifications
const notificationStatus = ref<"granted" | "denied" | "default" | "unsupported">("default");

onMounted(() => {
  notificationStatus.value = chatStore.checkNotificationStatus() as typeof notificationStatus.value;
  loadRooms();
});

async function toggleNotifications() {
  if (notificationsEnabled.value) {
    return;
  }
  await chatStore.requestNotificationPermission();
  notificationStatus.value = chatStore.checkNotificationStatus() as typeof notificationStatus.value;
}

const pseudo = ref(profile.value.pseudo);

const availableRooms = ref<Room[]>([]);
const isLoadingRooms = ref(true);

// Validation du pseudo (minimum 2 caractères)
const isPseudoValid = computed(() => pseudo.value.trim().length >= 2);
const pseudoError = computed(() => {
  if (pseudo.value.trim().length === 0) return "";
  if (pseudo.value.trim().length < 2) return "Le pseudo doit contenir au moins 2 caractères";
  return "";
});

// Charge les rooms depuis l'API
async function loadRooms() {
  isLoadingRooms.value = true;
  try {
    const response = await fetch("/api/rooms");
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        availableRooms.value = Object.keys(data.data).map((roomId) => ({
          id: roomId,
          name: roomId.charAt(0).toUpperCase() + roomId.slice(1),
          joined: false,
        }));
      }
    }
  } catch (e) {
    console.error("Erreur chargement rooms:", e);
  } finally {
    isLoadingRooms.value = false;
  }
}

// Descriptions par défaut pour certaines rooms connues
const roomDescriptions: Record<string, string> = {
  general: "Le salon principal pour discuter de tout et de rien.",
  random: "Partagez vos trouvailles, memes et inspirations.",
};

watch(
  profile,
  (value) => {
    pseudo.value = value.pseudo;
  },
  { deep: true }
);

function saveProfile() {
  if (!isPseudoValid.value) return;
  profileStore.save({ pseudo: pseudo.value });
}
</script>

<template>
  <section
    class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100"
  >
    <div class="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
      <header class="space-y-2 text-center lg:text-left">
        <div class="flex items-center justify-between">
          <p class="text-sm uppercase tracking-[0.3em] text-emerald-400">
            Salon de discussion
          </p>
          <!-- Batterie -->
          <div
            v-if="batterySupported"
            class="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-xs font-semibold"
            :class="getBatteryColor()"
          >
            <span>{{ charging ? '🔌' : '🔋' }}</span>
            <span>{{ batteryLevel }}%</span>
          </div>
        </div>
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
                >Pseudo <span class="text-red-400">*</span></span
              >
              <input
                class="w-full rounded-2xl border px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2"
                :class="
                  pseudoError
                    ? 'border-red-500 bg-red-950/20 focus:border-red-400 focus:ring-red-500/30'
                    : 'border-slate-800 bg-slate-950/60 focus:border-emerald-400 focus:ring-emerald-500/30'
                "
                placeholder="Votre pseudo (min. 2 caractères)"
                v-model="pseudo"
                @input="saveProfile"
              />
              <span v-if="pseudoError" class="text-xs text-red-400">
                {{ pseudoError }}
              </span>
            </label>


            <!-- Notifications -->
            <div class="space-y-3">
              <span
                class="text-xs font-medium uppercase tracking-widest text-slate-400"
                >Notifications</span
              >
              <div
                class="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 px-5 py-4"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-full text-xl"
                    :class="
                      notificationsEnabled
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    "
                  >
                    {{ notificationsEnabled ? '🔔' : '🔕' }}
                  </span>
                  <div>
                    <p class="text-sm font-medium text-slate-200">
                      {{ notificationsEnabled ? 'Notifications activées' : 'Notifications désactivées' }}
                    </p>
                    <p class="text-xs text-slate-400">
                      <template v-if="notificationStatus === 'unsupported'">
                        Non supportées par ce navigateur
                      </template>
                      <template v-else-if="notificationStatus === 'denied'">
                        Bloquées dans les paramètres du navigateur
                      </template>
                      <template v-else-if="notificationsEnabled">
                        Vous serez alerté des nouveaux messages
                      </template>
                      <template v-else>
                        Activez pour ne rien manquer
                      </template>
                    </p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button
                    v-if="notificationStatus !== 'unsupported' && notificationStatus !== 'denied'"
                    type="button"
                    class="rounded-full px-4 py-2 text-sm font-medium transition"
                    :class="
                      notificationsEnabled
                        ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    "
                    :disabled="notificationsEnabled"
                    @click="toggleNotifications"
                  >
                    {{ notificationsEnabled ? 'Activées' : 'Activer' }}
                  </button>
                  <button
                    v-if="notificationsEnabled"
                    type="button"
                    class="rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
                    @click="chatStore.testNotification()"
                  >
                    Tester
                  </button>
                </div>
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

            <div
              v-if="isPseudoValid"
              class="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              <span>✓</span>
              <span>Profil prêt ! Vous pouvez rejoindre un salon.</span>
            </div>
            <div
              v-else
              class="flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-300"
            >
              <span>⚠</span>
              <span>Entrez un pseudo pour rejoindre un salon.</span>
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
            <!-- État de chargement -->
            <div
              v-if="isLoadingRooms"
              class="flex items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 px-5 py-8"
            >
              <div class="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
              <span class="text-sm text-slate-400">Chargement des salons...</span>
            </div>

            <!-- Aucune room disponible -->
            <div
              v-else-if="availableRooms.length === 0"
              class="rounded-2xl border border-slate-800 bg-slate-950/40 px-5 py-8 text-center text-sm text-slate-400"
            >
              Aucun salon disponible pour le moment.
            </div>

            <!-- Liste des rooms -->
            <template v-else>
              <NuxtLink
                v-for="r in availableRooms"
                :key="r.id"
                :to="isPseudoValid ? `/room/${r.id}` : undefined"
                :class="[
                  'group flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 transition',
                  isPseudoValid
                    ? 'border-slate-800 bg-slate-950/40 hover:border-emerald-400/70 hover:bg-emerald-500/10 cursor-pointer'
                    : 'border-slate-800/50 bg-slate-950/20 opacity-50 cursor-not-allowed'
                ]"
                @click.prevent="!isPseudoValid && undefined"
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
                  class="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest transition"
                  :class="
                    isPseudoValid
                      ? 'border-emerald-500/60 text-emerald-300 group-hover:border-emerald-400 group-hover:text-emerald-200'
                      : 'border-slate-700 text-slate-500'
                  "
                >
                  {{ isPseudoValid ? 'Entrer' : 'Pseudo requis' }}
                </span>
              </NuxtLink>
            </template>
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
