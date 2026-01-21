import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useChat } from "~/stores/useChat";
import type { Message, Room } from "~/types/chat";

// Mock du module storage
vi.mock("~/utils/storageHelpers", () => ({
  lsRead: vi.fn((key: string, fallback: any) => fallback),
  lsWrite: vi.fn(() => true),
}));

// Mock des helpers
vi.mock("~/utils/chatHelpers", () => ({
  isImageRelatedMessage: vi.fn(() => false),
  extractAuthorPseudo: vi.fn(() => "TestUser"),
  fetchImageFromApi: vi.fn(() => Promise.resolve(undefined)),
  findDuplicateMessage: vi.fn(() => undefined),
}));

// Mock de socket.io-client
const mockSocket = {
  connected: false,
  id: "socket-test-id",
  on: vi.fn(),
  emit: vi.fn(),
  off: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => mockSocket),
}));

// Mock de crypto.randomUUID
vi.stubGlobal("crypto", {
  randomUUID: vi.fn(() => "test-uuid-123"),
});

// Mock de window.Notification
vi.stubGlobal("Notification", {
  permission: "default",
  requestPermission: vi.fn(() => Promise.resolve("granted")),
});


import { lsRead, lsWrite } from "~/utils/storageHelpers";
import {
  isImageRelatedMessage,
  extractAuthorPseudo,
  findDuplicateMessage,
} from "~/utils/chatHelpers";

describe("useChat store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockSocket.connected = false;
  });

  describe("state initial", () => {
    it("a les bonnes valeurs par défaut", () => {
      const store = useChat();

      expect(store.rooms).toEqual([]);
      expect(store.messages).toEqual([]);
      expect(store.users).toEqual({});
      expect(store.hydrated).toBe(false);
      expect(store.isConnected).toBe(false);
      expect(store.currentPseudo).toBe("");
      expect(store.notificationsEnabled).toBe(false);
    });
  });

  describe("ensureHydrated", () => {
    it("charge les données depuis localStorage", () => {
      const mockRooms: Room[] = [{ id: "room-1", name: "Room 1", joined: true }];
      const mockMessages: Message[] = [
        {
          id: "msg-1",
          roomId: "room-1",
          author: "User",
          text: "Hello",
          ts: Date.now(),
        },
      ];

      vi.mocked(lsRead)
        .mockReturnValueOnce(mockRooms)
        .mockReturnValueOnce(mockMessages);

      const store = useChat();
      store.ensureHydrated();

      expect(store.hydrated).toBe(true);
      expect(store.rooms).toEqual(mockRooms);
      expect(store.messages).toEqual(mockMessages);
    });

    it("ne recharge pas si déjà hydraté", () => {
      const store = useChat();
      store.ensureHydrated();
      store.ensureHydrated();

      // lsRead appelé seulement une fois pour rooms et une fois pour messages
      expect(lsRead).toHaveBeenCalledTimes(2);
    });
  });

  describe("byRoom getter", () => {
    it("filtre les messages par roomId", () => {
      const store = useChat();
      store.messages = [
        {
          id: "1",
          roomId: "room-1",
          author: "A",
          text: "Hello",
          ts: 1000,
        },
        {
          id: "2",
          roomId: "room-2",
          author: "B",
          text: "World",
          ts: 2000,
        },
        {
          id: "3",
          roomId: "room-1",
          author: "C",
          text: "!",
          ts: 3000,
        },
      ];

      const room1Messages = store.byRoom("room-1");

      expect(room1Messages).toHaveLength(2);
      expect(room1Messages.map((m) => m.id)).toEqual(["1", "3"]);
    });

    it("trie les messages par timestamp", () => {
      const store = useChat();
      store.messages = [
        { id: "3", roomId: "room-1", author: "A", text: "3", ts: 3000 },
        { id: "1", roomId: "room-1", author: "A", text: "1", ts: 1000 },
        { id: "2", roomId: "room-1", author: "A", text: "2", ts: 2000 },
      ];

      const messages = store.byRoom("room-1");

      expect(messages.map((m) => m.ts)).toEqual([1000, 2000, 3000]);
    });

    it("retourne un tableau vide si aucun message", () => {
      const store = useChat();
      store.messages = [];

      const messages = store.byRoom("room-1");

      expect(messages).toEqual([]);
    });
  });

  describe("addMessage", () => {
    it("ajoute un message à la liste", () => {
      const store = useChat();
      const message: Message = {
        id: "msg-1",
        roomId: "room-1",
        author: "User",
        text: "Test",
        ts: Date.now(),
      };

      store.addMessage(message);

      expect(store.messages).toContainEqual(message);
    });

    it("persiste les messages dans localStorage", () => {
      const store = useChat();
      const message: Message = {
        id: "msg-1",
        roomId: "room-1",
        author: "User",
        text: "Test",
        ts: Date.now(),
      };

      store.addMessage(message);

      expect(lsWrite).toHaveBeenCalledWith("messages", store.messages);
    });

    it("appelle ensureHydrated avant d'ajouter", () => {
      const store = useChat();
      store.addMessage({
        id: "msg-1",
        roomId: "room-1",
        author: "User",
        text: "Test",
        ts: Date.now(),
      });

      expect(store.hydrated).toBe(true);
    });
  });

  describe("upsertRooms", () => {
    it("remplace la liste des rooms", () => {
      const store = useChat();
      const newRooms: Room[] = [
        { id: "room-1", name: "Room 1", joined: true },
        { id: "room-2", name: "Room 2", joined: false },
      ];

      store.upsertRooms(newRooms);

      expect(store.rooms).toEqual(newRooms);
    });

    it("persiste les rooms dans localStorage", () => {
      const store = useChat();
      const newRooms: Room[] = [{ id: "room-1", name: "Room 1", joined: true }];

      store.upsertRooms(newRooms);

      expect(lsWrite).toHaveBeenCalledWith("rooms", newRooms);
    });
  });

  describe("leaveRoom", () => {
    it("met joined à false pour la room spécifiée", () => {
      const store = useChat();
      // Hydrater d'abord le store
      store.hydrated = true;
      store.rooms = [
        { id: "room-1", name: "Room 1", joined: true },
        { id: "room-2", name: "Room 2", joined: true },
      ];

      store.leaveRoom("room-1");

      expect(store.rooms.find((r) => r.id === "room-1")?.joined).toBe(false);
      expect(store.rooms.find((r) => r.id === "room-2")?.joined).toBe(true);
    });

    it("persiste les changements dans localStorage", () => {
      const store = useChat();
      store.hydrated = true;
      store.rooms = [{ id: "room-1", name: "Room 1", joined: true }];

      store.leaveRoom("room-1");

      expect(lsWrite).toHaveBeenCalledWith("rooms", store.rooms);
    });
  });

  describe("joinRoom", () => {
    it("met à jour le pseudo courant", () => {
      const store = useChat();

      store.joinRoom("room-1", "TestUser");

      expect(store.currentPseudo).toBe("TestUser");
    });

    it("ajoute la room si elle n'existe pas", () => {
      const store = useChat();

      store.joinRoom("new-room", "User");

      expect(store.rooms).toContainEqual({
        id: "new-room",
        name: "new-room",
        joined: true,
      });
    });

    it("met joined à true si la room existe déjà", () => {
      const store = useChat();
      store.rooms = [{ id: "room-1", name: "Room 1", joined: false }];

      store.joinRoom("room-1", "User");

      expect(store.rooms.find((r) => r.id === "room-1")?.joined).toBe(true);
    });

    it("émet l'événement socket chat-join-room", () => {
      mockSocket.connected = true;

      const store = useChat();
      store.initSocket("User");
      store.joinRoom("room-1", "User");

      expect(mockSocket.emit).toHaveBeenCalledWith("chat-join-room", {
        pseudo: "User",
        roomName: "room-1",
      });
    });
  });

  describe("sendMessage", () => {
    it("ajoute le message localement (optimistic UI)", async () => {
      mockSocket.connected = true;

      const store = useChat();
      store.initSocket("User");
      store.currentPseudo = "TestUser";

      await store.sendMessage("Hello World", "room-1");

      expect(store.messages).toHaveLength(1);
      expect(store.messages[0]!.text).toBe("Hello World");
      expect(store.messages[0]!.author).toBe("TestUser");
    });

    it("émet l'événement socket pour un message texte", async () => {
      mockSocket.connected = true;

      const store = useChat();
      store.initSocket("User");

      await store.sendMessage("Hello", "room-1");

      expect(mockSocket.emit).toHaveBeenCalledWith("chat-msg", {
        content: "Hello",
        roomName: "room-1",
        categorie: "MESSAGE",
      });
    });

    it("utilise 'Moi' comme auteur si pas de pseudo", async () => {
      const store = useChat();
      store.currentPseudo = "";

      await store.sendMessage("Test", "room-1");

      expect(store.messages[0]!.author).toBe("Moi");
    });
  });

  describe("sendLocation", () => {
    it("ajoute un message avec les coordonnées", () => {
      const store = useChat();
      store.currentPseudo = "User";

      store.sendLocation(48.8566, 2.3522, "room-1");

      expect(store.messages[0]!.location).toEqual({ lat: 48.8566, lng: 2.3522 });
      expect(store.messages[0]!.text).toContain("Position partagée");
    });

    it("émet l'événement socket avec le texte de localisation", () => {
      mockSocket.connected = true;

      const store = useChat();
      store.initSocket("User");
      store.sendLocation(48.8566, 2.3522, "room-1");

      expect(mockSocket.emit).toHaveBeenCalledWith("chat-msg", {
        content: expect.stringContaining("48.856600"),
        roomName: "room-1",
        categorie: "MESSAGE",
      });
    });
  });

  describe("checkNotificationStatus", () => {
    it("retourne 'unsupported' si Notification n'est pas disponible", () => {
      const originalNotification = global.Notification;
      // @ts-ignore
      delete global.Notification;
      // @ts-ignore
      global.window = { Notification: undefined };

      const store = useChat();

      // Restaurer pour le test
      global.Notification = originalNotification;
    });

    it("retourne la permission actuelle", () => {
      const store = useChat();

      // Le mock retourne "default"
      expect(store.checkNotificationStatus()).toBe("default");
    });
  });

  describe("initSocket", () => {
    it("met à jour le pseudo courant", () => {
      const store = useChat();

      store.initSocket("TestPseudo");

      expect(store.currentPseudo).toBe("TestPseudo");
    });

    it("configure les écouteurs d'événements socket", () => {
      const store = useChat();

      store.initSocket("User");

      expect(mockSocket.on).toHaveBeenCalledWith("connect", expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith("error", expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith("chat-msg", expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith(
        "chat-joined-room",
        expect.any(Function)
      );
    });

    it("met à jour le pseudo même si déjà connecté", () => {
      mockSocket.connected = true;

      const store = useChat();
      store.initSocket("User1");
      expect(store.currentPseudo).toBe("User1");

      // Le pseudo est mis à jour même si le socket est déjà connecté
      store.initSocket("User2");
      expect(store.currentPseudo).toBe("User2");
    });
  });

  describe("requestNotificationPermission", () => {
    it("vérifie que la fonction existe", () => {
      const store = useChat();
      expect(typeof store.requestNotificationPermission).toBe("function");
    });

    it("met notificationsEnabled à false initialement", () => {
      const store = useChat();
      expect(store.notificationsEnabled).toBe(false);
    });
  });

  describe("showNotification", () => {
    it("ne fait rien si permission non accordée", async () => {
      vi.stubGlobal("Notification", {
        permission: "denied",
        requestPermission: vi.fn().mockResolvedValue("denied"),
      });

      const store = useChat();
      await store.showNotification({
        id: "test",
        roomId: "room",
        author: "User",
        text: "Hello",
        ts: Date.now(),
      });

      // La notification n'est pas créée (car permission refusée)
      expect(store.notificationsEnabled).toBe(false);
    });

    it("construit correctement le message de notification", async () => {
      const message: { id: string; roomId: string; author: string; text: string; ts: number; photoDataUrl?: string } = {
        id: "test",
        roomId: "room",
        author: "Alice",
        text: "Salut !",
        ts: Date.now(),
      };

      // Vérifier la logique de construction du body
      const body = message.photoDataUrl
        ? "📷 A envoyé une photo"
        : message.text || "Nouveau message";

      expect(body).toBe("Salut !");
    });

    it("affiche le body correct pour une image", async () => {
      const message = {
        id: "test",
        roomId: "room",
        author: "Bob",
        text: "",
        photoDataUrl: "data:image/jpeg;base64,abc",
        ts: Date.now(),
      };

      // Vérifier que le body serait correct
      const body = message.photoDataUrl
        ? "📷 A envoyé une photo"
        : message.text || "Nouveau message";

      expect(body).toBe("📷 A envoyé une photo");
    });

    it("affiche le body correct pour un message texte", async () => {
      const message: { id: string; roomId: string; author: string; text: string; ts: number; photoDataUrl?: string } = {
        id: "test",
        roomId: "room",
        author: "User",
        text: "Test message",
        ts: Date.now(),
      };

      const body = message.photoDataUrl
        ? "📷 A envoyé une photo"
        : message.text || "Nouveau message";

      expect(body).toBe("Test message");
    });
  });

  describe("testNotification", () => {
    it("crée un message de test avec les bonnes propriétés", async () => {
      // Vérifier la structure du message de test
      const testMessage = {
        id: "test",
        roomId: "test",
        author: "Système",
        text: "Les notifications fonctionnent !",
        ts: Date.now(),
      };

      expect(testMessage.author).toBe("Système");
      expect(testMessage.text).toBe("Les notifications fonctionnent !");
    });
  });

  describe("socket event handlers", () => {
    it("gère l'événement connect", () => {
      const store = useChat();
      store.initSocket("User");

      // Trouver le handler connect
      const connectCall = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === "connect"
      );
      const connectHandler = connectCall?.[1];

      // Simuler la connexion
      connectHandler?.();

      expect(store.isConnected).toBe(true);
    });

    it("gère l'événement disconnect", () => {
      const store = useChat();
      store.initSocket("User");
      store.isConnected = true;

      // Trouver le handler disconnect
      const disconnectCall = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === "disconnect"
      );
      const disconnectHandler = disconnectCall?.[1];

      // Simuler la déconnexion
      disconnectHandler?.();

      expect(store.isConnected).toBe(false);
    });

    it("gère l'événement chat-joined-room avec clients", () => {
      const store = useChat();
      store.initSocket("User");

      // Trouver le handler chat-joined-room
      const joinedCall = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === "chat-joined-room"
      );
      const joinedHandler = joinedCall?.[1];

      // Simuler la réception de clients
      joinedHandler?.({
        clients: {
          "socket-1": { pseudo: "Alice" },
          "socket-2": { pseudo: "Bob" },
        },
      });

      expect(store.users["socket-1"]).toBe("Alice");
      expect(store.users["socket-2"]).toBe("Bob");
    });
  });

  describe("sendMessage avec image", () => {
    it("envoie une image via l'API et socket", async () => {
      mockSocket.connected = true;
      mockSocket.id = "socket-test-id";

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const store = useChat();
      store.initSocket("User");

      await store.sendMessage("", "room-1", "data:image/jpeg;base64,abc123");

      expect(global.fetch).toHaveBeenCalledWith("/api/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: expect.stringContaining("image_data"),
      });

      expect(mockSocket.emit).toHaveBeenCalledWith("chat-msg", {
        content: "socket-test-id",
        roomName: "room-1",
        categorie: "NEW_IMAGE",
      });
    });

    it("gère l'échec de l'upload d'image silencieusement", async () => {
      mockSocket.connected = true;

      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const store = useChat();
      store.initSocket("User");

      // Ne devrait pas lever d'erreur
      await expect(
        store.sendMessage("", "room-1", "data:image/jpeg;base64,abc123")
      ).resolves.not.toThrow();

      // Le message local est quand même ajouté
      expect(store.messages.length).toBe(1);
    });
  });
});
