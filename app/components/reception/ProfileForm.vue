<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  modelValue: string;
  notificationsEnabled: boolean;
  notificationStatus: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "save"): void;
  (e: "toggleNotifications"): void;
  (e: "testNotification"): void;
}>();

const isPseudoValid = computed(() => props.modelValue.trim().length >= 2);
const pseudoError = computed(() => {
  if (props.modelValue.trim().length === 0) return "";
  if (props.modelValue.trim().length < 2)
    return "Le pseudo doit contenir au moins 2 caractères";
  return "";
});

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
  emit("save");
}
</script>

<template>
  <form
    class="group relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/60 px-8 py-10 shadow-xl shadow-slate-950/40 backdrop-blur min-w-0"
    @submit.prevent="$emit('save')"
  >
    <div
      class="absolute inset-x-10 top-0 h-20 rounded-b-full bg-emerald-500/10 blur-3xl"
    ></div>
    <div class="relative flex flex-col gap-8">
      <div>
        <h2 class="text-lg font-semibold">Mon profil</h2>
        <p class="mt-1 text-sm text-slate-400">
          Un pseudo clair et une photo rendent les échanges plus chaleureux.
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
          :value="modelValue"
          @input="onInput"
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
              {{ notificationsEnabled ? "🔔" : "🔕" }}
            </span>
            <div>
              <p class="text-sm font-medium text-slate-200">
                {{
                  notificationsEnabled
                    ? "Notifications activées"
                    : "Notifications désactivées"
                }}
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
                <template v-else> Activez pour ne rien manquer </template>
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              v-if="
                notificationStatus !== 'unsupported' &&
                notificationStatus !== 'denied'
              "
              type="button"
              class="rounded-full px-4 py-2 text-sm font-medium transition"
              :class="
                notificationsEnabled
                  ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              "
              :disabled="notificationsEnabled"
              @click="$emit('toggleNotifications')"
            >
              {{ notificationsEnabled ? "Activées" : "Activer" }}
            </button>
            <button
              v-if="notificationsEnabled"
              type="button"
              class="rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
              @click="$emit('testNotification')"
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
          Gardez votre pseudo court et facile à retenir. Les autres participants
          vous identifieront en un coup d'oeil.
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
</template>
