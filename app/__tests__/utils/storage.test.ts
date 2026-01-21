import { describe, it, expect, beforeEach, vi } from "vitest";
import { lsRead, lsWrite, ssRead, ssWrite } from "~/utils/storage";

describe("storage utils", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe("lsRead", () => {
    it("retourne le fallback si la clé n'existe pas", () => {
      const result = lsRead("nonexistent", "default");
      expect(result).toBe("default");
    });

    it("retourne la valeur parsée si la clé existe", () => {
      localStorage.setItem("test-key", JSON.stringify({ name: "test" }));
      const result = lsRead("test-key", { name: "default" });
      expect(result).toEqual({ name: "test" });
    });

    it("retourne le fallback si le JSON est invalide", () => {
      localStorage.setItem("invalid-json", "not valid json");
      const result = lsRead("invalid-json", "fallback");
      expect(result).toBe("fallback");
    });

    it("retourne null si null est stocké (comportement JSON)", () => {
      localStorage.setItem("null-value", JSON.stringify(null));
      const result = lsRead("null-value", "fallback");
      // Le code retourne null car JSON.parse("null") = null qui est truthy pour la condition
      expect(result).toBeNull();
    });

    it("gère les tableaux", () => {
      localStorage.setItem("array-key", JSON.stringify([1, 2, 3]));
      const result = lsRead<number[]>("array-key", []);
      expect(result).toEqual([1, 2, 3]);
    });

    it("gère les nombres", () => {
      localStorage.setItem("number-key", JSON.stringify(42));
      const result = lsRead("number-key", 0);
      expect(result).toBe(42);
    });

    it("gère les booléens", () => {
      localStorage.setItem("bool-key", JSON.stringify(true));
      const result = lsRead("bool-key", false);
      expect(result).toBe(true);
    });
  });

  describe("lsWrite", () => {
    it("écrit une valeur dans localStorage et retourne true", () => {
      const result = lsWrite("write-test", { data: "value" });
      expect(result).toBe(true);
      expect(localStorage.getItem("write-test")).toBe(
        JSON.stringify({ data: "value" })
      );
    });

    it("écrit un tableau dans localStorage", () => {
      const result = lsWrite("array-write", [1, 2, 3]);
      expect(result).toBe(true);
      expect(localStorage.getItem("array-write")).toBe(JSON.stringify([1, 2, 3]));
    });

    it("écrit une chaîne dans localStorage", () => {
      const result = lsWrite("string-write", "hello");
      expect(result).toBe(true);
      expect(localStorage.getItem("string-write")).toBe(JSON.stringify("hello"));
    });

    it("écrase une valeur existante", () => {
      lsWrite("overwrite-test", "old");
      lsWrite("overwrite-test", "new");
      expect(lsRead("overwrite-test", "")).toBe("new");
    });
  });

  describe("ssRead", () => {
    it("retourne le fallback si la clé n'existe pas", () => {
      const result = ssRead("nonexistent", "default");
      expect(result).toBe("default");
    });

    it("retourne la valeur parsée si la clé existe", () => {
      sessionStorage.setItem("test-key", JSON.stringify({ name: "test" }));
      const result = ssRead("test-key", { name: "default" });
      expect(result).toEqual({ name: "test" });
    });

    it("retourne le fallback si le JSON est invalide", () => {
      sessionStorage.setItem("invalid-json", "not valid json");
      const result = ssRead("invalid-json", "fallback");
      expect(result).toBe("fallback");
    });

    it("retourne null si null est stocké (comportement JSON)", () => {
      sessionStorage.setItem("null-value", JSON.stringify(null));
      const result = ssRead("null-value", "fallback");
      expect(result).toBeNull();
    });
  });

  describe("ssWrite", () => {
    it("écrit une valeur dans sessionStorage et retourne true", () => {
      const result = ssWrite("write-test", { data: "value" });
      expect(result).toBe(true);
      expect(sessionStorage.getItem("write-test")).toBe(
        JSON.stringify({ data: "value" })
      );
    });

    it("écrit un tableau dans sessionStorage", () => {
      const result = ssWrite("array-write", [1, 2, 3]);
      expect(result).toBe(true);
      expect(sessionStorage.getItem("array-write")).toBe(
        JSON.stringify([1, 2, 3])
      );
    });
  });

  describe("gestion des erreurs", () => {
    it("lsWrite retourne false si localStorage.setItem échoue", () => {
      const originalLocalStorage = global.localStorage;
      const mockStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(() => {
          throw new Error("QuotaExceededError");
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      };
      Object.defineProperty(global, "localStorage", {
        value: mockStorage,
        writable: true,
        configurable: true,
      });

      const result = lsWrite("error-test", { data: "value" });
      expect(result).toBe(false);

      Object.defineProperty(global, "localStorage", {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
    });

    it("ssWrite retourne false si sessionStorage.setItem échoue", () => {
      const originalSessionStorage = global.sessionStorage;
      const mockStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(() => {
          throw new Error("QuotaExceededError");
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      };
      Object.defineProperty(global, "sessionStorage", {
        value: mockStorage,
        writable: true,
        configurable: true,
      });

      const result = ssWrite("error-test", { data: "value" });
      expect(result).toBe(false);

      Object.defineProperty(global, "sessionStorage", {
        value: originalSessionStorage,
        writable: true,
        configurable: true,
      });
    });

    it("lsRead retourne le fallback si localStorage.getItem échoue", () => {
      const originalLocalStorage = global.localStorage;
      const mockStorage = {
        getItem: vi.fn(() => {
          throw new Error("SecurityError");
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      };
      Object.defineProperty(global, "localStorage", {
        value: mockStorage,
        writable: true,
        configurable: true,
      });

      const result = lsRead("error-test", "fallback");
      expect(result).toBe("fallback");

      Object.defineProperty(global, "localStorage", {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
    });

    it("ssRead retourne le fallback si sessionStorage.getItem échoue", () => {
      const originalSessionStorage = global.sessionStorage;
      const mockStorage = {
        getItem: vi.fn(() => {
          throw new Error("SecurityError");
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      };
      Object.defineProperty(global, "sessionStorage", {
        value: mockStorage,
        writable: true,
        configurable: true,
      });

      const result = ssRead("error-test", "fallback");
      expect(result).toBe("fallback");

      Object.defineProperty(global, "sessionStorage", {
        value: originalSessionStorage,
        writable: true,
        configurable: true,
      });
    });
  });
});
