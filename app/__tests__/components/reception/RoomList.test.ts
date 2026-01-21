import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import RoomList from "~/components/reception/RoomList.vue";
import type { Room } from "~/types/chat";

// Stub pour NuxtLink
const NuxtLinkStub = {
  template: '<a :href="to" :class="$attrs.class"><slot /></a>',
  props: ["to"],
};

describe("RoomList", () => {
  const defaultProps = {
    rooms: [] as Room[],
    isLoading: false,
    isPseudoValid: false,
  };

  const mockRooms: Room[] = [
    { id: "general", name: "general", joined: false },
    { id: "random", name: "random", joined: false },
    { id: "custom", name: "Mon Salon", joined: true },
  ];

  const mountOptions = {
    global: {
      stubs: {
        NuxtLink: NuxtLinkStub,
      },
    },
  };

  describe("rendu", () => {
    it("affiche le titre", () => {
      const wrapper = mount(RoomList, {
        props: defaultProps,
        ...mountOptions,
      });

      expect(wrapper.find("h3").text()).toBe("Rooms disponibles");
    });

    it("affiche la description", () => {
      const wrapper = mount(RoomList, {
        props: defaultProps,
        ...mountOptions,
      });

      expect(wrapper.text()).toContain("Découvrez les salons publics");
    });
  });

  describe("état de chargement", () => {
    it("affiche le spinner de chargement", () => {
      const wrapper = mount(RoomList, {
        props: { ...defaultProps, isLoading: true },
        ...mountOptions,
      });

      expect(wrapper.text()).toContain("Chargement des salons");
      expect(wrapper.find(".animate-spin").exists()).toBe(true);
    });

    it("n'affiche pas le spinner quand pas en chargement", () => {
      const wrapper = mount(RoomList, {
        props: { ...defaultProps, isLoading: false },
        ...mountOptions,
      });

      expect(wrapper.find(".animate-spin").exists()).toBe(false);
    });
  });

  describe("liste vide", () => {
    it("affiche un message si aucune room disponible", () => {
      const wrapper = mount(RoomList, {
        props: { ...defaultProps, rooms: [] },
        ...mountOptions,
      });

      expect(wrapper.text()).toContain("Aucun salon disponible");
    });
  });

  describe("liste des rooms", () => {
    it("affiche toutes les rooms", () => {
      const wrapper = mount(RoomList, {
        props: { ...defaultProps, rooms: mockRooms },
        ...mountOptions,
      });

      expect(wrapper.text()).toContain("general");
      expect(wrapper.text()).toContain("random");
      expect(wrapper.text()).toContain("Mon Salon");
    });

    it("affiche la description par défaut pour les rooms connues", () => {
      const wrapper = mount(RoomList, {
        props: { ...defaultProps, rooms: mockRooms },
        ...mountOptions,
      });

      expect(wrapper.text()).toContain("Le salon principal pour discuter");
      expect(wrapper.text()).toContain("Partagez vos trouvailles");
    });

    it("affiche la description générique pour les rooms inconnues", () => {
      const wrapper = mount(RoomList, {
        props: { ...defaultProps, rooms: mockRooms },
        ...mountOptions,
      });

      expect(wrapper.text()).toContain("Rejoignez la conversation en temps réel");
    });
  });

  describe("pseudo valide", () => {
    it("affiche 'Entrer' si le pseudo est valide", () => {
      const wrapper = mount(RoomList, {
        props: { ...defaultProps, rooms: mockRooms, isPseudoValid: true },
        ...mountOptions,
      });

      const badges = wrapper.findAll("span").filter((s) => s.text() === "Entrer");
      expect(badges.length).toBe(mockRooms.length);
    });

    it("affiche 'Pseudo requis' si le pseudo est invalide", () => {
      const wrapper = mount(RoomList, {
        props: { ...defaultProps, rooms: mockRooms, isPseudoValid: false },
        ...mountOptions,
      });

      const badges = wrapper
        .findAll("span")
        .filter((s) => s.text() === "Pseudo requis");
      expect(badges.length).toBe(mockRooms.length);
    });

    it("les liens sont cliquables si le pseudo est valide", () => {
      const wrapper = mount(RoomList, {
        props: { ...defaultProps, rooms: mockRooms, isPseudoValid: true },
        ...mountOptions,
      });

      const links = wrapper.findAll("a");
      expect(links[0].attributes("href")).toBe("/room/general");
    });

    it("applique les classes désactivées si pseudo invalide", () => {
      const wrapper = mount(RoomList, {
        props: { ...defaultProps, rooms: mockRooms, isPseudoValid: false },
        ...mountOptions,
      });

      const links = wrapper.findAll("a");
      expect(links[0].classes()).toContain("opacity-50");
      expect(links[0].classes()).toContain("cursor-not-allowed");
    });

    it("applique les classes actives si pseudo valide", () => {
      const wrapper = mount(RoomList, {
        props: { ...defaultProps, rooms: mockRooms, isPseudoValid: true },
        ...mountOptions,
      });

      const links = wrapper.findAll("a");
      expect(links[0].classes()).toContain("cursor-pointer");
    });
  });

  describe("message d'information", () => {
    it("affiche le message sur les nouveaux salons", () => {
      const wrapper = mount(RoomList, {
        props: defaultProps,
        ...mountOptions,
      });

      expect(wrapper.text()).toContain("De nouveaux salons thématiques");
    });
  });
});
