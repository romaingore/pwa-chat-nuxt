import { defineStore } from "pinia";
import { lsRead, lsWrite } from "~/utils/storage";
import type { Room, Message } from "~/types/chat";

export const useChat = defineStore("chat", {
  state: () => ({
    rooms: [] as Room[],
    messages: [] as Message[],
    hydrated: false,
  }),

  getters: {
    // Retourne les messages d'une room triés par date
    byRoom: (state) => (roomId: string) =>
      state.messages
        .filter((m) => m.roomId === roomId)
        .sort((a, b) => a.ts - b.ts),
  },

  actions: {
    ensureHydrated() {
      if (this.hydrated || import.meta.server) {
        return;
      }
      this.rooms = lsRead<Room[]>("rooms", []);
      this.messages = lsRead<Message[]>("messages", []);
      this.hydrated = true;
    },
    upsertRooms(next: Room[]) {
      this.ensureHydrated();
      this.rooms = next;
      lsWrite("rooms", this.rooms);
    },
    addMessage(m: Message) {
      this.ensureHydrated();
      this.messages.push(m);
      lsWrite("messages", this.messages);
    },
    leaveRoom(roomId: string) {
      this.ensureHydrated();
      this.rooms = this.rooms.map((r) =>
        r.id === roomId ? { ...r, joined: false } : r
      );
      lsWrite("rooms", this.rooms);
    },
  },
});
