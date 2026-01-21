import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ChatHeader from "~/components/chat/ChatHeader.vue";

// Stub pour le composant BatteryBadge
const BatteryBadgeStub = {
  template: '<div data-testid="battery-badge">Battery</div>',
};

describe("ChatHeader", () => {
  const defaultProps = {
    roomName: "general",
    stats: {
      total: 10,
      mediaCount: 2,
      lastActivity: "il y a 5 minutes",
    },
  };

  const mountOptions = {
    global: {
      stubs: {
        CommonBatteryBadge: BatteryBadgeStub,
      },
    },
  };

  describe("rendu", () => {
    it("affiche le label 'Salon'", () => {
      const wrapper = mount(ChatHeader, {
        props: defaultProps,
        ...mountOptions,
      });

      expect(wrapper.text()).toContain("Salon");
    });

    it("affiche le nom de la room avec #", () => {
      const wrapper = mount(ChatHeader, {
        props: defaultProps,
        ...mountOptions,
      });

      expect(wrapper.find("h1").text()).toBe("#general");
    });

    it("affiche le composant BatteryBadge", () => {
      const wrapper = mount(ChatHeader, {
        props: defaultProps,
        ...mountOptions,
      });

      expect(wrapper.find('[data-testid="battery-badge"]').exists()).toBe(true);
    });
  });

  describe("statistiques", () => {
    it("affiche le nombre de messages", () => {
      const wrapper = mount(ChatHeader, {
        props: defaultProps,
        ...mountOptions,
      });

      expect(wrapper.text()).toContain("10 messages");
    });

    it("affiche 'message' au singulier si 1 message", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          ...defaultProps,
          stats: { ...defaultProps.stats, total: 1 },
        },
        ...mountOptions,
      });

      expect(wrapper.text()).toContain("1 message");
      expect(wrapper.text()).not.toContain("1 messages");
    });

    it("affiche le nombre de médias", () => {
      const wrapper = mount(ChatHeader, {
        props: defaultProps,
        ...mountOptions,
      });

      expect(wrapper.text()).toContain("2 médias");
    });

    it("affiche 'média' au singulier si 1 média", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          ...defaultProps,
          stats: { ...defaultProps.stats, mediaCount: 1 },
        },
        ...mountOptions,
      });

      expect(wrapper.text()).toContain("1 média");
      expect(wrapper.text()).not.toContain("1 médias");
    });

    it("affiche 0 messages correctement", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          ...defaultProps,
          stats: { ...defaultProps.stats, total: 0 },
        },
        ...mountOptions,
      });

      expect(wrapper.text()).toContain("0 messages");
    });
  });

  describe("dernière activité", () => {
    it("affiche la dernière activité si disponible", () => {
      const wrapper = mount(ChatHeader, {
        props: defaultProps,
        ...mountOptions,
      });

      expect(wrapper.text()).toContain("il y a 5 minutes");
    });

    it("affiche 'inconnue' si lastActivity est null", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          ...defaultProps,
          stats: { ...defaultProps.stats, lastActivity: null },
        },
        ...mountOptions,
      });

      expect(wrapper.text()).toContain("inconnue");
    });

    it("affiche le texte d'historique hors ligne", () => {
      const wrapper = mount(ChatHeader, {
        props: defaultProps,
        ...mountOptions,
      });

      expect(wrapper.text()).toContain("Historique disponible hors ligne");
    });
  });

  describe("bouton quitter", () => {
    it("affiche le bouton Quitter", () => {
      const wrapper = mount(ChatHeader, {
        props: defaultProps,
        ...mountOptions,
      });

      const quitButton = wrapper.find("button");
      expect(quitButton.exists()).toBe(true);
      expect(quitButton.text()).toContain("Quitter");
    });

    it("émet leave au clic sur Quitter", async () => {
      const wrapper = mount(ChatHeader, {
        props: defaultProps,
        ...mountOptions,
      });

      const quitButton = wrapper.find("button");
      await quitButton.trigger("click");

      expect(wrapper.emitted("leave")).toBeTruthy();
    });

    it("le bouton a les bonnes classes de style", () => {
      const wrapper = mount(ChatHeader, {
        props: defaultProps,
        ...mountOptions,
      });

      const quitButton = wrapper.find("button");
      expect(quitButton.classes()).toContain("border-red-500/70");
      expect(quitButton.classes()).toContain("text-red-200");
    });
  });

  describe("différents noms de room", () => {
    it("affiche correctement un nom de room personnalisé", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          ...defaultProps,
          roomName: "mon-super-salon",
        },
        ...mountOptions,
      });

      expect(wrapper.find("h1").text()).toBe("#mon-super-salon");
    });

    it("gère les noms avec espaces", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          ...defaultProps,
          roomName: "Mon Salon",
        },
        ...mountOptions,
      });

      expect(wrapper.find("h1").text()).toBe("#Mon Salon");
    });
  });
});
