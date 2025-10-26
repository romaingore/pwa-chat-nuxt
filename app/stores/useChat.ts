import { defineStore } from "pinia";
import { lsRead, lsWrite } from "~/utils/storage";
import type { Room, Message } from "~/types/chat";

export const useChat = defineStore("chat", {
  state: () => ({
    rooms: lsRead<Room[]>("rooms", []),
    messages: lsRead<Message[]>("messages", []),
  }),

  getters: {
    // Retourne les messages d'une room triés par date
    byRoom: (state) => (roomId: string) =>
      state.messages
        .filter((m) => m.roomId === roomId)
        .sort((a, b) => a.ts - b.ts),
  },

  actions: {
    upsertRooms(next: Room[]) {
      this.rooms = next;
      lsWrite("rooms", this.rooms);
    },
    addMessage(m: Message) {
      this.messages.push(m);
      lsWrite("messages", this.messages);
    },
    leaveRoom(roomId: string) {
      this.rooms = this.rooms.map((r) =>
        r.id === roomId ? { ...r, joined: false } : r
      );
      lsWrite("rooms", this.rooms);
    },
  },
});
