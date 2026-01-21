<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import MessageBubble from "./MessageBubble.vue";

const props = defineProps<{
  messages: Array<{
    id: string;
    author: string;
    text?: string;
    photoDataUrl?: string;
    time: string;
    date: string;
    isSelf: boolean;
  }>;
}>();

// ===== SCROLL AUTO =====
const messagesContainer = ref<HTMLElement | null>(null);

function scrollToBottom() {
  nextTick(() => {
    setTimeout(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTo({
          top: messagesContainer.value.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
  });
}

// Scroll au montage
onMounted(() => {
  scrollToBottom();
});

// Scroll quand de nouveaux messages arrivent
watch(
  () => props.messages.length,
  () => {
    scrollToBottom();
  }
);
</script>

<template>
  <div
    ref="messagesContainer"
    class="messages-container flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-6 py-10 max-h-[60vh]"
  >
    <div
      v-if="messages.length === 0"
      class="text-center text-sm text-slate-400"
    >
      Aucun message dans ce salon. Soyez le premier à écrire !
    </div>

    <template v-else>
      <MessageBubble
        v-for="message in messages"
        :key="message.id"
        v-bind="message"
      />
    </template>
  </div>
</template>

<style scoped>
.messages-container {
  scroll-behavior: smooth;
}

/* Scrollbar personnalisée */
.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: rgb(15 23 42); /* slate-900 */
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgb(51 65 85); /* slate-700 */
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgb(71 85 105); /* slate-600 */
}

/* Firefox */
.messages-container {
  scrollbar-width: thin;
  scrollbar-color: rgb(51 65 85) rgb(15 23 42);
}
</style>
