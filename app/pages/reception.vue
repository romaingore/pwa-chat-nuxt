<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useProfile } from "~/stores/useProfile";
import { useChat } from "~/stores/useChat";
import type { Room } from "~/types/chat";

// Composants
import ReceptionHeader from "~/components/reception/ReceptionHeader.vue";
import ProfileForm from "~/components/reception/ProfileForm.vue";
import RoomList from "~/components/reception/RoomList.vue";

const profileStore = useProfile();
const chatStore = useChat();
const { data: profile } = storeToRefs(profileStore);
const { notificationsEnabled } = storeToRefs(chatStore);

// Etat des notifications
const notificationStatus = ref<
  "granted" | "denied" | "default" | "unsupported"
>("default");

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

// Pseudo
const pseudo = ref(profile.value.pseudo);

watch(
  profile,
  (value) => {
    pseudo.value = value.pseudo;
  },
  { deep: true }
);

const isPseudoValid = computed(() => pseudo.value.trim().length >= 2);

function saveProfile() {
  if (!isPseudoValid.value) return;
  profileStore.save({ pseudo: pseudo.value });
}

// Rooms
const availableRooms = ref<Room[]>([]);
const isLoadingRooms = ref(true);

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
</script>

<template>
  <section
    class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100"
  >
    <div class="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
      <ReceptionHeader />

      <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <ProfileForm
          v-model="pseudo"
          :notifications-enabled="notificationsEnabled"
          :notification-status="notificationStatus"
          @save="saveProfile"
          @toggle-notifications="toggleNotifications"
          @test-notification="chatStore.testNotification()"
        />

        <RoomList
          :rooms="availableRooms"
          :is-loading="isLoadingRooms"
          :is-pseudo-valid="isPseudoValid"
        />
      </div>
    </div>
  </section>
</template>
