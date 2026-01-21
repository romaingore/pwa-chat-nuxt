import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("useGeolocation", () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
  };

  let originalGeolocation: Geolocation | undefined;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    originalGeolocation = navigator.geolocation;
    // Setup par défaut avec géolocalisation supportée
    Object.defineProperty(global.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restaurer l'état original
    if (originalGeolocation !== undefined) {
      Object.defineProperty(global.navigator, "geolocation", {
        value: originalGeolocation,
        writable: true,
        configurable: true,
      });
    }
  });

  describe("isSupported", () => {
    it("retourne true si geolocation est disponible", async () => {
      const { useGeolocation } = await import("~/composables/useGeolocation");
      const { isSupported } = useGeolocation();
      expect(isSupported()).toBe(true);
    });

    it("vérifie que isSupported retourne un booléen", async () => {
      const { useGeolocation } = await import("~/composables/useGeolocation");
      const { isSupported } = useGeolocation();
      expect(typeof isSupported()).toBe("boolean");
    });
  });

  describe("valeurs initiales", () => {
    it("a les bonnes valeurs par défaut", async () => {
      const { useGeolocation } = await import("~/composables/useGeolocation");
      const { isLoading, error, position } = useGeolocation();
      expect(isLoading.value).toBe(false);
      expect(error.value).toBeNull();
      expect(position.value).toBeNull();
    });
  });

  describe("getCurrentPosition", () => {
    it("retourne la position en cas de succès", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 48.8566,
            longitude: 2.3522,
          },
        });
      });

      const { useGeolocation } = await import("~/composables/useGeolocation");
      const { getCurrentPosition, position, isLoading, error } = useGeolocation();

      const result = await getCurrentPosition();

      expect(result).toEqual({ lat: 48.8566, lng: 2.3522 });
      expect(position.value).toEqual({ lat: 48.8566, lng: 2.3522 });
      expect(isLoading.value).toBe(false);
      expect(error.value).toBeNull();
    });

    it("gère l'erreur PERMISSION_DENIED", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_, errorCb) => {
        errorCb({
          code: 1,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      const { useGeolocation } = await import("~/composables/useGeolocation");
      const { getCurrentPosition, error, isLoading } = useGeolocation();

      const result = await getCurrentPosition();

      expect(result).toBeNull();
      expect(error.value).toBe("Permission de géolocalisation refusée");
      expect(isLoading.value).toBe(false);
    });

    it("gère l'erreur POSITION_UNAVAILABLE", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_, errorCb) => {
        errorCb({
          code: 2,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      const { useGeolocation } = await import("~/composables/useGeolocation");
      const { getCurrentPosition, error } = useGeolocation();

      const result = await getCurrentPosition();

      expect(result).toBeNull();
      expect(error.value).toBe("Position non disponible");
    });

    it("gère l'erreur TIMEOUT", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_, errorCb) => {
        errorCb({
          code: 3,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      const { useGeolocation } = await import("~/composables/useGeolocation");
      const { getCurrentPosition, error } = useGeolocation();

      const result = await getCurrentPosition();

      expect(result).toBeNull();
      expect(error.value).toBe("Délai d'attente dépassé");
    });

    it("gère les erreurs inconnues", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_, errorCb) => {
        errorCb({
          code: 999,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      const { useGeolocation } = await import("~/composables/useGeolocation");
      const { getCurrentPosition, error } = useGeolocation();

      const result = await getCurrentPosition();

      expect(result).toBeNull();
      expect(error.value).toBe("Erreur de géolocalisation");
    });

    it("met isLoading à true pendant la requête", async () => {
      let resolvePosition: (pos: any) => void;
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        resolvePosition = success;
      });

      const { useGeolocation } = await import("~/composables/useGeolocation");
      const { getCurrentPosition, isLoading } = useGeolocation();

      const promise = getCurrentPosition();

      // Pendant la requête
      expect(isLoading.value).toBe(true);

      // Résoudre la promesse
      resolvePosition!({
        coords: { latitude: 48.8566, longitude: 2.3522 },
      });

      await promise;

      // Après la requête
      expect(isLoading.value).toBe(false);
    });

    it("réinitialise error avant chaque requête", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: { latitude: 48.8566, longitude: 2.3522 },
        });
      });

      const { useGeolocation } = await import("~/composables/useGeolocation");
      const { getCurrentPosition, error } = useGeolocation();

      // Simuler une erreur précédente
      error.value = "Erreur précédente";

      await getCurrentPosition();

      expect(error.value).toBeNull();
    });
  });
});
