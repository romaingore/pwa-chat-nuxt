import { defineStore } from "pinia";
import { io, Socket } from "socket.io-client";
import { lsRead, lsWrite } from "~/utils/storage";
import {
  isImageRelatedMessage,
  extractAuthorPseudo,
  fetchImageFromApi,
  findDuplicateMessage,
} from "~/utils/chatHelpers";
import type { Room, Message } from "~/types/chat";

// Variable pour stocker la connexion socket (singleton)
let socket: Socket | null = null;

export const useChat = defineStore("chat", {
  state: () => ({
    rooms: [] as Room[],
    messages: [] as Message[],
    users: {} as Record<string, string>, // socketId -> pseudo
    hydrated: false,
    isConnected: false,
    currentPseudo: "",
    notificationsEnabled: false,
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

    // ========== SOCKET.IO ==========

    /**
     * Initialise la connexion Socket.IO au serveur
     */
    initSocket(pseudo: string) {
      // Toujours mettre à jour le pseudo, même si déjà connecté
      this.currentPseudo = pseudo;

      // Évite de recréer si déjà connecté
      if (socket && socket.connected) {
        return;
      }

      // Création de la connexion
      // L'URL de base est https://api.tools.gavago.fr
      // Le path Socket.IO est généralement /socket.io (par défaut)
      socket = io("https://api.tools.gavago.fr", {
        path: "/socket.io", // Chemin standard Socket.IO
        transports: ["websocket", "polling"],
      });

      // ===== ÉCOUTE DES ÉVÉNEMENTS DU SERVEUR =====

      socket.on("connect", () => {
        this.isConnected = true;
      });

      socket.on("disconnect", () => {
        this.isConnected = false;
      });

      socket.on("error", () => {
        // Gestion silencieuse des erreurs serveur
      });

      // Réception d'un message
      socket.on("chat-msg", async (payload: any) => {
        const contentStr = String(payload.content || "");
        const category = payload.categorie || "MESSAGE";
        const isImage = category === "NEW_IMAGE";

        // Messages système (INFO) - join/leave notifications
        if (category === "INFO") {
          this.addMessage({
            id: crypto.randomUUID(),
            roomId: payload.roomName || "general",
            author: "Système",
            text: contentStr,
            ts: new Date(payload.dateEmis).getTime() || Date.now(),
          });
          return;
        }

        // Ignore les messages liés aux images (déjà affichés via NEW_IMAGE)
        if (isImageRelatedMessage(contentStr) && category === "MESSAGE") {
          return;
        }

        // Extraction du pseudo et de l'image
        const authorPseudo = extractAuthorPseudo(payload, isImage, contentStr, this.users);
        const photoDataUrl = isImage && payload.id_image
          ? await fetchImageFromApi(payload.id_image)
          : undefined;

        const newMessage: Message = {
          id: crypto.randomUUID(),
          roomId: payload.roomName || "general",
          author: authorPseudo,
          text: photoDataUrl ? "" : contentStr,
          photoDataUrl,
          ts: new Date(payload.dateEmis).getTime(),
        };

        // Gestion des doublons (optimistic UI)
        const isOwnMessage = authorPseudo.toLowerCase() === this.currentPseudo.toLowerCase();
        const existingMessage = findDuplicateMessage(this.messages, newMessage, isImage, photoDataUrl);

        if (existingMessage) {
          if (existingMessage.author !== authorPseudo && isOwnMessage) {
            existingMessage.author = authorPseudo;
            lsWrite("messages", this.messages);
          }
        } else {
          this.addMessage(newMessage);
          if (!isOwnMessage) {
            this.showNotification(newMessage);
          }
        }
      });

      // Quelqu'un rejoint une room - mise à jour de la liste des utilisateurs
      socket.on("chat-joined-room", (payload: any) => {
        if (payload.clients) {
          Object.entries(payload.clients).forEach(
            ([id, client]: [string, any]) => {
              if (client.pseudo) {
                this.users[id] = client.pseudo;
              }
            }
          );
        }
      });
    },

    /**
     * Rejoint une room de chat
     */
    joinRoom(roomId: string, pseudo: string) {
      // Toujours mettre à jour le pseudo local
      this.currentPseudo = pseudo;

      if (!socket || !socket.connected) {
        this.initSocket(pseudo);
      }

      // Le serveur requiert 'pseudo' comme clé
      socket?.emit("chat-join-room", {
        pseudo: pseudo,
        roomName: roomId,
      });

      // Met à jour l'état local
      this.ensureHydrated();
      const existing = this.rooms.find((r) => r.id === roomId);
      if (existing) {
        existing.joined = true;
      } else {
        this.rooms.push({ id: roomId, name: roomId, joined: true });
      }
      lsWrite("rooms", this.rooms);
    },

    /**
     * Envoie un message texte ou image
     */
    async sendMessage(text: string, roomId: string, image?: string) {
      // 1. Ajoute immédiatement le message en local (optimistic UI)
      const localMessage: Message = {
        id: crypto.randomUUID(),
        roomId,
        author: this.currentPseudo || "Moi",
        text: image ? "" : text,
        photoDataUrl: image,
        ts: Date.now(),
      };
      this.addMessage(localMessage);

      // 2. Envoie au serveur
      if (image) {
        try {
          // Upload l'image via notre proxy local
          const response = await fetch("/api/upload-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: socket?.id,
              image_data: image,
            }),
          });

          if (response.ok) {
            // Envoie la référence de l'image via Socket.IO
            socket?.emit("chat-msg", {
              content: socket?.id, // L'ID sert de référence pour récupérer l'image
              roomName: roomId,
              categorie: "NEW_IMAGE",
            });
          }
        } catch (error) {
          // En cas d'erreur, on garde le message local mais on ne l'envoie pas
        }
      } else if (text) {
        socket?.emit("chat-msg", {
          content: text,
          roomName: roomId,
          categorie: "MESSAGE",
        });
      }
    },

    /**
     * Envoie une localisation
     */
    sendLocation(lat: number, lng: number, roomId: string) {
      const locationText = `📍 Position partagée: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;

      // Ajoute le message en local avec les coordonnées
      const localMessage: Message = {
        id: crypto.randomUUID(),
        roomId,
        author: this.currentPseudo || "Moi",
        text: locationText,
        location: { lat, lng },
        ts: Date.now(),
      };
      this.addMessage(localMessage);

      // Envoie au serveur (le serveur ne supporte peut-être pas les locations, on envoie comme texte)
      socket?.emit("chat-msg", {
        content: locationText,
        roomName: roomId,
        categorie: "MESSAGE",
      });
    },

    // ========== GESTION LOCALE ==========

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

    // ========== NOTIFICATIONS ==========

    checkNotificationStatus(): "granted" | "denied" | "default" | "unsupported" {
      if (!("Notification" in window)) {
        return "unsupported";
      }
      return Notification.permission;
    },

    async requestNotificationPermission(): Promise<boolean> {
      if (!("Notification" in window)) {
        return false;
      }

      if (Notification.permission === "granted") {
        this.notificationsEnabled = true;
        return true;
      }

      if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        this.notificationsEnabled = permission === "granted";
        return this.notificationsEnabled;
      }

      return false;
    },

    /**
     * Envoie une notification de test
     */
    async testNotification() {
      const testMessage: Message = {
        id: "test",
        roomId: "test",
        author: "Système",
        text: "Les notifications fonctionnent !",
        ts: Date.now(),
      };
      await this.showNotification(testMessage);
    },

    /**
     * Affiche une notification et fait vibrer l'appareil
     */
    async showNotification(message: Message) {
      const hasPermission = await this.requestNotificationPermission();
      if (!hasPermission) return;

      // Vibreur (200ms, pause 100ms, 200ms)
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }

      const body = message.photoDataUrl
        ? "📷 A envoyé une photo"
        : message.text || "Nouveau message";

      const notification = new Notification(`Message de ${message.author}`, {
        body: body,
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    },
  },
});
