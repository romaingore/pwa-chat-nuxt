<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, navigateTo } from "#imports";
import { useChat } from "~/stores/useChat";
import { useProfile } from "~/stores/useProfile";
import { useGeolocation } from "~/composables/useGeolocation";

// Composants
import ChatHeader from "~/components/chat/ChatHeader.vue";
import MessageList from "~/components/chat/MessageList.vue";
import ChatInput from "~/components/chat/ChatInput.vue";
import CameraModal from "~/components/chat/CameraModal.vue";

const route = useRoute();
const roomId = route.params.id as string;

const chat = useChat();
const profileStore = useProfile();
const { data: profile } = storeToRefs(profileStore);

// S'assurer que les données sont hydratées
chat.ensureHydrated();

// Rejoindre la room
onMounted(() => {
  const pseudo = profile.value.pseudo || "Anonyme";
  chat.joinRoom(roomId, pseudo);
});

// Données de la room
const { rooms } = storeToRefs(chat);
const list = computed(() => chat.byRoom(roomId));

const roomName = computed(() => {
  const target = rooms.value.find((r) => r.id === roomId);
  return target?.name ?? roomId;
});

// Statistiques
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

// Formatage des messages pour l'affichage
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

// Actions
function onSendMessage(text: string) {
  chat.sendMessage(text, roomId);
}

function onLeave() {
  chat.leaveRoom(roomId);
  navigateTo("/reception");
}

// Camera
const showCamera = ref(false);

function onCapturePhoto(photo: string) {
  chat.sendMessage("", roomId, photo);
  showCamera.value = false;
}

// Géolocalisation
const { isLoading: geoLoading, getCurrentPosition } = useGeolocation();

async function onShareLocation() {
  const position = await getCurrentPosition();
  if (position) {
    chat.sendLocation(position.lat, position.lng, roomId);
  }
}
</script>

<template>
  <section
    class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100"
  >
    <div class="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12">
      <!-- Header -->
      <ChatHeader 
        :room-name="roomName" 
        :stats="stats" 
        @leave="onLeave" 
      />

      <!-- Zone de chat -->
      <div
        class="flex min-h-[26rem] flex-col overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-950/50 shadow-xl shadow-slate-950/40"
      >
        <!-- Liste des messages -->
        <MessageList :messages="formattedMessages" />

        <!-- Modal Caméra (surimposé) -->
        <CameraModal
          v-if="showCamera"
          @close="showCamera = false"
          @capture="onCapturePhoto"
        />

        <!-- Input Bar -->
        <ChatInput
          :is-loading-geo="geoLoading"
          @send="onSendMessage"
          @toggle-camera="showCamera = !showCamera"
          @share-location="onShareLocation"
        />
      </div>
    </div>
  </section>
</template>
