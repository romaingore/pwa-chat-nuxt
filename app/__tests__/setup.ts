import { vi } from "vitest";

// Supprime les warnings Vue pour les hooks de lifecycle appelés hors composant
// Ces warnings sont attendus car on teste les composables en isolation
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args[0];
  if (
    typeof message === "string" &&
    message.includes("is called when there is no active component instance")
  ) {
    return; // Ignore ce warning spécifique
  }
  originalWarn.apply(console, args);
};

// Supprime aussi les console.error pour les erreurs attendues dans les tests
const originalError = console.error;
console.error = (...args: any[]) => {
  const message = args[0];
  if (
    typeof message === "string" &&
    (message.includes("Erreur chargement image") ||
      message.includes("[Vue warn]"))
  ) {
    return;
  }
  originalError.apply(console, args);
};
