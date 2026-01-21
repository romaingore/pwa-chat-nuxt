import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, computed } from "vue";

describe("useCamera", () => {
  const mockTrack = {
    stop: vi.fn(),
    getSettings: vi.fn(() => ({ width: 1280, height: 720 })),
  };

  const mockStream = {
    getTracks: vi.fn(() => [mockTrack]),
    getVideoTracks: vi.fn(() => [mockTrack]),
  };

  const mockCtx = {
    drawImage: vi.fn(),
    imageSmoothingEnabled: false,
    imageSmoothingQuality: "",
  };

  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => mockCtx),
    toDataURL: vi.fn(() => "data:image/jpeg;base64,test123"),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock navigator.mediaDevices.getUserMedia
    Object.defineProperty(global.navigator, "mediaDevices", {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
      writable: true,
      configurable: true,
    });

    // Mock document.createElement pour canvas et video
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "canvas") {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      if (tagName === "video") {
        return {
          srcObject: null,
          playsInline: false,
          muted: false,
          readyState: 1,
          videoWidth: 1280,
          videoHeight: 720,
          play: vi.fn().mockResolvedValue(undefined),
          pause: vi.fn(),
          onloadedmetadata: null,
        } as unknown as HTMLVideoElement;
      }
      // Fallback pour les autres éléments
      const element = {
        tagName: tagName.toUpperCase(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      return element as unknown as HTMLElement;
    });
  });

  describe("fonctionnalités de base", () => {
    it("useCamera exporte les fonctions attendues", async () => {
      // Importer avec vi.importActual pour éviter les problèmes de mock
      const { useCamera } = await vi.importActual<
        typeof import("~/composables/useCamera")
      >("~/composables/useCamera");

      const camera = useCamera();

      expect(camera).toHaveProperty("videoEl");
      expect(camera).toHaveProperty("isPreviewing");
      expect(camera).toHaveProperty("startPreview");
      expect(camera).toHaveProperty("stopPreview");
      expect(camera).toHaveProperty("capture");
      expect(typeof camera.startPreview).toBe("function");
      expect(typeof camera.stopPreview).toBe("function");
      expect(typeof camera.capture).toBe("function");
    });

    it("isPreviewing est false initialement", async () => {
      const { useCamera } = await vi.importActual<
        typeof import("~/composables/useCamera")
      >("~/composables/useCamera");

      const camera = useCamera();

      expect(camera.isPreviewing.value).toBe(false);
    });

    it("videoEl est null initialement", async () => {
      const { useCamera } = await vi.importActual<
        typeof import("~/composables/useCamera")
      >("~/composables/useCamera");

      const camera = useCamera();

      expect(camera.videoEl.value).toBeNull();
    });
  });

  describe("startPreview", () => {
    it("demande l'accès à la caméra avec les bonnes contraintes", async () => {
      const { useCamera } = await vi.importActual<
        typeof import("~/composables/useCamera")
      >("~/composables/useCamera");

      const camera = useCamera();
      await camera.startPreview();

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
      });
    });

    it("met isPreviewing à true après démarrage", async () => {
      const { useCamera } = await vi.importActual<
        typeof import("~/composables/useCamera")
      >("~/composables/useCamera");

      const camera = useCamera();
      await camera.startPreview();

      expect(camera.isPreviewing.value).toBe(true);
    });

    it("ne redemande pas l'accès si déjà en preview", async () => {
      const { useCamera } = await vi.importActual<
        typeof import("~/composables/useCamera")
      >("~/composables/useCamera");

      const camera = useCamera();
      await camera.startPreview();
      await camera.startPreview();

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    });
  });

  describe("stopPreview", () => {
    it("arrête les tracks du stream", async () => {
      const { useCamera } = await vi.importActual<
        typeof import("~/composables/useCamera")
      >("~/composables/useCamera");

      const camera = useCamera();
      await camera.startPreview();
      camera.stopPreview();

      expect(mockTrack.stop).toHaveBeenCalled();
    });

    it("met isPreviewing à false", async () => {
      const { useCamera } = await vi.importActual<
        typeof import("~/composables/useCamera")
      >("~/composables/useCamera");

      const camera = useCamera();
      await camera.startPreview();
      camera.stopPreview();

      expect(camera.isPreviewing.value).toBe(false);
    });

    it("ne fait rien si pas de stream actif", async () => {
      const { useCamera } = await vi.importActual<
        typeof import("~/composables/useCamera")
      >("~/composables/useCamera");

      const camera = useCamera();
      camera.stopPreview(); // Ne devrait pas lever d'erreur

      expect(mockTrack.stop).not.toHaveBeenCalled();
    });
  });

  describe("capture", () => {
    it("crée un nouveau stream si pas de preview et retourne une data URL", async () => {
      const { useCamera } = await vi.importActual<
        typeof import("~/composables/useCamera")
      >("~/composables/useCamera");

      const camera = useCamera();
      const result = await camera.capture();

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
      expect(result).toBe("data:image/jpeg;base64,test123");
    });

    it("arrête le stream après capture sans preview", async () => {
      const { useCamera } = await vi.importActual<
        typeof import("~/composables/useCamera")
      >("~/composables/useCamera");

      const camera = useCamera();
      await camera.capture();

      expect(mockTrack.stop).toHaveBeenCalled();
    });
  });
});
