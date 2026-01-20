import { defineStore } from "pinia";
import { io, Socket } from "socket.io-client";
import { lsRead, lsWrite } from "~/utils/storage";
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

        // Selon la doc, content est toujours une string
        const contentStr = String(payload.content || "");
        const category = payload.categorie || "MESSAGE";
        const isImage = category === "NEW_IMAGE";

        // Ignore les messages système du serveur
        if (category === "INFO") {
          return;
        }

        // Ignore les messages liés aux images (on affiche déjà l'image via NEW_IMAGE)
        // - Messages "[IMAGE] url..."
        // - Messages contenant l'URL de l'API images
        // - Messages qui sont juste un ID d'image (format: caractères alphanumériques avec tirets/underscores)
        const isImageRelatedMessage =
          contentStr.startsWith("[IMAGE]") ||
          contentStr.includes("api/images/") ||
          /^[\w-]{10,30}$/.test(contentStr.trim());

        if (isImageRelatedMessage && category === "MESSAGE") {
          return;
        }

        // Récupère le pseudo de l'auteur
        // Pour les images, le pseudo est "SERVER" mais le vrai pseudo est dans le content
        // Format: "Nouvelle image pour le user {pseudo}."
        let authorPseudo = "Anonyme";

        // 1. Pour les images, extraire le pseudo du contenu
        if (isImage && contentStr.includes("pour le user ")) {
          const match = contentStr.match(/pour le user ([^.]+)/);
          if (match && match[1]) {
            authorPseudo = match[1].trim();
          }
        }
        // 2. Utiliser le pseudo du payload s'il existe et n'est pas "SERVER"
        else if (payload.pseudo && payload.pseudo !== "SERVER" && payload.pseudo.trim() !== "") {
          authorPseudo = payload.pseudo;
        }
        // 3. Sinon chercher dans la liste des users par userId
        else if (payload.userId) {
          const userPseudo = this.users[payload.userId];
          if (userPseudo) {
            authorPseudo = userPseudo;
          }
        }
        // 4. Sinon chercher par socketId (si disponible)
        else if (payload.socketId) {
          const socketPseudo = this.users[payload.socketId];
          if (socketPseudo) {
            authorPseudo = socketPseudo;
          }
        }

        let photoDataUrl: string | undefined;

        // Si c'est une image (catégorie "NEW_IMAGE"), on la récupère via l'API
        // L'ID de l'image est dans payload.id_image
        if (isImage && payload.id_image) {
          try {
            const response = await fetch(`/api/image/${payload.id_image}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data_image) {
                photoDataUrl = data.data_image;
              }
            }
          } catch (e) {
            console.error("Erreur chargement image:", e);
          }
        }

        // Si on a trouvé une photo, on efface le texte pour ne pas afficher l'ID
        const finalContent = photoDataUrl ? "" : contentStr;

        const newMessage: Message = {
          id: crypto.randomUUID(),
          roomId: payload.roomName || "general",
          author: authorPseudo,
          text: finalContent,
          photoDataUrl: photoDataUrl,
          ts: new Date(payload.dateEmis).getTime(),
        };

        // Vérifie si c'est notre propre message (envoyé localement avec optimistic UI)
        // On compare le pseudo en ignorant la casse
        const isOwnMessage = authorPseudo.toLowerCase() === this.currentPseudo.toLowerCase();

        // Évite les doublons - pour nos propres messages, on vérifie le texte et le timestamp
        const existingMessage = this.messages.find(
          (m) =>
            Math.abs(m.ts - newMessage.ts) < 5000 &&
            (isImage
              ? m.photoDataUrl === photoDataUrl
              : m.text === newMessage.text)
        );

        if (existingMessage) {
          // Si le message existe déjà (optimistic UI), on met à jour l'auteur avec celui du serveur
          if (existingMessage.author !== authorPseudo && isOwnMessage) {
            existingMessage.author = authorPseudo;
            lsWrite("messages", this.messages);
          }
        } else {
          this.addMessage(newMessage);

          // Notification si message d'un autre utilisateur
          if (!isOwnMessage) {
            this.showNotification(newMessage);
          }
        }
      });

      // Quelqu'un rejoint une room
      socket.on("chat-joined-room", (payload: any) => {
        if (payload.clients) {
          Object.entries(payload.clients).forEach(
            ([id, client]: [string, any]) => {
              // Si c'est un nouveau utilisateur (pas encore dans notre liste)
              if (!this.users[id] && client.pseudo) {
                // Ajoute un message système
                const systemMessage: Message = {
                  id: crypto.randomUUID(),
                  roomId: payload.roomName || "general",
                  author: "Système",
                  text: `${client.pseudo} a rejoint le salon`,
                  ts: Date.now(),
                };
                this.addMessage(systemMessage);
              }
              this.users[id] = client.pseudo;
            }
          );
        }
      });

      // Quelqu'un quitte
      socket.on("chat-disconnected", (payload: any) => {
        if (payload.pseudo) {
          const systemMessage: Message = {
            id: crypto.randomUUID(),
            roomId: payload.roomName || "general",
            author: "Système",
            text: `${payload.pseudo} a quitté le salon`,
            ts: Date.now(),
          };
          this.addMessage(systemMessage);
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
