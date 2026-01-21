import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MessageBubble from "~/components/chat/MessageBubble.vue";

describe("MessageBubble", () => {
  const defaultProps = {
    author: "Alice",
    text: "Bonjour tout le monde !",
    time: "14:30",
    date: "21 janv. 2026",
    isSelf: false,
  };

  describe("rendu de base", () => {
    it("affiche l'auteur du message", () => {
      const wrapper = mount(MessageBubble, { props: defaultProps });

      expect(wrapper.text()).toContain("Alice");
    });

    it("affiche le texte du message", () => {
      const wrapper = mount(MessageBubble, { props: defaultProps });

      expect(wrapper.text()).toContain("Bonjour tout le monde !");
    });

    it("affiche l'heure du message", () => {
      const wrapper = mount(MessageBubble, { props: defaultProps });

      expect(wrapper.text()).toContain("14:30");
    });

    it("affiche la date du message", () => {
      const wrapper = mount(MessageBubble, { props: defaultProps });

      expect(wrapper.text()).toContain("21 janv. 2026");
    });
  });

  describe("message personnel (isSelf = true)", () => {
    it("aligne le message à droite", () => {
      const wrapper = mount(MessageBubble, {
        props: { ...defaultProps, isSelf: true },
      });

      const container = wrapper.find("div");
      expect(container.classes()).toContain("justify-end");
    });

    it("applique les styles emerald", () => {
      const wrapper = mount(MessageBubble, {
        props: { ...defaultProps, isSelf: true },
      });

      const bubble = wrapper.find(".message-bubble");
      expect(bubble.classes()).toContain("border-emerald-500/40");
      expect(bubble.classes()).toContain("bg-emerald-500/10");
    });
  });

  describe("message des autres (isSelf = false)", () => {
    it("aligne le message à gauche", () => {
      const wrapper = mount(MessageBubble, {
        props: { ...defaultProps, isSelf: false },
      });

      const container = wrapper.find("div");
      expect(container.classes()).toContain("justify-start");
    });

    it("applique les styles slate", () => {
      const wrapper = mount(MessageBubble, {
        props: { ...defaultProps, isSelf: false },
      });

      const bubble = wrapper.find(".message-bubble");
      expect(bubble.classes()).toContain("border-slate-800");
      expect(bubble.classes()).toContain("bg-slate-900/80");
    });
  });

  describe("message texte", () => {
    it("affiche le paragraphe de texte", () => {
      const wrapper = mount(MessageBubble, { props: defaultProps });

      const textElement = wrapper.find("p.text-sm");
      expect(textElement.exists()).toBe(true);
      expect(textElement.text()).toBe("Bonjour tout le monde !");
    });

    it("n'affiche pas de paragraphe si pas de texte", () => {
      const wrapper = mount(MessageBubble, {
        props: { ...defaultProps, text: undefined },
      });

      const textElements = wrapper.findAll("p.text-sm");
      expect(textElements.length).toBe(0);
    });

    it("gère les textes vides", () => {
      const wrapper = mount(MessageBubble, {
        props: { ...defaultProps, text: "" },
      });

      const textElements = wrapper.findAll("p.text-sm");
      expect(textElements.length).toBe(0);
    });
  });

  describe("message avec image", () => {
    it("affiche l'image si photoDataUrl est fourni", () => {
      const wrapper = mount(MessageBubble, {
        props: {
          ...defaultProps,
          photoDataUrl: "data:image/jpeg;base64,abc123",
        },
      });

      const img = wrapper.find("img");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toBe("data:image/jpeg;base64,abc123");
    });

    it("l'image a le bon alt text", () => {
      const wrapper = mount(MessageBubble, {
        props: {
          ...defaultProps,
          photoDataUrl: "data:image/jpeg;base64,abc123",
        },
      });

      const img = wrapper.find("img");
      expect(img.attributes("alt")).toBe("photo envoyée");
    });

    it("l'image a le lazy loading activé", () => {
      const wrapper = mount(MessageBubble, {
        props: {
          ...defaultProps,
          photoDataUrl: "data:image/jpeg;base64,abc123",
        },
      });

      const img = wrapper.find("img");
      expect(img.attributes("loading")).toBe("lazy");
    });

    it("n'affiche pas d'image si photoDataUrl est absent", () => {
      const wrapper = mount(MessageBubble, { props: defaultProps });

      const img = wrapper.find("img");
      expect(img.exists()).toBe(false);
    });
  });

  describe("message avec texte et image", () => {
    it("affiche à la fois le texte et l'image", () => {
      const wrapper = mount(MessageBubble, {
        props: {
          ...defaultProps,
          text: "Regardez cette photo !",
          photoDataUrl: "data:image/jpeg;base64,abc123",
        },
      });

      expect(wrapper.text()).toContain("Regardez cette photo !");
      expect(wrapper.find("img").exists()).toBe(true);
    });
  });

  describe("styles conditionnels", () => {
    it("applique la couleur emerald pour l'auteur si isSelf", () => {
      const wrapper = mount(MessageBubble, {
        props: { ...defaultProps, isSelf: true },
      });

      const authorSpan = wrapper.find("span.font-semibold");
      expect(authorSpan.classes()).toContain("text-emerald-200");
    });

    it("applique la couleur slate pour l'auteur si pas isSelf", () => {
      const wrapper = mount(MessageBubble, {
        props: { ...defaultProps, isSelf: false },
      });

      const authorSpan = wrapper.find("span.font-semibold");
      expect(authorSpan.classes()).toContain("text-slate-300");
    });
  });

  describe("formatage du texte", () => {
    it("préserve les retours à la ligne (whitespace-pre-wrap)", () => {
      const wrapper = mount(MessageBubble, {
        props: { ...defaultProps, text: "Ligne 1\nLigne 2" },
      });

      const textElement = wrapper.find("p.text-sm");
      expect(textElement.classes()).toContain("whitespace-pre-wrap");
    });

    it("gère les mots longs (break-words)", () => {
      const wrapper = mount(MessageBubble, { props: defaultProps });

      const textElement = wrapper.find("p.text-sm");
      expect(textElement.classes()).toContain("break-words");
    });
  });
});
