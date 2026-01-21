import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useProfile } from "~/stores/useProfile";

// Mock du module storage
vi.mock("~/utils/storageHelpers", () => ({
  lsRead: vi.fn((key: string, fallback: any) => fallback),
  lsWrite: vi.fn(() => true),
}));

import { lsRead, lsWrite } from "~/utils/storageHelpers";

describe("useProfile store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("state initial", () => {
    it("charge le profil depuis localStorage au démarrage", () => {
      const store = useProfile();

      expect(lsRead).toHaveBeenCalledWith("profile", { pseudo: "" });
      expect(store.data).toEqual({ pseudo: "" });
    });

    it("utilise les données de localStorage si présentes", () => {
      vi.mocked(lsRead).mockReturnValueOnce({ pseudo: "TestUser" });

      const store = useProfile();

      expect(store.data).toEqual({ pseudo: "TestUser" });
    });
  });

  describe("save", () => {
    it("met à jour le state avec le nouveau profil", () => {
      const store = useProfile();

      store.save({ pseudo: "NouveauPseudo" });

      expect(store.data).toEqual({ pseudo: "NouveauPseudo" });
    });

    it("persiste le profil dans localStorage", () => {
      const store = useProfile();

      store.save({ pseudo: "TestSave" });

      expect(lsWrite).toHaveBeenCalledWith("profile", { pseudo: "TestSave" });
    });

    it("sauvegarde le profil avec photoDataUrl", () => {
      const store = useProfile();
      const profile = {
        pseudo: "User",
        photoDataUrl: "data:image/jpeg;base64,abc123",
      };

      store.save(profile);

      expect(store.data).toEqual(profile);
      expect(lsWrite).toHaveBeenCalledWith("profile", profile);
    });

    it("écrase le profil existant", () => {
      const store = useProfile();

      store.save({ pseudo: "Premier" });
      store.save({ pseudo: "Second" });

      expect(store.data.pseudo).toBe("Second");
    });
  });
});
