import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isImageRelatedMessage,
  extractAuthorPseudo,
  fetchImageFromApi,
  findDuplicateMessage,
} from "~/utils/chatHelpers";
import type { Message } from "~/types/chat";

describe("chatHelpers", () => {
  describe("isImageRelatedMessage", () => {
    it('retourne true pour les messages commençant par "[IMAGE]"', () => {
      expect(isImageRelatedMessage("[IMAGE] photo.jpg")).toBe(true);
      expect(isImageRelatedMessage("[IMAGE]")).toBe(true);
    });

    it('retourne true pour les messages contenant "api/images/"', () => {
      expect(isImageRelatedMessage("Voir /api/images/123")).toBe(true);
      expect(isImageRelatedMessage("https://example.com/api/images/abc")).toBe(
        true
      );
    });

    it("retourne true pour les IDs d'image (10-30 caractères alphanumériques)", () => {
      expect(isImageRelatedMessage("abcdef1234")).toBe(true); // 10 caractères
      expect(isImageRelatedMessage("abc-def-123")).toBe(true); // avec tirets
      expect(isImageRelatedMessage("abcdefghij1234567890123456789")).toBe(true); // 29 caractères
    });

    it("retourne false pour les messages texte normaux", () => {
      expect(isImageRelatedMessage("Bonjour tout le monde")).toBe(false);
      expect(isImageRelatedMessage("Hello!")).toBe(false);
      expect(isImageRelatedMessage("")).toBe(false);
    });

    it("retourne false pour les IDs trop courts", () => {
      expect(isImageRelatedMessage("abc")).toBe(false); // moins de 10 caractères
      expect(isImageRelatedMessage("12345")).toBe(false);
    });

    it("retourne false pour les IDs trop longs", () => {
      expect(
        isImageRelatedMessage("a".repeat(31))
      ).toBe(false); // plus de 30 caractères
    });
  });

  describe("extractAuthorPseudo", () => {
    const users: Record<string, string> = {
      "socket-123": "Alice",
      "user-456": "Bob",
    };

    it('extrait le pseudo depuis le contenu pour les images avec "pour le user"', () => {
      const payload = { pseudo: "SERVER" };
      const result = extractAuthorPseudo(
        payload,
        true,
        "Image envoyée pour le user Jean.",
        users
      );
      expect(result).toBe("Jean");
    });

    it("utilise le pseudo du payload s'il existe et n'est pas SERVER", () => {
      const payload = { pseudo: "Marie" };
      const result = extractAuthorPseudo(payload, false, "Hello", users);
      expect(result).toBe("Marie");
    });

    it("ignore le pseudo SERVER", () => {
      const payload = { pseudo: "SERVER", userId: "user-456" };
      const result = extractAuthorPseudo(payload, false, "Hello", users);
      expect(result).toBe("Bob");
    });

    it("ignore les pseudos vides", () => {
      const payload = { pseudo: "   ", userId: "user-456" };
      const result = extractAuthorPseudo(payload, false, "Hello", users);
      expect(result).toBe("Bob");
    });

    it("cherche par userId dans la liste des users", () => {
      const payload = { userId: "user-456" };
      const result = extractAuthorPseudo(payload, false, "Hello", users);
      expect(result).toBe("Bob");
    });

    it("cherche par socketId dans la liste des users", () => {
      const payload = { socketId: "socket-123" };
      const result = extractAuthorPseudo(payload, false, "Hello", users);
      expect(result).toBe("Alice");
    });

    it('retourne "Anonyme" si aucun pseudo trouvé', () => {
      const payload = {};
      const result = extractAuthorPseudo(payload, false, "Hello", {});
      expect(result).toBe("Anonyme");
    });

    it("priorité: contenu image > pseudo > userId > socketId", () => {
      const payload = {
        pseudo: "Marie",
        userId: "user-456",
        socketId: "socket-123",
      };
      // Pour une image avec "pour le user", le contenu a la priorité
      const result = extractAuthorPseudo(
        payload,
        true,
        "Image pour le user Jean.",
        users
      );
      expect(result).toBe("Jean");
    });
  });

  describe("fetchImageFromApi", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("retourne l'image si la requête réussit", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data_image: "data:image/jpeg;base64,abc123",
          }),
      });

      const result = await fetchImageFromApi("image-123");
      expect(result).toBe("data:image/jpeg;base64,abc123");
      expect(fetch).toHaveBeenCalledWith("/api/image/image-123");
    });

    it("retourne undefined si la requête échoue (status not ok)", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      });

      const result = await fetchImageFromApi("image-123");
      expect(result).toBeUndefined();
    });

    it("retourne undefined si success est false", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false }),
      });

      const result = await fetchImageFromApi("image-123");
      expect(result).toBeUndefined();
    });

    it("retourne undefined en cas d'erreur réseau", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const result = await fetchImageFromApi("image-123");
      expect(result).toBeUndefined();
    });

    it("retourne undefined si data_image est absent", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await fetchImageFromApi("image-123");
      expect(result).toBeUndefined();
    });
  });

  describe("findDuplicateMessage", () => {
    const baseTime = Date.now();

    const createMessage = (
      overrides: Partial<Message> = {}
    ): Message => ({
      id: "msg-1",
      roomId: "room-1",
      author: "User",
      text: "Hello",
      ts: baseTime,
      ...overrides,
    });

    it("trouve un message dupliqué par texte dans la fenêtre de 5 secondes", () => {
      const existingMessages: Message[] = [
        createMessage({ id: "existing", text: "Hello", ts: baseTime }),
      ];
      const newMessage = createMessage({
        id: "new",
        text: "Hello",
        ts: baseTime + 3000,
      });

      const result = findDuplicateMessage(
        existingMessages,
        newMessage,
        false,
        undefined
      );
      expect(result).toEqual(existingMessages[0]);
    });

    it("ne trouve pas de doublon si le texte est différent", () => {
      const existingMessages: Message[] = [
        createMessage({ id: "existing", text: "Hello", ts: baseTime }),
      ];
      const newMessage = createMessage({
        id: "new",
        text: "Goodbye",
        ts: baseTime + 1000,
      });

      const result = findDuplicateMessage(
        existingMessages,
        newMessage,
        false,
        undefined
      );
      expect(result).toBeUndefined();
    });

    it("ne trouve pas de doublon si le timestamp est hors fenêtre", () => {
      const existingMessages: Message[] = [
        createMessage({ id: "existing", text: "Hello", ts: baseTime }),
      ];
      const newMessage = createMessage({
        id: "new",
        text: "Hello",
        ts: baseTime + 6000,
      }); // > 5000ms

      const result = findDuplicateMessage(
        existingMessages,
        newMessage,
        false,
        undefined
      );
      expect(result).toBeUndefined();
    });

    it("trouve un message image dupliqué par photoDataUrl", () => {
      const photoUrl = "data:image/jpeg;base64,abc123";
      const existingMessages: Message[] = [
        createMessage({
          id: "existing",
          photoDataUrl: photoUrl,
          ts: baseTime,
        }),
      ];
      const newMessage = createMessage({
        id: "new",
        photoDataUrl: photoUrl,
        ts: baseTime + 2000,
      });

      const result = findDuplicateMessage(
        existingMessages,
        newMessage,
        true,
        photoUrl
      );
      expect(result).toEqual(existingMessages[0]);
    });

    it("ne trouve pas de doublon image si photoDataUrl différent", () => {
      const existingMessages: Message[] = [
        createMessage({
          id: "existing",
          photoDataUrl: "data:image/jpeg;base64,abc",
          ts: baseTime,
        }),
      ];
      const newMessage = createMessage({
        id: "new",
        photoDataUrl: "data:image/jpeg;base64,xyz",
        ts: baseTime + 1000,
      });

      const result = findDuplicateMessage(
        existingMessages,
        newMessage,
        true,
        "data:image/jpeg;base64,xyz"
      );
      expect(result).toBeUndefined();
    });

    it("retourne undefined si la liste est vide", () => {
      const newMessage = createMessage();
      const result = findDuplicateMessage([], newMessage, false, undefined);
      expect(result).toBeUndefined();
    });

    it("gère les timestamps négatifs (message plus ancien)", () => {
      const existingMessages: Message[] = [
        createMessage({ id: "existing", text: "Hello", ts: baseTime }),
      ];
      const newMessage = createMessage({
        id: "new",
        text: "Hello",
        ts: baseTime - 3000,
      });

      const result = findDuplicateMessage(
        existingMessages,
        newMessage,
        false,
        undefined
      );
      expect(result).toEqual(existingMessages[0]);
    });
  });
});
