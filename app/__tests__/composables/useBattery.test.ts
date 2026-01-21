import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock des hooks Vue pour éviter les erreurs hors composant
vi.mock("vue", async () => {
  const actual = await vi.importActual("vue");
  return {
    ...actual,
    onMounted: vi.fn((cb) => cb()),
    onUnmounted: vi.fn(),
  };
});

describe("useBattery", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  describe("formatTime", () => {
    it("retourne une chaîne vide pour Infinity", async () => {
      const { useBattery } = await import("~/composables/useBattery");
      const { formatTime } = useBattery();
      expect(formatTime(Infinity)).toBe("");
    });

    it("retourne une chaîne vide pour 0", async () => {
      const { useBattery } = await import("~/composables/useBattery");
      const { formatTime } = useBattery();
      expect(formatTime(0)).toBe("");
    });

    it("retourne une chaîne vide pour les valeurs négatives", async () => {
      const { useBattery } = await import("~/composables/useBattery");
      const { formatTime } = useBattery();
      expect(formatTime(-100)).toBe("");
    });

    it("formate correctement les minutes seules", async () => {
      const { useBattery } = await import("~/composables/useBattery");
      const { formatTime } = useBattery();
      expect(formatTime(1800)).toBe("30min"); // 30 minutes
      expect(formatTime(60)).toBe("1min");
      expect(formatTime(300)).toBe("5min");
    });

    it("formate correctement les heures et minutes", async () => {
      const { useBattery } = await import("~/composables/useBattery");
      const { formatTime } = useBattery();
      expect(formatTime(3600)).toBe("1h 0min"); // 1 heure
      expect(formatTime(5400)).toBe("1h 30min"); // 1h30
      expect(formatTime(7200)).toBe("2h 0min"); // 2 heures
      expect(formatTime(9000)).toBe("2h 30min"); // 2h30
    });
  });

  describe("getBatteryIcon", () => {
    it("retourne l'icône de charge si en charge", async () => {
      const { useBattery } = await import("~/composables/useBattery");
      const battery = useBattery();
      battery.charging.value = true;
      battery.level.value = 50;
      expect(battery.getBatteryIcon()).toBe("🔌");
    });

    it("retourne l'icône batterie faible pour niveau <= 10", async () => {
      const { useBattery } = await import("~/composables/useBattery");
      const battery = useBattery();
      battery.charging.value = false;
      battery.level.value = 10;
      expect(battery.getBatteryIcon()).toBe("🪫");
    });

    it("retourne l'icône batterie pour niveau > 10", async () => {
      const { useBattery } = await import("~/composables/useBattery");
      const battery = useBattery();
      battery.charging.value = false;
      battery.level.value = 50;
      expect(battery.getBatteryIcon()).toBe("🔋");
    });
  });

  describe("getBatteryColor", () => {
    it("retourne emerald si en charge", async () => {
      const { useBattery } = await import("~/composables/useBattery");
      const battery = useBattery();
      battery.charging.value = true;
      battery.level.value = 5;
      expect(battery.getBatteryColor()).toBe("text-emerald-400");
    });

    it("retourne rouge pour niveau <= 10", async () => {
      const { useBattery } = await import("~/composables/useBattery");
      const battery = useBattery();
      battery.charging.value = false;
      battery.level.value = 10;
      expect(battery.getBatteryColor()).toBe("text-red-400");
    });

    it("retourne orange pour niveau <= 20", async () => {
      const { useBattery } = await import("~/composables/useBattery");
      const battery = useBattery();
      battery.charging.value = false;
      battery.level.value = 20;
      expect(battery.getBatteryColor()).toBe("text-orange-400");
    });

    it("retourne jaune pour niveau <= 50", async () => {
      const { useBattery } = await import("~/composables/useBattery");
      const battery = useBattery();
      battery.charging.value = false;
      battery.level.value = 50;
      expect(battery.getBatteryColor()).toBe("text-yellow-400");
    });

    it("retourne emerald pour niveau > 50", async () => {
      const { useBattery } = await import("~/composables/useBattery");
      const battery = useBattery();
      battery.charging.value = false;
      battery.level.value = 80;
      expect(battery.getBatteryColor()).toBe("text-emerald-400");
    });
  });

  describe("valeurs initiales", () => {
    it("a les bonnes valeurs par défaut", async () => {
      const { useBattery } = await import("~/composables/useBattery");
      const battery = useBattery();
      expect(battery.level.value).toBe(100);
      expect(battery.charging.value).toBe(false);
      expect(battery.chargingTime.value).toBe(0);
      expect(battery.dischargingTime.value).toBe(0);
    });
  });

  describe("onMounted avec navigator.getBattery", () => {
    it("initialise la batterie quand getBattery est disponible", async () => {
      const mockBatteryManager = {
        level: 0.75,
        charging: true,
        chargingTime: 1800,
        dischargingTime: Infinity,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };

      Object.defineProperty(global.navigator, "getBattery", {
        value: vi.fn().mockResolvedValue(mockBatteryManager),
        writable: true,
        configurable: true,
      });

      const { useBattery } = await import("~/composables/useBattery");
      const battery = useBattery();

      // Attendre que onMounted s'exécute
      await vi.waitFor(() => {
        expect(battery.isSupported.value).toBe(true);
      });

      expect(battery.level.value).toBe(75);
      expect(battery.charging.value).toBe(true);
      expect(mockBatteryManager.addEventListener).toHaveBeenCalledWith(
        "chargingchange",
        expect.any(Function)
      );
      expect(mockBatteryManager.addEventListener).toHaveBeenCalledWith(
        "levelchange",
        expect.any(Function)
      );
    });

    it("met isSupported à false si getBattery échoue", async () => {
      Object.defineProperty(global.navigator, "getBattery", {
        value: vi.fn().mockRejectedValue(new Error("Not supported")),
        writable: true,
        configurable: true,
      });

      const { useBattery } = await import("~/composables/useBattery");
      const battery = useBattery();

      // Attendre que onMounted s'exécute et gère l'erreur
      await vi.waitFor(() => {
        expect(battery.isSupported.value).toBe(false);
      });
    });

    it("reste isSupported false si navigator.getBattery n'existe pas", async () => {
      // Supprimer getBattery
      const originalGetBattery = (navigator as any).getBattery;
      delete (navigator as any).getBattery;

      const { useBattery } = await import("~/composables/useBattery");
      const battery = useBattery();

      expect(battery.isSupported.value).toBe(false);

      // Restaurer
      if (originalGetBattery) {
        (navigator as any).getBattery = originalGetBattery;
      }
    });
  });

  describe("updateBatteryInfo callback", () => {
    it("met à jour les valeurs quand un événement est déclenché", async () => {
      let eventHandlers: Record<string, Function> = {};
      const mockBatteryManager = {
        level: 0.5,
        charging: false,
        chargingTime: 0,
        dischargingTime: 3600,
        addEventListener: vi.fn((event, handler) => {
          eventHandlers[event] = handler;
        }),
        removeEventListener: vi.fn(),
      };

      Object.defineProperty(global.navigator, "getBattery", {
        value: vi.fn().mockResolvedValue(mockBatteryManager),
        writable: true,
        configurable: true,
      });

      const { useBattery } = await import("~/composables/useBattery");
      const battery = useBattery();

      // Attendre l'initialisation
      await vi.waitFor(() => {
        expect(battery.isSupported.value).toBe(true);
      });

      // Simuler un changement de niveau
      mockBatteryManager.level = 0.25;
      mockBatteryManager.charging = true;
      eventHandlers["levelchange"]?.();

      expect(battery.level.value).toBe(25);
      expect(battery.charging.value).toBe(true);
    });
  });
});
